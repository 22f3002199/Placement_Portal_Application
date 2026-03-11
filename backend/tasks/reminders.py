from datetime import datetime, timedelta
import requests
from backend.config import Config
from backend.database import SessionLocal
from backend.models import PlacementDrive
from backend.celery_worker import celery


# Google Chat webhook (replace later)
GOOGLE_CHAT_WEBHOOK = Config.GOOGLE_CHAT_WEBHOOK


@celery.task
def send_daily_reminders():

    db = SessionLocal()

    now = datetime.utcnow()
    tomorrow = now + timedelta(days=1)

    drives = db.query(PlacementDrive).filter(
        PlacementDrive.application_deadline != None,
        PlacementDrive.application_deadline <= tomorrow,
        PlacementDrive.application_deadline >= now,
        PlacementDrive.status == "approved"
    ).all()

    for drive in drives:

        message_text = f"""
Placement Reminder

Company: {drive.company.user.name}
Role: {drive.job_title}

Deadline: {drive.application_deadline}
"""

        # If webhook configured
        if GOOGLE_CHAT_WEBHOOK:

            payload = {"text": message_text}

            try:
                requests.post(GOOGLE_CHAT_WEBHOOK, json=payload)
            except Exception as e:
                print("Webhook failed:", e)

        # Always log to console for debugging
        print(message_text)

    db.close()