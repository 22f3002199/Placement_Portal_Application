from flask import Blueprint, request, jsonify, session
from sqlalchemy.orm import Session
from backend.database import SessionLocal
from backend.models import User, Student, Company
from werkzeug.security import generate_password_hash, check_password_hash
import re
from datetime import datetime


auth_bp = Blueprint("auth", __name__)


# Email validation

def valid_email(email):
    pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    return re.match(pattern, email)


# Login

@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    db: Session = SessionLocal()

    user = db.query(User).filter(User.email == email).first()

    if not user:
        db.close()
        return jsonify({"error": "Invalid credentials"}), 401

    if not check_password_hash(user.password, password):
        db.close()
        return jsonify({"error": "Invalid credentials"}), 401

    if not user.is_active:
        db.close()
        return jsonify({"error": "Account is deactivated"}), 403

    # store login session
    session["user_id"] = user.id
    session["role"] = user.role

    response = {
        "user_id": user.id,
        "role": user.role,
        "name": user.name
    }

    db.close()

    return jsonify(response), 200


# Student Registration

@auth_bp.route("/register/student", methods=["POST"])
def register_student():

    data = request.get_json()

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    branch = data.get("branch")
    cgpa = data.get("cgpa")
    graduation_year = data.get("graduation_year")
    resume = data.get("resume")

    if not name or not email or not password:
        return jsonify({"error": "Missing required fields"}), 400

    if not valid_email(email):
        return jsonify({"error": "Invalid email format"}), 400

    if cgpa and (cgpa < 0 or cgpa > 10):
        return jsonify({"error":"Invalid CGPA"}),400
    
    if graduation_year and (graduation_year < 2000 or graduation_year > 2100):
        return jsonify({"error":"Invalid graduation year"}),400

    db: Session = SessionLocal()

    existing_user = db.query(User).filter(User.email == email).first()

    if existing_user:
        db.close()
        return jsonify({"error": "Email already registered"}), 400

    hashed_password = generate_password_hash(password)

    user = User(
        name=name,
        email=email,
        password=hashed_password,
        role="student",
        created_at=datetime.utcnow()
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    student = Student(
        user_id=user.id,
        branch=branch,
        cgpa=cgpa,
        graduation_year=graduation_year,
        resume=resume
    )

    db.add(student)
    db.commit()

    db.close()

    return jsonify({"message": "Student registered successfully"}), 201


# Company Registration

@auth_bp.route("/register/company", methods=["POST"])
def register_company():

    data = request.get_json()

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    hr_contact = data.get("hr_contact")
    website = data.get("website")

    description = data.get("description")
    headquarters = data.get("headquarters")
    number_of_employees = data.get("number_of_employees")

    if not name or not email or not password:
        return jsonify({"error": "Missing required fields"}), 400

    if not valid_email(email):
        return jsonify({"error": "Invalid email"}), 400

    db: Session = SessionLocal()

    existing_user = db.query(User).filter(User.email == email).first()

    if existing_user:
        db.close()
        return jsonify({"error": "Email already registered"}), 400

    hashed_password = generate_password_hash(password)

    user = User(
        name=name,
        email=email,
        password=hashed_password,
        role="company",
        created_at=datetime.utcnow()
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    company = Company(
        user_id=user.id,
        hr_contact=hr_contact,
        website=website,
        description=description,
        headquarters=headquarters,
        number_of_employees=number_of_employees
    )

    db.add(company)
    db.commit()

    db.close()

    return jsonify({
        "message": "Company registered. Awaiting admin approval."
    }), 201


@auth_bp.route("/logout", methods=["POST"])
def logout():

    session.clear()

    return {"message":"Logged out"}