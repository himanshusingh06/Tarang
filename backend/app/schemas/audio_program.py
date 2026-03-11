from pydantic import BaseModel, ConfigDict


class AudioProgramCreate(BaseModel):
    name: str
    frequency: str
    brainwave_type: str
    chakra: str | None = None
    duration: int
    benefits: str | None = None
    audio_file: str | None = None
    recommended_time: str | None = None
    tags: str | None = None


class AudioProgramUpdate(BaseModel):
    name: str | None = None
    frequency: str | None = None
    brainwave_type: str | None = None
    chakra: str | None = None
    duration: int | None = None
    benefits: str | None = None
    audio_file: str | None = None
    recommended_time: str | None = None
    tags: str | None = None


class AudioProgramRead(BaseModel):
    id: int
    name: str
    frequency: str
    brainwave_type: str
    chakra: str | None
    duration: int
    benefits: str | None
    audio_file: str | None
    recommended_time: str | None
    tags: str | None
    model_config = ConfigDict(from_attributes=True)
