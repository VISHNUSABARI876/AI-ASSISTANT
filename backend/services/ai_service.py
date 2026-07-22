"""
AI Service — Groq as primary engine with rule-based fallback.

Groq is initialised lazily on first call. If the API key is absent or the
network call fails, the service falls back to the comprehensive rule-based
engine so the app keeps working even without a valid key.
"""
import logging
import os
import random
import re
import textwrap
import traceback
from typing import Optional

logger = logging.getLogger(__name__)

# ── Groq client (lazy) ────────────────────────────────────────────────────────

_groq_client = None
_groq_available = False
_groq_attempted = False

# Default model — fast & capable; override with GROQ_MODEL env var
_GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")


def _get_groq():
    """Lazy-initialise the Groq client."""
    global _groq_client, _groq_available, _groq_attempted
    if _groq_attempted:
        return _groq_client

    _groq_attempted = True
    api_key = os.getenv("GROQ_API_KEY", "").strip()
    print("GROQ API KEY FOUND:", bool(api_key))
    print("GROQ API KEY:", api_key[:10] + "..." if api_key else "NOT FOUND")
    if not api_key or api_key == "your_groq_api_key_here":
        logger.warning("GROQ_API_KEY not set — using rule-based fallback.")
        return None

    try:
        from groq import Groq  # type: ignore

        _groq_client = Groq(api_key=api_key)
        _groq_available = True
        logger.info("Groq client initialised successfully.")
    except Exception as exc:
        traceback.print_exc()
        logger.warning(f"Groq unavailable, using fallback: {exc}")
        _groq_client = None

    return _groq_client


def _log_details(messages, model, response_text=None, exception=None):
    """Log complete request and response/error details for audit."""
    from flask import request, has_request_context
    log_lines = []
    log_lines.append("\n=================== AI SERVICE LOG START ===================")
    
    # 1. Incoming request details
    if has_request_context():
        log_lines.append(f"INCOMING REQUEST: {request.method} {request.url}")
        log_lines.append(f"HEADERS: {dict(request.headers)}")
    else:
        log_lines.append("INCOMING REQUEST: (No active Flask request context)")
        
    # 2. Extract user message and system prompt
    user_msg = ""
    system_prompt = ""
    for msg in messages:
        if msg.get("role") == "system":
            system_prompt = msg.get("content", "")
        elif msg.get("role") == "user":
            user_msg = msg.get("content", "")
            
    log_lines.append(f"USER MESSAGE: {user_msg}")
    log_lines.append(f"SELECTED MODEL: {model}")
    log_lines.append(f"SYSTEM PROMPT: {system_prompt}")
    log_lines.append(f"REQUEST SENT TO GROQ: {messages}")
    
    if response_text is not None:
        log_lines.append(f"GROQ RESPONSE: {response_text}")
    
    if exception is not None:
        log_lines.append("EXCEPTION OCCURRED:")
        log_lines.append(traceback.format_exc())
        
    log_lines.append("==================== AI SERVICE LOG END ====================\n")
    logger.info("\n".join(log_lines))


def _call_groq(prompt_or_messages, max_tokens: int = 512, system_prompt: Optional[str] = None) -> Optional[str]:
    """Call Groq and return the text response, or None on failure."""
    client = _get_groq()
    
    # Standardize messages format
    if isinstance(prompt_or_messages, list):
        messages = prompt_or_messages
    else:
        sys_content = system_prompt if system_prompt is not None else "You are a helpful AI assistant. Always respond with a clear, informative answer."
        messages = [
            {"role": "system", "content": sys_content},
            {"role": "user", "content": prompt_or_messages}
        ]

    if client is None:
        logger.warning("Groq client not available, using fallback rule-based chat.")
        return None

    try:
        completion = client.chat.completions.create(
            model=_GROQ_MODEL,
            messages=messages,
            max_tokens=max_tokens,
            temperature=0.7,
        )
        choice = completion.choices[0]
        text = choice.message.content
        if text:
            text = text.strip()
        if not text:
            logger.warning(f"Groq returned empty content. Finish reason: {choice.finish_reason}")
            _log_details(messages, _GROQ_MODEL, response_text="[EMPTY RESPONSE]", exception=None)
            return None
        _log_details(messages, _GROQ_MODEL, response_text=text, exception=None)
        return text
    except Exception as exc:
        _log_details(messages, _GROQ_MODEL, response_text=None, exception=exc)
        return None


# ── Smart fallback chat ───────────────────────────────────────────────────────

