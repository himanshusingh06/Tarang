from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models.listening_history import ListeningHistory
from app.schemas.history import ListeningHistoryCreate, ListeningHistoryRead

router = APIRouter(prefix="/listening-history", tags=["listening-history"])


@router.get("/", response_model=list[ListeningHistoryRead])
async def list_history(
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    result = await db.execute(
        select(ListeningHistory).where(ListeningHistory.user_id == user.id).order_by(ListeningHistory.listened_at.desc())
    )
    return result.scalars().all()


@router.post("/", response_model=ListeningHistoryRead)
async def add_history(
    payload: ListeningHistoryCreate,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    entry = ListeningHistory(
        user_id=user.id,
        program_id=payload.program_id,
        program_type=payload.program_type,
        duration=payload.duration,
    )
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return entry
