import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from apps.api.schemas.product import ProductResponse
from apps.api.schemas.supplier import SupplierResponse


class NegotiationMessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    negotiation_id: uuid.UUID
    round_number: int
    sender: str
    offer_price: Decimal
    shipping_cost: Decimal
    payment_terms: str
    message_text: str
    supplier_counter_price: Decimal | None = None
    supplier_response_text: str | None = None
    created_at: datetime


class NegotiationBase(BaseModel):
    product_id: uuid.UUID
    supplier_id: uuid.UUID
    target_price: Decimal
    initial_quote: Decimal
    quantity: int = 1
    max_rounds: int = 4
    strategy: str = "Volume Discount & Free Shipping"


class NegotiationCreate(NegotiationBase):
    organization_id: uuid.UUID | None = None


class CounterOfferRequest(BaseModel):
    offer_price: Decimal
    shipping_cost: Decimal = Decimal("0.00")
    payment_terms: str = "Net 30"
    message_text: str


class NegotiationResponse(NegotiationBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    organization_id: uuid.UUID
    final_price: Decimal | None = None
    rounds_completed: int
    status: str
    expected_margin: Decimal | None = None
    expected_savings: Decimal | None = None
    created_at: datetime
    updated_at: datetime
    product: ProductResponse | None = None
    supplier: SupplierResponse | None = None


class NegotiationDetailResponse(NegotiationResponse):
    messages: list[NegotiationMessageResponse] = []
