import asyncio
from datetime import datetime, timedelta, timezone

from sqlalchemy import select

from app.core.security import get_password_hash
from app.db.session import async_session_factory, engine
from app.models.ai_recommendation import AIRecommendation
from app.models.audio_program import AudioProgram
from app.models.daily_schedule import DailySchedule
from app.models.dosha_profile import DoshaProfile
from app.models.listening_history import ListeningHistory
from app.models.user import User


async def get_or_create_user(session, email: str, password: str, full_name: str, role: str) -> User:
    result = await session.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if user:
        return user
    user = User(
        email=email,
        hashed_password=get_password_hash(password),
        full_name=full_name,
        role=role,
    )
    session.add(user)
    await session.flush()
    return user


async def seed():
    async with async_session_factory() as session:
        # Users
        admin = await get_or_create_user(
            session, "admin@dhun.ai", "Admin@123", "Admin User", "admin"
        )
        staff1 = await get_or_create_user(
            session, "staff1@dhun.ai", "Staff@123", "Staff One", "staff"
        )
        staff2 = await get_or_create_user(
            session, "staff2@dhun.ai", "Staff@123", "Staff Two", "staff"
        )
        user1 = await get_or_create_user(
            session, "meera@dhun.ai", "User@123", "Meera Sharma", "user"
        )
        user2 = await get_or_create_user(
            session, "arjun@dhun.ai", "User@123", "Arjun Mehta", "user"
        )
        user3 = await get_or_create_user(
            session, "isha@dhun.ai", "User@123", "Isha Rao", "user"
        )

        # Programs (should already exist; we just need their ids)
        programs_result = await session.execute(select(AudioProgram))
        programs = programs_result.scalars().all()
        if not programs:
            await session.commit()
            print("No audio programs found. Start the app once to seed them.")
            return

        program_ids = [p.id for p in programs]
        primary_program_id = program_ids[0]

        # Dosha profiles
        async def upsert_dosha(user: User, vata: int, pitta: int, kapha: int, primary: str):
            result = await session.execute(
                select(DoshaProfile).where(DoshaProfile.user_id == user.id)
            )
            profile = result.scalar_one_or_none()
            if profile:
                profile.vata = vata
                profile.pitta = pitta
                profile.kapha = kapha
                profile.primary_dosha = primary
                return
            session.add(
                DoshaProfile(
                    user_id=user.id,
                    vata=vata,
                    pitta=pitta,
                    kapha=kapha,
                    primary_dosha=primary,
                )
            )

        await upsert_dosha(user1, 60, 25, 15, "Vata")
        await upsert_dosha(user2, 20, 60, 20, "Pitta")
        await upsert_dosha(user3, 25, 20, 55, "Kapha")

        # Listening history (last 7 days)
        now = datetime.now(timezone.utc)
        history_exists = await session.execute(select(ListeningHistory.id).limit(1))
        if not history_exists.scalar_one_or_none():
            for idx, user in enumerate([user1, user2, user3]):
                for day_offset in range(6, -1, -1):
                    listened_at = now - timedelta(days=day_offset, hours=idx)
                    session.add(
                        ListeningHistory(
                            user_id=user.id,
                            program_id=program_ids[(day_offset + idx) % len(program_ids)],
                            program_type="audio_program",
                            listened_at=listened_at,
                            duration=25 + (day_offset % 3) * 5,
                        )
                    )

        # Daily schedule for today
        schedule_date = now.date().isoformat()
        schedule_exists = await session.execute(select(DailySchedule.id).limit(1))
        if not schedule_exists.scalar_one_or_none():
            for user in [user1, user2, user3]:
                for period in ["Morning", "Evening", "Night"]:
                    session.add(
                        DailySchedule(
                            user_id=user.id,
                            schedule_date=schedule_date,
                            period=period,
                            program_id=primary_program_id,
                            program_type="audio_program",
                        )
                    )

        # AI recommendations
        rec_exists = await session.execute(select(AIRecommendation.id).limit(1))
        if not rec_exists.scalar_one_or_none():
            session.add(
                AIRecommendation(
                    user_id=user1.id,
                    input_text="I feel stressed and tired",
                    recommendation="Sanjeevani + Alpha focus, 30 minutes in the evening.",
                )
            )
            session.add(
                AIRecommendation(
                    user_id=user2.id,
                    input_text="Need better focus at work",
                    recommendation="Kayakalp in the morning with Beta state stimulation.",
                )
            )

        await session.commit()
        print("Seeded dummy users, dosha profiles, history, schedules, and recommendations.")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed())
