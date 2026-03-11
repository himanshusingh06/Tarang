from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.api.deps import get_current_user, get_db
from app.models.dosha_profile import DoshaProfile
from app.schemas.diagnostic import DiagnosticSubmission, DoshaResult
from app.services.diagnostics import QUESTIONS, evaluate_dosha

router = APIRouter(prefix="/diagnostics", tags=["diagnostics"])


@router.get("/questions")
async def get_questions():
    return QUESTIONS


@router.post("/submit", response_model=DoshaResult)
async def submit(
    submission: DiagnosticSubmission,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    result = evaluate_dosha([a.dict() for a in submission.answers])
    existing = await db.execute(select(DoshaProfile).where(DoshaProfile.user_id == user.id))
    profile = existing.scalar_one_or_none()
    if profile:
        profile.vata = result["vata"]
        profile.pitta = result["pitta"]
        profile.kapha = result["kapha"]
        profile.primary_dosha = result["primary_dosha"]
    else:
        profile = DoshaProfile(user_id=user.id, **result)
        db.add(profile)
    await db.commit()
    return result
