from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.sql import func

from app.db.base import Base


class ListeningHistory(Base):
    __tablename__ = "listening_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    program_id = Column(Integer, nullable=False)
    program_type = Column(String, nullable=False)
    listened_at = Column(DateTime(timezone=True), server_default=func.now())
    duration = Column(Integer, nullable=False)
