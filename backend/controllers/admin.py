from flask import Blueprint, jsonify, request, session
from backend.database import SessionLocal
from backend.models import User, Company, PlacementDrive, Application
from backend.cache import cache

admin_bp = Blueprint("admin", __name__)


def admin_required():

    if "user_id" not in session:
        return False

    if session.get("role") != "admin":
        return False

    return True


@admin_bp.route("/summary", methods=["GET"])
def admin_summary():

    if not admin_required():
        return jsonify({"error": "Unauthorized"}), 403

    db = SessionLocal()

    total_students = db.query(User).filter(User.role == "student").count()

    total_companies = db.query(User).filter(User.role == "company").count()

    pending_companies = db.query(Company).filter(
        Company.approval_status == "pending"
    ).count()

    total_drives = db.query(PlacementDrive).count()

    db.close()

    return jsonify({

        "total_students": total_students,
        "total_companies": total_companies,
        "pending_companies": pending_companies,
        "total_drives": total_drives

    })


# Get Pending Companies
@admin_bp.route("/pending-companies", methods=["GET"])
def get_pending_companies():

    if not admin_required():
        return {"error": "Unauthorized"}, 403

    db = SessionLocal()

    companies = db.query(Company).filter(
        Company.approval_status == "pending"
    ).all()

    result = []

    for c in companies:

        result.append({

            "id": c.id,
            "company_name": c.user.name,
            "email": c.user.email,
            "website": c.website,
            "headquarters": c.headquarters,
            "employees": c.number_of_employees

        })

    db.close()

    return {"companies": result}


# Approve Company
@admin_bp.route("/approve-company/<int:company_id>", methods=["POST"])
def approve_company(company_id):

    if not admin_required():
        return {"error": "Unauthorized"}, 403

    db = SessionLocal()

    company = db.query(Company).filter(Company.id == company_id).first()

    if not company:
        db.close()
        return {"error": "Company not found"}, 404

    company.approval_status = "approved"

    drives = db.query(PlacementDrive).filter(
        PlacementDrive.company_id == company_id
    ).all()

    for d in drives:
        d.status = "approved"

    db.commit()

    db.close()

    return {"message": "Company approved"}



# Reject Company
@admin_bp.route("/reject-company/<int:company_id>", methods=["POST"])
def reject_company(company_id):

    if not admin_required():
        return {"error": "Unauthorized"}, 403

    db = SessionLocal()

    company = db.query(Company).filter(Company.id == company_id).first()

    if not company:
        db.close()
        return {"error": "Company not found"}, 404

    company.approval_status = "rejected"

    db.commit()

    db.close()

    return {"message": "Company rejected"}


# Get All Companies
@admin_bp.route("/companies", methods=["GET"])
def get_companies():

    if not admin_required():
        return {"error": "Unauthorized"}, 403

    db = SessionLocal()

    companies = db.query(Company).filter(
        Company.approval_status != "rejected"
    ).all()

    result = []

    for c in companies:

        result.append({

            "id": c.id,
            "company_name": c.user.name,
            "email": c.user.email,
            "website": c.website,
            "headquarters": c.headquarters,
            "employees": c.number_of_employees,
            "status": c.approval_status,
            "description": c.description,
            "hr_contact": c.hr_contact

        })

    db.close()

    return {"companies": result}


# Blacklist Company
@admin_bp.route("/blacklist-company/<int:company_id>", methods=["POST"])
def blacklist_company(company_id):

    if not admin_required():
        return {"error": "Unauthorized"}, 403

    db = SessionLocal()

    company = db.query(Company).filter(Company.id == company_id).first()

    if not company:
        db.close()
        return {"error": "Company not found"}, 404
    
    if company.approval_status == "rejected":
        return {"error":"Rejected companies cannot be modified"},400

    company.approval_status = "blacklisted"

    drives = db.query(PlacementDrive).filter(
        PlacementDrive.company_id == company_id
    ).all()

    for d in drives:
        d.status = "cancelled"

    db.commit()
    db.close()

    return {"message": "Company blacklisted"}


