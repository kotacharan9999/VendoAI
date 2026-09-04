import uuid
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from apps.api.database import get_db
from apps.api.models import (
    Inventory,
    Product,
    SupplierQuote,
    User,
)
from apps.api.schemas.product import (
    ProductCreate,
    ProductDetailResponse,
    ProductResponse,
)
from apps.api.services.auth import get_current_user

router = APIRouter(prefix="/products", tags=["products"])


@router.get("", response_model=list[ProductResponse])
async def list_products(
    category: str | None = None,
    search: str | None = None,
    risk_level: str | None = None,
    offset: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Product)
        .options(selectinload(Product.images), selectinload(Product.inventory))
        .where(Product.organization_id == current_user.organization_id)
    )

    if category:
        stmt = stmt.where(Product.category == category)
    if search:
        search_fmt = f"%{search}%"
        stmt = stmt.where(or_(Product.title.ilike(search_fmt), Product.sku.ilike(search_fmt)))

    stmt = stmt.order_by(Product.created_at.desc()).offset(offset).limit(limit)
    res = await db.execute(stmt)
    products = res.scalars().all()

    response = []
    for p in products:
        item = ProductResponse.model_validate(p)
        if p.inventory:
            item.current_stock = p.inventory.current_stock
            item.stockout_risk_level = p.inventory.stockout_risk_level
            item.days_of_inventory = p.inventory.days_of_inventory
        if risk_level and item.stockout_risk_level != risk_level:
            continue
        response.append(item)
    return response


@router.get("/{product_id}", response_model=ProductDetailResponse)
async def get_product(
    product_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Product)
        .options(
            selectinload(Product.images),
            selectinload(Product.inventory),
            selectinload(Product.supplier_products),
            selectinload(Product.sales_records),
        )
        .where(Product.id == product_id, Product.organization_id == current_user.organization_id)
    )
    res = await db.execute(stmt)
    product = res.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    detail = ProductDetailResponse.model_validate(product)
    if product.inventory:
        detail.current_stock = product.inventory.current_stock
        detail.stockout_risk_level = product.inventory.stockout_risk_level
        detail.days_of_inventory = product.inventory.days_of_inventory
        detail.safety_stock = product.inventory.safety_stock
        detail.reorder_point = product.inventory.reorder_point
        detail.suggested_reorder_qty = product.inventory.suggested_reorder_qty

    if product.sales_records:
        sales_30d = sorted(product.sales_records, key=lambda s: s.date, reverse=True)[:30]
        tot = sum(s.units_sold for s in sales_30d)
        detail.avg_daily_sales = (Decimal(str(tot)) / Decimal(str(max(1, len(sales_30d))))).quantize(Decimal("0.1"))
        detail.forecasted_demand_30d = (detail.avg_daily_sales * Decimal(30)).quantize(Decimal("0.1"))

    stmt_quotes = select(SupplierQuote).where(
        SupplierQuote.product_id == product_id,
        SupplierQuote.organization_id == current_user.organization_id,
        SupplierQuote.status == "RECEIVED",
    )
    quotes = (await db.execute(stmt_quotes)).scalars().all()
    detail.active_suppliers_count = len(quotes)
    if quotes:
        detail.lowest_quote_price = min(q.unit_price for q in quotes)

    return detail


@router.post("", response_model=ProductResponse)
async def create_product(
    data: ProductCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    product = Product(
        organization_id=current_user.organization_id,
        title=data.title,
        description=data.description,
        category=data.category,
        sku=data.sku,
        source=data.source,
        source_product_id=data.source_product_id,
        selling_price=data.selling_price,
        cost_price=data.cost_price,
        currency=data.currency,
        dimensions=data.dimensions,
        metadata_json=data.metadata_json,
    )
    db.add(product)
    await db.flush()

    inv = Inventory(
        organization_id=current_user.organization_id,
        product_id=product.id,
        current_stock=0,
        reorder_point=10,
        safety_stock=5,
        suggested_reorder_qty=50,
    )
    db.add(inv)
    await db.commit()

    return ProductResponse.model_validate(product)
