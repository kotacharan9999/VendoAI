from decimal import Decimal

import pytest
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from apps.api.database import AsyncSessionLocal
from apps.api.models import Inventory, Product, SalesHistory, SupplierQuote


@pytest.mark.asyncio
async def test_database_seeded():
    async with AsyncSessionLocal() as db:
        stmt = select(Product).where(Product.sku == "WBR-AUD-1048")
        res = await db.execute(stmt)
        product = res.scalar_one_or_none()
        assert product is not None
        assert product.title == "Wireless Earbuds Pro"
        assert product.selling_price == Decimal("1999.00")
        assert product.cost_price == Decimal("1250.00")


@pytest.mark.asyncio
async def test_inventory_stockout_risk():
    async with AsyncSessionLocal() as db:
        stmt = (
            select(Inventory)
            .join(Product, Inventory.product_id == Product.id)
            .where(Product.sku == "WBR-AUD-1048")
        )
        res = await db.execute(stmt)
        inv = res.scalar_one_or_none()
        assert inv is not None
        assert inv.current_stock >= 0
        assert inv.stockout_risk_level in ("CRITICAL", "RESOLVED", "HIGH", "MEDIUM", "LOW", "HEALTHY")
        assert inv.days_of_inventory == Decimal("1.5")


@pytest.mark.asyncio
async def test_sales_history():
    async with AsyncSessionLocal() as db:
        stmt = (
            select(SalesHistory)
            .join(Product, SalesHistory.product_id == Product.id)
            .where(Product.sku == "WBR-AUD-1048")
            .order_by(SalesHistory.date.desc())
            .limit(30)
        )
        res = await db.execute(stmt)
        sales = res.scalars().all()
        assert len(sales) == 30


@pytest.mark.asyncio
async def test_supplier_quotes():
    async with AsyncSessionLocal() as db:
        stmt = (
            select(SupplierQuote)
            .options(selectinload(SupplierQuote.supplier))
            .join(Product, SupplierQuote.product_id == Product.id)
            .where(Product.sku == "WBR-AUD-1048")
        )
        res = await db.execute(stmt)
        quotes = res.scalars().all()
        assert len(quotes) >= 3

        prices = {q.supplier.name: q.unit_price for q in quotes}
        assert "NovaTech Industrial Solutions" in prices
        assert "PrimeSource Global" in prices
        assert "Orbit Electronics & Components" in prices


@pytest.mark.asyncio
async def test_deterministic_margin_calculation():
    from apps.api.services.margin_service import MarginService

    analysis = MarginService.calculate_margin(
        selling_price=Decimal("1999.00"),
        unit_cost=Decimal("1105.00"),
        quantity=150,
        shipping_per_unit=Decimal("0.00"),
        initial_unit_quote=Decimal("1180.00"),
    )

    assert analysis.gross_margin_pct == Decimal("44.72")
    assert analysis.gross_profit_per_unit == Decimal("894.00")
    assert analysis.total_savings == Decimal("11250.00")
    assert analysis.roi_pct == Decimal("80.90")


@pytest.mark.asyncio
async def test_policy_engine_block_on_low_margin():
    from apps.api.policy.policy_engine import PolicyEngine

    result = PolicyEngine.evaluate_procurement(
        procurement_amount=Decimal("165750.00"),
        calculated_margin_pct=Decimal("20.00"),
        supplier_rating=Decimal("4.20"),
        supplier_risk=Decimal("15.00"),
        quotes_count=3,
    )

    assert result.decision == "BLOCKED"
    assert result.blocked is True
    assert len(result.violated_rules) > 0
    assert "below minimum requirement" in result.violated_rules[0]


@pytest.mark.asyncio
async def test_policy_engine_requires_human_approval():
    from apps.api.policy.policy_engine import PolicyEngine

    result = PolicyEngine.evaluate_procurement(
        procurement_amount=Decimal("165750.00"),
        calculated_margin_pct=Decimal("44.72"),
        supplier_rating=Decimal("4.20"),
        supplier_risk=Decimal("15.00"),
        quotes_count=3,
    )

    assert result.decision == "REQUIRES_HUMAN_APPROVAL"
    assert result.requires_human_approval is True
    assert result.blocked is False


@pytest.mark.asyncio
async def test_policy_engine_auto_approval():
    from apps.api.policy.policy_engine import PolicyEngine

    result = PolicyEngine.evaluate_procurement(
        procurement_amount=Decimal("30000.00"),
        calculated_margin_pct=Decimal("40.00"),
        supplier_rating=Decimal("4.50"),
        supplier_risk=Decimal("10.00"),
        quotes_count=2,
        auto_purchase_enabled=True,
    )

    assert result.decision == "ALLOWED"
    assert result.allowed is True
    assert result.requires_human_approval is False
    assert result.blocked is False


@pytest.mark.asyncio
async def test_supplier_procurement_score():
    from apps.api.services.supplier_service import SupplierService

    breakdown = SupplierService.calculate_procurement_score(
        quote_price=Decimal("1180.00"),
        benchmark_price=Decimal("1188.33"),
        reliability_score=Decimal("88.00"),
        delivery_score=Decimal("90.00"),
        quality_score=Decimal("85.00"),
        payment_terms="Net 30",
    )

    assert breakdown.cost_score > Decimal("0")
    assert breakdown.reliability_score == Decimal("88.00")
    assert breakdown.composite_procurement_score > Decimal("0")


@pytest.mark.asyncio
async def test_forecasting_engine():
    from apps.api.forecasting.engine import ForecastingEngine

    sales_records = [
        {"date": "2026-08-01", "units_sold": 12},
        {"date": "2026-08-02", "units_sold": 11},
        {"date": "2026-08-03", "units_sold": 13},
        {"date": "2026-08-04", "units_sold": 12},
        {"date": "2026-08-05", "units_sold": 10},
        {"date": "2026-08-06", "units_sold": 14},
        {"date": "2026-08-07", "units_sold": 12},
        {"date": "2026-08-08", "units_sold": 13},
        {"date": "2026-08-09", "units_sold": 11},
        {"date": "2026-08-10", "units_sold": 12},
        {"date": "2026-08-11", "units_sold": 10},
        {"date": "2026-08-12", "units_sold": 13},
        {"date": "2026-08-13", "units_sold": 11},
        {"date": "2026-08-14", "units_sold": 12},
    ]

    engine = ForecastingEngine()
    result = engine.forecast("test-product", sales_records, horizon_days=30)

    assert result.predicted_demand > Decimal("0")
    assert result.confidence_score > Decimal("0.5")
    assert result.model_name == "WeightedMovingAverageWithTrend"


@pytest.mark.asyncio
async def test_negotiation_simulation_canonical():
    from apps.api.services.negotiation_service import NegotiationService

    sup_price, sup_ship, sup_text, is_agreed = NegotiationService.simulate_supplier_response(
        persona="Reliable Supplier",
        initial_price=Decimal("1180"),
        buyer_offer=Decimal("1080"),
        round_number=1,
        max_rounds=4,
        is_canonical_demo=True,
    )

    assert sup_price == Decimal("1140")
    assert is_agreed is False

    sup_price2, sup_ship2, sup_text2, is_agreed2 = NegotiationService.simulate_supplier_response(
        persona="Reliable Supplier",
        initial_price=Decimal("1180"),
        buyer_offer=Decimal("1100"),
        round_number=2,
        max_rounds=4,
        is_canonical_demo=True,
    )

    assert sup_price2 == Decimal("1105")
    assert is_agreed2 is True


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
