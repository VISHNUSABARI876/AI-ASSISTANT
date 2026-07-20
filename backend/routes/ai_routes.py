from flask import Blueprint, request, jsonify, current_app
from models import UploadedFile
from auth import token_required
from services.ai_service import generate_summary, generate_code
from services.pdf_service import extract_text_from_file

ai_bp = Blueprint("ai", __name__, url_prefix="/api/ai")


@ai_bp.post("/summarize")
@token_required
def summarize(current_user):
    data = request.get_json(silent=True) or {}
    file_id = data.get("file_id")

    if file_id:
        file_record = UploadedFile.query.filter_by(id=file_id, user_id=current_user.id).first()
        if not file_record:
            return jsonify({"error": "File not found."}), 404
        try:
            text = extract_text_from_file(file_record.filepath)
        except Exception as e:
            return jsonify({"error": f"Failed to extract text: {str(e)}"}), 500
    else:
        text = (data.get("text") or "").strip()
        if not text:
            return jsonify({"error": "Provide either a file_id or text to summarize."}), 400

    if len(text) < 50:
        return jsonify({"error": "Text is too short to summarize (minimum 50 characters)."}), 400

    summary = generate_summary(text)
    return jsonify({"summary": summary, "original_length": len(text), "summary_length": len(summary)}), 200


@ai_bp.post("/generate-code")
@token_required
def generate_code_endpoint(current_user):
    data = request.get_json(silent=True) or {}
    prompt = (data.get("prompt") or "").strip()
    language = (data.get("language") or "python").strip().lower()

    if not prompt:
        return jsonify({"error": "Prompt cannot be empty."}), 400

    code = generate_code(prompt, language)
    return jsonify({"code": code, "language": language, "prompt": prompt}), 200
