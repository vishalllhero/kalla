import uuid
from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, JSON, String
from sqlalchemy.orm import relationship
from .base import UUIDType, Base


class ProvenanceRecord(Base):
    __tablename__ = "provenance_records"

    id = Column(UUIDType, primary_key=True, index=True, default=uuid.uuid4)
    artwork_id = Column(UUIDType, ForeignKey("artworks.id"), nullable=False, unique=True, index=True)
    artisan_id = Column(UUIDType, ForeignKey("users.id"), nullable=False, index=True)
    metadata_hash = Column(String(64), nullable=False, index=True)
    blockchain_network = Column(String(50), nullable=False)
    transaction_signature = Column(String(255), nullable=True, unique=True, index=True)
    verification_status = Column(String(30), nullable=False, default="pending", index=True)
    provider_reference = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    verified_at = Column(DateTime, nullable=True)

    artwork = relationship("Artwork")
    artisan = relationship("User")
