from pydantic import BaseModel


class DiagnosticAnswer(BaseModel):
    question_id: int
    value: str


class DiagnosticSubmission(BaseModel):
    answers: list[DiagnosticAnswer]


class DoshaResult(BaseModel):
    vata: int
    pitta: int
    kapha: int
    primary_dosha: str
