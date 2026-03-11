from pydantic import BaseModel

from app.schemas.user import UserRead


class DoshaRead(BaseModel):
    vata: int
    pitta: int
    kapha: int
    primary_dosha: str | None


class ProfileStats(BaseModel):
    total_sessions: int
    total_minutes: int
    streak_days: int


class ProfileRead(BaseModel):
    user: UserRead
    dosha: DoshaRead | None
    stats: ProfileStats
