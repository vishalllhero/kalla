import tempfile
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base
from app.core.security import hash_password, verify_password, generate_access_token
from app.models.role import Role
from app.models.user import User, AdminProfile
from bootstrap_admin import bootstrap_admin


def setup_test_db(db_url: str):
    engine = create_engine(db_url, connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()

    admin_role = Role(name="admin", display_name="Administrator", description="Admin role", permissions="")
    buyer_role = Role(name="buyer", display_name="Buyer", description="Buyer role", permissions="")
    artisan_role = Role(name="artisan", display_name="Artisan", description="Artisan role", permissions="")
    session.add_all([admin_role, buyer_role, artisan_role])
    session.commit()
    return session


def test_promoted_existing_user_keeps_password_by_default(monkeypatch):
    db_path = Path(tempfile.mkdtemp()) / "promotion.db"
    db_url = f"sqlite:///{db_path}"
    monkeypatch.setenv("DATABASE_URL", db_url)
    monkeypatch.setenv("ADMIN_EMAIL", "existing@example.com")
    monkeypatch.delenv("ADMIN_PASSWORD", raising=False)
    monkeypatch.delenv("ADMIN_RESET_PASSWORD", raising=False)

    session = setup_test_db(db_url)
    original_hash = hash_password("KeepThisPassword")
    user = User(
        email="existing@example.com",
        password_hash=original_hash,
        role_id=session.query(Role).filter(Role.name == "buyer").one().id,
        is_active=True,
        is_verified=True,
        display_name="Existing User",
    )
    session.add(user)
    session.commit()
    session.close()

    result = bootstrap_admin()

    assert result == "promoted"
    session = sessionmaker(bind=create_engine(db_url, connect_args={"check_same_thread": False}))()
    saved_user = session.query(User).filter(User.email == "existing@example.com").one()
    assert saved_user.role.name == "admin"
    assert verify_password("KeepThisPassword", saved_user.password_hash) is True
    assert saved_user.password_hash == original_hash
    session.close()


def test_promoted_existing_user_can_reset_password_when_requested(monkeypatch):
    db_path = Path(tempfile.mkdtemp()) / "reset.db"
    db_url = f"sqlite:///{db_path}"
    monkeypatch.setenv("DATABASE_URL", db_url)
    monkeypatch.setenv("ADMIN_EMAIL", "existing-reset@example.com")
    monkeypatch.setenv("ADMIN_PASSWORD", "ResetPassword123")
    monkeypatch.setenv("ADMIN_RESET_PASSWORD", "true")

    session = setup_test_db(db_url)
    original_hash = hash_password("OldPassword")
    user = User(
        email="existing-reset@example.com",
        password_hash=original_hash,
        role_id=session.query(Role).filter(Role.name == "artisan").one().id,
        is_active=True,
        is_verified=True,
        display_name="Reset User",
    )
    session.add(user)
    session.commit()
    session.close()

    result = bootstrap_admin()

    assert result == "promoted"
    session = sessionmaker(bind=create_engine(db_url, connect_args={"check_same_thread": False}))()
    saved_user = session.query(User).filter(User.email == "existing-reset@example.com").one()
    assert saved_user.role.name == "admin"
    assert verify_password("ResetPassword123", saved_user.password_hash) is True
    assert saved_user.password_hash != original_hash
    session.close()


def test_new_admin_created_with_env_credentials(monkeypatch):
    db_path = Path(tempfile.mkdtemp()) / "creation.db"
    db_url = f"sqlite:///{db_path}"
    monkeypatch.setenv("DATABASE_URL", db_url)
    monkeypatch.setenv("ADMIN_EMAIL", "newadmin@example.com")
    monkeypatch.setenv("ADMIN_PASSWORD", "NewAdminPassword123")
    monkeypatch.delenv("ADMIN_RESET_PASSWORD", raising=False)

    setup_test_db(db_url).close()

    result = bootstrap_admin()

    assert result == "created"
    session = sessionmaker(bind=create_engine(db_url, connect_args={"check_same_thread": False}))()
    saved_user = session.query(User).filter(User.email == "newadmin@example.com").one()
    assert saved_user.role.name == "admin"
    assert verify_password("NewAdminPassword123", saved_user.password_hash) is True
    admin_profile = session.query(AdminProfile).filter(AdminProfile.user_id == saved_user.id).one()
    assert admin_profile.admin_level == "super"
    token = generate_access_token(str(saved_user.id), saved_user.email, saved_user.role.name)
    assert saved_user.role.name == "admin"
    assert token.startswith("eyJ")
    session.close()
