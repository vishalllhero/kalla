from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class CertificateBase(BaseModel):
    certificate_id: str
    artwork_id: str
    certificate_hash: str
    metadata_hash: str
    ipfs_cid: Optional[str] = None
    storage_provider: str = "local"
    blockchain_network: Optional[str] = None
    blockchain_tx_hash: Optional[str] = None


class CertificateCreate(CertificateBase):
    pass


class CertificateRead(CertificateBase):
    id: str
    artisan_id: Optional[str] = None
    issue_date: datetime
    expiry_date: Optional[datetime] = None
    status: str
    qr_code_url: Optional[str] = None
    metadata_url: Optional[str] = None
    is_revoked: bool
    revocation_reason: Optional[str] = None
    revocation_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class BlockchainRecordRead(BaseModel):
    id: str
    artwork_id: Optional[str] = None
    certificate_id: Optional[str] = None
    transaction_hash: str
    block_number: Optional[int] = None
    gas_used: Optional[int] = None
    network: str
    contract_address: str
    function_name: str
    event_type: str
    status: str
    timestamp_on_chain: Optional[datetime] = None
    recorded_at: datetime
    tx_data: Optional[dict] = None

    model_config = {"from_attributes": True}


class ProvenanceEventRead(BaseModel):
    id: str
    artwork_id: str
    event_type: str
    description: str
    actor_id: Optional[str] = None
    actor_type: str
    timestamp: datetime
    blockchain_tx_hash: Optional[str] = None
    event_metadata: Optional[dict] = None
    is_on_chain: bool
    sequence_order: int

    model_config = {"from_attributes": True}


class OwnershipTransferRead(BaseModel):
    id: str
    artwork_id: str
    from_owner_id: Optional[str] = None
    to_owner_id: str
    transfer_type: str
    transaction_hash: Optional[str] = None
    order_id: Optional[str] = None
    transfer_date: datetime

    model_config = {"from_attributes": True}


class VerifyResponse(BaseModel):
    is_valid: bool
    artwork_id: Optional[str] = None
    title: Optional[str] = None
    artisan_name: Optional[str] = None
    region: Optional[str] = None
    craft: Optional[str] = None
    material: Optional[str] = None
    creation_year: Optional[int] = None
    description: Optional[str] = None
    certificate_id: Optional[str] = None
    certificate_hash: Optional[str] = None
    blockchain_status: Optional[str] = None
    blockchain_network: Optional[str] = None
    blockchain_txn_hash: Optional[str] = None
    issuance_date: Optional[datetime] = None
    current_owner: Optional[str] = None
    provenance: List[ProvenanceEventRead] = []
    message: Optional[str] = None


class ProvenanceResponse(BaseModel):
    artwork_id: str
    title: str
    current_owner: Optional[str] = None
    current_owner_name: Optional[str] = None
    blockchain_status: str
    certificate_id: Optional[str] = None
    events: List[ProvenanceEventRead] = []
