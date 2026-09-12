from typing import Any, Dict, List, Optional

from .base import BlockchainServiceInterface
from ...core.config import settings


class SolanaBlockchainProvider(BlockchainServiceInterface):
    """Solana provider boundary.

    Real transaction signing is intentionally opt-in. Configure a Solana SDK and
    signer in the deployment before selecting this provider; mock mode remains
    the default and never emits fake Solana signatures.
    """

    def _not_configured(self) -> None:
        raise RuntimeError(
            "Solana provider requires a configured RPC_URL and server-side signer; "
            "use BLOCKCHAIN_PROVIDER=mock until those are provisioned"
        )

    async def register_artwork(self, artwork_id: str, certificate_id: str, metadata_hash: str, owner_address: str, metadata_uri: str) -> Dict[str, Any]:
        self._not_configured()
        return {}

    async def verify_artwork(self, artwork_id: str) -> Dict[str, Any]:
        self._not_configured()
        return {}

    async def get_artwork(self, artwork_id: str) -> Dict[str, Any]:
        self._not_configured()
        return {}

    async def get_provenance(self, artwork_id: str) -> List[Dict[str, Any]]:
        self._not_configured()
        return []

    async def create_provenance_record(self, product_id: str, artisan_id: str, metadata_hash: str) -> Dict[str, Any]:
        self._not_configured()
        return {}

    async def verify_provenance(self, product_id: str, metadata_hash: str, transaction_signature: Optional[str]) -> Dict[str, Any]:
        self._not_configured()
        return {}

    async def get_transaction(self, transaction_signature: str) -> Dict[str, Any]:
        self._not_configured()
        return {}

    def get_explorer_url(self, transaction_signature: str) -> Optional[str]:
        cluster = "devnet" if settings.BLOCKCHAIN_NETWORK.endswith("devnet") else "mainnet-beta"
        return f"https://explorer.solana.com/tx/{transaction_signature}?cluster={cluster}"

    async def transfer_artwork(self, artwork_id: str, from_address: str, to_address: str, order_id: Optional[str] = None) -> Dict[str, Any]:
        self._not_configured()
        return {}

    async def update_certificate(self, certificate_id: str, new_owner: str, additional_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        self._not_configured()
        return {}

    def get_network_name(self) -> str:
        return settings.BLOCKCHAIN_NETWORK

    def is_mock(self) -> bool:
        return False
