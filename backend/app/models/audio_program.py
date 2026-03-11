from sqlalchemy import Column, Integer, String, Text

from app.db.base import Base


class AudioProgram(Base):
    __tablename__ = "audio_programs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    frequency = Column(String, nullable=False)
    brainwave_type = Column(String, nullable=False)
    chakra = Column(String, nullable=True)
    duration = Column(Integer, nullable=False)
    benefits = Column(Text, nullable=True)
    audio_file = Column(String, nullable=True)
    recommended_time = Column(String, nullable=True)
    tags = Column(String, nullable=True)
