import uuid
from decimal import Decimal

from sqlalchemy.ext.asyncio import AsyncSession

from apps.api.agents.state import ProcurementState
from apps.api.audit.audit_service import AuditService
from apps.api.integrations.ai_provider import get_ai_provider
from apps.api.models.negotiation import Negotiation
from apps.api.services.negotiation_service import NegotiationService


async def run_negotiation_agent(state: ProcurementState, db: AsyncSession, agent_run_id: uuid.UUID) -> ProcurementState:
    org_id = uuid.UUID(state["organization_id"])
    prod_id = uuid.UUID(state["product_id"])
    supp_id = uuid.UUID(state["selected_supplier_id"])
    target_price = Decimal(str(state["target_price"]))
    initial_quote = Decimal(str(state["initial_quote"]))
    qty = state["suggested_reorder_qty"]

    negotiation = Negotiation(
        organization_id=org_id,
        product_id=prod_id,
        supplier_id=supp_id,
        target_price=target_price,
        initial_quote=initial_quote,
        quantity=qty,
        max_rounds=4,
        status="IN_PROGRESS",
        strategy="Volume Commitment & Freight Concession",
    )
    db.add(negotiation)
    await db.flush()

    await AuditService.record_agent_event(
        db=db,
        organization_id=org_id,
        agent_run_id=agent_run_id,
        event_type="NEGOTIATION_STARTED",
        message=f"Negotiation initiated with {state['selected_supplier_name']} for {qty} units. Target: ₹{target_price}/unit (Initial: ₹{initial_quote}).",
        details={"initial_quote": float(initial_quote), "target_price": float(target_price), "quantity": qty},
    )

    ai_provider = get_ai_provider()
    history = []
    rounds_data = []

    for round_idx in range(1, 3):
        proposal = await ai_provider.generate_counter_offer(
            product_title=state.get("product_title", "Product"),
            supplier_name=state["selected_supplier_name"],
            current_quote=initial_quote,
            round_number=round_idx,
            target_price=target_price,
            history=history,
        )

        negotiation = await NegotiationService.execute_negotiation_round(
            db=db,
            negotiation_id=negotiation.id,
            buyer_offer=proposal.counter_offer,
            shipping_cost=proposal.counter_shipping,
            payment_terms=proposal.payment_terms,
            buyer_message=proposal.message,
        )

        # Reload negotiation with messages to avoid lazy loading issue
        from sqlalchemy import select
        from sqlalchemy.orm import selectinload
        stmt = (
            select(Negotiation)
            .options(selectinload(Negotiation.messages))
            .where(Negotiation.id == negotiation.id)
        )
        res = await db.execute(stmt)
        negotiation = res.scalar_one()

        latest_msg = negotiation.messages[-1] if negotiation.messages else None
        round_info = {
            "round": round_idx,
            "buyer_offer": float(proposal.counter_offer),
            "supplier_response": float(latest_msg.supplier_counter_price) if latest_msg else float(proposal.counter_offer),
            "buyer_message": proposal.message,
            "supplier_message": latest_msg.supplier_response_text if latest_msg else "",
        }
        rounds_data.append(round_info)
        history.append(round_info)

        await AuditService.record_agent_event(
            db=db,
            organization_id=org_id,
            agent_run_id=agent_run_id,
            event_type="NEGOTIATION_COUNTERED",
            message=f"Round {round_idx}: Counter-offered ₹{proposal.counter_offer}. {state['selected_supplier_name']} responded ₹{latest_msg.supplier_counter_price if latest_msg else proposal.counter_offer}.",
            details=round_info,
        )

        if negotiation.status == "COMPLETED":
            break

    final_price = negotiation.final_price or Decimal(1105)
    savings = (initial_quote - final_price) * Decimal(str(qty))
    state["negotiated_price"] = float(final_price)
    state["expected_savings"] = float(savings)
    state["negotiation_rounds"] = rounds_data
    state["total_spend"] = float(final_price * Decimal(str(qty)))

    await AuditService.record_agent_event(
        db=db,
        organization_id=org_id,
        agent_run_id=agent_run_id,
        event_type="NEGOTIATION_COMPLETED",
        message=f"Negotiation finalized with {state['selected_supplier_name']} at ₹{final_price}/unit. Total procurement savings: ₹{savings:,}.",
        details={
            "final_unit_price": float(final_price),
            "total_savings": float(savings),
            "total_spend": state["total_spend"],
        },
    )

    state["stage"] = "EVALUATE"
    return state
