import csv
import os
from datetime import datetime

from backend.database import SessionLocal
from backend.models import Application
from backend.celery_worker import celery


BASE_DIR = os.getcwd()
EXPORT_FOLDER = os.path.join(BASE_DIR, "exports")

os.makedirs(EXPORT_FOLDER, exist_ok=True)


@celery.task(bind=True)
def export_applications(self, student_id):

    db = SessionLocal()

    applications = db.query(Application).filter(
        Application.student_id == student_id
    ).all()

    timestamp = int(datetime.utcnow().timestamp())

    filename = f"applications_student_{student_id}_{timestamp}.csv"

    filepath = os.path.join(EXPORT_FOLDER, filename)

    with open(filepath, "w", newline="", encoding="utf-8") as file:

        writer = csv.writer(file)

        # CSV Header
        writer.writerow([
            "Application ID",
            "Student ID",
            "Company Name",
            "Job Title",
            "Salary Offered",
            "Application Status",
            "Applied Date",
            "Last Updated",
            "Interview Date",
            "Drive Deadline"
        ])

        for app in applications:

            drive = app.drive
            company = drive.company.user

            applied_date = (
                app.applied_at.strftime("%Y-%m-%d %H:%M")
                if app.applied_at else ""
            )

            updated_date = (
                app.updated_at.strftime("%Y-%m-%d %H:%M")
                if app.updated_at else ""
            )

            interview_date = (
                app.interview_date.strftime("%Y-%m-%d %H:%M")
                if app.interview_date else ""
            )

            deadline = (
                drive.application_deadline.strftime("%Y-%m-%d")
                if drive.application_deadline else ""
            )

            writer.writerow([
                app.id,
                student_id,
                company.name,
                drive.job_title,
                drive.salary,
                app.status,
                applied_date,
                updated_date,
                interview_date,
                deadline
            ])

    db.close()

    return {
        "status": "completed",
        "file": filename
    }