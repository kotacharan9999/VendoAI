import abc
from decimal import Decimal
from typing import Any

from pydantic import BaseModel

from apps.api.config import settings


class NegotiationProposal(BaseModel):
    target_price: Decimal
    counter_offer: Decimal
    counter_shipping: Decimal
    payment_terms: str
    message: str
    strategy_reason: str
    confidence: Decimal


class SupplierEvaluation(BaseModel):
    recommended_supplier_name: str
    recommended_quote: Decimal
    expected_unit_cost: Decimal
    reason: str
    confidence: Decimal


class AIProvider(abc.ABC):
    @abc.abstractmethod
    async def evaluate_suppliers(
        self, product_title: str, quotes: list[dict[str, Any]]
    ) -> SupplierEvaluation:
        pass

    @abc.abstractmethod
    async def generate_counter_offer(
        self,
        product_title: str,
        supplier_name: str,
        current_quote: Decimal,
        round_number: int,
        target_price: Decimal,
        history: list[dict[str, Any]],
    ) -> NegotiationProposal:
        pass

    @abc.abstractmethod
    async def summarize_procurement(
        self,
        product_title: str,
        supplier_name: str,
        quantity: int,
        unit_price: Decimal,
        total_cost: Decimal,
        margin: Decimal,
        savings: Decimal,
    ) -> str:
        pass


class MockAIProvider(AIProvider):
    async def evaluate_suppliers(
        self, product_title: str, quotes: list[dict[str, Any]]
    ) -> SupplierEvaluation:
        sorted_quotes = sorted(quotes, key=lambda q: q.get("composite_score", 0), reverse=True)
        best = sorted_quotes[0] if sorted_quotes else quotes[0]
        return SupplierEvaluation(
            recommended_supplier_name=best.get("supplier_name", "NovaTech"),
            recommended_quote=Decimal(str(best.get("unit_price", 1180))),
            expected_unit_cost=Decimal(str(best.get("unit_price", 1180))),
            reason=f"Selected {best.get('supplier_name')} with highest composite score ({best.get('composite_score', '89.4')}) considering cost, delivery reliability, and quality standards.",
            confidence=Decimal("0.920"),
        )

    async def generate_counter_offer(
        self,
        product_title: str,
        supplier_name: str,
        current_quote: Decimal,
        round_number: int,
        target_price: Decimal,
        history: list[dict[str, Any]],
    ) -> NegotiationProposal:
        if round_number == 1:
            return NegotiationProposal(
                target_price=Decimal(1105),
                counter_offer=Decimal(1080),
                counter_shipping=Decimal("0.00"),
                payment_terms="Net 30",
                message=f"Thank you for the initial quote of ₹{current_quote}. For an order volume of 150 units, our target procurement cost is ₹1,080 with vendor-covered freight.",
                strategy_reason="Opening counter with high volume anchor and freight concession.",
                confidence=Decimal("0.910"),
            )
        elif round_number == 2:
            return NegotiationProposal(
                target_price=Decimal(1105),
                counter_offer=Decimal(1100),
                counter_shipping=Decimal("0.00"),
                payment_terms="Net 30",
                message="We can adjust our position to ₹1,100 per unit provided standard freight and 7-day expedited delivery remain included.",
                strategy_reason="Targeting convergence near target ceiling of ₹1,105 inclusive.",
                confidence=Decimal("0.940"),
            )
        else:
            return NegotiationProposal(
                target_price=Decimal(1105),
                counter_offer=Decimal(1105),
                counter_shipping=Decimal("0.00"),
                payment_terms="Net 30",
                message="We accept the revised terms of ₹1,105/unit inclusive of shipping on Net 30 terms.",
                strategy_reason="Agreement reached within acceptable price and margin parameters.",
                confidence=Decimal("0.980"),
            )

    async def summarize_procurement(
        self,
        product_title: str,
        supplier_name: str,
        quantity: int,
        unit_price: Decimal,
        total_cost: Decimal,
        margin: Decimal,
        savings: Decimal,
    ) -> str:
        return (
            f"Autonomous procurement completed for {quantity} units of {product_title} via {supplier_name} "
            f"at ₹{unit_price}/unit. Secured gross margin of {margin}% and savings of ₹{savings}."
        )


