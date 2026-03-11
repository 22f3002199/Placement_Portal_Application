from celery import Celery
from celery.schedules import crontab


celery = Celery(
    "placement_portal",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0"
)

celery.conf.update(
    timezone="UTC",
    enable_utc=True
)

# Auto-discover tasks
celery.autodiscover_tasks(["backend.tasks"])


# Celery Beat Schedule
celery.conf.beat_schedule = {

    # Daily reminders at 9 AM
    "daily-reminder-job": {
        "task": "backend.tasks.reminders.send_daily_reminders",
        "schedule": crontab(hour=8, minute=0),
    },

    # Monthly report on the 1st day of every month at 8 AM
    "monthly-report-job": {
        "task": "backend.tasks.reports.generate_monthly_report",
        "schedule": crontab(day_of_month=1, hour=8, minute=0),
    },

}