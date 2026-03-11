from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.sql import func

from app.db.base import Base


class DailySchedule(Base):
    __tablename__ = "daily_schedule"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    schedule_date = Column(String, nullable=False)
    period = Column(String, nullable=False)
    program_id = Column(Integer, nullable=False)
    program_type = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
