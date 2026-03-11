from fastapi import APIRouter, Depends
from datetime import timedelta
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models.dosha_profile import DoshaProfile
from app.models.listening_history import ListeningHistory
from app.schemas.profile import DoshaRead, ProfileRead, ProfileStats

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("/", response_model=ProfileRead)
async def read_profile(
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    dosha_result = await db.execute(select(DoshaProfile).where(DoshaProfile.user_id == user.id))
    dosha = dosha_result.scalar_one_or_none()

    stats_result = await db.execute(
        select(
            func.count(ListeningHistory.id),
            func.coalesce(func.sum(ListeningHistory.duration), 0),
        ).where(ListeningHistory.user_id == user.id)
    )
    total_sessions, total_minutes = stats_result.one()

    history_dates_result = await db.execute(
        select(ListeningHistory.listened_at)
        .where(ListeningHistory.user_id == user.id)
        .order_by(ListeningHistory.listened_at.desc())
    )
    unique_dates = []
    for (dt,) in history_dates_result:
        day = dt.date()
        if day not in unique_dates:
            unique_dates.append(day)

    streak = 0
    if unique_dates:
        current = unique_dates[0]
        for day in unique_dates:
            if day == current:
                streak += 1
                current = current - timedelta(days=1)
            else:
                break

    return ProfileRead(
        user=user,
        dosha=DoshaRead(
            vata=dosha.vata,
            pitta=dosha.pitta,
            kapha=dosha.kapha,
            primary_dosha=dosha.primary_dosha,
        )
        if dosha
        else None,
        stats=ProfileStats(
            total_sessions=total_sessions,
            total_minutes=total_minutes,
            streak_days=streak,
        ),
    )
