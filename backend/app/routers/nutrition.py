from datetime import date, datetime, timedelta, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.nutrition import DietaryProfile, Habit, HabitLog, HydrationLog, MealPlan
from app.models.user import User
from app.schemas.nutrition import (
    DietaryProfileCreate,
    DietaryProfileResponse,
    DietaryProfileUpdate,
    HabitCreate,
    HabitLogCreate,
    HabitLogResponse,
    HabitResponse,
    HabitUpdate,
    HydrationLogCreate,
    HydrationLogResponse,
    MealPlanGenerateRequest,
    MealPlanResponse,
)
from app.services.ai_service import AIService
from app.utils.deps import get_current_user

router = APIRouter(prefix="/nutrition", tags=["Nutrition & Lifestyle"])


# ==========================================
# 1. DIETARY PROFILE
# ==========================================
@router.get(
    "/profile",
    response_model=Optional[DietaryProfileResponse],
    summary="Get user's dietary profile",
)
async def get_dietary_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Optional[DietaryProfileResponse]:
    """Retrieve nutritional preferences, goals, allergies, and daily budget."""
    query = select(DietaryProfile).where(DietaryProfile.user_id == current_user.id)
    result = await db.execute(query)
    profile = result.scalar_one_or_none()
    if not profile:
        return None
    return DietaryProfileResponse.model_validate(profile)


