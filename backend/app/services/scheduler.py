from __future__ import annotations

TIME_MAP = [
    {"period": "Morning", "brainwave": "Beta", "goal": "Focus"},
    {"period": "Afternoon", "brainwave": "Alpha", "goal": "Balance"},
    {"period": "Evening", "brainwave": "Alpha", "goal": "Relaxation"},
    {"period": "Night", "brainwave": "Delta", "goal": "Sleep"},
]


def build_schedule(programs: list[dict]) -> list[dict]:
    items = []
    for slot in TIME_MAP:
        match = None
        for program in programs:
            if program["brainwave_type"].lower() == slot["brainwave"].lower():
                match = program
                break
        if not match and programs:
            match = programs[0]
        if match:
            items.append(
                {
                    "period": slot["period"],
                    "program_id": match["id"],
                    "program_type": "audio_program",
                    "name": match["name"],
                }
            )
    return items
