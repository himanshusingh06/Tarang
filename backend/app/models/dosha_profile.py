from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.sql import func

from app.db.base import Base


class DoshaProfile(Base):
    __tablename__ = "dosha_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    vata = Column(Integer, default=0)
    pitta = Column(Integer, default=0)
    kapha = Column(Integer, default=0)
    primary_dosha = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