_GREETINGS = [
    "Hello! 👋 I'm your AI assistant. How can I help you today?",
    "Hey there! What can I do for you?",
    "Hi! I'm ready to help. What's on your mind?",
    "Greetings! Ask me anything — coding, summarising, brainstorming, you name it.",
]

_FAREWELL = [
    "Goodbye! Feel free to come back anytime. 👋",
    "See you later! Don't hesitate to reach out when you need help.",
    "Bye for now! Have a great day! 🙌",
]

_THANKS_REPLIES = [
    "You're welcome! Happy to help. 😊",
    "Glad I could assist! Let me know if you need anything else.",
    "No problem at all! That's what I'm here for.",
]

_CAPABILITIES = (
    "Here's what I can do for you:\n\n"
    "💬 **Chat** — Ask me questions on any topic\n"
    "📝 **Summarise** — Paste text or upload a document and I'll condense it\n"
    "💻 **Generate Code** — Describe what you need and I'll write the code\n"
    "🔍 **Explain Concepts** — I can break down complex topics\n"
    "🧮 **Basic Maths** — I can evaluate simple expressions\n\n"
    "Just type your request and I'll do my best!"
)

_TOPIC_RESPONSES = {
    "python": (
        "Python is a versatile, high-level programming language known for its "
        "readability and vast ecosystem. It's widely used in web development "
        "(Django, Flask), data science (pandas, NumPy), machine learning "
        "(TensorFlow, PyTorch), automation, and more. Would you like me to "
        "write some Python code for you?"
    ),
    "javascript": (
        "JavaScript is the language of the web! It runs in browsers and on "
        "servers (Node.js). Modern JS features async/await, modules, and "
        "frameworks like React, Vue, and Angular. Need a code snippet?"
    ),
    "machine learning": (
        "Machine learning is a subset of AI where systems learn patterns from "
        "data instead of being explicitly programmed. Key concepts include "
        "supervised learning, unsupervised learning, and reinforcement learning. "
        "Popular frameworks include scikit-learn, TensorFlow, and PyTorch."
    ),
    "ai": (
        "Artificial Intelligence encompasses techniques that enable machines to "
        "mimic human intelligence — from natural language processing and computer "
        "vision to decision-making and robotics. Want to dive deeper into a "
        "specific area?"
    ),
    "web development": (
        "Web development involves building websites and web applications. The "
        "front-end (HTML, CSS, JavaScript) handles what users see, while the "
        "back-end (Python/Flask, Node.js, databases) handles logic and data. "
        "Would you like help with a specific part?"
    ),
    "database": (
        "Databases store and organise data. Relational databases (PostgreSQL, "
        "MySQL, SQLite) use SQL and structured tables, while NoSQL databases "
        "(MongoDB, Redis) offer flexible schemas. Each has trade-offs depending "
        "on your use case."
    ),
    "api": (
        "An API (Application Programming Interface) lets different software "
        "systems communicate. REST APIs use HTTP methods (GET, POST, PUT, DELETE) "
        "and typically exchange JSON data. GraphQL is another popular approach "
        "that lets clients request exactly the data they need."
    ),
}


def _try_math(message: str) -> Optional[str]:
    """Attempt to evaluate simple maths expressions."""
    math_match = re.search(
        r'(?:what\s+is|calculate|compute|evaluate|solve)?\s*([\d\s\+\-\*\/\.\(\)]+)\s*[\?]?$',
        message.lower(),
    )
    if math_match:
        expr = math_match.group(1).strip()
        if len(expr) >= 3 and any(op in expr for op in ['+', '-', '*', '/']):
            try:
                if re.match(r'^[\d\s\+\-\*\/\.\(\)]+$', expr):
                    result = eval(expr)  # noqa: S307
                    return f"The result of `{expr}` is **{result}**."
            except Exception:
                pass
    return None


