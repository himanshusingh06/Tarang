from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models.audio_program import AudioProgram
from app.schemas.scheduler import SchedulerRequest, SchedulerResponse
from app.services.scheduler import build_schedule

router = APIRouter(prefix="/scheduler", tags=["scheduler"])


@router.post("/daily", response_model=SchedulerResponse)
async def daily(
    payload: SchedulerRequest,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    result = await db.execute(select(AudioProgram))
    programs = result.scalars().all()
    items = build_schedule(
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
    return SchedulerResponse(date=payload.date, items=items)
