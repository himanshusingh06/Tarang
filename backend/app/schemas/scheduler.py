from pydantic import BaseModel


class SchedulerRequest(BaseModel):
    date: str
    mood: str | None = None
    goals: list[str] | None = None


class SchedulerResponse(BaseModel):
    date: str
    items: list[dict]