def _smart_chat(message: str) -> str:
    """Comprehensive rule-based chat — used when Groq is unavailable."""
    msg = message.strip()
    msg_lower = msg.lower()

    if any(k in msg_lower for k in ["hello", "hi ", "hi!", "hey", "good morning", "good evening", "howdy"]):
        return random.choice(_GREETINGS)
    if any(k in msg_lower for k in ["bye", "goodbye", "see you", "take care", "good night"]):
        return random.choice(_FAREWELL)
    if any(k in msg_lower for k in ["thank", "thanks", "thx", "appreciate"]):
        return random.choice(_THANKS_REPLIES)
    if any(k in msg_lower for k in ["who are you", "what are you", "your name", "about you"]):
        return (
            "I'm an AI assistant built into this application. I can help you "
            "with coding questions, text summarisation, code generation, and "
            "general knowledge topics. How can I help?"
        )
    if any(k in msg_lower for k in ["help", "what can you do", "capabilities", "features"]):
        return _CAPABILITIES
    if any(k in msg_lower for k in ["how are you", "how do you do", "how's it going"]):
        return "I'm doing great, thank you for asking! What can I help you with? 😊"

    math_result = _try_math(msg)
    if math_result:
        return math_result

    for topic, response in _TOPIC_RESPONSES.items():
        if topic in msg_lower:
            return response

    if re.match(r'^(what\s+is|define|explain|describe|tell\s+me\s+about)\s+', msg_lower):
        subject = re.sub(r'^(what\s+is|define|explain|describe|tell\s+me\s+about)\s+', '', msg_lower).rstrip('?. ')
        return (
            f"**{subject.title()}** is a great topic! While I'm running in offline "
            f"mode right now, I'd be happy to discuss what I know about {subject}. "
            f"Could you ask a more specific question so I can give you the best answer?"
        )

    if any(k in msg_lower for k in ["write code", "code for", "write a program", "write a function",
                                     "how to code", "implement", "create a script"]):
        return (
            "I'd love to help you write code! Please use the **Code Generation** "
            "feature for the best results — you can specify the language and describe "
            "what you need. Alternatively, tell me the language and what the code should "
            "do, and I'll do my best right here."
        )

    if msg_lower.strip().rstrip('!.') in ["yes", "yeah", "yep", "sure", "ok", "okay"]:
        return "Great! What would you like me to help with next?"
    if msg_lower.strip().rstrip('!.') in ["no", "nah", "nope", "not really"]:
        return "No worries! Let me know whenever you need anything."

    return (
        f"Thanks for your message! I've processed your input: \"{msg[:120]}{'…' if len(msg) > 120 else ''}\"\n\n"
        "Here are some things I can help with:\n"
        "• Ask me questions about programming, tech, or general topics\n"
        "• Use the **Summarise** tab to condense long text\n"
        "• Use the **Code Generation** tab to create code snippets\n"
        "• Try simple maths like \"what is 25 * 4?\"\n\n"
        "How can I assist you?"
    )


# ── Extractive summary fallback ───────────────────────────────────────────────

def _extractive_summary(text: str) -> str:
    """Smart extractive summary — picks the most informative sentences."""
    clean = text.replace("\n", " ").replace("\r", " ")
    clean = re.sub(r'\s+', ' ', clean).strip()
    sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', clean) if len(s.strip()) > 15]

    if not sentences:
        return "Could not generate a summary. The text may be too short or unstructured."

    scored = []
    for i, s in enumerate(sentences):
        score = len(s.split())
        if i < 3:
            score += 10
        scored.append((score, i, s))

    scored.sort(key=lambda x: x[0], reverse=True)
    top = sorted(scored[:3], key=lambda x: x[1])
    summary = " ".join(s for _, _, s in top)

    if not summary.endswith((".", "!", "?")):
        summary += "."
    return summary


# ── Fallback code template ────────────────────────────────────────────────────

def _fallback_code(prompt: str, language: str) -> str:
    """Return a well-structured code template as a fallback."""
    templates = {
        "python": textwrap.dedent(f'''\
            # Generated code for: {prompt}

            def main():
                """
                {prompt}
                """
                # TODO: Implement the logic here
                result = None
                print(f"Result: {{result}}")
                return result

            if __name__ == "__main__":
                main()
        '''),
        "javascript": textwrap.dedent(f'''\
            // Generated code for: {prompt}

            /**
             * {prompt}
             */
            async function main() {{
              // TODO: Implement the logic here
              const result = null;
              console.log("Result:", result);
              return result;
            }}

            main().catch(console.error);
        '''),
        "html": textwrap.dedent(f'''\
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>{prompt}</title>
              <style>
                body {{ font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }}
              </style>
            </head>
            <body>
              <h1>{prompt}</h1>
              <!-- TODO: Add your content here -->
              <p>Generated HTML template for: {prompt}</p>
            </body>
            </html>
        '''),
    }
    return templates.get(language.lower(), templates["python"])


# ── Public API ────────────────────────────────────────────────────────────────

