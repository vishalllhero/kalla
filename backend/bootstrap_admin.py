"""Create or promote one KALAA administrator from environment variables."""

import os
import sys
from email.utils import parseaddr

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.config import settings
from app.core.security import hash_password
from app.models.role import Role
from app.models.user import AdminProfile, User


def _get_session_local():
    db_url = os.getenv("DATABASE_URL", "").strip() or settings.DATABASE_URL
    engine_kwargs = {}
    if db_url.startswith("sqlite"):
        engine_kwargs["connect_args"] = {"check_same_thread": False}
        engine_kwargs["poolclass"] = StaticPool
    engine = create_engine(db_url, **engine_kwargs)
    return sessionmaker(autocommit=False, autoflush=False, bind=engine)


def _required_environment(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise ValueError(f"{name} must be set")
    return value


def _bool_environment(name: str, default: bool = False) -> bool:
    value = os.getenv(name, "").strip().lower()
    if not value:
        return default
    return value in {"1", "true", "yes", "on"}


def _validate_email(email: str) -> None:
    if parseaddr(email)[1] != email or "@" not in email:
        raise ValueError("ADMIN_EMAIL must be a valid email address")


def bootstrap_admin() -> str:
    email = _required_environment("ADMIN_EMAIL").lower()
    _validate_email(email)

    reset_password = _bool_environment("ADMIN_RESET_PASSWORD", default=False)
    requested_password = os.getenv("ADMIN_PASSWORD", "").strip()
    if reset_password and not requested_password:
        raise ValueError("ADMIN_PASSWORD must be set when ADMIN_RESET_PASSWORD=true")
    if len(requested_password) and len(requested_password) < 8:
        raise ValueError("ADMIN_PASSWORD must be at least 8 characters")

    SessionLocal = _get_session_local()
    db = SessionLocal()
    try:
        role = db.query(Role).filter(Role.name == "admin").one_or_none()
        if role is None:
            role = Role(
                name="admin",
                display_name="Administrator",
                description="Full access to the platform",
                permissions="manage_users,verify_artisans,verify_artworks,manage_categories,monitor_transactions,manage_reports",
            )
            db.add(role)
            db.flush()

        user = db.query(User).filter(User.email == email).one_or_none()
        created = user is None
        if user is None:
            if not requested_password:
                raise ValueError("ADMIN_PASSWORD must be set to create a new administrator")
            user = User(email=email, password_hash=hash_password(requested_password), role=role)
            db.add(user)
            db.flush()

        if created or reset_password:
            user.password_hash = hash_password(requested_password)
        elif not user.password_hash:
            if not requested_password:
                raise ValueError("Existing user has no password hash; set ADMIN_PASSWORD to create or reset it")
            user.password_hash = hash_password(requested_password)

        user.role = role
        user.is_active = True
        user.is_verified = True
        if not user.display_name:
            user.display_name = email.split("@", 1)[0]
        if not user.full_name:
            user.full_name = user.display_name
        db.flush()

        if not user.admin_profile:
            db.add(AdminProfile(user_id=user.id, admin_level="super"))

        db.commit()
        return "created" if created else "promoted"
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    try:
        result = bootstrap_admin()
    except (ValueError, RuntimeError) as error:
        print(f"Admin bootstrap failed: {error}", file=sys.stderr)
        raise SystemExit(1) from error
    except Exception:
        print("Admin bootstrap failed; no changes were committed.", file=sys.stderr)
        raise SystemExit(1) from None
    print(f"Administrator account {result} successfully.")