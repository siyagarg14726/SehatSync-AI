from datetime import datetime, timedelta, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.models.wellness import WellnessCheckIn
from app.schemas.wellness import (
    WellnessCheckInCreate,
    WellnessCheckInResponse,
    WellnessInsightResponse,
    WellnessTrendPoint,
    WellnessTrendResponse,
)
from app.services.ai_service import AIService
from app.utils.deps import get_current_user

router = APIRouter(prefix="/wellness", tags=["RakshakAI Wellness"])


@router.post(
    "/check-in",
    response_model=WellnessCheckInResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record daily wellness check-in",
)
async def create_check_in(
    payload: WellnessCheckInCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> WellnessCheckInResponse:
    """Record daily wellness metrics: stress, sleep hours, fatigue, mood, and optional notes."""
    checkin_time = payload.recorded_at or datetime.now(timezone.utc)
    new_checkin = WellnessCheckIn(
        user_id=current_user.id,
        stress=payload.stress,
        sleep_hours=payload.sleep_hours,
        fatigue=payload.fatigue,
        mood=payload.mood,
        notes=payload.notes,
        recorded_at=checkin_time,
    )
    db.add(new_checkin)
    await db.commit()
    await db.refresh(new_checkin)
    return WellnessCheckInResponse.model_validate(new_checkin)


@router.get(
    "/check-ins",
    response_model=List[WellnessCheckInResponse],
    summary="List wellness check-in history",
)
async def list_check_ins(
    limit: int = Query(30, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> List[WellnessCheckInResponse]:
    """Retrieve chronological history of wellness check-ins for current user."""
    query = (
        select(WellnessCheckIn)
        .where(WellnessCheckIn.user_id == current_user.id)
        .order_by(desc(WellnessCheckIn.recorded_at))
        .offset(offset)
        .limit(limit)
    )
    result = await db.execute(query)
    checkins = result.scalars().all()
    return [WellnessCheckInResponse.model_validate(c) for c in checkins]


@router.get(
    "/check-ins/latest",
    response_model=Optional[WellnessCheckInResponse],
    summary="Get the most recent wellness check-in",
)
async def get_latest_check_in(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Optional[WellnessCheckInResponse]:
    """Retrieve the most recent wellness check-in recorded by the user."""
    query = (
        select(WellnessCheckIn)
        .where(WellnessCheckIn.user_id == current_user.id)
        .order_by(desc(WellnessCheckIn.recorded_at))
        .limit(1)
    )
    result = await db.execute(query)
    latest = result.scalar_one_or_none()
    if not latest:
        return None
    return WellnessCheckInResponse.model_validate(latest)


@router.get(
    "/trends",
    response_model=WellnessTrendResponse,
    summary="Get wellness trend analysis for past 7 or 30 days",
)
async def get_wellness_trends(
    days: int = Query(7, ge=1, le=90, description="Analysis window in days (e.g. 7, 30)"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> WellnessTrendResponse:
    """Calculate averages and day-by-day trend points for stress, sleep, fatigue, and mood."""
    cutoff_date = datetime.now(timezone.utc) - timedelta(days=days)
    query = (
        select(WellnessCheckIn)
        .where(
            WellnessCheckIn.user_id == current_user.id,
            WellnessCheckIn.recorded_at >= cutoff_date,
        )
        .order_by(WellnessCheckIn.recorded_at.asc())
    )
    result = await db.execute(query)
    checkins = result.scalars().all()

    if not checkins:
        return WellnessTrendResponse(
            period_days=days,
            total_checkins=0,
            avg_stress=None,
            avg_sleep_hours=None,
            avg_fatigue=None,
            avg_mood=None,
            daily_trends=[],
            summary=f"No check-ins recorded in the last {days} days. Start tracking daily to see trend trajectories.",
        )

    count = len(checkins)
    avg_stress = round(sum(c.stress for c in checkins) / count, 2)
    avg_sleep = round(sum(c.sleep_hours for c in checkins) / count, 2)
    avg_fatigue = round(sum(c.fatigue for c in checkins) / count, 2)
    avg_mood = round(sum(c.mood for c in checkins) / count, 2)

    # Group or map chronologically
    daily_trends: List[WellnessTrendPoint] = []
    for c in checkins:
        daily_trends.append(
            WellnessTrendPoint(
                date=c.recorded_at.strftime("%Y-%m-%d"),
                stress=float(c.stress),
                sleep_hours=float(c.sleep_hours),
                fatigue=float(c.fatigue),
                mood=float(c.mood),
            )
        )

    summary = (
        f"In the past {days} days ({count} check-ins), your average stress was {avg_stress}/10, "
        f"sleep averaged {avg_sleep} hours/night, fatigue was {avg_fatigue}/10, and mood was {avg_mood}/10."
    )

    return WellnessTrendResponse(
        period_days=days,
        total_checkins=count,
        avg_stress=avg_stress,
        avg_sleep_hours=avg_sleep,
        avg_fatigue=avg_fatigue,
        avg_mood=avg_mood,
        daily_trends=daily_trends,
        summary=summary,
    )


@router.post(
    "/insights",
    response_model=WellnessInsightResponse,
    summary="Generate AI wellness insights from last 7 days of check-ins",
)
async def generate_ai_wellness_insights(
    days: int = Query(7, ge=3, le=30, description="Window of check-ins to feed to AI engine"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> WellnessInsightResponse:
    """Send past check-in records to Google Gemini to get explainable wellness insights & recommendations."""
    cutoff_date = datetime.now(timezone.utc) - timedelta(days=days)
    query = (
        select(WellnessCheckIn)
        .where(
            WellnessCheckIn.user_id == current_user.id,
            WellnessCheckIn.recorded_at >= cutoff_date,
        )
        .order_by(desc(WellnessCheckIn.recorded_at))
    )
    result = await db.execute(query)
    records = result.scalars().all()

    checkins_data = [
        {
            "date": c.recorded_at.strftime("%Y-%m-%d"),
            "stress": c.stress,
            "sleep_hours": c.sleep_hours,
            "fatigue": c.fatigue,
            "mood": c.mood,
            "notes": c.notes,
        }
        for c in records
    ]

    user_name = current_user.profile.full_name if current_user.profile else "User"
    ai_result = await AIService.generate_wellness_insights(checkins_data, user_name=user_name)

    return WellnessInsightResponse(
        overview=ai_result.get("overview", "Wellness analysis completed."),
        explainable_factors=ai_result.get("explainable_factors", []),
        recommendations=ai_result.get("recommendations", []),
        stress_level_status=ai_result.get("stress_level_status", "Optimal"),
        sleep_status=ai_result.get("sleep_status", "Optimal"),
    )
