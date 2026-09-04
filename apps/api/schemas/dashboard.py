from decimal import Decimal
from typing import Any

from pydantic import BaseModel

from apps.api.schemas.agent import AgentEventResponse
from apps.api.schemas.procurement import OpportunityResponse


class MetricCard(BaseModel):
    label: str
    value: str
    numeric_value: Decimal
    change_pct: Decimal | None = None
    trend: str | None = "up"
    description: str | None = None


class ChartDataPoint(BaseModel):
    date: str
    spend: Decimal | None = Decimal(0)
    savings: Decimal | None = Decimal(0)
    margin_pct: Decimal | None = Decimal(0)
    stockout_risk_count: int | None = 0
    forecast_actual: Decimal | None = None
    forecast_predicted: Decimal | None = None


class DashboardResponse(BaseModel):
    inventory_value: MetricCard
    products_at_risk: MetricCard
    procurement_spend: MetricCard
    ai_savings: MetricCard
    average_margin: MetricCard
    active_negotiations: MetricCard
    pending_approvals: MetricCard
    revenue_protected: MetricCard
    forecast_accuracy: MetricCard
    supplier_reliability: MetricCard
    spend_trend: list[dict[str, Any]]
    savings_trend: list[dict[str, Any]]
    inventory_risk_distribution: list[dict[str, Any]]
    demand_forecast_chart: list[dict[str, Any]]
    supplier_performance_comparison: list[dict[str, Any]]
    top_opportunities: list[OpportunityResponse]
    recent_activity: list[AgentEventResponse]
