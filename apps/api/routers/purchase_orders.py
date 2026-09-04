import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from apps.api.database import get_db
from apps.api.models import Product, PurchaseOrder, PurchaseOrderItem, User
from apps.api.schemas.procurement import PurchaseOrderCreate, PurchaseOrderResponse
from apps.api.services.auth import get_current_user

router = APIRouter(prefix="/purchase-orders", tags=["purchase-orders"])


@router.get("", response_model=list[PurchaseOrderResponse])
async def list_purchase_orders(
    status: str | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(PurchaseOrder)
        .options(
            selectinload(PurchaseOrder.supplier),
            selectinload(PurchaseOrder.items).selectinload(PurchaseOrderItem.product).selectinload(Product.images),
            selectinload(PurchaseOrder.payments),
        )
        .where(PurchaseOrder.organization_id == current_user.organization_id)
        .order_by(PurchaseOrder.created_at.desc())
    )
    if status:
        stmt = stmt.where(PurchaseOrder.status == status)

    res = await db.execute(stmt)
    return res.scalars().all()


@router.get("/{po_id}", response_model=PurchaseOrderResponse)
async def get_purchase_order(
    po_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(PurchaseOrder)
        .options(
            selectinload(PurchaseOrder.supplier),
            selectinload(PurchaseOrder.items).selectinload(PurchaseOrderItem.product).selectinload(Product.images),
            selectinload(PurchaseOrder.payments),
        )
        .where(PurchaseOrder.id == po_id, PurchaseOrder.organization_id == current_user.organization_id)
    )
    res = await db.execute(stmt)
    po = res.scalar_one_or_none()
    if not po:
        raise HTTPException(status_code=404, detail="Purchase Order not found")
    return po


@router.post("", response_model=PurchaseOrderResponse)
async def create_purchase_order(
    data: PurchaseOrderCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    subtotal = sum(item.total_price for item in data.items)
    total_amount = subtotal + data.shipping_cost
    po_number = f"VAI-PO-{uuid.uuid4().hex[:8].upper()}"

    po = PurchaseOrder(
        organization_id=current_user.organization_id,
        po_number=po_number,
        supplier_id=data.supplier_id,
        subtotal=subtotal,
        shipping_cost=data.shipping_cost,
        total_amount=total_amount,
        currency=data.currency,
        expected_delivery_date=data.expected_delivery_date,
        status="DRAFT",
        payment_status="PENDING",
        created_by_id=current_user.id,
    )
    db.add(po)
    await db.flush()

    for item in data.items:
        po_item = PurchaseOrderItem(
            purchase_order_id=po.id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=item.unit_price,
            total_price=item.total_price,
        )
        db.add(po_item)

    await db.commit()

    stmt = (
        select(PurchaseOrder)
        .options(
            selectinload(PurchaseOrder.supplier),
            selectinload(PurchaseOrder.items).selectinload(PurchaseOrderItem.product).selectinload(Product.images),
            selectinload(PurchaseOrder.payments),
        )
        .where(PurchaseOrder.id == po.id)
    )
    res = await db.execute(stmt)
    return res.scalar_one()
