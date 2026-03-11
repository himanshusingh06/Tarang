from fastapi import APIRouter, Depends

from app.schemas.search import SearchRequest, SearchResult
from app.services.search import search

router = APIRouter(prefix="/search", tags=["search"])


@router.post("/", response_model=list[SearchResult])
async def search_programs(payload: SearchRequest):
    matches = await search(payload.query, k=12)
    results = []
    filters = payload.filters or {}

    def matches_filters(meta: dict) -> bool:
        for key, value in filters.items():
            if value is None:
                continue
            if key == "issue":
                haystack = f"{meta.get('tags','')} {meta.get('benefits','')}".lower()
            else:
                haystack = str(meta.get(key, "")).lower()
            if isinstance(value, list):
                if not any(str(v).lower() in haystack for v in value):
                    return False
            else:
                if str(value).lower() not in haystack:
                    return False
        return True

    for score, doc in matches:
        meta = doc["metadata"]
        if meta.get("type") != "audio_program":
            continue
        if not matches_filters(meta):
            continue
        results.append(
            SearchResult(
                id=meta["id"],
                name=meta["name"],
                program_type="audio_program",
                score=score,
            )
        )
    return results
