"""
Shared Chat Links Routes.
Allows users to share their chat history publicly via a unique link.
"""
import json
from flask import Blueprint, jsonify, request
from auth import token_required
from database import db
from models import SharedChat, Chat

share_bp = Blueprint("share", __name__, url_prefix="/api/share")


@share_bp.post("/")
@token_required
def create_share(current_user):
    """Create a shareable public link from the current chat history."""
    data = request.get_json(silent=True) or {}
    messages = data.get("messages")
    title = (data.get("title") or "").strip() or "Shared AI Conversation"

    if not messages or not isinstance(messages, list):
        return jsonify({"error": "A non-empty messages array is required."}), 400

    # Limit to 100 messages to avoid abuse
    messages = messages[:100]

    shared = SharedChat(
        user_id=current_user.id,
        title=title,
        messages_json=json.dumps(messages),
    )
    db.session.add(shared)
    db.session.commit()

    return jsonify({
        "share_id": shared.share_id,
        "share_url": f"/share/{shared.share_id}",
        "title": shared.title,
        "message": "Chat shared successfully!",
    }), 201


@share_bp.get("/<string:share_id>")
def get_shared_chat(share_id):
    """Retrieve a publicly shared chat by share ID (no auth required)."""
    shared = SharedChat.query.filter_by(share_id=share_id, is_public=True).first()
    if not shared:
        return jsonify({"error": "Shared chat not found or has been removed."}), 404

    # Increment view count
    shared.view_count += 1
    db.session.commit()

    return jsonify({
        "share_id": shared.share_id,
        "title": shared.title,
        "messages": json.loads(shared.messages_json),
        "view_count": shared.view_count,
        "created_at": shared.created_at.isoformat() if shared.created_at else None,
    }), 200


@share_bp.get("/my/list")
@token_required
def list_my_shares(current_user):
    """List all shared chats created by the current user."""
    shares = SharedChat.query.filter_by(user_id=current_user.id).order_by(SharedChat.created_at.desc()).all()
    return jsonify({"shares": [s.to_dict() for s in shares]}), 200


@share_bp.delete("/<string:share_id>")
@token_required
def delete_share(current_user, share_id):
    """Delete a shared chat (owner only)."""
    shared = SharedChat.query.filter_by(share_id=share_id, user_id=current_user.id).first()
    if not shared:
        return jsonify({"error": "Shared chat not found."}), 404
    db.session.delete(shared)
    db.session.commit()
    return jsonify({"message": "Shared chat deleted."}), 200
