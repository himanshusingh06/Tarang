from fastapi import APIRouter

from app.api.routes import (
    auth,
    users,
    programs,
    chakras,
    audio,
    diagnostics,
    ai_agent,
    scheduler,
    search,
    history,
    profile,
    recommendations,
    admin,
)

router = APIRouter()

router.include_router(auth.router)
router.include_router(users.router)
router.include_router(programs.router)
router.include_router(chakras.router)
router.include_router(audio.router)
router.include_router(diagnostics.router)
router.include_router(ai_agent.router)
router.include_router(scheduler.router)
router.include_router(search.router)
router.include_router(history.router)
router.include_router(profile.router)
router.include_router(recommendations.router)
router.include_router(admin.router)
