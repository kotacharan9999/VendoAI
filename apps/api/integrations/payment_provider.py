import abc
import uuid
from decimal import Decimal
from typing import Any

from pydantic import BaseModel


class PaymentResult(BaseModel):
    transaction_id: str
    status: str
    provider: str
    payment_method: str
    amount: Decimal
    currency: str
    details: dict[str, Any]


class PaymentProvider(abc.ABC):
    @abc.abstractmethod
    async def process_payment(
        self, amount: Decimal, currency: str, po_number: str
    ) -> PaymentResult:
        pass


class MockPaymentProvider(PaymentProvider):
    async def process_payment(
        self, amount: Decimal, currency: str, po_number: str
    ) -> PaymentResult:
        tx_id = f"VAI-TXN-{uuid.uuid4().hex[:8].upper()}"
        return PaymentResult(
            transaction_id=tx_id,
            status="CAPTURED",
            provider="MockPaymentProvider",
            payment_method="SIMULATED_ESCROW",
            amount=amount,
            currency=currency,
            details={
                "po_number": po_number,
                "clearing_time": "instant",
                "escrow_guarantee": "active",
                "simulated": True,
            },
        )


def get_payment_provider() -> PaymentProvider:
    return MockPaymentProvider()