class OpenAIProvider(AIProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.fallback = MockAIProvider()

    async def evaluate_suppliers(self, product_title: str, quotes: list[dict[str, Any]]) -> SupplierEvaluation:
        return await self.fallback.evaluate_suppliers(product_title, quotes)

    async def generate_counter_offer(
        self,
        product_title: str,
        supplier_name: str,
        current_quote: Decimal,
        round_number: int,
        target_price: Decimal,
        history: list[dict[str, Any]],
    ) -> NegotiationProposal:
        return await self.fallback.generate_counter_offer(
            product_title, supplier_name, current_quote, round_number, target_price, history
        )

    async def summarize_procurement(
        self,
        product_title: str,
        supplier_name: str,
        quantity: int,
        unit_price: Decimal,
        total_cost: Decimal,
        margin: Decimal,
        savings: Decimal,
    ) -> str:
        return await self.fallback.summarize_procurement(
            product_title, supplier_name, quantity, unit_price, total_cost, margin, savings
        )


class GeminiProvider(AIProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.fallback = MockAIProvider()

    async def evaluate_suppliers(self, product_title: str, quotes: list[dict[str, Any]]) -> SupplierEvaluation:
        return await self.fallback.evaluate_suppliers(product_title, quotes)

    async def generate_counter_offer(
        self,
        product_title: str,
        supplier_name: str,
        current_quote: Decimal,
        round_number: int,
        target_price: Decimal,
        history: list[dict[str, Any]],
    ) -> NegotiationProposal:
        return await self.fallback.generate_counter_offer(
            product_title, supplier_name, current_quote, round_number, target_price, history
        )

    async def summarize_procurement(
        self,
        product_title: str,
        supplier_name: str,
        quantity: int,
        unit_price: Decimal,
        total_cost: Decimal,
        margin: Decimal,
        savings: Decimal,
    ) -> str:
        return await self.fallback.summarize_procurement(
            product_title, supplier_name, quantity, unit_price, total_cost, margin, savings
        )


class AnthropicProvider(AIProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.fallback = MockAIProvider()

    async def evaluate_suppliers(self, product_title: str, quotes: list[dict[str, Any]]) -> SupplierEvaluation:
        return await self.fallback.evaluate_suppliers(product_title, quotes)

    async def generate_counter_offer(
        self,
        product_title: str,
        supplier_name: str,
        current_quote: Decimal,
        round_number: int,
        target_price: Decimal,
        history: list[dict[str, Any]],
    ) -> NegotiationProposal:
        return await self.fallback.generate_counter_offer(
            product_title, supplier_name, current_quote, round_number, target_price, history
        )

    async def summarize_procurement(
        self,
        product_title: str,
        supplier_name: str,
        quantity: int,
        unit_price: Decimal,
        total_cost: Decimal,
        margin: Decimal,
        savings: Decimal,
    ) -> str:
        return await self.fallback.summarize_procurement(
            product_title, supplier_name, quantity, unit_price, total_cost, margin, savings
        )


def get_ai_provider() -> AIProvider:
    provider = settings.AI_PROVIDER.lower()
    if provider == "openai" and settings.OPENAI_API_KEY:
        return OpenAIProvider(settings.OPENAI_API_KEY)
    elif provider == "gemini" and settings.GEMINI_API_KEY:
        return GeminiProvider(settings.GEMINI_API_KEY)
    elif provider == "anthropic" and settings.ANTHROPIC_API_KEY:
        return AnthropicProvider(settings.ANTHROPIC_API_KEY)
    return MockAIProvider()
