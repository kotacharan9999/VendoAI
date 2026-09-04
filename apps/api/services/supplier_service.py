import uuid
from decimal import Decimal
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from apps.api.models.supplier import Supplier, SupplierQuote
from apps.api.schemas.supplier import SupplierScoringBreakdown


class SupplierService:
    @staticmethod
    def calculate_procurement_score(
        quote_price: Decimal,
        benchmark_price: Decimal,
        reliability_score: Decimal,
        delivery_score: Decimal,
        quality_score: Decimal,
        payment_terms: str,
    ) -> SupplierScoringBreakdown:
        if benchmark_price > Decimal(0):
            price_ratio = benchmark_price / quote_price
            cost_score = (min(Decimal("1.20"), max(Decimal("0.50"), price_ratio)) * Decimal(100) - Decimal(50)) * Decimal("2.0")
            cost_score = max(Decimal("0.0"), min(Decimal("100.0"), cost_score))
        else:
            cost_score = Decimal("75.0")

        terms_map = {
            "Net 60": Decimal("100.0"),
            "Net 30": Decimal("85.0"),
            "Net 15": Decimal("70.0"),
            "Advance": Decimal("40.0"),
            "COD": Decimal("50.0"),
        }
        payment_score = terms_map.get(payment_terms, Decimal("70.0"))

        composite = (
            cost_score * Decimal("0.35")
            + reliability_score * Decimal("0.25")
            + delivery_score * Decimal("0.20")
            + quality_score * Decimal("0.10")
            + payment_score * Decimal("0.10")
        ).quantize(Decimal("0.01"))

        return SupplierScoringBreakdown(
            cost_score=cost_score.quantize(Decimal("0.01")),
            reliability_score=reliability_score.quantize(Decimal("0.01")),
            delivery_score=delivery_score.quantize(Decimal("0.01")),
            quality_score=quality_score.quantize(Decimal("0.01")),
            payment_terms_score=payment_score.quantize(Decimal("0.01")),
            composite_procurement_score=composite,
        )

    @staticmethod
    async def get_quotes_for_product(
        db: AsyncSession, organization_id: uuid.UUID, product_id: uuid.UUID
    ) -> list[dict[str, Any]]:
        stmt = (
            select(SupplierQuote, Supplier)
            .join(Supplier, SupplierQuote.supplier_id == Supplier.id)
            .where(
                SupplierQuote.organization_id == organization_id,
                SupplierQuote.product_id == product_id,
                SupplierQuote.status == "RECEIVED",
            )
        )
        result = await db.execute(stmt)
        rows = result.all()

        if not rows:
            return []

        avg_price = sum(q.unit_price for q, _ in rows) / Decimal(str(len(rows)))
        quote_list = []
        for quote, supplier in rows:
            breakdown = SupplierService.calculate_procurement_score(
                quote_price=quote.unit_price + quote.shipping_cost,
                benchmark_price=avg_price,
                reliability_score=supplier.reliability_score,
                delivery_score=supplier.delivery_score,
                quality_score=supplier.quality_score,
                payment_terms=quote.payment_terms,
            )
            quote_list.append({
                "quote_id": quote.id,
                "supplier_id": supplier.id,
                "supplier_name": supplier.name,
                "unit_price": quote.unit_price,
                "shipping_cost": quote.shipping_cost,
                "total_unit_cost": quote.unit_price + quote.shipping_cost,
                "lead_time_days": quote.lead_time_days,
                "payment_terms": quote.payment_terms,
                "rating": supplier.rating,
                "risk_score": supplier.risk_score,
                "negotiation_style": supplier.negotiation_style,
                "composite_score": breakdown.composite_procurement_score,
                "breakdown": breakdown,
            })

        quote_list.sort(key=lambda x: x["composite_score"], reverse=True)
        return quote_list
