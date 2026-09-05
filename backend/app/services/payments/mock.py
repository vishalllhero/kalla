from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from datetime import datetime
from uuid import uuid4
import random
import string


class PaymentServiceInterface(ABC):
    """Abstract interface for payment processing."""

    @abstractmethod
    async def process_payment(
        self,
        amount: int,
        currency: str,
        payment_method: str,
        order_id: str,
        buyer_id: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Process a payment.

        Returns:
            Dict with transaction_id, status, amount, payment_method, etc.
        """
        pass

    @abstractmethod
    async def verify_payment(self, transaction_id: str) -> Dict[str, Any]:
        """Verify a payment by transaction ID."""
        pass

    @abstractmethod
    async def refund_payment(self, transaction_id: str, amount: Optional[int] = None) -> Dict[str, Any]:
        """Process a refund."""
        pass

    @abstractmethod
    def get_provider(self) -> str:
        """Return the payment provider name."""
        pass


class MockPaymentService(PaymentServiceInterface):
    """Mock payment service that simulates successful payments."""

    def __init__(self):
        self._transactions: Dict[str, Dict[str, Any]] = {}

    def get_provider(self) -> str:
        return "mock"

    async def process_payment(
        self,
        amount: int,
        currency: str,
        payment_method: str,
        order_id: str,
        buyer_id: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        import asyncio
        await asyncio.sleep(0.5)

        txn_id = "txn_" + "".join(random.choices(string.ascii_lowercase + string.digits, k=16))

        transaction = {
            "transaction_id": txn_id,
            "order_id": order_id,
            "buyer_id": buyer_id,
            "amount": amount,
            "currency": currency,
            "payment_method": payment_method,
            "status": "completed",
            "gateway": "mock",
            "gateway_response": {
                "authorization_code": "".join(random.choices(string.digits, k=6)),
                "avs_result": "Y",
                "cvv_result": "M",
            },
            "created_at": datetime.utcnow().isoformat(),
            "completed_at": datetime.utcnow().isoformat(),
            "metadata": metadata or {},
        }

        self._transactions[txn_id] = transaction

        return {
            "transaction_id": txn_id,
            "status": "completed",
            "amount": amount,
            "currency": currency,
            "payment_method": payment_method,
            "gateway": "mock",
            "gateway_response": transaction["gateway_response"],
            "created_at": transaction["created_at"],
            "completed_at": transaction["completed_at"],
        }

    async def verify_payment(self, transaction_id: str) -> Dict[str, Any]:
        import asyncio
        await asyncio.sleep(0.2)

        txn = self._transactions.get(transaction_id)
        if not txn:
            return {"status": "not_found", "transaction_id": transaction_id}

        return {
            "transaction_id": transaction_id,
            "status": txn["status"],
            "amount": txn["amount"],
            "currency": txn["currency"],
            "payment_method": txn["payment_method"],
            "verified": True,
        }

    async def refund_payment(self, transaction_id: str, amount: Optional[int] = None) -> Dict[str, Any]:
        import asyncio
        await asyncio.sleep(0.4)

        txn = self._transactions.get(transaction_id)
        if not txn:
            return {"status": "not_found", "transaction_id": transaction_id}

        refund_id = "ref_" + "".join(random.choices(string.ascii_lowercase + string.digits, k=12))
        refund_amount = amount if amount is not None else txn["amount"]

        return {
            "refund_id": refund_id,
            "original_transaction_id": transaction_id,
            "status": "completed",
            "amount_refunded": refund_amount,
            "currency": txn["currency"],
            "gateway": "mock",
            "processed_at": datetime.utcnow().isoformat(),
        }


def get_payment_service() -> PaymentServiceInterface:
    return MockPaymentService()