@router.post(
    "/profile",
    response_model=DietaryProfileResponse,
    summary="Create or update user's dietary profile",
)
async def save_dietary_profile(
    payload: DietaryProfileCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> DietaryProfileResponse:
    """Create or update dietary preferences (veg/vegan/non-veg, allergies, goals, daily budget)."""
    query = select(DietaryProfile).where(DietaryProfile.user_id == current_user.id)
    result = await db.execute(query)
    profile = result.scalar_one_or_none()

    if not profile:
        profile = DietaryProfile(
            user_id=current_user.id,
            dietary_type=payload.dietary_type,
            allergies=payload.allergies,
            goals=payload.goals,
            daily_budget=payload.daily_budget,
            calorie_target=payload.calorie_target,
        )
        db.add(profile)
    else:
        profile.dietary_type = payload.dietary_type
        profile.allergies = payload.allergies
        profile.goals = payload.goals
        profile.daily_budget = payload.daily_budget
        profile.calorie_target = payload.calorie_target

    await db.commit()
    await db.refresh(profile)
    return DietaryProfileResponse.model_validate(profile)


@router.put(
    "/profile",
    response_model=DietaryProfileResponse,
    summary="Partially update user's dietary profile",
)
async def update_dietary_profile(
    payload: DietaryProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> DietaryProfileResponse:
    """Update specific fields of dietary profile."""
    query = select(DietaryProfile).where(DietaryProfile.user_id == current_user.id)
    result = await db.execute(query)
    profile = result.scalar_one_or_none()

    if not profile:
        profile = DietaryProfile(
            user_id=current_user.id,
            dietary_type="veg",
            goals="maintenance",
        )
        db.add(profile)

    update_dict = payload.model_dump(exclude_unset=True)
    for k, v in update_dict.items():
        setattr(profile, k, v)

    await db.commit()
    await db.refresh(profile)
    return DietaryProfileResponse.model_validate(profile)


# ==========================================
# 2. WEEKLY MEAL PLANS
# ==========================================
@router.post(
    "/meal-plans/generate",
    response_model=MealPlanResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generate budget-aware weekly meal plan using Gemini AI",
)
async def generate_meal_plan(
    payload: MealPlanGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MealPlanResponse:
    """Generate 7-day personalized meal plan with breakfast, lunch, dinner, and snacks."""
    # Get user's dietary profile
    query = select(DietaryProfile).where(DietaryProfile.user_id == current_user.id)
    result = await db.execute(query)
    profile = result.scalar_one_or_none()

    dietary_info = {
        "dietary_type": payload.dietary_type_override or (profile.dietary_type if profile else "veg"),
        "allergies": profile.allergies if profile else "None",
        "goals": profile.goals if profile else "maintenance",
        "daily_budget": payload.daily_budget_override or (profile.daily_budget if profile else 350.0),
    }

    week_start = payload.week_start_date or (date.today() + timedelta(days=(7 - date.today().weekday()) % 7))

    plan_json = await AIService.generate_weekly_meal_plan(
        dietary_profile=dietary_info,
        special_notes=payload.special_notes,
        daily_budget=payload.daily_budget_override,
    )

    title = f"Weekly {dietary_info['dietary_type'].capitalize()} Plan ({week_start.strftime('%b %d')})"
    meal_plan = MealPlan(
        user_id=current_user.id,
        week_start_date=week_start,
        title=title,
        plan_data=plan_json,
        ai_generated=True,
    )
    db.add(meal_plan)
    await db.commit()
    await db.refresh(meal_plan)
    return MealPlanResponse.model_validate(meal_plan)


@router.get(
    "/meal-plans",
    response_model=List[MealPlanResponse],
    summary="List saved weekly meal plans",
)
async def list_meal_plans(
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> List[MealPlanResponse]:
    """Retrieve history of generated and saved meal plans."""
    query = (
        select(MealPlan)
        .where(MealPlan.user_id == current_user.id)
        .order_by(desc(MealPlan.created_at))
        .limit(limit)
    )
    result = await db.execute(query)
    plans = result.scalars().all()
    return [MealPlanResponse.model_validate(p) for p in plans]


@router.get(
    "/meal-plans/{plan_id}",
    response_model=MealPlanResponse,
    summary="Get single meal plan by ID",
)
async def get_meal_plan(
    plan_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MealPlanResponse:
    """Retrieve specific meal plan details."""
    query = select(MealPlan).where(MealPlan.id == plan_id, MealPlan.user_id == current_user.id)
    result = await db.execute(query)
    plan = result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meal plan not found")
    return MealPlanResponse.model_validate(plan)


@router.delete(
    "/meal-plans/{plan_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a meal plan",
)
async def delete_meal_plan(
    plan_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Remove a saved meal plan."""
    query = select(MealPlan).where(MealPlan.id == plan_id, MealPlan.user_id == current_user.id)
    result = await db.execute(query)
    plan = result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meal plan not found")
    await db.delete(plan)
    await db.commit()


# ==========================================
# 3. HYDRATION LOG
# ==========================================
@router.post(
    "/hydration",
    response_model=HydrationLogResponse,
    summary="Log daily water intake (glasses)",
)
async def log_hydration(
    payload: HydrationLogCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> HydrationLogResponse:
    """Log or increment glasses of water for a specific day (defaults to today)."""
    target_date = payload.log_date or date.today()
    query = select(HydrationLog).where(
        HydrationLog.user_id == current_user.id,
        HydrationLog.log_date == target_date,
    )
    result = await db.execute(query)
    log_entry = result.scalar_one_or_none()

    if not log_entry:
        glasses_val = payload.glasses
        log_entry = HydrationLog(
            user_id=current_user.id,
            log_date=target_date,
            glasses=glasses_val,
            target_glasses=payload.target_glasses or 8,
            notes=payload.notes,
        )
        db.add(log_entry)
    else:
        if payload.mode == "set":
            log_entry.glasses = payload.glasses
        else:
            log_entry.glasses += payload.glasses
        if payload.target_glasses:
            log_entry.target_glasses = payload.target_glasses
        if payload.notes:
            log_entry.notes = payload.notes

    await db.commit()
    await db.refresh(log_entry)
    return HydrationLogResponse.model_validate(log_entry)


@router.get(
    "/hydration/today",
    response_model=HydrationLogResponse,
    summary="Get today's hydration status",
)
async def get_today_hydration(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> HydrationLogResponse:
    """Get hydration record for current date, creating default if not logged yet."""
    today = date.today()
    query = select(HydrationLog).where(
        HydrationLog.user_id == current_user.id,
        HydrationLog.log_date == today,
    )
    result = await db.execute(query)
    entry = result.scalar_one_or_none()
    if not entry:
        entry = HydrationLog(
            user_id=current_user.id,
            log_date=today,
            glasses=0,
            target_glasses=8,
        )
        db.add(entry)
        await db.commit()
        await db.refresh(entry)
    return HydrationLogResponse.model_validate(entry)


@router.get(
    "/hydration/history",
    response_model=List[HydrationLogResponse],
    summary="Get hydration history for past N days",
)
async def get_hydration_history(
    days: int = Query(7, ge=1, le=60),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> List[HydrationLogResponse]:
    """Retrieve daily water consumption history."""
    cutoff = date.today() - timedelta(days=days)
    query = (
        select(HydrationLog)
        .where(
            HydrationLog.user_id == current_user.id,
            HydrationLog.log_date >= cutoff,
        )
        .order_by(desc(HydrationLog.log_date))
    )
    result = await db.execute(query)
    logs = result.scalars().all()
    return [HydrationLogResponse.model_validate(l) for l in logs]


# ==========================================
# 4. HABIT TRACKER
# ==========================================
@router.post(
    "/habits",
    response_model=HabitResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new wellness habit",
)
async def create_habit(
    payload: HabitCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> HabitResponse:
    """Create a new habit to track daily or weekly."""
    habit = Habit(
        user_id=current_user.id,
        name=payload.name.strip(),
        description=payload.description,
        frequency=payload.frequency,
        is_active=True,
    )
    db.add(habit)
    await db.commit()
    await db.refresh(habit)

    return HabitResponse(
        id=habit.id,
        user_id=habit.user_id,
        name=habit.name,
        description=habit.description,
        frequency=habit.frequency,
        is_active=habit.is_active,
        created_at=habit.created_at,
        completed_today=False,
        current_streak=0,
    )


@router.get(
    "/habits",
    response_model=List[HabitResponse],
    summary="List all habits with today's status & streaks",
)
async def list_habits(
    include_inactive: bool = Query(False),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> List[HabitResponse]:
    """List active habits along with whether completed today and current streak count."""
    query = (
        select(Habit)
        .options(selectinload(Habit.logs))
        .where(Habit.user_id == current_user.id)
    )
    if not include_inactive:
        query = query.where(Habit.is_active.is_(True))

    result = await db.execute(query)
    habits = result.scalars().all()

    today = date.today()
    responses: List[HabitResponse] = []

    for habit in habits:
        completed_today = any(log.log_date == today and log.completed for log in habit.logs)

        # Calculate streak: consecutive days backwards
        streak = 0
        check_date = today if completed_today else today - timedelta(days=1)
        logged_dates = {log.log_date for log in habit.logs if log.completed}
        while check_date in logged_dates:
            streak += 1
            check_date -= timedelta(days=1)

        responses.append(
            HabitResponse(
                id=habit.id,
                user_id=habit.user_id,
                name=habit.name,
                description=habit.description,
                frequency=habit.frequency,
                is_active=habit.is_active,
                created_at=habit.created_at,
                completed_today=completed_today,
                current_streak=streak,
            )
        )

    return responses


@router.put(
    "/habits/{habit_id}",
    response_model=HabitResponse,
    summary="Update habit details",
)
async def update_habit(
    habit_id: int,
    payload: HabitUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> HabitResponse:
    """Update habit name, description, frequency, or active state."""
    query = select(Habit).options(selectinload(Habit.logs)).where(Habit.id == habit_id, Habit.user_id == current_user.id)
    result = await db.execute(query)
    habit = result.scalar_one_or_none()
    if not habit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Habit not found")

    update_dict = payload.model_dump(exclude_unset=True)
    for k, v in update_dict.items():
        setattr(habit, k, v)

    await db.commit()
    await db.refresh(habit)

    today = date.today()
    completed_today = any(log.log_date == today and log.completed for log in habit.logs)
    return HabitResponse(
        id=habit.id,
        user_id=habit.user_id,
        name=habit.name,
        description=habit.description,
        frequency=habit.frequency,
        is_active=habit.is_active,
        created_at=habit.created_at,
        completed_today=completed_today,
        current_streak=0,
    )


@router.delete(
    "/habits/{habit_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a habit",
)
async def delete_habit(
    habit_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete habit and its logs."""
    query = select(Habit).where(Habit.id == habit_id, Habit.user_id == current_user.id)
    result = await db.execute(query)
    habit = result.scalar_one_or_none()
    if not habit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Habit not found")
    await db.delete(habit)
    await db.commit()


@router.post(
    "/habits/{habit_id}/log",
    response_model=HabitLogResponse,
    summary="Mark habit completion for a day",
)
async def log_habit_completion(
    habit_id: int,
    payload: HabitLogCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> HabitLogResponse:
    """Mark daily completion (or toggle status) for a specific habit."""
    # Verify habit exists and belongs to user
    habit_query = select(Habit).where(Habit.id == habit_id, Habit.user_id == current_user.id)
    result = await db.execute(habit_query)
    habit = result.scalar_one_or_none()
    if not habit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Habit not found")

    target_date = payload.log_date or date.today()
    log_query = select(HabitLog).where(
        HabitLog.habit_id == habit_id,
        HabitLog.log_date == target_date,
    )
    log_res = await db.execute(log_query)
    habit_log = log_res.scalar_one_or_none()

    now = datetime.now(timezone.utc)
    if not habit_log:
        habit_log = HabitLog(
            habit_id=habit_id,
            user_id=current_user.id,
            log_date=target_date,
            completed=payload.completed,
            notes=payload.notes,
            completed_at=now,
        )
        db.add(habit_log)
    else:
        habit_log.completed = payload.completed
        if payload.notes is not None:
            habit_log.notes = payload.notes
        habit_log.completed_at = now

    await db.commit()
    await db.refresh(habit_log)
    return HabitLogResponse.model_validate(habit_log)


@router.get(
    "/habits/{habit_id}/history",
    response_model=List[HabitLogResponse],
    summary="Get completion history for a specific habit",
)
async def get_habit_history(
    habit_id: int,
    limit: int = Query(30, ge=1, le=90),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> List[HabitLogResponse]:
    """Retrieve completion logs for a given habit."""
    # Verify habit belongs to user
    h_query = select(Habit).where(Habit.id == habit_id, Habit.user_id == current_user.id)
    h_res = await db.execute(h_query)
    if not h_res.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Habit not found")

    query = (
        select(HabitLog)
        .where(HabitLog.habit_id == habit_id)
        .order_by(desc(HabitLog.log_date))
        .limit(limit)
    )
    res = await db.execute(query)
    logs = res.scalars().all()
    return [HabitLogResponse.model_validate(l) for l in logs]
