import re
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, field_validator


def _validate_password(v: str) -> str:
    if len(v) < 8:
        raise ValueError("Password must be at least 8 characters")
    if not re.search(r"\d", v):
        raise ValueError("Password must contain at least one digit")
    if not re.search(r"[A-ZА-ЯЁ]", v):
        raise ValueError("Password must contain at least one uppercase letter")
    return v


class UserRegister(BaseModel):
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        return _validate_password(v)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    display_name: Optional[str] = None
    timezone: Optional[str] = None
    currency: Optional[str] = None
    language: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    timezone: Optional[str] = None
    currency: Optional[str] = None
    language: Optional[str] = None
    avatar_url: Optional[str] = None
    email_notifications_enabled: Optional[bool] = None
    daily_digest_enabled: Optional[bool] = None


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        return _validate_password(v)
