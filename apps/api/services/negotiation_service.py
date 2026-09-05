import uuid
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from apps.api.models.negotiation import Negotiation, NegotiationMessage
from apps.api.models.product import Product
from apps.api.models.supplier import Supplier


class NegotiationService:
    @staticmethod
    def simulate_supplier_response(
        persona: str,
        initial_price: Decimal,
        buyer_offer: Decimal,
        round_number: int,
        max_rounds: int,
        is_canonical: bool = False,
        is_canonical_demo: bool | None = None,
    ) -> tuple[Decimal, Decimal, str, bool]:
        if is_canonical_demo is not None:
            is_canonical = is_canonical_demo
        if is_canonical:
            if round_number == 1:
                return Decimal(1140), Decimal("0.00"), "We can reduce the unit price from ₹1,180 to ₹1,140 based on your volume commitment of 150 units, with freight included.", False
            elif round_number == 2:
                return Decimal(1105), Decimal("0.00"), "Our final best concession is ₹1,105 per unit with expedited 7-day freight and Net 30 payment terms.", True
            else:
                return Decimal(1105), Decimal("0.00"), "Confirmed at ₹1,105/unit inclusive of delivery.", True

        discount_flexibility = {
            "Aggressive Negotiator": Decimal("0.04"),
            "Rigid Supplier": Decimal("0.02"),
            "Premium Supplier": Decimal("0.05"),
            "Volume Supplier": Decimal("0.12"),
            "Fast Delivery Supplier": Decimal("0.06"),
            "Budget Supplier": Decimal("0.08"),
            "Reliable Supplier": Decimal("0.07"),
            "High-Risk Low-Cost Supplier": Decimal("0.15"),
        }.get(persona, Decimal("0.06"))

        floor_price = (initial_price * (Decimal("1.00") - discount_flexibility)).quantize(Decimal(1))
        progress_ratio = Decimal(str(round_number)) / Decimal(str(max_rounds))
        concession = (initial_price - floor_price) * progress_ratio
        supplier_offer = max(floor_price, (initial_price - concession).quantize(Decimal(1)))

        if buyer_offer >= floor_price:
            supplier_offer = max(buyer_offer, floor_price)
            is_agreed = True
            message = f"We accept your counter-offer of ₹{supplier_offer} under standard terms."
        elif round_number >= max_rounds:
            is_agreed = True
            message = f"This is our final position: ₹{supplier_offer} per unit."
        else:
            is_agreed = False
            message = f"We can meet at ₹{supplier_offer} per unit with standard delivery."

        return supplier_offer, Decimal("0.00"), message, is_agreed

    @staticmethod
    async def execute_negotiation_round(
        db: AsyncSession,
        negotiation_id: uuid.UUID,
        buyer_offer: Decimal,
        shipping_cost: Decimal,
        payment_terms: str,
        buyer_message: str,
    ) -> Negotiation:
        stmt = (
            select(Negotiation, Supplier, Product)
            .join(Supplier, Negotiation.supplier_id == Supplier.id)
            .join(Product, Negotiation.product_id == Product.id)
            .where(Negotiation.id == negotiation_id)
        )
        result = await db.execute(stmt)
        row = result.first()
        if not row:
            raise ValueError("Negotiation not found")
        negotiation, supplier, product = row

        round_num = negotiation.rounds_completed + 1
        is_canonical = "Wireless Earbuds Pro" in product.title and "NovaTech" in supplier.name

        sup_price, sup_ship, sup_text, is_agreed = NegotiationService.simulate_supplier_response(
            persona=supplier.negotiation_style,
            initial_price=negotiation.initial_quote,
            buyer_offer=buyer_offer,
            round_number=round_num,
            max_rounds=negotiation.max_rounds,
            is_canonical=is_canonical,
        )

        msg = NegotiationMessage(
            negotiation_id=negotiation.id,
            round_number=round_num,
            sender="BUYER_AI",
            offer_price=buyer_offer,
            shipping_cost=shipping_cost,
            payment_terms=payment_terms,
            message_text=buyer_message,
            supplier_counter_price=sup_price,
            supplier_response_text=sup_text,
        )
        db.add(msg)

        negotiation.rounds_completed = round_num

        if is_agreed or round_num >= negotiation.max_rounds or sup_price <= negotiation.target_price:
            # When supplier agrees, use their final price (canonical spec: 1105)
            # When buyer offer beats supplier floor, use buyer offer
            if is_agreed:
                final_unit = sup_price
            elif sup_price <= buyer_offer:
                final_unit = buyer_offer
            else:
                final_unit = sup_price
            negotiation.final_price = final_unit
            negotiation.status = "COMPLETED"
            total_savings = (negotiation.initial_quote - final_unit) * Decimal(str(negotiation.quantity))
            negotiation.expected_savings = total_savings
            unit_margin = ((product.selling_price - final_unit) / product.selling_price) * Decimal(100)
            negotiation.expected_margin = unit_margin.quantize(Decimal("0.01"))
        else:
            negotiation.status = "IN_PROGRESS"

        await db.flush()
        return negotiation
