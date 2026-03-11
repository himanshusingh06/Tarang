from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.models.audio_program import AudioProgram
from app.schemas.audio_program import AudioProgramRead

router = APIRouter(prefix="/programs", tags=["programs"])


@router.get("/", response_model=list[AudioProgramRead])
async def list_programs(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AudioProgram))
    return result.scalars().all()


@router.get("/{program_id}", response_model=AudioProgramRead)
async def get_program(program_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AudioProgram).where(AudioProgram.id == program_id))
    program = result.scalar_one_or_none()
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
    return program
