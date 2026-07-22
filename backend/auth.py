import jwt
import bcrypt
from datetime import datetime, timedelta, timezone
from functools import wraps
from flask import request, jsonify, current_app
from database import db
from models import User


def hash_password(password: str) -> str:
    """Hash a plaintext password using bcrypt."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def check_password(password: str, hashed: str) -> bool:
    """Verify a plaintext password against a bcrypt hash."""
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))


def generate_token(user_id: int, secret_key: str, expiry_hours: int = 24) -> str:
    """Generate a JWT token for a given user ID."""
    payload = {
        "sub": user_id,
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(hours=expiry_hours),
    }
    return jwt.encode(payload, secret_key, algorithm="HS256")


def decode_token(token: str, secret_key: str) -> dict:
    """Decode and validate a JWT token. Raises on failure."""
    return jwt.decode(token, secret_key, algorithms=["HS256"])


def token_required(f):
    """Decorator to protect routes — requires a valid Bearer JWT."""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Authorization header missing or malformed"}), 401
        token = auth_header.split(" ", 1)[1]
        try:
            payload = decode_token(token, current_app.config["SECRET_KEY"])
            user_id = payload.get("sub")
            current_user = db.session.get(User, user_id)
            if current_user is None:
                return jsonify({"error": "User not found"}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired"}), 401
        except jwt.InvalidTokenError as e:
            return jsonify({"error": f"Invalid token: {str(e)}"}), 401
        return f(current_user, *args, **kwargs)
    return decorated
