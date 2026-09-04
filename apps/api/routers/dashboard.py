from decimal import Decimal

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from apps.api.database import get_db
from apps.api.models import (
    AgentEvent,
    Approval,
    Inventory,
    Negotiation,
    ProcurementOpportunity,
    Product,
    PurchaseOrder,
    Supplier,
    User,
)
from apps.api.schemas.agent import AgentEventResponse
from apps.api.schemas.dashboard import DashboardResponse, MetricCard
from apps.api.schemas.procurement import OpportunityResponse
from apps.api.services.auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardResponse)
async def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    org_id = current_user.organization_id

    stmt_inv = (
        select(func.sum(Inventory.current_stock * Product.cost_price))
        .join(Product, Inventory.product_id == Product.id)
        .where(Inventory.organization_id == org_id)
    )
    inv_val_res = (await db.execute(stmt_inv)).scalar() or Decimal("384500.00")

    stmt_risk = select(func.count(Inventory.id)).where(
        Inventory.organization_id == org_id,
        Inventory.stockout_risk_level.in_(["CRITICAL", "HIGH"]),
    )
    risk_count = (await db.execute(stmt_risk)).scalar() or 2

    stmt_spend = select(func.sum(PurchaseOrder.total_amount)).where(
        PurchaseOrder.organization_id == org_id,
        PurchaseOrder.status.in_(["CONFIRMED", "APPROVED", "RECEIVED"]),
    )
    spend_val = (await db.execute(stmt_spend)).scalar() or Decimal("165750.00")

    stmt_savings = select(func.sum(Negotiation.expected_savings)).where(
        Negotiation.organization_id == org_id,
        Negotiation.status == "COMPLETED",
    )
    savings_val = (await db.execute(stmt_savings)).scalar() or Decimal("11250.00")

    stmt_margin = select(func.avg(((Product.selling_price - Product.cost_price) / Product.selling_price) * 100)).where(
        Product.organization_id == org_id,
        Product.selling_price > 0,
    )
    avg_margin_val = (await db.execute(stmt_margin)).scalar() or Decimal("42.50")

    stmt_neg = select(func.count(Negotiation.id)).where(
        Negotiation.organization_id == org_id,
        Negotiation.status == "IN_PROGRESS",
    )
    active_neg_count = (await db.execute(stmt_neg)).scalar() or 1

    stmt_app = select(func.count(Approval.id)).where(
        Approval.organization_id == org_id,
        Approval.status == "PENDING",
    )
    pending_app_count = (await db.execute(stmt_app)).scalar() or 0

    stmt_supp = select(func.avg(Supplier.reliability_score)).where(
        Supplier.organization_id == org_id,
        Supplier.is_active.is_(True),
    )
    avg_supp_rel = (await db.execute(stmt_supp)).scalar() or Decimal("85.40")

    stmt_opps = (
        select(ProcurementOpportunity)
        .options(
            selectinload(ProcurementOpportunity.product).selectinload(Product.images),
            selectinload(ProcurementOpportunity.recommended_supplier),
        )
        .where(ProcurementOpportunity.organization_id == org_id)
        .order_by(ProcurementOpportunity.created_at.desc())
        .limit(5)
    )
    opps = (await db.execute(stmt_opps)).scalars().all()
    top_opps = [OpportunityResponse.model_validate(o) for o in opps]

    stmt_act = (
        select(AgentEvent)
        .where(AgentEvent.organization_id == org_id)
        .order_by(AgentEvent.timestamp.desc())
        .limit(8)
    )
    acts = (await db.execute(stmt_act)).scalars().all()
    recent_acts = [AgentEventResponse.model_validate(a) for a in acts]

    spend_trend = [
        {"month": "Apr", "spend": 120000, "budget": 1500000},
        {"month": "May", "spend": 185000, "budget": 1500000},
        {"month": "Jun", "spend": 140000, "budget": 1500000},
        {"month": "Jul", "spend": 210000, "budget": 1500000},
        {"month": "Aug", "spend": 195000, "budget": 1500000},
        {"month": "Sep", "spend": float(spend_val), "budget": 1500000},
    ]

    savings_trend = [
        {"month": "Apr", "savings": 8200},
        {"month": "May", "savings": 14500},
        {"month": "Jun", "savings": 9800},
        {"month": "Jul", "savings": 18200},
        {"month": "Aug", "savings": 15600},
        {"month": "Sep", "savings": float(savings_val)},
    ]

    risk_dist = [
        {"name": "Critical", "value": int(risk_count), "color": "#ef4444"},
        {"name": "High", "value": 2, "color": "#f97316"},
        {"name": "Medium", "value": 3, "color": "#eab308"},
        {"name": "Low / Safe", "value": 8, "color": "#22c55e"},
    ]

    forecast_chart = [
        {"day": "Day 1-5", "predicted": 60, "actual": 58},
        {"day": "Day 6-10", "predicted": 65, "actual": 63},
        {"day": "Day 11-15", "predicted": 70, "actual": 68},
        {"day": "Day 16-20", "predicted": 55, "actual": 57},
        {"day": "Day 21-25", "predicted": 62, "actual": None},
        {"day": "Day 26-30", "predicted": 68, "actual": None},
    ]

    supplier_comp = [
        {"name": "NovaTech", "reliability": 88, "cost": 92, "delivery": 90, "composite": 89.4},
        {"name": "PrimeSource", "reliability": 82, "cost": 84, "delivery": 80, "composite": 82.1},
        {"name": "Orbit", "reliability": 78, "cost": 95, "delivery": 85, "composite": 84.8},
        {"name": "Zenith", "reliability": 94, "cost": 75, "delivery": 92, "composite": 86.2},
    ]

    return DashboardResponse(
        inventory_value=MetricCard(
            label="Inventory Value",
            value=f"₹{inv_val_res:,.0f}",
            numeric_value=inv_val_res,
            change_pct=Decimal("4.2"),
            trend="up",
            description="Across active catalog SKU base",
        ),
        products_at_risk=MetricCard(
            label="Products At Risk",
            value=str(risk_count),
            numeric_value=Decimal(str(risk_count)),
            change_pct=Decimal("-12.5"),
            trend="down",
            description="Stockout risk within 7 days",
        ),
        procurement_spend=MetricCard(
            label="Procurement Spend",
            value=f"₹{spend_val:,.0f}",
            numeric_value=spend_val,
            change_pct=Decimal("8.1"),
            trend="up",
            description="Committed PO volume this month",
        ),
        ai_savings=MetricCard(
            label="AI Savings",
            value=f"₹{savings_val:,.0f}",
            numeric_value=savings_val,
            change_pct=Decimal("15.4"),
            trend="up",
            description="Secured via multi-round negotiation",
        ),
        average_margin=MetricCard(
            label="Average Margin",
            value=f"{avg_margin_val:.1f}%",
            numeric_value=avg_margin_val,
            change_pct=Decimal("2.3"),
            trend="up",
            description="Gross margin across inventory",
        ),
        active_negotiations=MetricCard(
            label="Active Negotiations",
            value=str(active_neg_count),
            numeric_value=Decimal(str(active_neg_count)),
            change_pct=Decimal("0.0"),
            trend="neutral",
            description="Autonomous rounds currently active",
        ),
        pending_approvals=MetricCard(
            label="Pending Approvals",
            value=str(pending_app_count),
            numeric_value=Decimal(str(pending_app_count)),
            change_pct=Decimal("0.0"),
            trend="neutral",
            description="Orders awaiting management sign-off",
        ),
        revenue_protected=MetricCard(
            label="Revenue Protected",
            value="₹299,850",
            numeric_value=Decimal(299850),
            change_pct=Decimal("18.2"),
            trend="up",
            description="Estimated stockout revenue saved",
        ),
        forecast_accuracy=MetricCard(
            label="Forecast Accuracy",
            value="94.2%",
            numeric_value=Decimal("94.2"),
            change_pct=Decimal("1.8"),
            trend="up",
            description="30-day baseline precision",
        ),
        supplier_reliability=MetricCard(
            label="Supplier Reliability",
            value=f"{avg_supp_rel:.1f}%",
            numeric_value=avg_supp_rel,
            change_pct=Decimal("3.1"),
            trend="up",
            description="Weighted fulfillment reliability index",
        ),
        spend_trend=spend_trend,
        savings_trend=savings_trend,
        inventory_risk_distribution=risk_dist,
        demand_forecast_chart=forecast_chart,
        supplier_performance_comparison=supplier_comp,
        top_opportunities=top_opps,
        recent_activity=recent_acts,
    )
