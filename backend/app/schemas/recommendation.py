from pydantic import BaseModel


class RecommendationRequest(BaseModel):
    input_text: str
    mood: str | None = None
    goals: list[str] | None = None


class ScheduleItem(BaseModel):
    period: str
    program_id: int
    program_type: str
    name: str


class RecommendationResponse(BaseModel):
    recommendation: str
    program: dict
    schedule: list[ScheduleItem]
