import os

class Config:

    SECRET_KEY = "super-secret-key"

    DATABASE_URL = "sqlite:///placement_portal.db"

    REDIS_URL = "redis://localhost:6379/0"

    CELERY_BROKER_URL = REDIS_URL
    CELERY_RESULT_BACKEND = REDIS_URL

    GOOGLE_CHAT_WEBHOOK = None