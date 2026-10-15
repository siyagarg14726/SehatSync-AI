from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class WellnessCheckInCreate(BaseModel):
    stress: int = Field(..., ge=1, le=10, description="Stress level from 1 (lowest) to 10 (highest)", examples=[4])
    sleep_hours: float = Field(..., ge=0.0, le=24.0, description="Hours of sleep in past 24 hours", examples=[7.5])
    fatigue: int = Field(..., ge=1, le=10, description="Fatigue level from 1 (lowest) to 10 (highest)", examples=[3])
    mood: int = Field(..., ge=1, le=10, description="Mood rating from 1 (lowest/worst) to 10 (highest/best)", examples=[8])
    notes: Optional[str] = Field(None, max_length=1000, description="Optional personal notes about the day", examples=["Had a restful morning walk"])
    recorded_at: Optional[datetime] = Field(None, description="Optional custom timestamp; defaults to current time")


class WellnessCheckInResponse(BaseModel):
    id: int
    user_id: int
    stress: int
    sleep_hours: float
    fatigue: int
    mood: int
    notes: Optional[str]
    recorded_at: datetime
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class WellnessTrendPoint(BaseModel):
    date: str
    stress: float
    sleep_hours: float
    fatigue: float
    mood: float


class WellnessTrendResponse(BaseModel):
    period_days: int
    total_checkins: int
    avg_stress: Optional[float] = None
    avg_sleep_hours: Optional[float] = None
    avg_fatigue: Optional[float] = None
    avg_mood: Optional[float] = None
    daily_trends: List[WellnessTrendPoint] = []
    summary: str


class WellnessInsightResponse(BaseModel):
    overview: str
    explainable_factors: List[str]
    recommendations: List[str]
    stress_level_status: str
    sleep_status: str
    generated_at: datetime = Field(default_factory=datetime.utcnow)
