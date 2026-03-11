from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, text

from app.api.routes.index import router as api_router
from app.core.config import settings
from app.core.logging import setup_logging
from app.db.base import Base
from app.db.session import engine, async_session_factory
from app.models.audio_program import AudioProgram
from app.models.chakra_program import ChakraProgram
from app.services.search import build_index
import app.models  # noqa: F401

setup_logging()

app = FastAPI(title=settings.PROJECT_NAME)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.on_event("startup")
async def startup_event():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session_factory() as session:
        result = await session.execute(select(AudioProgram))
        programs = result.scalars().all()
        if not programs:
            from app.data.seed import AUDIO_PROGRAMS, CHAKRA_PROGRAMS
            for program in AUDIO_PROGRAMS:
                session.add(AudioProgram(**program))
            for chakra in CHAKRA_PROGRAMS:
                session.add(ChakraProgram(**chakra))
            await session.commit()

        # Ensure sequences are aligned after seed inserts with explicit ids.
        await session.execute(
            text(
                "SELECT setval(pg_get_serial_sequence('audio_programs','id'), "
                "COALESCE((SELECT MAX(id) FROM audio_programs), 1), true)"
            )
        )
        await session.execute(
            text(
                "SELECT setval(pg_get_serial_sequence('chakra_programs','id'), "
                "COALESCE((SELECT MAX(id) FROM chakra_programs), 1), true)"
            )
        )
        await session.commit()

        result = await session.execute(select(AudioProgram))
        programs = result.scalars().all()
        try:
            from app.rag.loader import load_knowledge_chunks
            knowledge_chunks = load_knowledge_chunks()
        except Exception:
            knowledge_chunks = []

        await build_index(
            [
                {
                    "id": p.id,
                    "name": p.name,
                    "frequency": p.frequency,
                    "brainwave_type": p.brainwave_type,
                    "benefits": p.benefits,
                    "tags": p.tags,
                }
                for p in programs
            ],
            knowledge_chunks,
        )


@app.get("/")
async def health_check():
    return {"status": "ok", "service": settings.PROJECT_NAME}
