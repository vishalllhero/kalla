from typing import Optional, Dict, Any
import asyncio
from datetime import datetime

from ..models.user import User
from ..models.notification import Notification
from sqlalchemy.orm import Session


async def send_notification(
    user_id: str,
    title: str,
    message: str,
    notification_type: str,
    related_id: Optional[str] = None,
    related_type: Optional[str] = None,
    url: Optional[str] = None,
    data: Optional[Dict[str, Any]] = None,
    db: Optional[Session] = None,
):
    """Send a notification to a user (async)."""
    if db:
        notif = Notification(
            recipient_id=user_id,
            title=title,
            message=message,
            notification_type=notification_type,
            related_id=related_id,
            related_type=related_type,
            url=url,
            data=data,
        )
        db.add(notif)
        db.commit()
        db.refresh(notif)
        return notif
    return {"message": "Notification queued", "title": title, "type": notification_type}


def send_notification_sync(
    db: Session,
    user_id: str,
    title: str,
    message: str,
    notification_type: str,
    related_id: Optional[str] = None,
    related_type: Optional[str] = None,
    url: Optional[str] = None,
    data: Optional[Dict[str, Any]] = None,
    is_system: bool = False,
):
    """Send a notification synchronously (for use in non-async contexts)."""
    notif = Notification(
        recipient_id=user_id,
        title=title,
        message=message,
        notification_type=notification_type,
        related_id=related_id,
        related_type=related_type,
        url=url,
        data=data,
        is_system=is_system,
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif


def get_user_notifications(db: Session, user_id: str, unread_only: bool = False, limit: int = 50):
    """Get notifications for a user."""
    query = db.query(Notification).filter(Notification.recipient_id == user_id)
    if unread_only:
        query = query.filter(Notification.is_read == False)
    return query.order_by(Notification.created_at.desc()).limit(limit).all()


def mark_notification_read(db: Session, notification_id: str, user_id: str):
    """Mark a notification as read."""
    notif = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.recipient_id == user_id
    ).first()
    if not notif:
        return None
    notif.is_read = True
    notif.read_at = datetime.utcnow()
    db.commit()
    db.refresh(notif)
    return notif
