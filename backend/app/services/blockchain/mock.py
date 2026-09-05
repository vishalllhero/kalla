import hashlib
import json
import random
import string
from typing import Dict, Any, List, Optional
from datetime import datetime
from uuid import uuid4

from ...core.config import settings
from .base import BlockchainServiceInterface


def _generate_txn_hash() -> str:
    chars = string.hexdigits.lower()
    return "0x" + "".join(random.choices(chars, k=64))


def _generate_block_number() -> int:
    base = 1000000
    return base + random.randint(100, 99999)


def _compute_hash(data: Dict[str, Any]) -> str:
    serialized = json.dumps(data, sort_keys=True, default=str)
    return hashlib.sha256(serialized.encode()).hexdigest()


class MockBlockchainService(BlockchainServiceInterface):
    """Mock blockchain service that simulates EVM-compatible blockchain behavior.

    Stores all records in an in-memory dict (simulating blockchain state).
    Produces realistic transaction hashes, block numbers, and certificate data.
    """

    # Simulated contract state
    _state: Dict[str, Any] = {}
    _records: Dict[str, Dict[str, Any]] = {}
    _transfers: List[Dict[str, Any]] = []
    _next_token_id: int = 1

    def __init__(self):
        self._network = settings.BLOCKCHAIN_NETWORK if settings.BLOCKCHAIN_NETWORK != "testnet" else "KALAA Testnet (Mock)"
        self._contract_address = "0x" + "".join(random.choices(string.hexdigits.lower(), k=40))

    def get_network_name(self) -> str:
        return self._network

    def is_mock(self) -> bool:
        return True

    def get_contract_address(self) -> str:
        return self._contract_address

    async def register_artwork(
        self,
        artwork_id: str,
        certificate_id: str,
        metadata_hash: str,
        owner_address: str,
        metadata_uri: str
    ) -> Dict[str, Any]:
        import asyncio
        await asyncio.sleep(0.3)

        token_id = str(self._next_token_id)
        self._next_token_id += 1

        txn_hash = _generate_txn_hash()
        block_number = _generate_block_number()

        record = {
            "token_id": token_id,
            "artwork_id": artwork_id,
            "certificate_id": certificate_id,
            "owner_address": owner_address,
            "metadata_hash": metadata_hash,
            "metadata_uri": metadata_uri,
            "registration_date": datetime.utcnow().isoformat(),
            "status": "active",
            "contract_address": self._contract_address,
        }

        self._state[artwork_id] = record
        self._records[certificate_id] = record

        provenance_entry = {
            "event_type": "REGISTERED",
            "artwork_id": artwork_id,
            "actor": owner_address,
            "timestamp": datetime.utcnow().isoformat(),
            "txn_hash": txn_hash,
            "block_number": block_number,
        }
        self._transfers.append(provenance_entry)

        return {
            "transaction_hash": txn_hash,
            "block_number": block_number,
            "gas_used": random.randint(50000, 150000),
            "contract_address": self._contract_address,
            "token_id": token_id,
            "certificate_id": certificate_id,
            "event_type": "ArtworkRegistered",
            "status": "success",
            "network": self._network,
            "gas_price": random.randint(10, 50),
        }

    async def verify_artwork(self, artwork_id: str) -> Dict[str, Any]:
        import asyncio
        await asyncio.sleep(0.2)

        record = self._state.get(artwork_id)
        if not record:
            return {
                "is_verified": False,
                "status": "not_registered",
                "message": "Artwork not registered on blockchain",
                "artwork_id": artwork_id,
            }

        return {
            "is_verified": True,
            "status": "verified",
            "artwork_id": artwork_id,
            "certificate_id": record["certificate_id"],
            "owner_address": record["owner_address"],
            "metadata_hash": record["metadata_hash"],
            "metadata_uri": record["metadata_uri"],
            "registration_date": record["registration_date"],
            "contract_address": self._contract_address,
            "network": self._network,
            "message": "Artwork verified on blockchain",
        }

    async def get_artwork(self, artwork_id: str) -> Dict[str, Any]:
        import asyncio
        await asyncio.sleep(0.1)

        record = self._state.get(artwork_id)
        if not record:
            return {"found": False, "artwork_id": artwork_id}

        result = record.copy()
        result["found"] = True
        result["network"] = self._network
        result["contract_address"] = self._contract_address
        return result

    async def get_provenance(self, artwork_id: str) -> List[Dict[str, Any]]:
        import asyncio
        await asyncio.sleep(0.2)

        events = []
        for entry in self._transfers:
            if entry.get("artwork_id") == artwork_id:
                events.append({
                    "event_type": entry["event_type"],
                    "timestamp": entry["timestamp"],
                    "actor": entry.get("actor", ""),
                    "transaction_hash": entry.get("txn_hash", ""),
                    "block_number": entry.get("block_number", 0),
                    "details": entry.get("details", {}),
                })
        return events

    async def transfer_artwork(
        self,
        artwork_id: str,
        from_address: str,
        to_address: str,
        order_id: Optional[str] = None
    ) -> Dict[str, Any]:
        import asyncio
        await asyncio.sleep(0.4)

        if artwork_id not in self._state:
            raise ValueError(f"Artwork {artwork_id} not registered on blockchain")

        record = self._state[artwork_id]
        record["owner_address"] = to_address
        record["last_transfer_date"] = datetime.utcnow().isoformat()

        txn_hash = _generate_txn_hash()
        block_number = _generate_block_number()

        transfer_entry = {
            "event_type": "OWNERSHIP_TRANSFERRED",
            "artwork_id": artwork_id,
            "from": from_address,
            "to": to_address,
            "order_id": order_id,
            "timestamp": datetime.utcnow().isoformat(),
            "txn_hash": txn_hash,
            "block_number": block_number,
            "transfer_type": "sale",
        }
        self._transfers.append(transfer_entry)

        certificate = self._records.get(record["certificate_id"], {})
        certificate["owner_address"] = to_address

        return {
            "transaction_hash": txn_hash,
            "block_number": block_number,
            "gas_used": random.randint(30000, 80000),
            "contract_address": self._contract_address,
            "event_type": "OwnershipTransferred",
            "status": "success",
            "new_owner": to_address,
            "from_owner": from_address,
            "network": self._network,
            "gas_price": random.randint(10, 30),
        }

    async def update_certificate(
        self,
        certificate_id: str,
        new_owner: str,
        additional_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        import asyncio
        await asyncio.sleep(0.2)

        txn_hash = _generate_txn_hash()
        block_number = _generate_block_number()

        record = self._records.get(certificate_id)
        if record:
            record["owner_address"] = new_owner
            record["last_updated"] = datetime.utcnow().isoformat()
            if additional_data:
                record.update(additional_data)

        return {
            "transaction_hash": txn_hash,
            "block_number": block_number,
            "gas_used": random.randint(20000, 50000),
            "contract_address": self._contract_address,
            "certificate_id": certificate_id,
            "event_type": "CertificateUpdated",
            "status": "success",
            "network": self._network,
            "new_owner": new_owner,
        }

    @staticmethod
    def _compute_block_number() -> int:
        return _generate_block_number()


# Singleton instance
_mock_blockchain = None

def get_blockchain_service() -> BlockchainServiceInterface:
    global _mock_blockchain
    if _mock_blockchain is None:
        provider = settings.BLOCKCHAIN_PROVIDER
        if provider == "web3" and settings.RPC_URL and settings.PRIVATE_KEY:
            from .web3_service import Web3BlockchainService
            _mock_blockchain = Web3BlockchainService()
        else:
            _mock_blockchain = MockBlockchainService()
    return _mock_blockchain
