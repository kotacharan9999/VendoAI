from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from apps.api.database import get_db
from apps.api.models import Inventory, Product, SalesHistory, Supplier, SupplierQuote, User
from apps.api.schemas.data_health import DataHealthCheckItem, DataHealthReport
from apps.api.services.auth import get_current_user

router = APIRouter(prefix="/data-health", tags=["data-health"])


@router.get("", response_model=DataHealthReport)
async def get_data_health(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    org_id = current_user.organization_id
    checks: list[DataHealthCheckItem] = []

    stmt_dup_sku = (
        select(Product.sku, func.count(Product.id))
        .where(Product.organization_id == org_id)
        .group_by(Product.sku)
        .having(func.count(Product.id) > 1)
    )
    dup_skus = (await db.execute(stmt_dup_sku)).all()
    checks.append(
        DataHealthCheckItem(
            category="Catalog Integrity",
            check_name="Duplicate SKU Detection",
            status="PASSED" if not dup_skus else "FAILED",
            details="0 duplicate SKUs found across catalog." if not dup_skus else f"{len(dup_skus)} duplicate SKUs detected.",
            issue_count=len(dup_skus),
        )
    )

    stmt_inv_neg = select(func.count(Inventory.id)).where(
        Inventory.organization_id == org_id,
        Inventory.current_stock < 0,
    )
    neg_inv = (await db.execute(stmt_inv_neg)).scalar() or 0
    checks.append(
        DataHealthCheckItem(
            category="Inventory Consistency",
            check_name="Non-Negative Stock Constraints",
            status="PASSED" if neg_inv == 0 else "FAILED",
            details="All inventory levels are non-negative." if neg_inv == 0 else f"{neg_inv} items with negative stock.",
            issue_count=neg_inv,
        )
    )

    stmt_pricing = select(func.count(Product.id)).where(
        Product.organization_id == org_id,
        Product.selling_price <= 0,
    )
    bad_pricing = (await db.execute(stmt_pricing)).scalar() or 0
    checks.append(
        DataHealthCheckItem(
            category="Pricing & Margins",
            check_name="Positive Price Validation",
            status="PASSED" if bad_pricing == 0 else "FAILED",
            details="All products have positive selling prices." if bad_pricing == 0 else f"{bad_pricing} products with non-positive prices.",
            issue_count=bad_pricing,
        )
    )

    stmt_quotes = (
        select(Product.id)
        .outerjoin(SupplierQuote, Product.id == SupplierQuote.product_id)
        .where(Product.organization_id == org_id, SupplierQuote.id == None)
    )
    unquoted_prods = (await db.execute(stmt_quotes)).all()
    checks.append(
        DataHealthCheckItem(
            category="Supplier Network",
            check_name="Supplier Quote Coverage",
            status="PASSED" if len(unquoted_prods) == 0 else "WARNING",
            details="All catalog products have competitive supplier quotes." if len(unquoted_prods) == 0 else f"{len(unquoted_prods)} products lack supplier quotes.",
            issue_count=len(unquoted_prods),
        )
    )

    stmt_curr = select(func.count(Product.id)).where(
        Product.organization_id == org_id,
        Product.currency != "INR",
    )
    bad_curr = (await db.execute(stmt_curr)).scalar() or 0
    checks.append(
        DataHealthCheckItem(
            category="Financial Compliance",
            check_name="Currency Consistency (INR)",
            status="PASSED" if bad_curr == 0 else "WARNING",
            details="100% monetary entries normalized to INR." if bad_curr == 0 else f"{bad_curr} items with mismatching currency.",
            issue_count=bad_curr,
        )
    )

    passed = sum(1 for c in checks if c.status == "PASSED")
    warning = sum(1 for c in checks if c.status == "WARNING")
    failed = sum(1 for c in checks if c.status == "FAILED")
    health_score = int((passed / len(checks)) * 100) if checks else 100

    return DataHealthReport(
        overall_status="OPTIMAL" if failed == 0 and warning == 0 else "GOOD" if failed == 0 else "ATTENTION_REQUIRED",
        health_score=health_score,
        total_checks=len(checks),
        passed_checks=passed,
        warning_checks=warning,
        failed_checks=failed,
        checks=checks,
        metrics={
            "total_products": (await db.execute(select(func.count(Product.id)).where(Product.organization_id == org_id))).scalar() or 0,
            "total_suppliers": (await db.execute(select(func.count(Supplier.id)).where(Supplier.organization_id == org_id))).scalar() or 0,
            "total_sales_records": (await db.execute(select(func.count(SalesHistory.id)).where(SalesHistory.organization_id == org_id))).scalar() or 0,
        },
    )
