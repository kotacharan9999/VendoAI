import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from apps.api.audit.audit_service import AuditService
from apps.api.database import get_db
from apps.api.models import Approval, User
from apps.api.schemas.procurement import ApprovalDecisionRequest, ApprovalResponse
from apps.api.services.auth import get_current_user, require_roles
from apps.api.services.demo_data import decide_demo_approval, get_demo_approvals

router = APIRouter(prefix="/approvals", tags=["approvals"])


@router.get("", response_model=list[ApprovalResponse])
async def list_approvals(
    status: str | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if db is None:
        return get_demo_approvals(status=status)

    try:
        stmt = (
            select(Approval)
            .where(Approval.organization_id == current_user.organization_id)
            .order_by(Approval.created_at.desc())
        )
        if status:
            stmt = stmt.where(Approval.status == status)
        res = await db.execute(stmt)
        approvals = res.scalars().all()
        return approvals if approvals else get_demo_approvals(status=status)
    except Exception:
        return get_demo_approvals(status=status)


@router.post("/{approval_id}/approve", response_model=ApprovalResponse)
async def approve_request(
    approval_id: uuid.UUID,
    data: ApprovalDecisionRequest,
    current_user: User = Depends(require_roles(["ADMIN", "MANAGER", "BUYER"])),
    db: AsyncSession = Depends(get_db),
):
    if db is None:
        return decide_demo_approval(approval_id, "APPROVED", data.comments)

    try:
        stmt = select(Approval).where(Approval.id == approval_id, Approval.organization_id == current_user.organization_id)
        res = await db.execute(stmt)
        approval = res.scalar_one_or_none()
        if not approval:
            return decide_demo_approval(approval_id, "APPROVED", data.comments)

        approval.status = "APPROVED"
        approval.approved_by_id = current_user.id
        approval.comments = data.comments or "Approved by manager."
        approval.decided_at = datetime.utcnow()

        try:
            await AuditService.log_event(
                db=db,
                organization_id=current_user.organization_id,
                actor_type="USER",
                actor_id=str(current_user.id),
                action="APPROVAL_GRANTED",
                entity_type="APPROVAL",
                entity_id=str(approval.id),
                financial_amount=approval.amount,
                policy_result="ALLOWED",
                reason_summary=f"Approval granted for {approval.requested_action} by {current_user.full_name} ({current_user.role}).",
            )
        except Exception:
            pass

        await db.commit()
        await db.refresh(approval)
        return approval
    except Exception:
        return decide_demo_approval(approval_id, "APPROVED", data.comments)


@router.post("/{approval_id}/reject", response_model=ApprovalResponse)
async def reject_request(
    approval_id: uuid.UUID,
    data: ApprovalDecisionRequest,
    current_user: User = Depends(require_roles(["ADMIN", "MANAGER"])),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Approval).where(Approval.id == approval_id, Approval.organization_id == current_user.organization_id)
    res = await db.execute(stmt)
    approval = res.scalar_one_or_none()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval request not found")

    approval.status = "REJECTED"
    approval.approved_by_id = current_user.id
    approval.comments = data.comments or "Rejected during policy review."
    approval.decided_at = datetime.utcnow()

    await AuditService.log_event(
        db=db,
        organization_id=current_user.organization_id,
        actor_type="USER",
        actor_id=str(current_user.id),
        action="APPROVAL_REJECTED",
        entity_type="APPROVAL",
        entity_id=str(approval.id),
        financial_amount=approval.amount,
        policy_result="BLOCKED",
        reason_summary=f"Approval rejected by {current_user.full_name}: {approval.comments}",
    )

    await db.commit()
    await db.refresh(approval)
    return approval
