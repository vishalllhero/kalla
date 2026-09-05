import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, EmailStr, field_validator


class RoleBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    display_name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    permissions: str = ""


class RoleCreate(RoleBase):
    pass


class RoleRead(RoleBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class UserBase(BaseModel):
    email: EmailStr
    phone: Optional[str] = None
    full_name: Optional[str] = None
    display_name: Optional[str] = None
    preferred_language: str = "en"
    country_code: str = "IN"


class UserRegister(UserBase):
    password: str = Field(..., min_length=8, max_length=128)
    role: str = Field(default="buyer", pattern="^(buyer|artisan|admin)$")
    display_name: Optional[str] = None

    @field_validator("password")
    @classmethod
    def password_complexity(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserRead(BaseModel):
    id: str
    email: str
    phone: Optional[str] = None
    full_name: Optional[str] = None
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    role: str
    role_display_name: Optional[str] = None
    is_active: bool
    is_verified: bool
    is_2fa_enabled: bool
    preferred_language: str
    country_code: str
    created_at: datetime
    last_login_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

    @field_validator("role", mode="before")
    @classmethod
    def _coerce_role(cls, v):
        if isinstance(v, str):
            return v
        if v is not None and hasattr(v, "name"):
            return v.name
        return str(v)

    @field_validator("role_display_name", mode="before")
    @classmethod
    def _coerce_role_display_name(cls, v):
        if v is not None and hasattr(v, "display_name"):
            return v.display_name
        return v


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserRead


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    exp: Optional[int] = None
    jti: Optional[str] = None
