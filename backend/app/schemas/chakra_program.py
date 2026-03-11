from pydantic import BaseModel, ConfigDict


class ChakraProgramRead(BaseModel):
    id: int
    name: str
    chakra: str
    frequency: str
    brainwave_type: str
    duration: int
    benefits: str | None
    audio_file: str | None
    model_config = ConfigDict(from_attributes=True)
