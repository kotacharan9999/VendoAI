import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from apps.api.database import get_db
from apps.api.models import Inventory, InventoryMovement, Product, User
from apps.api.schemas.inventory import (
    InventoryMovementResponse,
    InventoryResponse,
    InventoryUpdateRequest,
)
from apps.api.services.auth import get_current_user
from apps.api.services.demo_data import (
    get_demo_inventory,
    get_demo_inventory_movements,
)

router = APIRouter(prefix="/inventory", tags=["inventory"])


@router.get("", response_model=list[InventoryResponse])
async def list_inventory(
    risk_level: str | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if db is None:
        return get_demo_inventory(risk_level=risk_level)

    try:
        stmt = (
            select(Inventory)
            .options(selectinload(Inventory.product).selectinload(Product.images))
            .where(Inventory.organization_id == current_user.organization_id)
        )
        if risk_level:
            stmt = stmt.where(Inventory.stockout_risk_level == risk_level)

        res = await db.execute(stmt)
        records = res.scalars().all()
        return records if records else get_demo_inventory(risk_level=risk_level)
    except Exception:
        return get_demo_inventory(risk_level=risk_level)


@router.get("/movements", response_model=list[InventoryMovementResponse])
async def list_movements(
    product_id: uuid.UUID | None = None,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if db is None:
        return get_demo_inventory_movements(product_id=product_id, limit=limit)

    try:
        stmt = (
            select(InventoryMovement)
            .where(InventoryMovement.organization_id == current_user.organization_id)
            .order_by(InventoryMovement.created_at.desc())
            .limit(limit)
        )
        if product_id:
            stmt = stmt.where(InventoryMovement.product_id == product_id)
        res = await db.execute(stmt)
        movs = res.scalars().all()
        return movs if movs else get_demo_inventory_movements(product_id=product_id, limit=limit)
    except Exception:
        return get_demo_inventory_movements(product_id=product_id, limit=limit)


@router.get("/{inventory_id}", response_model=InventoryResponse)
async def get_inventory_item(
    inventory_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if db is None:
        inv = get_demo_inventory()
        return inv[0]

    try:
        stmt = (
            select(Inventory)
            .options(selectinload(Inventory.product).selectinload(Product.images))
            .where(Inventory.id == inventory_id, Inventory.organization_id == current_user.organization_id)
        )
        res = await db.execute(stmt)
        item = res.scalar_one_or_none()
        if not item:
            inv = get_demo_inventory()
            return inv[0]
        return item
    except Exception:
        inv = get_demo_inventory()
        return inv[0]


@router.put("/{inventory_id}", response_model=InventoryResponse)
async def update_inventory(
    inventory_id: uuid.UUID,
    data: InventoryUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Inventory).where(Inventory.id == inventory_id, Inventory.organization_id == current_user.organization_id)
    res = await db.execute(stmt)
    inv = res.scalar_one_or_none()
    if not inv:
        raise HTTPException(status_code=404, detail="Inventory record not found")

    old_stock = inv.current_stock
    new_stock = data.current_stock if data.current_stock is not None else old_stock

    if data.current_stock is not None:
        inv.current_stock = data.current_stock
    if data.reserved_stock is not None:
        inv.reserved_stock = data.reserved_stock
    if data.expected_inbound is not None:
        inv.expected_inbound = data.expected_inbound
    if data.reorder_point is not None:
        inv.reorder_point = data.reorder_point
    if data.safety_stock is not None:
        inv.safety_stock = data.safety_stock
    if data.suggested_reorder_qty is not None:
        inv.suggested_reorder_qty = data.suggested_reorder_qty

    # Recalculate risk level based on updated levels
    if inv.current_stock <= inv.safety_stock:
        inv.stockout_risk_level = "CRITICAL"
    elif inv.current_stock <= inv.reorder_point:
        inv.stockout_risk_level = "HIGH"
    elif inv.current_stock <= int(inv.reorder_point * 1.5):
        inv.stockout_risk_level = "MEDIUM"
    else:
        inv.stockout_risk_level = "HEALTHY"

    # Log inventory movement if current stock changed
    if data.current_stock is not None and data.current_stock != old_stock:
        stock_diff = new_stock - old_stock
        movement = InventoryMovement(
            organization_id=current_user.organization_id,
            product_id=inv.product_id,
            reference_type="MANUAL_ADJUSTMENT",
            reference_id=str(inv.id),
            movement_type="ADJUSTMENT",
            quantity=abs(stock_diff),
            previous_stock=old_stock,
            new_stock=new_stock,
            reason=f"Manual stock adjustment: {old_stock} -> {new_stock} units by {current_user.email}",
        )
        db.add(movement)

    await db.commit()

    # Re-query with eager loading so the product relationship is properly loaded
    # before Pydantic serializes the response (avoids async lazy-load error)
    stmt_reload = (
        select(Inventory)
        .options(selectinload(Inventory.product).selectinload(Product.images))
        .where(Inventory.id == inventory_id)
    )
    res_reload = await db.execute(stmt_reload)
    return res_reload.scalar_one()
