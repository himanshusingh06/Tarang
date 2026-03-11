from __future__ import annotations

from datetime import datetime

from app.core.config import settings

SYMPTOM_MAP = {
    "stress": "Sanjeevani",
    "sleep": "Dhyana Nidra",
    "focus": "Kayakalp",
    "energy": "Sanjeevani",
    "anxiety": "Vimukt",
}

INTENT_TAGS = {
    "stress": ["stress", "calm", "relax"],
    "sleep": ["sleep", "rest", "deep"],
    "focus": ["focus", "clarity", "alert"],
    "energy": ["energy", "vitality", "uplift"],
    "balance": ["balance", "harmony"],
}

BRAINWAVE_PREFERENCES = {
    "Vata": ["Theta", "Delta", "Alpha"],
    "Pitta": ["Alpha", "Theta"],
    "Kapha": ["Beta", "Alpha"],
}

BRAINWAVE_MAP = {
    "Sanjeevani": "Alpha",
    "Kayakalp": "Beta",
    "Vimukt": "Theta",
    "Dhyana Nidra": "Theta",
    "Chaitanya": "Alpha",
}

CHAKRA_MAP = {
    "Sanjeevani": "Anahata",
    "Kayakalp": "Manipura",
    "Vimukt": "Swadhisthana",
    "Dhyana Nidra": "Ajna",
    "Chaitanya": "Vishuddha",
}


def detect_intent(text: str) -> str:
    lower = text.lower()
    if "sleep" in lower or "insomnia" in lower:
        return "sleep"
    if "stress" in lower or "anx" in lower:
        return "stress"
    if "focus" in lower or "concentr" in lower:
        return "focus"
    if "energy" in lower or "tired" in lower:
        return "energy"
    return "balance"


def map_symptom(intent: str) -> str:
    return SYMPTOM_MAP.get(intent, "Sanjeevani")


def get_time_period() -> str:
    hour = datetime.now().hour
    if 5 <= hour < 11:
        return "Morning"
    if 11 <= hour < 17:
        return "Afternoon"
    if 17 <= hour < 21:
        return "Evening"
    return "Night"


def score_program(
    program: dict,
    intent: str,
    dosha: str | None,
    time_period: str,
    recent_ids: set[int],
) -> float:
    score = 0.0
    if program["name"].lower() == map_symptom(intent).lower():
        score += 3.0
    tags = (program.get("tags") or "").lower()
    for tag in INTENT_TAGS.get(intent, []):
        if tag in tags:
            score += 1.0
    if dosha and program.get("brainwave_type") in BRAINWAVE_PREFERENCES.get(dosha, []):
        score += 2.0
    if program.get("recommended_time") and program["recommended_time"].lower() == time_period.lower():
        score += 1.0
    if program["id"] in recent_ids:
        score -= 2.0
    return score


def build_recommendation(program: dict) -> str:
    name = program["name"]
    brainwave = program["brainwave_type"]
    chakra = program.get("chakra") or CHAKRA_MAP.get(name, "Anahata")
    duration = program["duration"]
    time_of_day = program.get("recommended_time", "Evening")
    return (
        f"Recommended Program: {name}. "
        f"Frequency: {program['frequency']}. "
        f"Brainwave state: {brainwave}. "
        f"Chakra alignment: {chakra}. "
        f"Listening duration: {duration} minutes. "
        f"Best time: {time_of_day}."
    )


def llm_enhance(prompt: str, tool_context: dict | None = None) -> str:
    if not settings.GOOGLE_API_KEY:
        return prompt
    try:
        from langchain_google_genai import ChatGoogleGenerativeAI
        from langchain.agents import initialize_agent, AgentType
        from langchain.tools import Tool

        context = tool_context or {}
        tools = [
            Tool(
                name="SymptomMapper",
                func=lambda _: context.get("program_name", "Sanjeevani"),
                description="Maps user symptoms to the best program name.",
            ),
            Tool(
                name="ScheduleBuilder",
                func=lambda _: context.get("schedule_text", ""),
                description="Returns a recommended daily schedule as text.",
            ),
            Tool(
                name="KnowledgeRetriever",
                func=lambda _: context.get("knowledge", ""),
                description="Returns Ayurveda + neuroscience context for grounding recommendations.",
            ),
        ]

        llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-pro",
            google_api_key=settings.GOOGLE_API_KEY,
            temperature=0.2,
        )

        agent = initialize_agent(
            tools,
            llm,
            agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
            verbose=False,
        )
        return agent.run(prompt)
    except Exception:
        return prompt
