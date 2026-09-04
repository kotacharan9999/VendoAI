from decimal import Decimal

from pydantic import BaseModel


class MarginAnalysis(BaseModel):
    selling_price: Decimal
    unit_cost: Decimal
    shipping_per_unit: Decimal
    operational_cost_per_unit: Decimal
    total_unit_cost: Decimal
    gross_profit_per_unit: Decimal
    gross_margin_pct: Decimal
    net_margin_pct: Decimal
    quantity: int
    total_procurement_cost: Decimal
    total_expected_revenue: Decimal
    total_gross_profit: Decimal
    initial_quote_cost: Decimal | None = None
    total_savings: Decimal
    roi_pct: Decimal


class MarginService:
    @staticmethod
    def calculate_margin(
        selling_price: Decimal,
        unit_cost: Decimal,
        quantity: int = 1,
        shipping_per_unit: Decimal = Decimal("0.00"),
        operational_cost_per_unit: Decimal = Decimal("0.00"),
        initial_unit_quote: Decimal | None = None,
    ) -> MarginAnalysis:
        total_unit_cost = (unit_cost + shipping_per_unit).quantize(Decimal("0.01"))
        gross_profit_per_unit = (selling_price - total_unit_cost).quantize(Decimal("0.01"))

        if selling_price > Decimal(0):
            gross_margin_pct = ((gross_profit_per_unit / selling_price) * Decimal(100)).quantize(Decimal("0.01"))
        else:
            gross_margin_pct = Decimal("0.00")

        net_profit_per_unit = gross_profit_per_unit - operational_cost_per_unit
        if selling_price > Decimal(0):
            net_margin_pct = ((net_profit_per_unit / selling_price) * Decimal(100)).quantize(Decimal("0.01"))
        else:
            net_margin_pct = Decimal("0.00")

        total_procurement_cost = (total_unit_cost * Decimal(str(quantity))).quantize(Decimal("0.01"))
        total_expected_revenue = (selling_price * Decimal(str(quantity))).quantize(Decimal("0.01"))
        total_gross_profit = (gross_profit_per_unit * Decimal(str(quantity))).quantize(Decimal("0.01"))

        if initial_unit_quote and initial_unit_quote > total_unit_cost:
            total_savings = ((initial_unit_quote - total_unit_cost) * Decimal(str(quantity))).quantize(Decimal("0.01"))
        else:
            total_savings = Decimal("0.00")

        if total_procurement_cost > Decimal(0):
            roi_pct = ((total_gross_profit / total_procurement_cost) * Decimal(100)).quantize(Decimal("0.01"))
        else:
            roi_pct = Decimal("0.00")

        return MarginAnalysis(
            selling_price=selling_price,
            unit_cost=unit_cost,
            shipping_per_unit=shipping_per_unit,
            operational_cost_per_unit=operational_cost_per_unit,
            total_unit_cost=total_unit_cost,
            gross_profit_per_unit=gross_profit_per_unit,
            gross_margin_pct=gross_margin_pct,
            net_margin_pct=net_margin_pct,
            quantity=quantity,
            total_procurement_cost=total_procurement_cost,
            total_expected_revenue=total_expected_revenue,
            total_gross_profit=total_gross_profit,
            initial_quote_cost=initial_unit_quote,
            total_savings=total_savings,
            roi_pct=roi_pct,
        )
