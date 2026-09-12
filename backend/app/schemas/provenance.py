from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel


class ProvenanceRecordRead(BaseModel):
    id: str
    artwork_id: str
    artisan_id: str
    metadata_hash: str
    blockchain_network: str
    transaction_signature: Optional[str] = None
    verification_status: str
    provider_reference: Optional[dict[str, Any]] = None
    created_at: datetime
    verified_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