def build_system_prompt(custom_system_prompt: Optional[str] = None) -> str:
    """Build the system prompt, prepending any custom persona prompt if present."""
    general_prompt = (
        "You are a friendly, helpful AI assistant. Answer accurately, naturally, and professionally. "
        "Reply in the same language as the user's input whenever possible."
    )
    if custom_system_prompt and custom_system_prompt.strip():
        return f"{custom_system_prompt.strip()}\n\n{general_prompt}"
    return general_prompt


from services.search_service import search_web, format_search_context
import services.cache_service as _cache


def generate_response(
    message: str,
    history: Optional[list] = None,
    enable_web_search: bool = False,
    custom_system_prompt: Optional[str] = None,
) -> str:
    """Generate a chat response using Groq, with optional custom system persona and web search grounding."""
    system_prompt = build_system_prompt(custom_system_prompt)

    # Perform web search grounding if enabled
    if enable_web_search:
        logger.info(f"Performing real-time web search for query: {message}")
        results = search_web(message)
        search_ctx = format_search_context(results)
        if search_ctx:
            system_prompt += f"\n\n{search_ctx}"

    # Construct messages list: 1 system prompt, optional history, 1 user message
    messages = [{"role": "system", "content": system_prompt}]
    if history:
        for chat_item in history:
            messages.append({"role": "user", "content": chat_item["message"]})
            messages.append({"role": "assistant", "content": chat_item["response"]})
    messages.append({"role": "user", "content": message})

    # Check cache (only for simple single-turn requests without dynamic context)
    _use_cache = not enable_web_search and not history
    if _use_cache:
        cached = _cache.get(message, context=system_prompt[:80])
        if cached:
            logger.info("Serving response from cache.")
            return cached

    # Call Groq API
    final_result = _call_groq(messages, max_tokens=512)
    
    logger.info(
        f"\n--- BACKEND LANGUAGE FLOW AUDIT ---\n"
        f"System prompt: {system_prompt}\n"
        f"Model used: {_GROQ_MODEL}\n"
        f"------------------------------------"
    )

    if final_result:
        if _use_cache:
            _cache.set(message, final_result, context=system_prompt[:80])
        return final_result
        
    fallback = _smart_chat(message)
    if _use_cache:
        _cache.set(message, fallback, context=system_prompt[:80], ttl=300)
    return fallback


def generate_chat_response(
    message: str,
    history: Optional[list] = None,
    enable_web_search: bool = False,
    custom_system_prompt: Optional[str] = None,
) -> str:
    """Compatibility alias mapping generate_chat_response to generate_response."""
    return generate_response(
        message=message,
        history=history,
        enable_web_search=enable_web_search,
        custom_system_prompt=custom_system_prompt
    )


def stream_chat_response(
    message: str,
    history: Optional[list] = None,
    enable_web_search: bool = False,
    custom_system_prompt: Optional[str] = None,
):
    """Yield chunks of generated text for real-time SSE streaming response with optional persona and web search grounding."""
    system_prompt = build_system_prompt(custom_system_prompt)

    # Perform web search grounding if enabled
    if enable_web_search:
        logger.info(f"Performing real-time web search for query: {message}")
        results = search_web(message)
        search_ctx = format_search_context(results)
        if search_ctx:
            system_prompt += f"\n\n{search_ctx}"

    # Construct messages list: 1 system prompt, optional history, 1 user message
    messages = [{"role": "system", "content": system_prompt}]
    if history:
        for chat_item in history:
            messages.append({"role": "user", "content": chat_item["message"]})
            messages.append({"role": "assistant", "content": chat_item["response"]})
    messages.append({"role": "user", "content": message})

    # Check cache (only for simple single-turn requests without dynamic context)
    _use_cache = not enable_web_search and not history
    if _use_cache:
        cached = _cache.get(message, context=system_prompt[:80])
        if cached:
            logger.info("Serving response from cache.")
            return cached

    # Call Groq API (first attempt)
    result = _call_groq(messages, max_tokens=512)
    
    # Apply retry if needed
    final_result, retry_occurred = retry_if_needed(
        lang=lang,
        response_text=result or "",
        message=message,
        history=history,
        system_prompt=system_prompt
    )
    
    final_response_lang = detect_language(final_result or "")
    logger.info(
        f"\n--- BACKEND LANGUAGE FLOW AUDIT ---\n"
        f"Detected language: {lang}\n"
        f"System prompt selected: {system_prompt}\n"
        f"Model used: {_GROQ_MODEL}\n"
        f"Final response language: {final_response_lang}\n"
        f"------------------------------------"
    )

    if final_result:
        if _use_cache:
            _cache.set(message, final_result, context=system_prompt[:80])
        return final_result
        
    fallback = _smart_chat(message)
    if _use_cache:
        _cache.set(message, fallback, context=system_prompt[:80], ttl=300)
    return fallback


