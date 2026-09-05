import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Text, Integer, JSON
from sqlalchemy.orm import relationship
from .base import UUIDType, Base


class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(UUIDType, primary_key=True, index=True, default=uuid.uuid4)
    certificate_id = Column(String(50), unique=True, index=True, nullable=False)
    artwork_id = Column(UUIDType, ForeignKey("artworks.id"), nullable=False, unique=True)
    artisan_id = Column(UUIDType, ForeignKey("users.id"), nullable=True)
    certificate_hash = Column(String(64), unique=True, nullable=False)
    metadata_hash = Column(String(64), nullable=False)
    ipfs_cid = Column(String(100), nullable=True)
    storage_provider = Column(String(50), default="local", nullable=False)
    blockchain_network = Column(String(50), default="testnet", nullable=True)
    blockchain_tx_hash = Column(String(100), nullable=True)
    issue_date = Column(DateTime, default=datetime.utcnow)
    expiry_date = Column(DateTime, nullable=True)
    status = Column(String(20), default="active", nullable=False)
    qr_code_url = Column(String(500), nullable=True)
    qr_code_data = Column(String(500), nullable=True)
    metadata_url = Column(String(500), nullable=True)
    is_revoked = Column(Boolean, default=False, nullable=False)
    revocation_reason = Column(String(255), nullable=True)
    revocation_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    artwork = relationship("Artwork", back_populates="certificate")
    blockchain_records = relationship("BlockchainRecord", back_populates="certificate", cascade="all, delete-orphan")


class BlockchainRecord(Base):
    __tablename__ = "blockchain_records"

    id = Column(UUIDType, primary_key=True, index=True, default=uuid.uuid4)
    artwork_id = Column(UUIDType, ForeignKey("artworks.id"), nullable=True)
    certificate_id = Column(UUIDType, ForeignKey("certificates.id"), nullable=True)
    transaction_hash = Column(String(100), unique=True, index=True, nullable=False)
    block_number = Column(Integer, nullable=True)
    gas_used = Column(Integer, nullable=True)
    network = Column(String(50), default="testnet", nullable=False)
    contract_address = Column(String(100), nullable=False)
    function_name = Column(String(100), nullable=False)
    event_type = Column(String(50), nullable=False)
    status = Column(String(20), default="pending", nullable=False)
    timestamp_on_chain = Column(DateTime, nullable=True)
    recorded_at = Column(DateTime, default=datetime.utcnow)
    tx_data = Column(JSON, nullable=True)

    artwork = relationship("Artwork", back_populates="blockchain_records")
    certificate = relationship("Certificate", back_populates="blockchain_records")


class ProvenanceEvent(Base):
    __tablename__ = "provenance_events"

    id = Column(UUIDType, primary_key=True, index=True, default=uuid.uuid4)
    artwork_id = Column(UUIDType, ForeignKey("artworks.id"), nullable=False)
    event_type = Column(String(50), nullable=False)
    description = Column(Text, nullable=False)
    actor_id = Column(UUIDType, ForeignKey("users.id"), nullable=True)
    actor_type = Column(String(20), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    blockchain_tx_hash = Column(String(100), nullable=True)
    metadata_json = Column(JSON, nullable=True)
    is_on_chain = Column(Boolean, default=False, nullable=False)
    sequence_order = Column(Integer, nullable=False)

    artwork = relationship("Artwork", back_populates="provenance_events")
    actor = relationship("User", foreign_keys=[actor_id])


class OwnershipTransfer(Base):
    __tablename__ = "ownership_transfers"

    id = Column(UUIDType, primary_key=True, index=True, default=uuid.uuid4)
    artwork_id = Column(UUIDType, ForeignKey("artworks.id"), nullable=False)
    from_owner_id = Column(UUIDType, ForeignKey("users.id"), nullable=True)
    to_owner_id = Column(UUIDType, ForeignKey("users.id"), nullable=False)
    transfer_type = Column(String(50), default="sale", nullable=False)
    transaction_hash = Column(String(100), nullable=True)
    order_id = Column(UUIDType, ForeignKey("orders.id"), nullable=True)
    transfer_date = Column(DateTime, default=datetime.utcnow)

    artwork = relationship("Artwork")
    previous_owner = relationship("User", foreign_keys=[from_owner_id])
    new_owner = relationship("User", foreign_keys=[to_owner_id])