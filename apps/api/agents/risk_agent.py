import uuid
from decimal import Decimal

from sqlalchemy.ext.asyncio import AsyncSession

from apps.api.agents.state import ProcurementState
from apps.api.audit.audit_service import AuditService
from apps.api.models.procurement import Approval, ProcurementOpportunity
from apps.api.policy.policy_engine import PolicyEngine


async def run_risk_agent(state: ProcurementState, db: AsyncSession, agent_run_id: uuid.UUID) -> ProcurementState:
    org_id = uuid.UUID(state["organization_id"])
    prod_id = uuid.UUID(state["product_id"])
    spend = Decimal(str(state["total_spend"]))
    margin = Decimal(str(state["calculated_gross_margin"]))
    rating = Decimal(str(state.get("supplier_rating", 4.2)))
    risk = Decimal(str(state.get("supplier_risk_score", 15.0)))
    quotes_count = len(state.get("quotes", []))

    eval_result = PolicyEngine.evaluate_procurement(
        procurement_amount=spend,
        calculated_margin_pct=margin,
        supplier_rating=rating,
        supplier_risk=risk,
        quotes_count=quotes_count,
        auto_purchase_enabled=False,
    )

    state["policy_decision"] = eval_result.decision
    state["policy_violations"] = eval_result.violated_rules
    state["policy_warnings"] = eval_result.warnings
    state["requires_human_approval"] = eval_result.requires_human_approval

    await AuditService.record_agent_event(
        db=db,
        organization_id=org_id,
        agent_run_id=agent_run_id,
        event_type="POLICY_CHECKED",
        message=f"Policy Engine evaluated order of ₹{spend:,.2f}: {eval_result.decision}. ({eval_result.reason_summary})",
        details={
            "decision": eval_result.decision,
            "violations": eval_result.violated_rules,
            "warnings": eval_result.warnings,
            "requires_human_approval": eval_result.requires_human_approval,
        },
    )

    opp = ProcurementOpportunity(
        organization_id=org_id,
        product_id=prod_id,
        urgency="HIGH" if state.get("days_of_inventory", 1.5) < 3.0 else "MEDIUM",
        current_stock=state.get("current_stock", 18),
        days_of_coverage=Decimal(str(state.get("days_of_inventory", 1.5))),
        predicted_demand=int(state.get("predicted_demand_30d", 360)),
        recommended_quantity=state.get("suggested_reorder_qty", 150),
        recommended_supplier_id=uuid.UUID(state["selected_supplier_id"]),
        expected_unit_cost=Decimal(str(state["negotiated_price"])),
        expected_total_cost=spend,
        expected_margin=margin,
        expected_savings=Decimal(str(state["expected_savings"])),
        risk_score=risk,
        policy_result=eval_result.decision,
        recommended_action="APPROVE_AND_ORDER",
        status="PENDING_APPROVAL" if eval_result.requires_human_approval else "APPROVED",
    )
    db.add(opp)
    await db.flush()

    if eval_result.requires_human_approval:
        approval = Approval(
            organization_id=org_id,
            entity_type="PURCHASE_ORDER",
            entity_id=f"OPP-{opp.id.hex[:8].upper()}",
            requested_action="CREATE_PURCHASE_ORDER",
            amount=spend,
            expected_margin=margin,
            risk_score=risk,
            reason=f"Procurement order of ₹{spend:,.2f} for {state.get('product_title')} from {state.get('selected_supplier_name')} exceeds automatic approval limit (₹50,000).",
            policy_violations={"warnings": eval_result.warnings},
            status="PENDING",
        )
        db.add(approval)
        await db.flush()
        state["approval_id"] = str(approval.id)

        await AuditService.record_agent_event(
            db=db,
            organization_id=org_id,
            agent_run_id=agent_run_id,
            event_type="APPROVAL_REQUESTED",
            message=f"Approval requested for PO of ₹{spend:,.2f} (Gross Margin: {margin}%). Routed to Manager.",
            details={"approval_id": str(approval.id), "amount": float(spend)},
        )

    state["stage"] = "APPROVE"
    return state
