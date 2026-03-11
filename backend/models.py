from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, Text, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.database import Base

# User Model

class User(Base):

    __tablename__ = "users"

    id = Column(Integer, primary_key=True)

    avatar = Column(String)

    name = Column(String, nullable=False)

    email = Column(String, unique=True, nullable=False)

    password = Column(String, nullable=False)

    role = Column(String, nullable=False)
    # admin / student / company

    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    # relationships
    student_profile = relationship(
        "Student",
        back_populates="user",
        uselist=False,
        cascade="all, delete"
    )

    company_profile = relationship(
        "Company",
        back_populates="user",
        uselist=False,
        cascade="all, delete"
    )


# Student Profile

class Student(Base):

    __tablename__ = "students"

    id = Column(Integer, primary_key=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    branch = Column(String)

    cgpa = Column(Float)

    graduation_year = Column(Integer)

    resume = Column(String)

    website_url = Column(String)

    keywords = Column(Text)

    certificates_academic = Column(Text)

    certificates_extracurricular = Column(Text)

    reference_letters = Column(Text)

    academic_transcript = Column(String)

    created_at = Column(DateTime, default=datetime.utcnow)

    # relationships
    user = relationship("User", back_populates="student_profile")

    applications = relationship(
        "Application",
        back_populates="student",
        cascade="all, delete"
    )


# Company Profile

class Company(Base):

    __tablename__ = "companies"

    id = Column(Integer, primary_key=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    hr_contact = Column(String)

    website = Column(String)

    approval_status = Column(String, default="pending")
    # pending / approved / rejected / blacklisted

    description = Column(Text)

    headquarters = Column(String)

    number_of_employees = Column(Integer)

    created_at = Column(DateTime, default=datetime.utcnow)

    approved_at = Column(DateTime)

    # relationships
    user = relationship("User", back_populates="company_profile")

    drives = relationship(
        "PlacementDrive",
        back_populates="company",
        cascade="all, delete"
    )


# Placement Drive

class PlacementDrive(Base):

    __tablename__ = "placement_drives"

    id = Column(Integer, primary_key=True)

    company_id = Column(Integer, ForeignKey("companies.id"))

    job_title = Column(String)

    job_description = Column(Text)

    eligibility_cgpa = Column(Float)

    eligibility_year = Column(Integer)

    eligibility_branch = Column(String)

    application_deadline = Column(DateTime)

    salary = Column(Integer)

    status = Column(String, default="pending")
    # pending / approved / closed

    benefits = Column(Text)

    key_responsibilities = Column(Text)

    created_at = Column(DateTime, default=datetime.utcnow)

    closed_at = Column(DateTime)

    # relationships
    company = relationship("Company", back_populates="drives")

    applications = relationship(
        "Application",
        back_populates="drive",
        cascade="all, delete"
    )


# Application Model

class Application(Base):

    __tablename__ = "applications"

    id = Column(Integer, primary_key=True)

    student_id = Column(Integer, ForeignKey("students.id"))

    drive_id = Column(Integer, ForeignKey("placement_drives.id"))

    status = Column(String, default="applied")
    # applied / shortlisted / interview / selected / rejected

    interview_date = Column(DateTime)

    notes = Column(Text)

    applied_at = Column(DateTime, default=datetime.utcnow)

    updated_at = Column(DateTime, default=datetime.utcnow)

    # prevent duplicate applications
    __table_args__ = (
        UniqueConstraint("student_id", "drive_id", name="unique_application"),
    )

    # relationships
    student = relationship("Student", back_populates="applications")

    drive = relationship("PlacementDrive", back_populates="applications")

  