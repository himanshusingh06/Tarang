from pydantic import BaseModel, ConfigDict


class RecommendationLogRead(BaseModel):
    id: int
    input_text: str
    recommendation: str
    created_at: str

    model_config = ConfigDict(from_attributes=True)
