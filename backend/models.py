from datetime import datetime, timezone
import secrets
from database import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=True)
    google_id = db.Column(db.String(255), unique=True, nullable=True, index=True)
    avatar_url = db.Column(db.String(512), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    chats = db.relationship("Chat", backref="user", lazy=True, cascade="all, delete-orphan")
    files = db.relationship("UploadedFile", backref="user", lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "avatar_url": self.avatar_url,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Chat(db.Model):
    __tablename__ = "chats"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    message = db.Column(db.Text, nullable=False)
    response = db.Column(db.Text, nullable=False)
    image_url = db.Column(db.String(512), nullable=True)
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "message": self.message,
            "response": self.response,
            "image_url": self.image_url,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
        }


class UploadedFile(db.Model):
    __tablename__ = "uploaded_files"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    filepath = db.Column(db.String(512), nullable=False)
    uploaded_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "filename": self.filename,
            "uploaded_at": self.uploaded_at.isoformat() if self.uploaded_at else None,
        }


class Persona(db.Model):
    __tablename__ = "personas"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)  # None for default system personas
    name = db.Column(db.String(80), nullable=False)
    description = db.Column(db.String(255), nullable=True)
    system_prompt = db.Column(db.Text, nullable=False)
    icon = db.Column(db.String(50), default="🤖")
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.name,
            "description": self.description,
            "system_prompt": self.system_prompt,
            "icon": self.icon,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class APIKey(db.Model):
    __tablename__ = "api_keys"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    key_prefix = db.Column(db.String(12), nullable=False)          # First 12 chars shown to user
    key_hash = db.Column(db.String(64), nullable=False, unique=True)  # SHA-256 of full key
    is_active = db.Column(db.Boolean, default=True)
    last_used_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "key_prefix": self.key_prefix,
            "is_active": self.is_active,
            "last_used_at": self.last_used_at.isoformat() if self.last_used_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class SharedChat(db.Model):
    __tablename__ = "shared_chats"

    id = db.Column(db.Integer, primary_key=True)
    share_id = db.Column(db.String(32), unique=True, nullable=False, default=lambda: secrets.token_urlsafe(16))
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    title = db.Column(db.String(200), nullable=True)
    messages_json = db.Column(db.Text, nullable=False)   # JSON-serialized messages list
    is_public = db.Column(db.Boolean, default=True)
    view_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "share_id": self.share_id,
            "title": self.title,
            "is_public": self.is_public,
            "view_count": self.view_count,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
