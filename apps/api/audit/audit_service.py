import uuid
from decimal import Decimal
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from apps.api.models.agent import AgentEvent
from apps.api.models.audit import AuditLog


class AuditService:
    @staticmethod
    async def log_event(
        db: AsyncSession,
        organization_id: uuid.UUID,
        actor_type: str,
        action: str,
        entity_type: str,
        entity_id: str,
        reason_summary: str,
        actor_id: str | None = None,
        financial_amount: Decimal | None = None,
        policy_result: str | None = None,
        confidence_score: Decimal | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> AuditLog:
        audit_entry = AuditLog(
            organization_id=organization_id,
            actor_type=actor_type,
            actor_id=actor_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            financial_amount=financial_amount,
            policy_result=policy_result,
            confidence_score=confidence_score,
            reason_summary=reason_summary,
            metadata_json=metadata or {},
        )
        db.add(audit_entry)
        await db.flush()
        return audit_entry

    @staticmethod
    async def record_agent_event(
        db: AsyncSession,
        organization_id: uuid.UUID,
        agent_run_id: uuid.UUID,
        event_type: str,
        message: str,
        details: dict[str, Any] | None = None,
    ) -> AgentEvent:
        event = AgentEvent(
            organization_id=organization_id,
            agent_run_id=agent_run_id,
            event_type=event_type,
            message=message,
            details=details or {},
        )
        db.add(event)
        await db.flush()
        return event
