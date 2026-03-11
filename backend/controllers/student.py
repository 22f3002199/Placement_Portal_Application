from flask import Blueprint, session, request
from datetime import datetime

from backend.database import SessionLocal
from backend.models import Student, PlacementDrive, Application, Company, User
from backend.tasks.exports import export_applications
from backend.cache import cache
from celery.result import AsyncResult
from backend.celery_worker import celery
from flask import send_from_directory


student_bp = Blueprint("student", __name__)


# Auth check
def student_required():

    if "user_id" not in session:
        return None, {"error": "Unauthorized"}, 403

    db = SessionLocal()

    student = db.query(Student).filter(
        Student.user_id == session["user_id"]
    ).first()

    if not student:
        db.close()
        return None, {"error": "Student profile not found"}, 404

    user = db.query(User).filter(
        User.id == session["user_id"]
    ).first()

    if not user.is_active:
        db.close()
        return None, {"error": "Account is blacklisted"}, 403

    student_id = student.id
    db.close()

    return student_id, session["user_id"], None, None


# Get available drives
@student_bp.route("/drives", methods=["GET"])
@cache.cached(timeout=120)
def available_drives():

    student_id, user_id, err, status = student_required()
    if err:
        return err, status

    db = SessionLocal()

    student = db.query(Student).filter(Student.id == student_id).first()

    drives = db.query(PlacementDrive).filter(
        PlacementDrive.status == "approved"
    ).order_by(PlacementDrive.created_at.desc()).all()

    result = []

    for d in drives:

        company = d.company

        # skip drives from blacklisted companies
        if company.approval_status == "blacklisted":
            continue

        # skip closed drives
        if d.status in ["closed", "cancelled"]:
            continue

        eligible = True
        if student.cgpa < d.eligibility_cgpa:
            eligible = False

        result.append({
            "id": d.id,
            "company": d.company.user.name,
            "job_title": d.job_title,
            "salary": d.salary,
            "deadline": d.application_deadline.strftime("%Y-%m-%d"),
            "cgpa_required": d.eligibility_cgpa,
            "eligible": eligible,
            "branch-required": d.eligibility_branch,
            "year-required": d.eligibility_year,
            "benefits": d.benefits,
            "key_responsibilities": d.key_responsibilities
        })

    db.close()

    return {"drives": result}


# Get drive details
@student_bp.route("/drive/<int:drive_id>", methods=["GET"])
def drive_details(drive_id):

    student_id, user_id, err, status = student_required()
    if err:
        return err, status

    db = SessionLocal()

    drive = db.query(PlacementDrive).filter(
        PlacementDrive.id == drive_id
    ).first()

    if drive.status != "approved":
        db.close()
        return {"error": "Drive not available"}, 403
    if not drive:
        db.close()
        return {"error": "Drive not found"}, 404

    result = {

        "id": drive.id,
        "company": drive.company.user.name,
        "job_title": drive.job_title,
        "job_description": drive.job_description,
        "salary": drive.salary,
        "deadline": drive.application_deadline.strftime("%Y-%m-%d"),
        "cgpa": drive.eligibility_cgpa,
        "year": drive.eligibility_year,
        "branch": drive.eligibility_branch,
        "benefits": drive.benefits,
        "key_responsibilities": drive.key_responsibilities,
        "status": drive.status
    }

    db.close()

    return result


# Apply to drive
@student_bp.route("/apply/<int:drive_id>", methods=["POST"])
def apply_drive(drive_id):

    student_id, user_id, err, status = student_required()
    if err:
        return err, status
    
    db = SessionLocal()

    student = db.query(Student).filter(Student.id == student_id).first()

    drive = db.query(PlacementDrive).filter(
        PlacementDrive.id == drive_id
    ).first()

    if not drive:
        db.close()
        return {"error": "Drive not found"}, 404

    # drive closed or cancelled
    if drive.status in ["closed", "cancelled"]:
        db.close()
        return {"error": "Drive is closed"}, 400

    # company blacklisted
    if drive.company.approval_status == "blacklisted":
        db.close()
        return {"error": "Company is blacklisted"}, 400

    # deadline passed
    if datetime.utcnow() > drive.application_deadline:
        db.close()
        return {"error": "Application deadline passed"}, 400

    # eligibility checks
    if student.cgpa < drive.eligibility_cgpa:
        db.close()
        return {"error": "CGPA requirement not met"}, 400

    # already applied
    existing = db.query(Application).filter(
        Application.student_id == student.id,
        Application.drive_id == drive_id
    ).first()

    if existing:
        db.close()
        return {"error": "Already applied"}, 400

    app = Application(
        student_id=student.id,
        drive_id=drive_id,
        status="applied"
    )

    db.add(app)
    db.commit()

    db.close()
    cache.delete("view//api/admin/recent-drives")

    return {"message": "Application submitted"}


# Student Applications
@student_bp.route("/applications", methods=["GET"])
def student_applications():

    student_id, user_id, err, status = student_required()
    if err:
        return err, status
    
    db = SessionLocal()
    student = db.query(Student).filter(Student.id == student_id).first()

    apps = db.query(Application).filter(
        Application.student_id == student.id
    ).order_by(Application.applied_at.desc()).all()

    result = []

    for a in apps:

        result.append({
            "id": a.id,
            "company": a.drive.company.user.name,
            "job_title": a.drive.job_title,
            "status": a.status,
            "salary": a.drive.salary,
            "deadline": a.drive.application_deadline.strftime("%Y-%m-%d") if a.drive.application_deadline else None,
            "applied_at": a.applied_at.strftime("%Y-%m-%d")
        })

    db.close()

    return {"applications": result}


