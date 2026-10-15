from datetime import date, datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


# --- Dietary Profile ---
class DietaryProfileBase(BaseModel):
    dietary_type: str = Field("veg", examples=["veg", "vegan", "non-veg", "eggetarian"])
    allergies: Optional[str] = Field(None, examples=["peanuts", "lactose", "shellfish"])
    goals: str = Field("maintenance", examples=["weight-loss", "muscle-gain", "maintenance"])
    daily_budget: Optional[float] = Field(None, ge=0.0, examples=[400.0])
    calorie_target: Optional[int] = Field(None, ge=500, le=10000, examples=[2200])


class DietaryProfileCreate(DietaryProfileBase):
    pass


class DietaryProfileUpdate(BaseModel):
    dietary_type: Optional[str] = Field(None, examples=["vegan"])
    allergies: Optional[str] = None
    goals: Optional[str] = Field(None, examples=["weight-loss"])
    daily_budget: Optional[float] = Field(None, ge=0.0)
    calorie_target: Optional[int] = Field(None, ge=500, le=10000)


class DietaryProfileResponse(DietaryProfileBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Meal Plan ---
class MealPlanGenerateRequest(BaseModel):
    week_start_date: Optional[date] = Field(None, description="Start date of the week (defaults to next Monday or today)")
    dietary_type_override: Optional[str] = Field(None, description="Override saved dietary preference for this plan")
    daily_budget_override: Optional[float] = Field(None, description="Override daily budget in currency")
    special_notes: Optional[str] = Field(None, description="Specific cravings or ingredient constraints", examples=["high protein, quick 15-min breakfast"])


class MealPlanResponse(BaseModel):
    id: int
    user_id: int
    week_start_date: date
    title: str
    plan_data: Dict[str, Any]
    ai_generated: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Hydration ---
class HydrationLogCreate(BaseModel):
    log_date: Optional[date] = Field(None, description="Date for hydration log; defaults to today")
    glasses: int = Field(1, ge=0, le=50, description="Number of glasses to record or add")
    target_glasses: Optional[int] = Field(8, ge=1, le=50, description="Target glasses per day")
    mode: str = Field("add", description="'add' to increment existing count, or 'set' to set exact number")
    notes: Optional[str] = Field(None, max_length=255)


class HydrationLogResponse(BaseModel):
    id: int
    user_id: int
    log_date: date
    glasses: int
    target_glasses: int
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Habits ---
class HabitCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=150, examples=["Drink 500ml water upon waking", "20-minute brisk walk"])
    description: Optional[str] = Field(None, max_length=500, examples=["Boosts metabolism and morning alertness"])
    frequency: str = Field("daily", examples=["daily", "weekdays", "weekly"])


class HabitUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=150)
    description: Optional[str] = None
    frequency: Optional[str] = None
    is_active: Optional[bool] = None


class HabitLogCreate(BaseModel):
    log_date: Optional[date] = Field(None, description="Defaults to today")
    completed: bool = Field(True, description="Whether habit was completed")
    notes: Optional[str] = Field(None, max_length=255)


class HabitLogResponse(BaseModel):
    id: int
    habit_id: int
    user_id: int
    log_date: date
    completed: bool
    notes: Optional[str]
    completed_at: datetime

    model_config = ConfigDict(from_attributes=True)


class HabitResponse(BaseModel):
    id: int
    user_id: int
    name: str
    description: Optional[str]
    frequency: str
    is_active: bool
    created_at: datetime
    completed_today: bool = False
    current_streak: int = 0

    model_config = ConfigDict(from_attributes=True)
