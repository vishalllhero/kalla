import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Integer, Enum
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship
from ..core.database import Base

import sqlalchemy as sa
from sqlalchemy.types import TypeDecorator, String as SAString

class UUIDType(TypeDecorator):
    """Flexible UUID type that uses String for SQLite and UUID for PostgreSQL."""
    impl = SAString
    cache_ok = True

    def __init__(self, **kw):
        super().__init__(**kw)

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(PG_UUID())
        return dialect.type_descriptor(SAString(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        if isinstance(value, uuid.UUID):
            return str(value)
        return value

    def process_result_value(self, value, dialect):
        if value is None:
            return None
        return value

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    display_name = Column(String(100), nullable=False)
    description = Column(String(500), nullable=True)
    permissions = Column(String(2000), nullable=False, default="")

    created_at = Column(DateTime, default=datetime.utcnow)

__all__ = ["UUIDType"]