def generate_chat_response(
    message: str,
    history: Optional[list] = None,
    enable_web_search: bool = False,
    custom_system_prompt: Optional[str] = None,
) -> str:
    """Compatibility alias mapping generate_chat_response to generate_response."""
    return generate_response(
        message=message,
        history=history,
        enable_web_search=enable_web_search,
        custom_system_prompt=custom_system_prompt
    )


def stream_chat_response(
    message: str,
    history: Optional[list] = None,
    enable_web_search: bool = False,
    custom_system_prompt: Optional[str] = None,
):
    """Yield chunks of generated text for real-time SSE streaming response with optional persona and web search grounding."""
    system_prompt = build_system_prompt(custom_system_prompt)

    if enable_web_search:
        logger.info(f"Performing real-time web search for streaming query: {message}")
        results = search_web(message)
        search_ctx = format_search_context(results)
        if search_ctx:
            system_prompt += f"\n\n{search_ctx}"

    messages = [{"role": "system", "content": system_prompt}]
    if history:
        for chat_item in history:
            messages.append({"role": "user", "content": chat_item["message"]})
            messages.append({"role": "assistant", "content": chat_item["response"]})
    messages.append({"role": "user", "content": message})

    client = _get_groq()
    streamed_anything = False
    full_response_chunks = []

    if client:
        try:
            completion = client.chat.completions.create(
                model=_GROQ_MODEL,
                messages=messages,
                max_tokens=512,
                temperature=0.7,
                stream=True,
            )
            for chunk in completion:
                if chunk.choices and len(chunk.choices) > 0:
                    delta = chunk.choices[0].delta
                    if delta and delta.content:
                        streamed_anything = True
                        full_response_chunks.append(delta.content)
                        yield delta.content
            
            if streamed_anything:
                _log_details(messages, _GROQ_MODEL, response_text="".join(full_response_chunks), exception=None)
        except Exception as exc:
            _log_details(messages, _GROQ_MODEL, response_text=None, exception=exc)

    if not streamed_anything:
        fallback_text = _smart_chat(message)
        _log_details(messages, f"{_GROQ_MODEL} (Fallback to offline)", response_text=fallback_text, exception=None)
        words = fallback_text.split(" ")
        for i, word in enumerate(words):
            yield word + (" " if i < len(words) - 1 else "")




def generate_summary(text: str) -> str:
    """Summarise text using Groq, with extractive fallback and caching."""
    truncated = text[:6000]
    # Use content hash as cache key to avoid storing large texts as keys
    import hashlib
    text_sig = hashlib.md5(truncated.encode()).hexdigest()
    cached = _cache.get(text_sig, context="summary")
    if cached:
        logger.info("Serving summary from cache.")
        return cached

    groq_prompt = (
        "Summarise the following text in 3-5 concise, informative sentences. "
        "Return only the summary, no preamble.\n\n"
        f"{truncated}"
    )
    result = _call_groq(groq_prompt, max_tokens=300)
    if result:
        _cache.set(text_sig, result, context="summary", ttl=3600)  # 1 hour for summaries
        return result
    fallback = _extractive_summary(text)
    _cache.set(text_sig, fallback, context="summary", ttl=3600)
    return fallback


def generate_code(prompt: str, language: str = "python") -> str:
    """Generate code using Groq, with template fallback."""
    lang_map = {
        "python": "Python", "javascript": "JavaScript", "js": "JavaScript",
        "typescript": "TypeScript", "ts": "TypeScript", "java": "Java",
        "c++": "C++", "cpp": "C++", "c#": "C#", "go": "Go", "rust": "Rust",
        "sql": "SQL", "html": "HTML", "css": "CSS", "bash": "Bash", "shell": "Bash",
    }
    lang_display = lang_map.get(language.lower(), language.capitalize())

    groq_prompt = (
        f"Write a complete, working {lang_display} code snippet that: {prompt}\n\n"
        f"Return only the code inside a single fenced code block labelled `{language}`. "
        "No explanations outside the code block."
    )
    result = _call_groq(groq_prompt, max_tokens=800)
    if result:
        return result
    return _fallback_code(prompt, language)
