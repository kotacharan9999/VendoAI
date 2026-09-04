import uuid
from datetime import datetime
from decimal import Decimal
from typing import Any

from pydantic import BaseModel, ConfigDict


class BusinessRuleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    organization_id: uuid.UUID
    rule_name: str
    rule_key: str
    value_numeric: Decimal | None = None
    value_text: str | None = None
    value_boolean: bool | None = None
    value_json: dict[str, Any] | None = None
    is_active: bool
    updated_at: datetime


class BusinessRuleUpdate(BaseModel):
    value_numeric: Decimal | None = None
    value_text: str | None = None
    value_boolean: bool | None = None
    value_json: dict[str, Any] | None = None
    is_active: bool | None = None


class SettingsUpdate(BaseModel):
    minimum_margin: Decimal | None = None
    target_margin: Decimal | None = None
    auto_approval_limit: Decimal | None = None
    human_approval_limit: Decimal | None = None
    monthly_budget: Decimal | None = None
    minimum_supplier_rating: Decimal | None = None
    maximum_supplier_risk: Decimal | None = None
    minimum_quotes: int | None = None
    max_negotiation_rounds: int | None = None
    auto_purchase_enabled: bool | None = None
    ai_provider: str | None = None
    demo_mode: bool | None = None
    currency: str | None = None
