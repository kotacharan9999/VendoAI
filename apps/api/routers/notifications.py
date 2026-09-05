import uuid

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from apps.api.database import get_db
from apps.api.models import Notification, User
from apps.api.schemas.notification import NotificationResponse
from apps.api.services.auth import get_current_user
from apps.api.services.demo_data import (
    get_demo_notifications,
    mark_demo_notification_read,
)

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=list[NotificationResponse])
async def list_notifications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if db is None:
        return get_demo_notifications()

    try:
        stmt = (
            select(Notification)
            .where(Notification.organization_id == current_user.organization_id)
            .order_by(Notification.created_at.desc())
            .limit(30)
        )
        res = await db.execute(stmt)
        notifs = res.scalars().all()
        return notifs if notifs else get_demo_notifications()
    except Exception:
        return get_demo_notifications()


@router.post("/{notification_id}/read", response_model=NotificationResponse)
async def mark_as_read(
    notification_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if db is None:
        return mark_demo_notification_read(notification_id)

    try:
        stmt = select(Notification).where(
            Notification.id == notification_id, Notification.organization_id == current_user.organization_id
        )
        res = await db.execute(stmt)
        notif = res.scalar_one_or_none()
        if not notif:
            return mark_demo_notification_read(notification_id)

        notif.is_read = True
        await db.commit()
        await db.refresh(notif)
        return notif
    except Exception:
        return mark_demo_notification_read(notification_id)
