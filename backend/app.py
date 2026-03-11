from flask import Flask
from backend.config import Config
from backend.database import init_db
from backend.cache import cache

from backend.controllers.auth import auth_bp
from backend.controllers.admin import admin_bp
from backend.controllers.company import company_bp
from backend.controllers.student import student_bp


def create_app():

    app = Flask(__name__)
    cache.init_app(app)
    app.config.from_object(Config)

    # required for sessions
    app.secret_key = Config.SECRET_KEY

    init_db()

    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(company_bp, url_prefix="/api/company")
    app.register_blueprint(student_bp, url_prefix="/api/student")

    @app.route("/")
    def home():
        return {"status": "Placement Portal API running"}

    @app.route("/api/<path:path>", methods=["OPTIONS"])
    def options_handler(path):
        return "", 200
    
    # allow frontend requests
    @app.after_request
    def add_cors_headers(response):

        response.headers["Access-Control-Allow-Origin"] = "http://127.0.0.1:3000"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type"
        response.headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,OPTIONS"

        return response

    return app