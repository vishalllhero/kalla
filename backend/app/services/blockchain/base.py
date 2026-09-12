from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from datetime import datetime


class BlockchainServiceInterface(ABC):
    """Abstract interface for blockchain interaction."""

    @abstractmethod
    async def register_artwork(
        self,
        artwork_id: str,
        certificate_id: str,
        metadata_hash: str,
        owner_address: str,
        metadata_uri: str
    ) -> Dict[str, Any]:
        """Register an artwork on the blockchain.

        Returns:
            Dict with transaction_hash, block_number, contract_address, certificate_id
        """
        pass

    @abstractmethod
    async def verify_artwork(self, artwork_id: str) -> Dict[str, Any]:
        """Verify an artwork on the blockchain."""
        pass

    @abstractmethod
    async def get_artwork(self, artwork_id: str) -> Dict[str, Any]:
        """Get artwork record from blockchain."""
        pass

    @abstractmethod
    async def get_provenance(self, artwork_id: str) -> List[Dict[str, Any]]:
        """Get provenance timeline from blockchain."""
        pass

    @abstractmethod
    async def create_provenance_record(
        self, product_id: str, artisan_id: str, metadata_hash: str
    ) -> Dict[str, Any]:
        """Anchor a product metadata hash and return a provider reference."""
        pass

    @abstractmethod
    async def verify_provenance(
        self, product_id: str, metadata_hash: str, transaction_signature: Optional[str]
    ) -> Dict[str, Any]:
        """Verify an anchored product metadata hash."""
        pass

    @abstractmethod
    async def get_transaction(self, transaction_signature: str) -> Dict[str, Any]:
        """Fetch provider transaction details."""
        pass

    @abstractmethod
    def get_explorer_url(self, transaction_signature: str) -> Optional[str]:
        """Return a public explorer URL when supported by the network."""
        pass

    @abstractmethod
    async def transfer_artwork(
        self,
        artwork_id: str,
        from_address: str,
        to_address: str,
        order_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Transfer artwork ownership on blockchain."""
        pass

    @abstractmethod
    async def update_certificate(
        self,
        certificate_id: str,
        new_owner: str,
        additional_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Update certificate with new ownership info."""
        pass

    @abstractmethod
    def get_network_name(self) -> str:
        """Return the blockchain network name."""
        pass

    @abstractmethod
    def is_mock(self) -> bool:
        """Return True if using mock blockchain (no real network)."""
        pass
