import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from apps.api.database import get_db
from apps.api.models import Negotiation, Product, User
from apps.api.schemas.negotiation import (
    CounterOfferRequest,
    NegotiationCreate,
    NegotiationDetailResponse,
    NegotiationResponse,
)
from apps.api.services.auth import get_current_user
from apps.api.services.demo_data import (
    get_demo_negotiation_detail,
    get_demo_negotiations,
)
from apps.api.services.negotiation_service import NegotiationService

router = APIRouter(prefix="/negotiations", tags=["negotiations"])


@router.get("", response_model=list[NegotiationResponse])
async def list_negotiations(
    product_id: uuid.UUID | None = None,
    status: str | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if db is None:
        return get_demo_negotiations(product_id=product_id, status=status)

    try:
        stmt = (
            select(Negotiation)
            .options(
                selectinload(Negotiation.product).selectinload(Product.images),
                selectinload(Negotiation.supplier),
            )
            .where(Negotiation.organization_id == current_user.organization_id)
            .order_by(Negotiation.created_at.desc())
        )
        if product_id:
            stmt = stmt.where(Negotiation.product_id == product_id)
        if status:
            stmt = stmt.where(Negotiation.status == status)

        res = await db.execute(stmt)
        negs = res.scalars().all()
        return negs if negs else get_demo_negotiations(product_id=product_id, status=status)
    except Exception:
        return get_demo_negotiations(product_id=product_id, status=status)


@router.get("/{negotiation_id}", response_model=NegotiationDetailResponse)
async def get_negotiation(
    negotiation_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if db is None:
        return get_demo_negotiation_detail(negotiation_id)

    try:
        stmt = (
            select(Negotiation)
            .options(
                selectinload(Negotiation.product).selectinload(Product.images),
                selectinload(Negotiation.supplier),
                selectinload(Negotiation.messages),
            )
            .where(Negotiation.id == negotiation_id, Negotiation.organization_id == current_user.organization_id)
        )
        res = await db.execute(stmt)
        item = res.scalar_one_or_none()
        if not item:
            return get_demo_negotiation_detail(negotiation_id)
        return item
    except Exception:
        return get_demo_negotiation_detail(negotiation_id)


@router.post("", response_model=NegotiationResponse)
async def create_negotiation(
    data: NegotiationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    negotiation = Negotiation(
        organization_id=current_user.organization_id,
        product_id=data.product_id,
        supplier_id=data.supplier_id,
        target_price=data.target_price,
        initial_quote=data.initial_quote,
        quantity=data.quantity,
        max_rounds=data.max_rounds,
        status="IN_PROGRESS",
        strategy=data.strategy,
    )
    db.add(negotiation)
    await db.commit()
    await db.refresh(negotiation)
    return negotiation


@router.post("/{negotiation_id}/counter", response_model=NegotiationDetailResponse)
async def counter_negotiation(
    negotiation_id: uuid.UUID,
    data: CounterOfferRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        await NegotiationService.execute_negotiation_round(
            db=db,
            negotiation_id=negotiation_id,
            buyer_offer=data.offer_price,
            shipping_cost=data.shipping_cost,
            payment_terms=data.payment_terms,
            buyer_message=data.message_text,
        )
        await db.commit()

        stmt = (
            select(Negotiation)
            .options(
                selectinload(Negotiation.product).selectinload(Product.images),
                selectinload(Negotiation.supplier),
                selectinload(Negotiation.messages),
            )
            .where(Negotiation.id == negotiation_id)
        )
        res = await db.execute(stmt)
        return res.scalar_one()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
