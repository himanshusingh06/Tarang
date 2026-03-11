from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models.ai_recommendation import AIRecommendation
from app.schemas.recommendation_log import RecommendationLogRead

router = APIRouter(prefix="/ai-recommendations", tags=["ai-recommendations"])


@router.get("/", response_model=list[RecommendationLogRead])
async def list_recommendations(
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    result = await db.execute(
        select(AIRecommendation).where(AIRecommendation.user_id == user.id).order_by(AIRecommendation.created_at.desc())
    )
    return result.scalars().all()
