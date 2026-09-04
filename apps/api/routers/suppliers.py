import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from apps.api.database import get_db
from apps.api.models import PurchaseOrder, Supplier, SupplierProduct, SupplierQuote, User
from apps.api.schemas.supplier import (
    SupplierCreate,
    SupplierDetailResponse,
    SupplierQuoteResponse,
    SupplierResponse,
)
from apps.api.services.auth import get_current_user
from apps.api.services.supplier_service import SupplierService

router = APIRouter(prefix="/suppliers", tags=["suppliers"])


@router.get("", response_model=list[SupplierResponse])
async def list_suppliers(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Supplier)
        .where(Supplier.organization_id == current_user.organization_id, Supplier.is_active.is_(True))
        .order_by(Supplier.rating.desc())
    )
    res = await db.execute(stmt)
    suppliers = res.scalars().all()

    response = []
    for s in suppliers:
        item = SupplierResponse.model_validate(s)
        breakdown = SupplierService.calculate_procurement_score(
            quote_price=s.risk_score,
            benchmark_price=s.risk_score,
            reliability_score=s.reliability_score,
            delivery_score=s.delivery_score,
            quality_score=s.quality_score,
            payment_terms=s.payment_terms,
        )
        item.procurement_score = breakdown.composite_procurement_score
        response.append(item)
    return response


@router.get("/quotes", response_model=list[SupplierQuoteResponse])
async def list_quotes(
    product_id: uuid.UUID | None = None,
    supplier_id: uuid.UUID | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(SupplierQuote)
        .options(selectinload(SupplierQuote.supplier))
        .where(SupplierQuote.organization_id == current_user.organization_id)
        .order_by(SupplierQuote.created_at.desc())
    )
    if product_id:
        stmt = stmt.where(SupplierQuote.product_id == product_id)
    if supplier_id:
        stmt = stmt.where(SupplierQuote.supplier_id == supplier_id)

    res = await db.execute(stmt)
    return res.scalars().all()


@router.get("/{supplier_id}", response_model=SupplierDetailResponse)
async def get_supplier(
    supplier_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Supplier).where(Supplier.id == supplier_id, Supplier.organization_id == current_user.organization_id)
    res = await db.execute(stmt)
    supplier = res.scalar_one_or_none()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")

    detail = SupplierDetailResponse.model_validate(supplier)
    breakdown = SupplierService.calculate_procurement_score(
        quote_price=supplier.risk_score,
        benchmark_price=supplier.risk_score,
        reliability_score=supplier.reliability_score,
        delivery_score=supplier.delivery_score,
        quality_score=supplier.quality_score,
        payment_terms=supplier.payment_terms,
    )
    detail.scoring_breakdown = breakdown
    detail.procurement_score = breakdown.composite_procurement_score

    stmt_p = select(func.count(SupplierProduct.id)).where(SupplierProduct.supplier_id == supplier_id)
    detail.products_count = (await db.execute(stmt_p)).scalar() or 0

    stmt_q = select(func.count(SupplierQuote.id)).where(SupplierQuote.supplier_id == supplier_id, SupplierQuote.status == "RECEIVED")
    detail.active_quotes_count = (await db.execute(stmt_q)).scalar() or 0

    stmt_po = select(func.count(PurchaseOrder.id)).where(PurchaseOrder.supplier_id == supplier_id)
    detail.completed_orders_count = (await db.execute(stmt_po)).scalar() or 0

    return detail


@router.post("", response_model=SupplierResponse)
async def create_supplier(
    data: SupplierCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    supplier = Supplier(
        organization_id=current_user.organization_id,
        name=data.name,
        rating=data.rating,
        reliability_score=data.reliability_score,
        delivery_score=data.delivery_score,
        quality_score=data.quality_score,
        payment_terms=data.payment_terms,
        risk_score=data.risk_score,
        negotiation_style=data.negotiation_style,
        min_order_qty=data.min_order_qty,
        lead_time_days=data.lead_time_days,
        location=data.location,
        categories=data.categories,
        is_active=data.is_active,
    )
    db.add(supplier)
    await db.commit()
    await db.refresh(supplier)
    return supplier
