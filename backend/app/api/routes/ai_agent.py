from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models.ai_recommendation import AIRecommendation
from app.models.audio_program import AudioProgram
from app.models.dosha_profile import DoshaProfile
from app.models.listening_history import ListeningHistory
from app.schemas.recommendation import RecommendationRequest, RecommendationResponse, ScheduleItem
from app.services.ai_agent import (
    build_recommendation,
    detect_intent,
    get_time_period,
    llm_enhance,
    score_program,
)
from app.services.scheduler import build_schedule
from app.services.search import search as semantic_search

router = APIRouter(prefix="/ai-agent", tags=["ai-agent"])


@router.post("/recommend", response_model=RecommendationResponse)
async def recommend(
    payload: RecommendationRequest,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    intent = detect_intent(payload.input_text)
    result = await db.execute(select(AudioProgram))
    programs = result.scalars().all()
    dosha_result = await db.execute(select(DoshaProfile).where(DoshaProfile.user_id == user.id))
    dosha = dosha_result.scalar_one_or_none()
    recent_result = await db.execute(
        select(ListeningHistory.program_id)
        .where(ListeningHistory.user_id == user.id)
        .order_by(ListeningHistory.listened_at.desc())
        .limit(5)
    )
    recent_ids = {pid for (pid,) in recent_result.all()}
    time_period = get_time_period()

    program_candidates = [
        {
            "id": p.id,
            "name": p.name,
            "frequency": p.frequency,
            "brainwave_type": p.brainwave_type,
            "chakra": p.chakra,
            "duration": p.duration,
            "recommended_time": p.recommended_time,
            "tags": p.tags,
        }
        for p in programs
    ]
    program_data = max(
        program_candidates,
        key=lambda p: score_program(
            p,
            intent,
            dosha.primary_dosha if dosha else None,
            time_period,
            recent_ids,
        ),
        default=None,
    )
    if not program_data:
        program = programs[0]
        program_data = {
            "id": program.id,
            "name": program.name,
            "frequency": program.frequency,
            "brainwave_type": program.brainwave_type,
            "chakra": program.chakra,
            "duration": program.duration,
            "recommended_time": program.recommended_time,
            "tags": program.tags,
        }
    base_text = build_recommendation(program_data)
    matches = await semantic_search(payload.input_text, k=4)
    knowledge = []
    for _, doc in matches:
        meta = doc["metadata"]
        if meta.get("type") == "knowledge":
            knowledge.append(doc["text"])
    schedule = build_schedule(
        [
            {
                "id": p.id,
                "name": p.name,
                "frequency": p.frequency,
                "brainwave_type": p.brainwave_type,
                "duration": p.duration,
                "recommended_time": p.recommended_time,
            }
            for p in programs
        ]
    )
    schedule_text = "; ".join([f"{item['period']}: {item['name']}" for item in schedule])
    dosha_text = ""
    if dosha:
        dosha_text = f"Primary dosha: {dosha.primary_dosha}. Vata {dosha.vata}, Pitta {dosha.pitta}, Kapha {dosha.kapha}."

    enhanced = llm_enhance(
        base_text,
        {
            "program_name": program_data["name"],
            "schedule_text": schedule_text,
            "knowledge": "\n".join([dosha_text, f"Time of day: {time_period}."] + knowledge),
        },
    )
    db.add(AIRecommendation(user_id=user.id, input_text=payload.input_text, recommendation=enhanced))
    await db.commit()
    return RecommendationResponse(
        recommendation=enhanced,
        program=program_data,
        schedule=[ScheduleItem(**item) for item in schedule],
    )
