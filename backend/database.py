from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone

db = SQLAlchemy()


def init_db(app):
    """Initialize the database with the Flask app and apply auto-migrations."""
    db.init_app(app)
    with app.app_context():
        db.create_all()

        # Check if chats table has image_url column, add it if missing.
        # Uses information_schema for PostgreSQL compatibility (also works on SQLite fallback).
        try:
            with db.engine.connect() as conn:
                from sqlalchemy import text
                dialect = db.engine.dialect.name  # 'postgresql' or 'sqlite'

                if dialect == "sqlite":
                    result = conn.execute(text("PRAGMA table_info(chats);")).fetchall()
                    column_names = [row[1] for row in result]
                else:
                    result = conn.execute(text(
                        "SELECT column_name FROM information_schema.columns "
                        "WHERE table_name='chats';"
                    )).fetchall()
                    column_names = [row[0] for row in result]

                if "image_url" not in column_names:
                    app.logger.info("Database migration: adding 'image_url' column to 'chats' table.")
                    conn.execute(text("ALTER TABLE chats ADD COLUMN image_url VARCHAR(512);"))
                    conn.commit()
        except Exception as e:
            app.logger.warning(f"Database migration check failed: {e}")

