from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from apps.api.database import get_db
from apps.api.models import AgentEvent, AuditLog, User
from apps.api.schemas.agent import AgentEventResponse
from apps.api.schemas.audit import AuditLogResponse
from apps.api.services.auth import get_current_user
from apps.api.services.demo_data import get_demo_activity, get_demo_audit

router = APIRouter(prefix="/activity", tags=["activity"])


@router.get("", response_model=list[AgentEventResponse])
async def list_activity(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if db is None:
        return get_demo_activity(limit=limit)

    try:
        stmt = (
            select(AgentEvent)
            .where(AgentEvent.organization_id == current_user.organization_id)
            .order_by(AgentEvent.timestamp.desc())
            .limit(limit)
        )
        res = await db.execute(stmt)
        events = res.scalars().all()
        return events if events else get_demo_activity(limit=limit)
    except Exception:
        return get_demo_activity(limit=limit)


@router.get("/audit", response_model=list[AuditLogResponse])
async def list_audit_logs(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if db is None:
        return get_demo_audit(limit=limit)

    try:
        stmt = (
            select(AuditLog)
            .where(AuditLog.organization_id == current_user.organization_id)
            .order_by(AuditLog.timestamp.desc())
            .limit(limit)
        )
        res = await db.execute(stmt)
        logs = res.scalars().all()
        return logs if logs else get_demo_audit(limit=limit)
    except Exception:
        return get_demo_audit(limit=limit)
