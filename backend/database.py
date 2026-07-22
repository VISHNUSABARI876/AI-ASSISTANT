from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone

db = SQLAlchemy()


def init_db(app):
    """Initialize the database with the Flask app and apply auto-migrations."""
    db.init_app(app)
    with app.app_context():
        db.create_all()
        
        # Check if chats table has image_url column, add it if not (SQLite migration helper)
        try:
            with db.engine.connect() as conn:
                from sqlalchemy import text
                result = conn.execute(text("PRAGMA table_info(chats);")).fetchall()
                column_names = [row[1] for row in result]
                if "image_url" not in column_names:
                    app.logger.info("Database migration: adding 'image_url' column to 'chats' table.")
                    conn.execute(text("ALTER TABLE chats ADD COLUMN image_url VARCHAR(512);"))
                    conn.commit()
        except Exception as e:
            app.logger.warning(f"Database migration check failed: {e}")

