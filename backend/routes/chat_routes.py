import io
import csv
import json
from datetime import datetime
from flask import Blueprint, request, jsonify, Response, stream_with_context, current_app
from database import db
from models import Chat
from auth import token_required
from services.ai_service import generate_chat_response, stream_chat_response

chat_bp = Blueprint("chat", __name__, url_prefix="/api/chat")


@chat_bp.post("/")
@token_required
def chat(current_user):
    data = request.get_json(silent=True) or {}
    message = (data.get("message") or "").strip()
    image_url = data.get("image_url")
    enable_web_search = bool(data.get("enable_web_search", False))
    custom_system_prompt = data.get("system_prompt")
    if not message and not image_url:
        return jsonify({"error": "Message or image is required."}), 400

    recent_chats = (
        Chat.query.filter_by(user_id=current_user.id)
        .order_by(Chat.timestamp.desc())
        .limit(10)
        .all()
    )
    history = [{"message": c.message, "response": c.response} for c in reversed(recent_chats)]

    response_text = generate_chat_response(
        message or "[Image Attached]",
        history=history,
        enable_web_search=enable_web_search,
        custom_system_prompt=custom_system_prompt,
    )

    chat_entry = Chat(
        user_id=current_user.id,
        message=message or "[Image Attached]",
        response=response_text,
        image_url=image_url,
    )
    db.session.add(chat_entry)
    db.session.commit()

    return jsonify({"reply": response_text, "chat": chat_entry.to_dict()}), 200


@chat_bp.post("/stream")
@token_required
def chat_stream(current_user):
    data = request.get_json(silent=True) or {}
    message = (data.get("message") or "").strip()
    image_url = data.get("image_url")
    enable_web_search = bool(data.get("enable_web_search", False))
    custom_system_prompt = data.get("system_prompt")
    if not message and not image_url:
        return jsonify({"error": "Message or image is required."}), 400

    recent_chats = (
        Chat.query.filter_by(user_id=current_user.id)
        .order_by(Chat.timestamp.desc())
        .limit(10)
        .all()
    )
    history = [{"message": c.message, "response": c.response} for c in reversed(recent_chats)]

    app = current_app._get_current_object()
    user_id = current_user.id

    def generate():
        full_response = []
        effective_prompt = message or "Analyze the attached image."
        if image_url:
            effective_prompt = f"[Image Attached: {image_url}]\n{effective_prompt}"

        for chunk in stream_chat_response(
            effective_prompt,
            history=history,
            enable_web_search=enable_web_search,
            custom_system_prompt=custom_system_prompt,
        ):
            full_response.append(chunk)
            event_data = json.dumps({"chunk": chunk})
            yield f"data: {event_data}\n\n"
        
        complete_text = "".join(full_response)
        with app.app_context():
            chat_entry = Chat(
                user_id=user_id,
                message=message or "[Image Attached]",
                response=complete_text,
                image_url=image_url,
            )
            db.session.add(chat_entry)
            db.session.commit()
            chat_dict = chat_entry.to_dict()
            yield f"data: {json.dumps({'done': True, 'chat': chat_dict})}\n\n"

    return Response(stream_with_context(generate()), mimetype="text/event-stream")



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
