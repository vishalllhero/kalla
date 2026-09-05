"""Utility functions for the KALAA marketplace backend."""

import re
import uuid
from datetime import datetime, timezone
from typing import Optional


def generate_artwork_id(year: Optional[int] = None) -> str:
    """Generate a unique artwork ID like KLA-ART-2026-000001."""
    if year is None:
        year = datetime.now(timezone.utc).year
    seq = uuid.uuid4().hex[:6].upper()
    return f"KLA-ART-{year}-{seq}"


def generate_certificate_id(year: Optional[int] = None) -> str:
    """Generate a unique certificate ID like KLA-CERT-000001."""
    if year is None:
        year = datetime.now(timezone.utc).year
    seq = uuid.uuid4().hex[:6].upper()
    return f"KLA-CERT-{seq}"


def generate_artisan_id(year: Optional[int] = None) -> str:
    """Generate a unique artisan ID like KLA-ART-2026-0123."""
    if year is None:
        year = datetime.now(timezone.utc).year
    seq = uuid.uuid4().hex[:4].upper()
    return f"KLA-ART-{year}-{seq}"


def generate_order_number(year: Optional[int] = None) -> str:
    """Generate a unique order number like KLA-ORD-2026-000451."""
    if year is None:
        year = datetime.now(timezone.utc).year
    seq = uuid.uuid4().hex[:6].upper()
    return f"KLA-ORD-{year}-{seq}"


def generate_transaction_id() -> str:
    """Generate a mock transaction ID."""
    seq = uuid.uuid4().hex[:16]
    return f"txn_{seq}"


def format_price(amount: int, currency: str = "INR") -> str:
    """Format a price for display."""
    if currency == "INR":
        return f"\u20b9{amount:,}"
    return f"{currency} {amount:,}"


def slugify(text: str) -> str:
    """Convert text to URL-friendly slug."""
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    return text


def generate_qr_data(artwork_id: str, base_url: str = "https://kalaamarket.com") -> str:
    """Generate the data string for a QR code."""
    return f"{base_url}/verify/{artwork_id}"


def get_indian_states():
    """Return list of Indian states for filtering."""
    return [
        "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
        "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli",
        "Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana",
        "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand",
        "Karnataka", "Kerala", "Ladakh", "Lakshadweep",
        "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
        "Mizoram", "Nagaland", "Odisha", "Puducherry",
        "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
        "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
        "West Bengal",
    ]


def truncate_text(text: str, max_length: int = 100) -> str:
    """Truncate text to max length, adding ellipsis if needed."""
    if not text:
        return ""
    if len(text) <= max_length:
        return text
    return text[:max_length - 3] + "..."


def safe_int(value, default: int = 0) -> int:
    """Safely convert a value to int."""
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def calculate_platform_fee(amount: int, fee_percent: float) -> dict:
    """Calculate platform fee and artisan payout.

    Args:
        amount: Total sale amount
        fee_percent: Platform fee percentage (default 5.0)

    Returns:
        Dict with platform_fee, artisan_payout, net_to_artisan
    """
    platform_fee = int(amount * (fee_percent / 100.0))
    artisan_payout = amount - platform_fee
    return {
        "total_amount": amount,
        "platform_fee": platform_fee,
        "fee_percent": fee_percent,
        "artisan_payout": artisan_payout,
    }
