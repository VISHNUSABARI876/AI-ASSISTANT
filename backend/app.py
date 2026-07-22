"""
AI Assistant — Flask Backend Entry Point
"""
import logging
import os
from flask import Flask, jsonify, request
from dotenv import load_dotenv
from flask_cors import CORS


load_dotenv()

from config import Config
from database import init_db
from routes.auth_routes import auth_bp
from routes.chat_routes import chat_bp
from routes.file_routes import file_bp
from routes.ai_routes import ai_bp
from routes.persona_routes import persona_bp
from routes.apikey_routes import apikey_bp
from routes.share_routes import share_bp
from routes.cache_routes import cache_bp

# ─── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


def create_app() -> Flask:
    app = Flask(__name__)
    app.config.from_object(Config)
    Config.init_app(app)

    # ─── CORS ─────────────────────────────────────────────────────────────────
    CORS(app, resources={
        r"/api/*": {
            "origins": [
                "http://localhost:3000",
                "http://127.0.0.1:3000",
                "http://localhost:3001",
                "http://127.0.0.1:3001",
                "http://localhost:5173",
                "http://127.0.0.1:5173"
            ],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
            "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"],
            "expose_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True,
            "max_age": 3600
        }
    })

    # ─── Database ─────────────────────────────────────────────────────────────
    init_db(app)

    # ─── Blueprints ───────────────────────────────────────────────────────────
    app.register_blueprint(auth_bp)
    app.register_blueprint(chat_bp)
    app.register_blueprint(file_bp)
    app.register_blueprint(ai_bp)
    app.register_blueprint(persona_bp)
    app.register_blueprint(apikey_bp)
    app.register_blueprint(share_bp)
    app.register_blueprint(cache_bp)


    # ─── Health Check ─────────────────────────────────────────────────────────
    @app.get("/")
    def index():
        return jsonify({
            "message": "AI Assistant Backend is running.",
            "api_health": "http://localhost:5000/api/health",
            "frontend_url": "http://localhost:3000 (or http://localhost:3001)"
        }), 200

    @app.get("/api/health")
    def health():
        return jsonify({"status": "running", "version": "1.0.0"}), 200

    # ─── Error Handlers ───────────────────────────────────────────────────────
    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({"error": "Bad request.", "details": str(e)}), 400

    @app.errorhandler(401)
    def unauthorized(e):
        return jsonify({"error": "Unauthorized. Please log in."}), 401

    @app.errorhandler(403)
    def forbidden(e):
        return jsonify({"error": "Forbidden. You do not have access to this resource."}), 403

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Resource not found."}), 404

    @app.errorhandler(413)
    def too_large(e):
        return jsonify({"error": "File too large. Maximum size is 16 MB."}), 413

    @app.errorhandler(500)
    def internal_error(e):
        logger.error(f"Internal server error: {e}")
        return jsonify({"error": "An internal server error occurred."}), 500

    logger.info("AI Assistant backend initialized successfully.")
    return app


app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "True").lower() == "true"
    logger.info(f"Starting server on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=debug)
