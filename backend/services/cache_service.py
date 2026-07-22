"""
Simple in-memory TTL response cache for AI service calls.
Reduces redundant Groq API calls for repeated or identical prompts.
"""
import hashlib
import time
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

# Cache storage: { cache_key: { "value": str, "expires_at": float } }
_cache: Dict[str, Any] = {}

# Default TTL in seconds (15 minutes)
_DEFAULT_TTL = 900

# Max cache entries (simple LRU eviction)
_MAX_SIZE = 200


def _make_key(prompt: str, context: str = "") -> str:
    """Create a deterministic cache key from the prompt and context."""
    raw = f"{prompt.strip().lower()}|{context}"
    return hashlib.md5(raw.encode()).hexdigest()


def _evict_if_needed():
    """Remove expired entries; if still too big, drop oldest 20%."""
    now = time.time()
    expired = [k for k, v in _cache.items() if v["expires_at"] < now]
    for k in expired:
        del _cache[k]

    if len(_cache) >= _MAX_SIZE:
        # Sort by expiry and drop oldest 20%
        sorted_keys = sorted(_cache, key=lambda k: _cache[k]["expires_at"])
        to_remove = sorted_keys[: max(1, _MAX_SIZE // 5)]
        for k in to_remove:
            del _cache[k]
        logger.debug(f"Cache eviction: removed {len(to_remove)} entries.")


def get(prompt: str, context: str = "") -> Optional[str]:
    """Return cached value if it exists and has not expired."""
    key = _make_key(prompt, context)
    entry = _cache.get(key)
    if entry and entry["expires_at"] > time.time():
        logger.debug(f"Cache HIT for key={key[:8]}…")
        return entry["value"]
    if entry:
        del _cache[key]
    return None


def set(prompt: str, value: str, context: str = "", ttl: int = _DEFAULT_TTL):
    """Store a value in the cache with the given TTL (seconds)."""
    _evict_if_needed()
    key = _make_key(prompt, context)
    _cache[key] = {
        "value": value,
        "expires_at": time.time() + ttl,
    }
    logger.debug(f"Cache SET key={key[:8]}… (ttl={ttl}s, size={len(_cache)})")


def invalidate(prompt: str, context: str = ""):
    """Remove a specific cache entry."""
    key = _make_key(prompt, context)
    _cache.pop(key, None)


def clear():
    """Clear entire cache."""
    _cache.clear()
    logger.info("Response cache cleared.")


def stats() -> Dict[str, Any]:
    """Return cache statistics."""
    now = time.time()
    active = sum(1 for v in _cache.values() if v["expires_at"] > now)
    return {
        "total_entries": len(_cache),
        "active_entries": active,
        "expired_entries": len(_cache) - active,
        "max_size": _MAX_SIZE,
        "default_ttl_seconds": _DEFAULT_TTL,
    }
