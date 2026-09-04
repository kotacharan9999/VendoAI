import uuid
from datetime import datetime
from decimal import Decimal
from typing import Any

from pydantic import BaseModel, ConfigDict


class AuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    organization_id: uuid.UUID
    actor_type: str
    actor_id: str | None = None
    action: str
    entity_type: str
    entity_id: str
    financial_amount: Decimal | None = None
    policy_result: str | None = None
    confidence_score: Decimal | None = None
    reason_summary: str
    metadata_json: dict[str, Any] | None = None
    timestamp: datetime