# Application details
@student_bp.route("/application/<int:app_id>", methods=["GET"])
def application_details(app_id):

    student_id, user_id, err, status = student_required()
    if err:
        return err, status
    
    db = SessionLocal()
    student = db.query(Student).filter(Student.id == student_id).first()

    app = db.query(Application).filter(
        Application.id == app_id,
        Application.student_id == student.id
    ).first()

    if not app:
        db.close()
        return {"error": "Application not found"}, 404

    result = {

        "id": app.id,
        "company": app.drive.company.user.name,
        "job_title": app.drive.job_title,
        "status": app.status,
        "deadline": app.drive.application_deadline.strftime("%Y-%m-%d"),
        "description": app.drive.job_description
    }

    db.close()

    return result

# List organizations
@student_bp.route("/companies", methods=["GET"])
def companies():

    student_id, user_id, err, status = student_required()
    if err:
        return err, status
    

    db = SessionLocal()

    companies = db.query(Company).filter(
        Company.approval_status == "approved"
    ).all()

    result = []

    for c in companies:

        result.append({
            "id": c.id,
            "name": c.user.name,
            "website": c.website,
            "headquarters": c.headquarters
        })

    db.close()

    return {"companies": result}

# company details and drives
@student_bp.route("/company/<int:company_id>", methods=["GET"])
def company_details(company_id):

    student_id, user_id, err, status = student_required()
    if err:
        return err, status
    
    db = SessionLocal()

    student = db.query(Student).filter(Student.id == student_id).first()


    company = db.query(Company).filter(
        Company.id == company_id
    ).first()

    if company.approval_status != "approved":
        db.close()
        return {"error": "Company not available"}, 403

    if not company:
        db.close()
        return {"error":"Company not found"},404

    drives = db.query(PlacementDrive).filter(
        PlacementDrive.company_id == company_id,
        PlacementDrive.status == "approved"
    ).all()

    drive_list = []

    for d in drives:

        eligible = True

        if student.cgpa < d.eligibility_cgpa:
            eligible = False

        drive_list.append({

            "id": d.id,
            "job_title": d.job_title,
            "salary": d.salary,
            "deadline": d.application_deadline.strftime("%Y-%m-%d"),
            "eligible": eligible

        })

    result = {

        "company": company.user.name,
        "website": company.website,
        "headquarters": company.headquarters,
        "description": company.description,
        "drives": drive_list

    }

    db.close()

    return result

# get profile
@student_bp.route("/profile", methods=["GET"])
def get_profile():

    student_id, user_id, err, status = student_required()
    if err:
        return err, status

    db = SessionLocal()

    student = db.query(Student).filter(
        Student.id == student_id
    ).first()
    

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    result = {

        "name": user.name,
        "email": user.email,
        "avatar": user.avatar,

        "branch": student.branch,
        "cgpa": round(student.cgpa, 2) if student.cgpa else None,
        "graduation_year": student.graduation_year,

        "resume": student.resume,
        "website_url": student.website_url,
        "keywords": student.keywords,

        "certificates_academic": student.certificates_academic,
        "certificates_extracurricular": student.certificates_extracurricular,
        "reference_letters": student.reference_letters,
        "academic_transcript": student.academic_transcript

    }

    db.close()

    return result


# update profile
@student_bp.route("/profile", methods=["PUT"])
def update_profile():

    student_id, user_id, err, status = student_required()
    if err:
        return err, status

    data = request.json

    db = SessionLocal()

    student = db.query(Student).filter(
        Student.id == student_id
    ).first()

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    # user fields
    user.name = data.get("name", user.name)
    user.avatar = data.get("avatar", user.avatar)

    # student fields
    student.branch = data.get("branch", student.branch)
    student.cgpa = data.get("cgpa", student.cgpa)
    student.graduation_year = data.get("graduation_year", student.graduation_year)

    student.resume = data.get("resume", student.resume)
    student.website_url = data.get("website_url", student.website_url)
    student.keywords = data.get("keywords", student.keywords)

    student.certificates_academic = data.get(
        "certificates_academic",
        student.certificates_academic
    )

    student.certificates_extracurricular = data.get(
        "certificates_extracurricular",
        student.certificates_extracurricular
    )

    student.reference_letters = data.get(
        "reference_letters",
        student.reference_letters
    )

    student.academic_transcript = data.get(
        "academic_transcript",
        student.academic_transcript
    )

    db.commit()
    db.close()

    return {"message": "Profile updated"}

# Trigger export
@student_bp.route("/export", methods=["POST"])
def export_history():

    student_id, user_id, err, status = student_required()

    if err:
        return err, status

    task = export_applications.delay(student_id)

    return {
        "message": "Export started",
        "task_id": task.id
    }


@student_bp.route("/download/<filename>")
def download_csv(filename):

    return send_from_directory("exports", filename, as_attachment=True)


# for sending alert when export done
@student_bp.route("/export-status/<task_id>")
def export_status(task_id):

    task = AsyncResult(task_id, app=celery)

    if task.state == "PENDING":
        return {"status": "pending"}

    if task.state == "SUCCESS":
        return {
            "status": "completed",
            "file": task.result["file"]
        }

    return {"status": task.state}