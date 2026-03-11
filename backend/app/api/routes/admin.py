from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, require_roles
from app.core.security import get_password_hash
from app.models.audio_program import AudioProgram
from app.models.user import User
from app.schemas.admin import StaffCreate, UserUpdateAdmin
from app.schemas.audio_program import AudioProgramCreate, AudioProgramRead, AudioProgramUpdate
from app.schemas.user import UserRead

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users", response_model=list[UserRead])
async def list_users(
    role: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "staff")),
):
    query = select(User)
    if role:
        query = query.where(User.role == role)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/users/{user_id}", response_model=UserRead)
async def get_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "staff")),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/users/{user_id}", response_model=UserRead)
async def update_user(
    user_id: int,
    payload: UserUpdateAdmin,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "staff")),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if payload.email and payload.email != user.email:
        existing = await db.execute(select(User).where(User.email == payload.email))
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Email already registered")
    if current_user.role != "admin":
        if payload.role is not None or payload.is_active is not None:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(user, key, value)
    await db.commit()
    await db.refresh(user)
    return user


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await db.delete(user)
    await db.commit()
    return {"status": "deleted"}

@router.post("/staff", response_model=UserRead)
async def create_staff(
    payload: StaffCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    existing = await db.execute(select(User).where(User.email == payload.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=payload.email,
        hashed_password=get_password_hash(payload.password),
        full_name=payload.full_name,
        role="staff",
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.get("/programs", response_model=list[AudioProgramRead])
async def admin_programs(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "staff")),
):
    result = await db.execute(select(AudioProgram))
    return result.scalars().all()


@router.get("/programs/{program_id}", response_model=AudioProgramRead)
async def get_program(
    program_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "staff")),
):
    result = await db.execute(select(AudioProgram).where(AudioProgram.id == program_id))
    program = result.scalar_one_or_none()
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
    return program


@router.post("/programs", response_model=AudioProgramRead)
async def create_program(
    payload: AudioProgramCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "staff")),
):
    program = AudioProgram(**payload.model_dump())
    db.add(program)
    await db.commit()
    await db.refresh(program)
    return program


@router.put("/programs/{program_id}", response_model=AudioProgramRead)
async def update_program(
    program_id: int,
    payload: AudioProgramUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "staff")),
):
    result = await db.execute(select(AudioProgram).where(AudioProgram.id == program_id))
    program = result.scalar_one_or_none()
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(program, key, value)
    await db.commit()
    await db.refresh(program)
    return program


@router.delete("/programs/{program_id}")
async def delete_program(
    program_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    result = await db.execute(select(AudioProgram).where(AudioProgram.id == program_id))
    program = result.scalar_one_or_none()
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
    await db.delete(program)
    await db.commit()
    return {"status": "deleted"}
