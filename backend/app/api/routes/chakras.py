from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.models.chakra_program import ChakraProgram
from app.schemas.chakra_program import ChakraProgramRead

router = APIRouter(prefix="/chakras", tags=["chakras"])


@router.get("/", response_model=list[ChakraProgramRead])
async def list_chakras(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ChakraProgram))
    return result.scalars().all()
