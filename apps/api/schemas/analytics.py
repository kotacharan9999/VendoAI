from decimal import Decimal
from typing import Any

from pydantic import BaseModel


class AnalyticsResponse(BaseModel):
    total_procurement_spend: Decimal
    total_ai_savings: Decimal
    average_gross_margin: Decimal
    inventory_turnover_rate: Decimal
    stockout_incident_count: int
    forecast_accuracy_pct: Decimal
    supplier_average_reliability: Decimal
    negotiation_success_rate: Decimal
    approval_rate: Decimal
    average_cycle_time_hours: Decimal
    spend_by_category: list[dict[str, Any]]
    savings_by_supplier: list[dict[str, Any]]
    monthly_spend_savings: list[dict[str, Any]]
    negotiation_rounds_distribution: list[dict[str, Any]]
    margin_distribution: list[dict[str, Any]]
