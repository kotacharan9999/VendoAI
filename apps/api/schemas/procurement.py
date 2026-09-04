import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Any

from pydantic import BaseModel, ConfigDict

from apps.api.schemas.product import ProductResponse
from apps.api.schemas.supplier import SupplierResponse


class OpportunityResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    organization_id: uuid.UUID
    product_id: uuid.UUID
    urgency: str
    current_stock: int
    days_of_coverage: Decimal
    predicted_demand: int
    recommended_quantity: int
    recommended_supplier_id: uuid.UUID | None = None
    expected_unit_cost: Decimal
    expected_total_cost: Decimal
    expected_margin: Decimal
    expected_savings: Decimal
    risk_score: Decimal
    policy_result: str
    recommended_action: str
    status: str
    created_at: datetime
    updated_at: datetime
    product: ProductResponse | None = None
    recommended_supplier: SupplierResponse | None = None


class OpportunityEvaluateRequest(BaseModel):
    target_margin: Decimal | None = None
    max_risk_score: Decimal | None = None


class PurchaseOrderItemCreate(BaseModel):
    product_id: uuid.UUID
    quantity: int
    unit_price: Decimal
    total_price: Decimal


class PurchaseOrderItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    purchase_order_id: uuid.UUID
    product_id: uuid.UUID
    quantity: int
    unit_price: Decimal
    total_price: Decimal
    created_at: datetime
    product: ProductResponse | None = None


class PaymentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    organization_id: uuid.UUID
    purchase_order_id: uuid.UUID
    amount: Decimal
    currency: str
    provider: str
    transaction_id: str
    status: str
    payment_method: str
    metadata_json: dict[str, Any] | None = None
    created_at: datetime
    updated_at: datetime


class PurchaseOrderCreate(BaseModel):
    supplier_id: uuid.UUID
    items: list[PurchaseOrderItemCreate]
    shipping_cost: Decimal = Decimal("0.00")
    currency: str = "INR"
    expected_delivery_date: date | None = None


class PurchaseOrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    organization_id: uuid.UUID
    po_number: str
    supplier_id: uuid.UUID
    subtotal: Decimal
    shipping_cost: Decimal
    total_amount: Decimal
    currency: str
    expected_delivery_date: date | None = None
    status: str
    payment_status: str
    created_by_id: uuid.UUID | None = None
    created_at: datetime
    updated_at: datetime
    supplier: SupplierResponse | None = None
    items: list[PurchaseOrderItemResponse] = []
    payments: list[PaymentResponse] = []


class ApprovalDecisionRequest(BaseModel):
    status: str
    comments: str | None = None


class ApprovalResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    organization_id: uuid.UUID
    entity_type: str
    entity_id: str
    requested_by_id: uuid.UUID | None = None
    approved_by_id: uuid.UUID | None = None
    requested_action: str
    amount: Decimal
    expected_margin: Decimal
    risk_score: Decimal
    reason: str
    policy_violations: dict[str, Any] | None = None
    status: str
    comments: str | None = None
    created_at: datetime
    decided_at: datetime | None = None
