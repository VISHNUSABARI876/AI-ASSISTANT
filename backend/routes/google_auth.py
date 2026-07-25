import os
import secrets
import requests
from flask import Blueprint, request, jsonify, redirect, current_app, session
from database import db
from models import User
from auth import generate_token, token_required

google_bp = Blueprint("google_auth", __name__, url_prefix="/api/auth/google")

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"


@google_bp.route("/login")
def google_login():
    client_id = current_app.config.get("GOOGLE_CLIENT_ID")
    redirect_uri = current_app.config.get("GOOGLE_REDIRECT_URI")

    if not client_id:
        return jsonify({"error": "Google OAuth is not configured (missing GOOGLE_CLIENT_ID)."}), 501

    state = secrets.token_urlsafe(32)
    session["oauth_state"] = state

    params = {
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "state": state,
        "access_type": "offline",
        "prompt": "select_account",
    }
    import urllib.parse
    auth_url = GOOGLE_AUTH_URL + "?" + urllib.parse.urlencode(params)
    return redirect(auth_url)


@google_bp.route("/callback")
def google_callback():
    error = request.args.get("error")
    if error:
        frontend_url = current_app.config.get("FRONTEND_URL", "http://localhost:3000")
        return redirect(f"{frontend_url}/login?error=google_auth_cancelled")

    code = request.args.get("code")
    state = request.args.get("state")

    if not code or not state:
        return jsonify({"error": "Missing authorization code or state."}), 400

    expected_state = session.pop("oauth_state", None)
    if expected_state and state != expected_state:
        current_app.logger.warning(f"OAuth state mismatch: expected {expected_state}, got {state}")
        return jsonify({"error": "Invalid state parameter. Possible CSRF attack."}), 400

    client_id = current_app.config.get("GOOGLE_CLIENT_ID")
    client_secret = current_app.config.get("GOOGLE_CLIENT_SECRET")
    redirect_uri = current_app.config.get("GOOGLE_REDIRECT_URI")

    if not client_id or not client_secret:
        return jsonify({"error": "Google OAuth is not configured properly."}), 501

    # Exchange authorization code for tokens
    token_response = requests.post(GOOGLE_TOKEN_URL, data={
        "code": code,
        "client_id": client_id,
        "client_secret": client_secret,
        "redirect_uri": redirect_uri,
        "grant_type": "authorization_code",
    }, timeout=10)

    if not token_response.ok:
        return jsonify({"error": "Failed to exchange authorization code for tokens."}), 400

    token_data = token_response.json()
    access_token = token_data.get("access_token")

    if not access_token:
        return jsonify({"error": "No access token received from Google."}), 400

    # Get user info from Google
    userinfo_response = requests.get(GOOGLE_USERINFO_URL, headers={
        "Authorization": f"Bearer {access_token}",
    }, timeout=10)

    if not userinfo_response.ok:
        return jsonify({"error": "Failed to fetch user info from Google."}), 400

    google_user = userinfo_response.json()
    google_id = str(google_user["id"])
    email = google_user.get("email", "").lower()
    name = google_user.get("name", "")
    avatar = google_user.get("picture", "")

    if not email:
        return jsonify({"error": "Google account has no email address."}), 400

    # Find existing user by google_id or email
    user = User.query.filter_by(google_id=google_id).first()

    if not user:
        user = User.query.filter_by(email=email).first()
        if user:
            user.google_id = google_id
            if avatar:
                user.avatar_url = avatar
        else:
            username = name.replace(" ", "_") if name else email.split("@")[0]
            base_username = username
            counter = 1
            while User.query.filter_by(username=username).first():
                username = f"{base_username}{counter}"
                counter += 1

            user = User(
                username=username,
                email=email,
                google_id=google_id,
                avatar_url=avatar,
            )
            db.session.add(user)

    db.session.commit()

    jwt_token = generate_token(
        user.id,
        current_app.config["SECRET_KEY"],
        current_app.config["JWT_EXPIRY_HOURS"],
    )

    frontend_url = current_app.config.get("FRONTEND_URL", "http://localhost:3000")
    return redirect(f"{frontend_url}/auth/google/callback?token={jwt_token}")
