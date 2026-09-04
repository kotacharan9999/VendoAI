import uuid
from datetime import datetime
from decimal import Decimal
from typing import Any

from pydantic import BaseModel, ConfigDict


class AgentEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    organization_id: uuid.UUID
    agent_run_id: uuid.UUID
    event_type: str
    message: str
    details: dict[str, Any] | None = None
    timestamp: datetime


class AgentRunResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    organization_id: uuid.UUID
    agent_name: str
    execution_id: str
    trigger: str
    status: str
    input_state: dict[str, Any] | None = None
    output_state: dict[str, Any] | None = None
    confidence_score: Decimal
    execution_duration_ms: int | None = None
    error_message: str | None = None
    started_at: datetime
    completed_at: datetime | None = None
    events: list[AgentEventResponse] = []


class AgentTriggerRequest(BaseModel):
    agent_name: str
    product_id: uuid.UUID | None = None
    parameters: dict[str, Any] | None = None
