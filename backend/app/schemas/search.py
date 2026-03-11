from pydantic import BaseModel


class SearchRequest(BaseModel):
    query: str
    filters: dict | None = None


class SearchResult(BaseModel):
    id: int
    name: str
    program_type: str
    score: float
