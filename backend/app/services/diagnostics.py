from __future__ import annotations

QUESTIONS = [
    {"id": 1, "text": "How is your sleep quality?", "options": ["Light/Interrupted", "Moderate", "Deep/Heavy"]},
    {"id": 2, "text": "How is your digestion?", "options": ["Irregular", "Strong", "Slow"]},
    {"id": 3, "text": "Your energy levels feel:", "options": ["Variable", "Intense", "Stable"]},
    {"id": 4, "text": "Your body temperature is usually:", "options": ["Cold", "Warm", "Cool"]},
    {"id": 5, "text": "Your appetite is:", "options": ["Inconsistent", "Strong", "Low"]},
    {"id": 6, "text": "Your mood tends to be:", "options": ["Anxious", "Irritable", "Calm"]},
    {"id": 7, "text": "Your skin is:", "options": ["Dry", "Sensitive", "Oily"]},
    {"id": 8, "text": "Your focus is:", "options": ["Scattered", "Sharp", "Steady"]},
    {"id": 9, "text": "Your speech is:", "options": ["Fast", "Direct", "Slow"]},
    {"id": 10, "text": "Your memory is:", "options": ["Quick but forgetful", "Strong", "Stable"]},
    {"id": 11, "text": "Your body frame is:", "options": ["Slim", "Medium", "Solid"]},
    {"id": 12, "text": "Your joints are:", "options": ["Cracky", "Flexible", "Sturdy"]},
    {"id": 13, "text": "Your stress response is:", "options": ["Worry", "Anger", "Withdrawal"]},
    {"id": 14, "text": "Your work style is:", "options": ["Creative", "Goal-driven", "Methodical"]},
    {"id": 15, "text": "Your speech speed is:", "options": ["Rapid", "Moderate", "Slow"]},
    {"id": 16, "text": "Your walking pace is:", "options": ["Quick", "Brisk", "Leisurely"]},
    {"id": 17, "text": "Your food cravings are:", "options": ["Sweet", "Spicy", "Salty"]},
    {"id": 18, "text": "Your resilience is:", "options": ["Variable", "Strong", "Stable"]},
    {"id": 19, "text": "Your weight changes are:", "options": ["Fluctuating", "Stable", "Gain easily"]},
    {"id": 20, "text": "Your personality feels:", "options": ["Imaginative", "Driven", "Grounded"]},
]

OPTION_TO_DOSHA = {0: "vata", 1: "pitta", 2: "kapha"}


def evaluate_dosha(answers: list[dict]) -> dict:
    scores = {"vata": 0, "pitta": 0, "kapha": 0}
    for ans in answers:
        value = ans.get("value")
        try:
            idx = int(value)
        except ValueError:
            idx = 0
        dosha = OPTION_TO_DOSHA.get(idx, "vata")
        scores[dosha] += 1
    primary = max(scores, key=scores.get)
    return {**scores, "primary_dosha": primary}
