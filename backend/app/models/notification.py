import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Text, Integer, JSON
from sqlalchemy.orm import relationship
from .base import UUIDType, Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUIDType, primary_key=True, index=True, default=uuid.uuid4)
    recipient_id = Column(UUIDType, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    is_system = Column(Boolean, default=False, nullable=False)
    related_id = Column(UUIDType, nullable=True)
    related_type = Column(String(50), nullable=True)
    url = Column(String(500), nullable=True)
    data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    read_at = Column(DateTime, nullable=True)

    recipient = relationship("User", back_populates="notifications")


class Report(Base):
    __tablename__ = "reports"

    id = Column(UUIDType, primary_key=True, index=True, default=uuid.uuid4)
    reporter_id = Column(UUIDType, ForeignKey("users.id"), nullable=False)
    report_type = Column(String(50), nullable=False)
    subject_type = Column(String(50), nullable=False)
    subject_id = Column(UUIDType, nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(20), default="pending", nullable=False)
    admin_notes = Column(Text, nullable=True)
    resolution = Column(String(255), nullable=True)
    resolved_by = Column(UUIDType, ForeignKey("users.id"), nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    reporter = relationship("User", foreign_keys=[reporter_id], back_populates="reports")