# Reactivate Company
@admin_bp.route("/reactivate-company/<int:company_id>", methods=["POST"])
def reactivate_company(company_id):

    if not admin_required():
        return {"error": "Unauthorized"}, 403

    db = SessionLocal()

    company = db.query(Company).filter(Company.id == company_id).first()

    if not company:
        db.close()
        return {"error": "Company not found"}, 404

    company.approval_status = "approved"

    db.commit()
    db.close()

    return {"message": "Company reactivated"}


# Get Drives of a Company
@admin_bp.route("/company-drives/<int:company_id>", methods=["GET"])
def get_company_drives(company_id):

    if not admin_required():
        return {"error": "Unauthorized"}, 403

    db = SessionLocal()

    drives = db.query(PlacementDrive).filter(
        PlacementDrive.company_id == company_id
        ).order_by(PlacementDrive.created_at.desc()).all()

    result = []

    for d in drives:
        result.append({
            "id": d.id,
            "job_title": d.job_title,
            "salary": d.salary,
            "status": d.status,
            "deadline": str(d.application_deadline),

            "company": d.company.user.name,

            "job_description": d.job_description,
            "benefits": d.benefits,
            "key_responsibilities": d.key_responsibilities,

            "eligibility_cgpa": d.eligibility_cgpa,
            "eligibility_branch": d.eligibility_branch
        })

    db.close()

    return {"drives": result}


# Recent Drives
@cache.cached(timeout=120)
@admin_bp.route("/recent-drives", methods=["GET"])
def recent_drives():

    if not admin_required():
        return {"error": "Unauthorized"}, 403

    db = SessionLocal()

    drives = db.query(PlacementDrive).order_by(
        PlacementDrive.created_at.desc()
    ).all()

    result = []

    for d in drives:

        result.append({
            "id": d.id,
            "job_title": d.job_title,
            "salary": d.salary,
            "status": d.status,
            "deadline": str(d.application_deadline),

            "company": d.company.user.name,

            "job_description": d.job_description,
            "benefits": d.benefits,
            "key_responsibilities": d.key_responsibilities,

            "eligibility_cgpa": d.eligibility_cgpa,
            "eligibility_branch": d.eligibility_branch
        })

    db.close()

    return {"drives": result}


# Applications for drive
@admin_bp.route("/drive-applications/<int:drive_id>", methods=["GET"])
def drive_applications(drive_id):

    if not admin_required():
        return {"error":"Unauthorized"},403

    db = SessionLocal()

    apps = db.query(Application).filter(
        Application.drive_id == drive_id
    ).all()

    result = []

    for a in apps:

        result.append({
            "id": a.id,
            "student_name": a.student.user.name,
            "email": a.student.user.email,
            "status": a.status,

            # useful relations
            "job_title": a.drive.job_title,
            "company": a.drive.company.user.name,

            # optional extras
            "resume": a.student.resume if a.student.resume else None,
            "cgpa": a.student.cgpa,
            "branch": a.student.branch
            })

    db.close()

    return {"applications": result}

# Preload recent applications
@cache.cached(timeout=120)
@admin_bp.route("/recent-applications", methods=["GET"])
def recent_applications():

    if not admin_required():
        return {"error":"Unauthorized"},403

    db = SessionLocal()

    apps = db.query(Application).order_by(
        Application.applied_at.desc()
    ).all()

    result = []

    for a in apps:

        result.append({
            "id": a.id,
            "student_name": a.student.user.name,
            "email": a.student.user.email,
            "status": a.status,
            "job_title": a.drive.job_title,
            "company": a.drive.company.user.name
        })

    db.close()

    return {"applications": result}

# Search Users
@admin_bp.route("/search-users", methods=["GET"])
def search_users():

    if not admin_required():
        return {"error":"Unauthorized"},403

    query = request.args.get("q","").lower()

    db = SessionLocal()

    users = db.query(User).filter(
        User.name.ilike(f"%{query}%")
    ).all()

    result = []

    for u in users:

        result.append({
            "id":u.id,
            "name":u.name,
            "email":u.email,
            "role":u.role,
            "active":u.is_active
        })

    db.close()

    return {"users":result}

