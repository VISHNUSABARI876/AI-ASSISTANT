"""
Developer API Key Management Routes.
Allows users to create, list, revoke their own API keys.
"""
import hashlib
import secrets
from datetime import datetime, timezone

from flask import Blueprint, jsonify, request
from auth import token_required
from database import db
from models import APIKey

apikey_bp = Blueprint("apikeys", __name__, url_prefix="/api/keys")


def _hash_key(raw_key: str) -> str:
    return hashlib.sha256(raw_key.encode()).hexdigest()


@apikey_bp.get("/")
@token_required
def list_keys(current_user):
    """Return all API keys for the current user (without the full secret)."""
    keys = APIKey.query.filter_by(user_id=current_user.id).order_by(APIKey.created_at.desc()).all()
    return jsonify({"keys": [k.to_dict() for k in keys]}), 200


@apikey_bp.post("/")
@token_required
def create_key(current_user):
    """Generate a new API key. The full key is returned ONCE and never stored in plaintext."""
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    if not name:
        return jsonify({"error": "Key name is required."}), 400

    # Limit to 10 keys per user
    existing_count = APIKey.query.filter_by(user_id=current_user.id).count()
    if existing_count >= 10:
        return jsonify({"error": "Maximum of 10 API keys reached. Revoke an existing key first."}), 400

    # Generate a secret: prefix "aik_" + 32 random bytes (hex)
    raw_key = "aik_" + secrets.token_hex(32)
    key_prefix = raw_key[:12]
    key_hash = _hash_key(raw_key)

    new_key = APIKey(
        user_id=current_user.id,
        name=name,
        key_prefix=key_prefix,
        key_hash=key_hash,
    )
    db.session.add(new_key)
    db.session.commit()

    return jsonify({
        "message": "API key created. Copy the key now — it will never be shown again.",
        "key": raw_key,          # ← Only returned once on creation
        "key_info": new_key.to_dict(),
    }), 201


@apikey_bp.delete("/<int:key_id>")
@token_required
def revoke_key(current_user, key_id):
    """Revoke (deactivate) an API key by ID."""
    key = APIKey.query.filter_by(id=key_id, user_id=current_user.id).first()
    if not key:
        return jsonify({"error": "Key not found."}), 404
    key.is_active = False
    db.session.commit()
    return jsonify({"message": "API key revoked successfully."}), 200


@apikey_bp.delete("/<int:key_id>/delete")
@token_required
def delete_key(current_user, key_id):
    """Permanently delete an API key."""
    key = APIKey.query.filter_by(id=key_id, user_id=current_user.id).first()
    if not key:
        return jsonify({"error": "Key not found."}), 404
    db.session.delete(key)
    db.session.commit()
    return jsonify({"message": "API key deleted permanently."}), 200
