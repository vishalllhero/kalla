from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from ...core.security import hash_password, verify_password, generate_access_token, generate_refresh_token, decode_token
from ...core.database import get_db
from ...models.user import User, ArtisanProfile, BuyerProfile
from ...models.role import Role
from ...schemas.auth import UserRegister, UserLogin, Token, UserRead
from ...utils import generate_artisan_id
import secrets
from datetime import datetime

router = APIRouter()


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user with role-based profile creation."""
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    if user_data.phone:
        existing_phone = db.query(User).filter(User.phone == user_data.phone).first()
        if existing_phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Phone number already in use"
            )

    role = db.query(Role).filter(Role.name == user_data.role).first()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role: {user_data.role}"
        )

    password_hash = hash_password(user_data.password)

    user = User(
        email=user_data.email,
        phone=user_data.phone,
        password_hash=password_hash,
        role_id=role.id,
        display_name=user_data.display_name or user_data.full_name,
        full_name=user_data.full_name,
        is_active=True,
        is_verified=user_data.role == "buyer",
    )
    db.add(user)
    db.flush()

    if user_data.role == "artisan":
        artisan = ArtisanProfile(
            user_id=user.id,
            artisan_id=generate_artisan_id(),
            artisan_name=user_data.display_name or user_data.full_name or user_data.email.split("@")[0],
            verification_status="pending",
            is_verified=False,
            badge_level="bronze",
        )
        db.add(artisan)
    elif user_data.role == "buyer":
        buyer = BuyerProfile(
            user_id=user.id,
            full_name=user_data.full_name or user_data.display_name or "",
        )
        db.add(buyer)
    elif user_data.role == "admin":
        from ...models.user import AdminProfile
        admin = AdminProfile(
            user_id=user.id,
            admin_level="super",
        )
        db.add(admin)

    db.commit()
    db.refresh(user)
    db.refresh(role)
    user.role = role

    access_token = generate_access_token(user.id, user.email, role.name)
    refresh_token = generate_refresh_token(user.id)

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserRead.from_orm(user),
    )


@router.post("/login", response_model=Token)
async def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """Authenticate a user and return JWT tokens."""
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    if not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is not active"
        )

    user.last_login_at = datetime.utcnow()
    db.commit()

    role = db.get(Role, user.role_id)
    user.role = role
    access_token = generate_access_token(user.id, user.email, role.name)
    refresh_token = generate_refresh_token(user.id)

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserRead.from_orm(user),
    )


@router.post("/refresh", response_model=Token)
async def refresh_token(refresh_token: str = None, db: Session = Depends(get_db)):
    """Refresh an access token using a refresh token."""
    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Refresh token required")

    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    user_id = payload.get("sub")
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    role = db.get(Role, user.role_id)
    user.role = role
    access_token = generate_access_token(user.id, user.email, role.name)
    new_refresh = generate_refresh_token(user.id)

    return Token(
        access_token=access_token,
        refresh_token=new_refresh,
        user=UserRead.from_orm(user),
    )


from ..deps import get_current_active_user


@router.get("/me", response_model=UserRead)
async def get_current_user_info_v2(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get current user information."""
    role = db.get(Role, current_user.role_id)
    current_user.role = role
    return UserRead.from_orm(current_user)


@router.post("/change-password")
async def change_password(
    old_password: str,
    new_password: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Change user password."""
    if not verify_password(old_password, current_user.password_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Old password is incorrect")

    current_user.password_hash = hash_password(new_password)
    db.commit()
    return {"message": "Password changed successfully"}


@router.post("/generate-otp")
async def generate_otp(email: str, db: Session = Depends(get_db)):
    """Generate OTP for password reset (mock implementation)."""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    otp = secrets.token_hex(3)
    return {"message": "OTP sent", "otp_debug": otp}
