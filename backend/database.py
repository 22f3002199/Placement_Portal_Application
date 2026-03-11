import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from werkzeug.security import generate_password_hash
from backend.config import Config

Base = declarative_base()

# SQLite engine
engine = create_engine(
    Config.DATABASE_URL,
    connect_args={"check_same_thread": False}
)

# Session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


def get_db():
    """
    Provides a database session.
    Used inside APIs.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Creates tables and default admin.
    """
    from backend.models import User
    from datetime import datetime

    # create tables
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    # check if admin exists
    admin = db.query(User).filter(User.role == "admin").first()

    if not admin:

        admin_user = User(
            name="Admin",
            email="admin@portal.com",
            password=generate_password_hash("admin123"),
            role="admin",
            created_at=datetime.utcnow()
        )

        db.add(admin_user)
        db.commit()

    db.close()