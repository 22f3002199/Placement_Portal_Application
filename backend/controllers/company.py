from flask import Blueprint, request, session
from backend.database import SessionLocal
from backend.models import Company, PlacementDrive, Application
from datetime import datetime
from backend.cache import cache

company_bp = Blueprint("company", __name__)


def company_required():

    if "user_id" not in session:
        return None, {"error":"Unauthorized"},403

    db = SessionLocal()

    company = db.query(Company).filter(
        Company.user_id == session["user_id"]
    ).first()

    if not company:
        db.close()
        return None, {"error":"Company profile not found"},403

    if company.approval_status == "blacklisted":
        db.close()
        return None, {"error":"Account blacklisted"},403

    if company.approval_status != "approved":
        db.close()
        return None,{
            "error":"Company not approved",
            "status":company.approval_status
        },403

    db.close()

    return company,None,None

# Company Status
@company_bp.route("/status", methods=["GET"])
def company_status():

    if "user_id" not in session:
        return {"error": "Unauthorized"}, 403

    db = SessionLocal()

    company = db.query(Company).filter(
        Company.user_id == session["user_id"]
    ).first()

    if not company:
        db.close()
        return {"error": "Company not found"}, 404

    status = company.approval_status

    db.close()

    return {"status": status}


# Get company drives
@company_bp.route("/drives", methods=["GET"])
def company_drives():

    company,err,status = company_required()
    if err:
        return err,status

    db = SessionLocal()

    company = db.query(Company).filter(
        Company.user_id == session["user_id"]
    ).first()

    drives = db.query(PlacementDrive).filter(
        PlacementDrive.company_id == company.id
    ).order_by(PlacementDrive.created_at.desc()).all()

    result = []

    for d in drives:

        result.append({
            "id":d.id,
            "job_title":d.job_title,
            "salary":d.salary,
            "status":d.status,
            "deadline":d.application_deadline.strftime("%Y-%m-%d"),
            "applications": len(d.applications),
            "benefits": d.benefits,
            "key_responsibilities": d.key_responsibilities
        })

    db.close()

    return {"drives":result}

# Create new drive
@company_bp.route("/create-drive", methods=["POST"])
def create_drive():

    company, err, status = company_required()

    if err:
        return err, status

    data = request.json

    db = SessionLocal()

    deadline = datetime.strptime(
        data["application_deadline"],
        "%Y-%m-%d"
    )

    drive = PlacementDrive(

        company_id=company.id,

        job_title=data["job_title"],
        job_description=data["job_description"],

        eligibility_cgpa=float(data["eligibility_cgpa"]),
        eligibility_year=int(data["eligibility_year"]),
        eligibility_branch=data["eligibility_branch"],

        application_deadline=deadline,

        salary=int(data["salary"]),

        benefits=data.get("benefits"),
        key_responsibilities=data.get("key_responsibilities"),

        status="approved",
        created_at=datetime.utcnow()
    )

    db.add(drive)
    db.commit()
    cache.delete("view//api/student/drives")
    cache.delete("view//api/admin/recent-drives")
    db.close()

    return {"message": "Drive created successfully"}

# Close drive
@company_bp.route("/close-drive/<int:drive_id>", methods=["POST"])
def close_drive(drive_id):

    company,err,status = company_required()

    if err:
        return err,status

    db = SessionLocal()

    drive = db.query(PlacementDrive).filter(
        PlacementDrive.id == drive_id,
        PlacementDrive.company_id == company.id
    ).first()

    if not drive:
        db.close()
        return {"error": "Drive not found"}, 404
    
    drive.status = "closed"
    drive.closed_at = datetime.utcnow()

    apps = db.query(Application).filter(
        Application.drive_id == drive_id
    ).all()

    for a in apps:

        if a.status in ["applied", "pending", None]:
            a.status = "rejected"

    db.commit()
    db.close()

    return {"message":"Drive closed"}

# Get applications for a drive
@company_bp.route("/drive-applications/<int:drive_id>", methods=["GET"])
def drive_applications(drive_id):

    company, err, status = company_required()
    if err:
        return err, status

    db = SessionLocal()

    drive = db.query(PlacementDrive).filter(
        PlacementDrive.id == drive_id,
        PlacementDrive.company_id == company.id
    ).first()

    if not drive:
        db.close()
        return {"error": "Drive not found"}, 404

    apps = db.query(Application).filter(
        Application.drive_id == drive_id
    ).all()

    result = []

    for a in apps:

        student = a.student
        user = student.user

        result.append({

            "id": a.id,

            "student": user.name,
            "email": user.email,

            "status": a.status,

            "branch": student.branch,
            "cgpa": student.cgpa,
            "graduation_year": student.graduation_year,

            "resume": student.resume,
            "website_url": student.website_url,

            "keywords": student.keywords,

            "certificates_academic": student.certificates_academic,
            "certificates_extracurricular": student.certificates_extracurricular,

            "reference_letters": student.reference_letters,
            "academic_transcript": student.academic_transcript,

            "applied_at": a.applied_at.strftime("%Y-%m-%d")

        })

    db.close()

    return {"applications": result}

# Update application status
@company_bp.route("/update-application/<int:app_id>", methods=["POST"])
def update_application(app_id):

    company, err, status = company_required()

    if err:
        return err, status

    data = request.json

    db = SessionLocal()

    app = db.query(Application).filter(
        Application.id == app_id
    ).first()

    if not app:
        db.close()
        return {"error": "Application not found"}, 404

    drive = db.query(PlacementDrive).filter(
        PlacementDrive.id == app.drive_id,
        PlacementDrive.company_id == company.id
    ).first()

    if not drive:
        db.close()
        return {"error":"Unauthorized"},403

    # block updates if drive closed
    if drive.status == "closed":
        db.close()
        return {"error": "Drive is closed. Applications cannot be updated."}, 400

    app.status = data["status"]

    db.commit()
    db.close()

    return {"message": "Application updated"}