# Blacklist User
@admin_bp.route("/blacklist-user/<int:user_id>", methods=["POST"])
def blacklist_user(user_id):

    if not admin_required():
        return {"error":"Unauthorized"},403

    db = SessionLocal()

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        db.close()
        return {"error":"User not found"},404

    user.is_active = False

    if user.role == "company":

        company = db.query(Company).filter(
            Company.user_id == user.id
        ).first()

        if company:

            company.approval_status = "blacklisted"

            drives = db.query(PlacementDrive).filter(
                PlacementDrive.company_id == company.id
            ).all()

            for d in drives:
                d.status = "cancelled"

    db.commit()
    db.close()

    return {"message":"User blacklisted"}

# Reactivate User
@admin_bp.route("/reactivate-user/<int:user_id>", methods=["POST"])
def reactivate_user(user_id):

    if not admin_required():
        return {"error":"Unauthorized"},403

    db = SessionLocal()

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        db.close()
        return {"error":"User not found"},404

    user.is_active = True

    if user.role == "company":

        company = db.query(Company).filter(
            Company.user_id == user.id
        ).first()

        if company:
            company.approval_status = "approved"

    db.commit()
    db.close()

    return {"message":"User reactivated"}

# rejected companies
@admin_bp.route("/rejected-companies", methods=["GET"])
def rejected_companies():

    if not admin_required():
        return {"error":"Unauthorized"},403

    db = SessionLocal()

    companies = db.query(Company).filter(
        Company.approval_status == "rejected"
    ).all()

    result = []

    for c in companies:

        result.append({
            "id":c.id,
            "name":c.user.name,
            "email":c.user.email,
            "website":c.website,
            "headquarters":c.headquarters,
            "employees":c.number_of_employees
        })

    db.close()

    return {"companies":result}

# charts
@admin_bp.route("/analytics", methods=["GET"])
def admin_analytics():

    if not admin_required():
        return {"error": "Unauthorized"}, 403

    db = SessionLocal()

    # user distribution

    student_active = db.query(User).filter(
        User.role == "student",
        User.is_active == True
    ).count()

    student_blocked = db.query(User).filter(
        User.role == "student",
        User.is_active == False
    ).count()

    company_active = db.query(Company).filter(
        Company.approval_status == "approved"
    ).count()

    company_blocked = db.query(Company).filter(
        Company.approval_status == "blacklisted"
    ).count()

    company_pending = db.query(Company).filter(
        Company.approval_status == "pending"
    ).count()

    company_rejected = db.query(Company).filter(
        Company.approval_status == "rejected"
    ).count()

    users = {
        "students": {
            "active": student_active,
            "blocked": student_blocked
        },
        "companies": {
            "active": company_active,
            "blocked": company_blocked,
            "pending": company_pending,
            "rejected": company_rejected
        }
    }

    # drive activity

    active_drives = db.query(PlacementDrive).filter(
        PlacementDrive.status.in_(["pending", "approved"])
    ).all()

    inactive_drives = db.query(PlacementDrive).filter(
        PlacementDrive.status.in_(["closed", "cancelled"])
    ).all()

    active_drive_count = len(active_drives)
    inactive_drive_count = len(inactive_drives)

    active_applications = 0
    inactive_applications = 0

    for d in active_drives:
        active_applications += len(d.applications)

    for d in inactive_drives:
        inactive_applications += len(d.applications)

    drives = {
        "active": active_drive_count,
        "inactive": inactive_drive_count,
        "active_applications": active_applications,
        "inactive_applications": inactive_applications
    }

    # top hiring companies

    selected_apps = db.query(Application).filter(
        Application.status == "selected"
    ).all()

    hires = {}

    for a in selected_apps:

        company_name = a.drive.company.user.name

        if company_name not in hires:
            hires[company_name] = 0

        hires[company_name] += 1

    leaderboard = []

    for company, count in hires.items():

        leaderboard.append({
            "company": company,
            "hires": count
        })

    leaderboard.sort(key=lambda x: x["hires"], reverse=True)

    leaderboard = leaderboard[:7]

    db.close()

    return {
        "users": users,
        "drives": drives,
        "leaderboard": leaderboard
    }