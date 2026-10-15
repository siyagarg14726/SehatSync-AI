from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserProfileBase(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=150, examples=["John Doe"])
    age: Optional[int] = Field(None, ge=1, le=120, examples=[30])
    gender: Optional[str] = Field(None, max_length=50, examples=["Male", "Female", "Other", "Prefer not to say"])
    phone: Optional[str] = Field(None, max_length=30, examples=["+1234567890"])
    language_preference: str = Field("en", max_length=50, examples=["en", "hi", "es"])


class UserProfileCreate(UserProfileBase):
    pass


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=150)
    age: Optional[int] = Field(None, ge=1, le=120)
    gender: Optional[str] = Field(None, max_length=50)
    phone: Optional[str] = Field(None, max_length=30)
    language_preference: Optional[str] = Field(None, max_length=50)


class UserProfileResponse(UserProfileBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserRegisterRequest(BaseModel):
    email: EmailStr = Field(..., examples=["user@example.com"])
    password: str = Field(..., min_length=6, max_length=100, examples=["secretpassword123"])
    full_name: str = Field(..., min_length=1, max_length=150, examples=["Aarav Sharma"])
    age: Optional[int] = Field(None, ge=1, le=120, examples=[28])
    gender: Optional[str] = Field(None, examples=["Male"])
    phone: Optional[str] = Field(None, examples=["+919876543210"])
    language_preference: str = Field("en", examples=["en"])


class UserLoginRequest(BaseModel):
    email: EmailStr = Field(..., examples=["user@example.com"])
    password: str = Field(..., examples=["secretpassword123"])


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    is_active: bool
    created_at: datetime
    profile: Optional[UserProfileResponse] = None

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None
