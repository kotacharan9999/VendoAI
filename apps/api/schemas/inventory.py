import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from apps.api.schemas.product import ProductResponse


class InventoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    organization_id: uuid.UUID
    product_id: uuid.UUID
    current_stock: int
    reserved_stock: int
    expected_inbound: int
    reorder_point: int
    safety_stock: int
    suggested_reorder_qty: int
    days_of_inventory: Decimal
    stockout_risk_level: str
    last_checked_at: datetime
    updated_at: datetime
    product: ProductResponse | None = None


class InventoryMovementResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    organization_id: uuid.UUID
    product_id: uuid.UUID
    reference_type: str
    reference_id: str | None = None
    movement_type: str
    quantity: int
    previous_stock: int
    new_stock: int
    reason: str | None = None
    created_at: datetime


class InventoryUpdateRequest(BaseModel):
    current_stock: int | None = None
    reserved_stock: int | None = None
    expected_inbound: int | None = None
    reorder_point: int | None = None
    safety_stock: int | None = None
    suggested_reorder_qty: int | None = None
