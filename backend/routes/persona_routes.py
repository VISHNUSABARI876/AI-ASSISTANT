from flask import Blueprint, request, jsonify
from database import db
from models import Persona
from auth import token_required

persona_bp = Blueprint("personas", __name__, url_prefix="/api/personas")

DEFAULT_PERSONAS = [
    {
        "id": 1,
        "name": "General Assistant",
        "description": "Friendly, clear, and helpful AI assistant for any task.",
        "system_prompt": "You are a helpful AI assistant. Always respond clearly, accurately, and concisely.",
        "icon": "🤖",
    },
    {
        "id": 2,
        "name": "Senior Software Engineer",
        "description": "Expert programmer focused on clean code, architecture, and best practices.",
        "system_prompt": "You are a Senior Principal Software Engineer. Provide elegant, production-ready code snippets with clear architectural explanations, proper error handling, and type annotations.",
        "icon": "💻",
    },
    {
        "id": 3,
        "name": "Security Auditor & Reviewer",
        "description": "Identifies vulnerabilities, performance bottlenecks, and edge cases.",
        "system_prompt": "You are a Cyber Security Specialist and Code Auditor. Analyze prompts and code specifically looking for security risks (SQLi, XSS, OWASP Top 10), performance bottlenecks, and logical bugs.",
        "icon": "🛡️",
    },
    {
        "id": 4,
        "name": "Creative Copywriter",
        "description": "Crafts compelling copy, blog posts, and marketing content.",
        "system_prompt": "You are an expert Copywriter and Marketing Specialist. Write engaging, persuasive, well-structured content tailored for modern digital audiences.",
        "icon": "✍️",
    },
]


@persona_bp.get("/")
@token_required
def get_personas(current_user):
    user_custom = Persona.query.filter_by(user_id=current_user.id).all()
    custom_dicts = [p.to_dict() for p in user_custom]
    all_personas = DEFAULT_PERSONAS + custom_dicts
    return jsonify({"personas": all_personas}), 200


@persona_bp.post("/")
@token_required
def create_persona(current_user):
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    system_prompt = (data.get("system_prompt") or "").strip()
    description = (data.get("description") or "").strip()
    icon = (data.get("icon") or "🤖").strip()

    if not name or not system_prompt:
        return jsonify({"error": "Name and system prompt are required."}), 400

    persona = Persona(
        user_id=current_user.id,
        name=name,
        description=description,
        system_prompt=system_prompt,
        icon=icon,
    )
    db.session.add(persona)
    db.session.commit()

    return jsonify({"message": "Persona created.", "persona": persona.to_dict()}), 201


@persona_bp.delete("/<int:persona_id>")
@token_required
def delete_persona(current_user, persona_id):
    persona = Persona.query.filter_by(id=persona_id, user_id=current_user.id).first()
    if not persona:
        return jsonify({"error": "Custom persona not found."}), 404

    db.session.delete(persona)
    db.session.commit()
    return jsonify({"message": "Persona deleted."}), 200
