import io
import csv
import json
from datetime import datetime
from flask import Blueprint, request, jsonify, Response
from database import db
from models import Chat
from auth import token_required
from services.ai_service import generate_chat_response

chat_bp = Blueprint("chat", __name__, url_prefix="/api/chat")


@chat_bp.post("/")
@token_required
def chat(current_user):
    data = request.get_json(silent=True) or {}
    message = (data.get("message") or "").strip()
    if not message:
        return jsonify({"error": "Message cannot be empty."}), 400

    response_text = generate_chat_response(message)

    chat_entry = Chat(
        user_id=current_user.id,
        message=message,
        response=response_text,
    )
    db.session.add(chat_entry)
    db.session.commit()

    return jsonify({"reply": response_text, "chat": chat_entry.to_dict()}), 200


@chat_bp.get("/history")
@token_required
def get_history(current_user):
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    per_page = min(per_page, 100)

    paginated = (
        Chat.query.filter_by(user_id=current_user.id)
        .order_by(Chat.timestamp.desc())
        .paginate(page=page, per_page=per_page, error_out=False)
    )

    return jsonify({
        "chats": [c.to_dict() for c in paginated.items],
        "total": paginated.total,
        "pages": paginated.pages,
        "current_page": page,
    }), 200


@chat_bp.get("/history/search")
@token_required
def search_history(current_user):
    query = (request.args.get("q") or "").strip()
    if not query:
        return jsonify({"error": "Search query cannot be empty."}), 400

    results = (
        Chat.query.filter(
            Chat.user_id == current_user.id,
            Chat.message.ilike(f"%{query}%"),
        )
        .order_by(Chat.timestamp.desc())
        .limit(50)
        .all()
    )
    return jsonify({"chats": [c.to_dict() for c in results], "query": query}), 200


@chat_bp.delete("/history/<int:chat_id>")
@token_required
def delete_chat(current_user, chat_id):
    chat_entry = Chat.query.filter_by(id=chat_id, user_id=current_user.id).first()
    if not chat_entry:
        return jsonify({"error": "Chat not found."}), 404
    db.session.delete(chat_entry)
    db.session.commit()
    return jsonify({"message": "Chat deleted."}), 200


@chat_bp.get("/history/download")
@token_required
def download_history(current_user):
    fmt = request.args.get("format", "json").lower()
    chats = (
        Chat.query.filter_by(user_id=current_user.id)
        .order_by(Chat.timestamp.asc())
        .all()
    )

    if fmt == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["ID", "Message", "Response", "Timestamp"])
        for c in chats:
            writer.writerow([c.id, c.message, c.response, c.timestamp.isoformat()])
        output.seek(0)
        return Response(
            output.getvalue(),
            mimetype="text/csv",
            headers={"Content-Disposition": "attachment; filename=chat_history.csv"},
        )

    # Default: JSON
    data = json.dumps([c.to_dict() for c in chats], indent=2)
    return Response(
        data,
        mimetype="application/json",
        headers={"Content-Disposition": "attachment; filename=chat_history.json"},
    )
