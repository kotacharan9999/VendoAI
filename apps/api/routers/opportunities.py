import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from apps.api.database import get_db
from apps.api.models import ProcurementOpportunity, Product, User
from apps.api.schemas.procurement import OpportunityEvaluateRequest, OpportunityResponse
from apps.api.services.auth import get_current_user
from apps.api.services.demo_data import (
    get_demo_opportunities,
)

router = APIRouter(prefix="/opportunities", tags=["opportunities"])


@router.get("", response_model=list[OpportunityResponse])
async def list_opportunities(
    urgency: str | None = None,
    status: str | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if db is None:
        return get_demo_opportunities(urgency=urgency, status=status)

    try:
        stmt = (
            select(ProcurementOpportunity)
            .options(
                selectinload(ProcurementOpportunity.product).selectinload(Product.images),
                selectinload(ProcurementOpportunity.recommended_supplier),
            )
            .where(ProcurementOpportunity.organization_id == current_user.organization_id)
            .order_by(ProcurementOpportunity.created_at.desc())
        )
        if urgency:
            stmt = stmt.where(ProcurementOpportunity.urgency == urgency)
        if status:
            stmt = stmt.where(ProcurementOpportunity.status == status)

        res = await db.execute(stmt)
        opps = res.scalars().all()
        return opps if opps else get_demo_opportunities(urgency=urgency, status=status)
    except Exception:
        return get_demo_opportunities(urgency=urgency, status=status)


@router.post("/{opportunity_id}/evaluate", response_model=OpportunityResponse)
async def evaluate_opportunity(
    opportunity_id: uuid.UUID,
    data: OpportunityEvaluateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(ProcurementOpportunity)
        .options(
            selectinload(ProcurementOpportunity.product).selectinload(Product.images),
            selectinload(ProcurementOpportunity.recommended_supplier),
        )
        .where(ProcurementOpportunity.id == opportunity_id, ProcurementOpportunity.organization_id == current_user.organization_id)
    )
    res = await db.execute(stmt)
    opp = res.scalar_one_or_none()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    opp.status = "EVALUATED"
    await db.commit()
    await db.refresh(opp)
    return opp
