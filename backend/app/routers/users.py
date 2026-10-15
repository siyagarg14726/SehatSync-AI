from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.user import User, UserProfile
from app.schemas.user import UserProfileResponse, UserProfileUpdate, UserResponse
from app.utils.deps import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current authenticated user and profile",
)
async def get_me(
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    """Retrieve full profile details for the currently authenticated user."""
    return UserResponse.model_validate(current_user)


@router.get(
    "/me/profile",
    response_model=UserProfileResponse,
    summary="Get profile details of current user",
)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserProfileResponse:
    """Retrieve profile data directly."""
    if current_user.profile:
        return UserProfileResponse.model_validate(current_user.profile)

    # If profile does not exist yet, find or create
    query = select(UserProfile).where(UserProfile.user_id == current_user.id)
    result = await db.execute(query)
    profile = result.scalar_one_or_none()

    if not profile:
        profile = UserProfile(
            user_id=current_user.id,
            full_name=current_user.email.split("@")[0].title(),
            language_preference="en",
        )
        db.add(profile)
        await db.commit()
        await db.refresh(profile)

    return UserProfileResponse.model_validate(profile)


@router.put(
    "/me/profile",
    response_model=UserProfileResponse,
    summary="Update current user's profile",
)
async def update_my_profile(
    payload: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserProfileResponse:
    """Update profile information such as name, age, gender, phone, and preferred language."""
    query = select(UserProfile).where(UserProfile.user_id == current_user.id)
    result = await db.execute(query)
    profile = result.scalar_one_or_none()

    if not profile:
        profile = UserProfile(user_id=current_user.id, full_name="User")
        db.add(profile)

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)

    await db.commit()
    await db.refresh(profile)
    return UserProfileResponse.model_validate(profile)
