import uuid
from decimal import Decimal

from sqlalchemy.ext.asyncio import AsyncSession

from apps.api.agents.state import ProcurementState
from apps.api.audit.audit_service import AuditService
from apps.api.services.margin_service import MarginService


async def run_margin_agent(state: ProcurementState, db: AsyncSession, agent_run_id: uuid.UUID) -> ProcurementState:
    org_id = uuid.UUID(state["organization_id"])
    selling_price = Decimal(str(state.get("selling_price", 1999.0)))
    unit_cost = Decimal(str(state.get("negotiated_price", 1105.0)))
    initial_quote = Decimal(str(state.get("initial_quote", 1180.0)))
    qty = state.get("suggested_reorder_qty", 150)

    margin_analysis = MarginService.calculate_margin(
        selling_price=selling_price,
        unit_cost=unit_cost,
        quantity=qty,
        shipping_per_unit=Decimal("0.00"),
        initial_unit_quote=initial_quote,
    )

    state["calculated_gross_margin"] = float(margin_analysis.gross_margin_pct)
    state["expected_savings"] = float(margin_analysis.total_savings)
    state["total_spend"] = float(margin_analysis.total_procurement_cost)

    event_msg = f"Deterministic Margin Engine verified gross margin at {margin_analysis.gross_margin_pct}% (₹{margin_analysis.gross_profit_per_unit}/unit profit) with ROI of {margin_analysis.roi_pct}%."
    await AuditService.record_agent_event(
        db=db,
        organization_id=org_id,
        agent_run_id=agent_run_id,
        event_type="MARGIN_CALCULATED",
        message=event_msg,
        details={
            "gross_margin_pct": float(margin_analysis.gross_margin_pct),
            "gross_profit_per_unit": float(margin_analysis.gross_profit_per_unit),
            "total_procurement_cost": float(margin_analysis.total_procurement_cost),
            "total_savings": float(margin_analysis.total_savings),
            "roi_pct": float(margin_analysis.roi_pct),
        },
    )

    state["stage"] = "POLICY_CHECK"
    return state
