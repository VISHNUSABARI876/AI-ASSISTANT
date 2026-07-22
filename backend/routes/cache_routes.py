"""
Cache management endpoints — visible to admins/dashboard.
"""
from flask import Blueprint, jsonify
from auth import token_required
import services.cache_service as cache

cache_bp = Blueprint("cache", __name__, url_prefix="/api/cache")


@cache_bp.get("/stats")
@token_required
def get_cache_stats(current_user):
    """Return live cache statistics."""
    return jsonify(cache.stats()), 200


@cache_bp.delete("/clear")
@token_required
def clear_cache(current_user):
    """Clear the entire response cache (admin action)."""
    cache.clear()
    return jsonify({"message": "Cache cleared successfully."}), 200
