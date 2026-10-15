from datetime import datetime
from typing import Optional
from sqlalchemy import DateTime, Float, ForeignKey, Integer, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class WellnessCheckIn(Base):
    __tablename__ = "wellness_checkins"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    stress: Mapped[int] = mapped_column(Integer, nullable=False)  # 1 to 10
    sleep_hours: Mapped[float] = mapped_column(Float, nullable=False)  # e.g., 7.5
    fatigue: Mapped[int] = mapped_column(Integer, nullable=False)  # 1 to 10
    mood: Mapped[int] = mapped_column(Integer, nullable=False)  # 1 to 10
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    user: Mapped["User"] = relationship("User", back_populates="wellness_checkins")
