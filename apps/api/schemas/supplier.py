import uuid
from datetime import datetime
from decimal import Decimal
from typing import Any

from pydantic import BaseModel, ConfigDict


class SupplierScoringBreakdown(BaseModel):
    cost_score: Decimal
    reliability_score: Decimal
    delivery_score: Decimal
    quality_score: Decimal
    payment_terms_score: Decimal
    composite_procurement_score: Decimal


class SupplierBase(BaseModel):
    name: str
    rating: Decimal = Decimal("4.00")
    reliability_score: Decimal = Decimal("85.00")
    delivery_score: Decimal = Decimal("85.00")
    quality_score: Decimal = Decimal("85.00")
    payment_terms: str = "Net 30"
    risk_score: Decimal = Decimal("20.00")
    negotiation_style: str = "Reliable Supplier"
    min_order_qty: int = 50
    lead_time_days: int = 7
    location: str = "Bengaluru, India"
    categories: dict[str, Any] | None = None
    is_active: bool = True


class SupplierCreate(SupplierBase):
    organization_id: uuid.UUID | None = None


class SupplierResponse(SupplierBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    organization_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    procurement_score: Decimal | None = None


class SupplierProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    supplier_id: uuid.UUID
    product_id: uuid.UUID
    supplier_sku: str | None = None
    base_price: Decimal
    min_order_qty: int
    lead_time_days: int
    is_preferred: bool
    created_at: datetime
    updated_at: datetime


class SupplierQuoteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    organization_id: uuid.UUID
    supplier_id: uuid.UUID
    product_id: uuid.UUID
    unit_price: Decimal
    shipping_cost: Decimal
    total_quote: Decimal
    payment_terms: str
    lead_time_days: int
    validity_days: int
    status: str
    created_at: datetime
    supplier: SupplierResponse | None = None


class SupplierDetailResponse(SupplierResponse):
    scoring_breakdown: SupplierScoringBreakdown | None = None
    products_count: int = 0
    active_quotes_count: int = 0
    completed_orders_count: int = 0
