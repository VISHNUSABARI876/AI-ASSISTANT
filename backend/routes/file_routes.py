import os
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from database import db
from models import UploadedFile
from auth import token_required

file_bp = Blueprint("files", __name__, url_prefix="/api/files")


def allowed_file(filename: str) -> bool:
    allowed = current_app.config.get("ALLOWED_EXTENSIONS", {"pdf", "txt"})
    return "." in filename and filename.rsplit(".", 1)[1].lower() in allowed


@file_bp.post("/upload")
@token_required
def upload_file(current_user):
    if "file" not in request.files:
        return jsonify({"error": "No file part in the request."}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected."}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "File type not allowed. Only PDF and TXT are supported."}), 415

    filename = secure_filename(file.filename)
    # Prefix with user ID to avoid collisions
    safe_name = f"{current_user.id}_{filename}"
    upload_folder = current_app.config["UPLOAD_FOLDER"]
    os.makedirs(upload_folder, exist_ok=True)
    filepath = os.path.join(upload_folder, safe_name)
    file.save(filepath)

    file_record = UploadedFile(
        user_id=current_user.id,
        filename=filename,
        filepath=filepath,
    )
    db.session.add(file_record)
    db.session.commit()

    return jsonify({"message": "File uploaded successfully.", "file": file_record.to_dict()}), 201


@file_bp.get("/")
@token_required
def list_files(current_user):
    files = (
        UploadedFile.query.filter_by(user_id=current_user.id)
        .order_by(UploadedFile.uploaded_at.desc())
        .all()
    )
    return jsonify({"files": [f.to_dict() for f in files]}), 200


@file_bp.delete("/<int:file_id>")
@token_required
def delete_file(current_user, file_id):
    file_record = UploadedFile.query.filter_by(id=file_id, user_id=current_user.id).first()
    if not file_record:
        return jsonify({"error": "File not found."}), 404

    # Remove physical file if it exists
    if os.path.exists(file_record.filepath):
        os.remove(file_record.filepath)

    db.session.delete(file_record)
    db.session.commit()
    return jsonify({"message": "File deleted successfully."}), 200
