from typing import Any, TypedDict


class ProcurementState(TypedDict, total=False):
    organization_id: str
    product_id: str
    execution_id: str
    stage: str
    product_title: str
    selling_price: float
    current_stock: int
    avg_daily_sales: float
    days_of_inventory: float
    reorder_point: int
    safety_stock: int
    suggested_reorder_qty: int
    stockout_risk_level: str
    predicted_demand_30d: float
    forecast_confidence: float
    quotes: list[dict[str, Any]]
    selected_supplier_id: str
    selected_supplier_name: str
    initial_quote: float
    target_price: float
    negotiated_price: float
    negotiation_rounds: list[dict[str, Any]]
    expected_savings: float
    calculated_gross_margin: float
    total_spend: float
    supplier_risk_score: float
    supplier_rating: float
    policy_decision: str
    policy_violations: list[str]
    policy_warnings: list[str]
    requires_human_approval: bool
    approval_id: str | None
    po_number: str | None
    payment_status: str | None
    transaction_id: str | None
    inventory_updated: bool
    events: list[dict[str, Any]]
    error: str | None
