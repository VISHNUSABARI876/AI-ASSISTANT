import os
import re
from flask import Blueprint, request, jsonify, current_app
from database import db
from models import User
from auth import hash_password, check_password, generate_token, token_required

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


def is_valid_email(email: str) -> bool:
    pattern = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
    return bool(re.match(pattern, email))


@auth_bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    # Validation
    errors = {}
    if not username or len(username) < 3:
        errors["username"] = "Username must be at least 3 characters."
    if not email or not is_valid_email(email):
        errors["email"] = "A valid email is required."
    if not password or len(password) < 6:
        errors["password"] = "Password must be at least 6 characters."
    if errors:
        return jsonify({"errors": errors}), 422

    if User.query.filter_by(username=username).first():
        return jsonify({"errors": {"username": "Username already taken."}}), 409
    if User.query.filter_by(email=email).first():
        return jsonify({"errors": {"email": "Email already registered."}}), 409

    user = User(
        username=username,
        email=email,
        password_hash=hash_password(password),
    )
    db.session.add(user)
    db.session.commit()

    token = generate_token(user.id, current_app.config["SECRET_KEY"], current_app.config["JWT_EXPIRY_HOURS"])
    return jsonify({"message": "Registration successful.", "token": token, "user": user.to_dict()}), 201


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not check_password(password, user.password_hash):
        return jsonify({"error": "Invalid email or password."}), 401

    token = generate_token(user.id, current_app.config["SECRET_KEY"], current_app.config["JWT_EXPIRY_HOURS"])
    return jsonify({"message": "Login successful.", "token": token, "user": user.to_dict()}), 200


@auth_bp.get("/me")
@token_required
def me(current_user):
    return jsonify({"user": current_user.to_dict()}), 200


@auth_bp.put("/profile")
@token_required
def update_profile(current_user):
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    email = (data.get("email") or "").strip().lower()

    if username and username != current_user.username:
        if len(username) < 3:
            return jsonify({"error": "Username must be at least 3 characters."}), 422
        if User.query.filter_by(username=username).first():
            return jsonify({"error": "Username already taken."}), 409
        current_user.username = username

    if email and email != current_user.email:
        if not is_valid_email(email):
            return jsonify({"error": "Invalid email format."}), 422
        if User.query.filter_by(email=email).first():
            return jsonify({"error": "Email already registered."}), 409
        current_user.email = email

    db.session.commit()
    return jsonify({"message": "Profile updated.", "user": current_user.to_dict()}), 200


@auth_bp.put("/change-password")
@token_required
def change_password(current_user):
    data = request.get_json(silent=True) or {}
    old_password = data.get("old_password") or ""
    new_password = data.get("new_password") or ""

    if not old_password or not new_password:
        return jsonify({"error": "Both old and new passwords are required."}), 400
    if not check_password(old_password, current_user.password_hash):
        return jsonify({"error": "Current password is incorrect."}), 401
    if len(new_password) < 6:
        return jsonify({"error": "New password must be at least 6 characters."}), 422

    current_user.password_hash = hash_password(new_password)
    db.session.commit()
    return jsonify({"message": "Password changed successfully."}), 200
