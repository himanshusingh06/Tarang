from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Header
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.responses import FileResponse, Response
import mimetypes
import os
import uuid
from pathlib import Path

from app.api.deps import get_db, require_roles
from app.models.audio_program import AudioProgram
from app.services.audio_storage import get_audio_path

router = APIRouter(prefix="/audio", tags=["audio"])


@router.get("/{program_id}")
async def get_audio(
    program_id: int,
    db: AsyncSession = Depends(get_db),
    range_header: str | None = Header(default=None, alias="Range"),
):
    result = await db.execute(select(AudioProgram).where(AudioProgram.id == program_id))
    program = result.scalar_one_or_none()
    if not program or not program.audio_file:
        raise HTTPException(status_code=404, detail="Audio not found")
    path = get_audio_path(program.audio_file)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Audio file missing on server")
    media_type = mimetypes.guess_type(path)[0] or "application/octet-stream"
    file_size = os.path.getsize(path)

    if range_header:
        # Expected: "bytes=start-end"
        try:
            units, value = range_header.split("=", 1)
            if units != "bytes":
                raise ValueError("Unsupported range unit")
            start_str, end_str = value.split("-", 1)
            start = int(start_str) if start_str else 0
            end = int(end_str) if end_str else file_size - 1
        except Exception:
            raise HTTPException(status_code=416, detail="Invalid Range header")

        if start >= file_size:
            return Response(status_code=416, headers={"Content-Range": f"bytes */{file_size}"})

        end = min(end, file_size - 1)
        length = end - start + 1
        with open(path, "rb") as audio_file:
            audio_file.seek(start)
            data = audio_file.read(length)
        headers = {
            "Content-Range": f"bytes {start}-{end}/{file_size}",
            "Accept-Ranges": "bytes",
            "Content-Length": str(length),
        }
        return Response(content=data, status_code=206, media_type=media_type, headers=headers)

    return FileResponse(path, media_type=media_type, headers={"Accept-Ranges": "bytes"})


@router.post("/upload")
async def upload_audio(
    file: UploadFile = File(...),
    current_user=Depends(require_roles("admin", "staff")),
):
    ext = Path(file.filename or "").suffix.lower()
    if not ext:
        ext = ".wav"
    safe_name = f"{uuid.uuid4().hex}{ext}"
    path = get_audio_path(safe_name)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as out:
        out.write(await file.read())
    return {"filename": safe_name, "original_name": file.filename}
