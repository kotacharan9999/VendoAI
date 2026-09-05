import uuid
from datetime import datetime
from decimal import Decimal
from typing import Any

from pydantic import BaseModel, ConfigDict


class ProductImageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    product_id: uuid.UUID
    original_url: str | None = None
    primary_path: str | None = None
    thumbnail_path: str | None = None
    is_primary: bool


class ProductBase(BaseModel):
    title: str
    description: str | None = None
    category: str
    sku: str
    source: str = "internal"
    source_product_id: str | None = None
    selling_price: Decimal
    cost_price: Decimal
    currency: str = "INR"
    dimensions: dict[str, Any] | None = None
    metadata_json: dict[str, Any] | None = None


class ProductCreate(ProductBase):
    organization_id: uuid.UUID | None = None
    initial_stock: int | None = 0
    reorder_point: int | None = 10


class ProductUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    category: str | None = None
    sku: str | None = None
    selling_price: Decimal | None = None
    cost_price: Decimal | None = None
    currency: str | None = None
    current_stock: int | None = None
    reorder_point: int | None = None


class ProductResponse(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    organization_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    images: list[ProductImageResponse] = []
    current_stock: int | None = 0
    stockout_risk_level: str | None = "LOW"
    days_of_inventory: Decimal | None = Decimal("0.0")


class ProductDetailResponse(ProductResponse):
    avg_daily_sales: Decimal | None = Decimal("0.0")
    forecasted_demand_30d: Decimal | None = Decimal("0.0")
    safety_stock: int | None = 0
    reorder_point: int | None = 0
    suggested_reorder_qty: int | None = 0
    active_suppliers_count: int = 0
    lowest_quote_price: Decimal | None = None
