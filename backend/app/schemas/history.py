from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ListeningHistoryCreate(BaseModel):
    program_id: int
    program_type: str
    duration: int


class ListeningHistoryRead(BaseModel):
    id: int
    program_id: int
    program_type: str
    duration: int
    listened_at: datetime

    model_config = ConfigDict(from_attributes=True)
