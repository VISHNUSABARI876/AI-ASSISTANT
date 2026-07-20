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


def _call_groq(prompt: str, max_tokens: int = 512) -> Optional[str]:
    """Call Groq and return the text response, or None on failure."""
    client = _get_groq()
    if client is None:
        return None
    try:
        completion = client.chat.completions.create(
            model=_GROQ_MODEL,
            messages=[
                {"role": "system", "content": "You are a helpful AI assistant. Always respond with a clear, informative answer."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=max_tokens,
            temperature=0.7,
        )
        choice = completion.choices[0]
        text = choice.message.content
        if text:
            text = text.strip()
        if not text:
            logger.warning(f"Groq returned empty content. Finish reason: {choice.finish_reason}")
            print(f"[Groq] Empty response — finish_reason={choice.finish_reason}, model={_GROQ_MODEL}")
            return None
        return text
    except Exception as exc:
        traceback.print_exc()
        logger.error(f"Groq API error: {exc}")
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

def generate_chat_response(message: str) -> str:
    """Generate a chat response using Groq, with rule-based fallback."""
    groq_prompt = (
        "You are a helpful, concise AI assistant. "
        "Answer the user's message in plain text (no excessive markdown unless it helps readability). "
        f"User: {message}"
    )
    result = _call_groq(groq_prompt, max_tokens=512)
    if result:
        return result
    return _smart_chat(message)


def generate_summary(text: str) -> str:
    """Summarise text using Groq, with extractive fallback."""
    truncated = text[:6000]
    groq_prompt = (
        "Summarise the following text in 3-5 concise, informative sentences. "
        "Return only the summary, no preamble.\n\n"
        f"{truncated}"
    )
    result = _call_groq(groq_prompt, max_tokens=300)
    if result:
        return result
    return _extractive_summary(text)


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
