from services.ai_groq import (
    generate_summary_groq,
    generate_flashcards_groq,
    generate_quiz_groq,
    generate_mindmap_groq,
    generate_section_summary_groq,
    generate_chat_answer_groq
)

from services.ai_openrouter import (
    generate_summary_openrouter,
    generate_flashcards_openrouter,
    generate_quiz_openrouter,
    generate_mindmap_openrouter,
    generate_section_summary_openrouter,
    generate_chat_answer_openrouter
)

from services.ai_gemini import (
    generate_summary_gemini,
    generate_flashcards_gemini,
    generate_quiz_gemini,
    generate_mindmap_gemini,
    generate_section_summary_gemini,
    generate_chat_answer_gemini
)

from services.ai_cerebras import (
    generate_summary_cerebras,
    generate_flashcards_cerebras,
    generate_quiz_cerebras,
    generate_mindmap_cerebras,
    generate_section_summary_cerebras,
    generate_chat_answer_cerebras
)


def _with_fallback(label, providers, args=()):
    """Try each provider in order until one works.

    providers is a list of (name, function) tuples, e.g.
    [("Groq", fn1), ("OpenRouter", fn2), ("Gemini", fn3), ("Cerebras", fn4)]
    Order = priority. First one that succeeds wins.
    """

    last_error = None

    for name, fn in providers:
        try:
            print(f"Using {name} ({label})")
            return fn(*args)

        except Exception as e:
            print(f"{name} Failed ({label}):", e)
            last_error = e

    raise Exception(f"All AI providers failed. Last error: {last_error}")


def generate_summary(text, mode="detailed"):
    return _with_fallback(
        "summary",
        [
            ("Groq", generate_summary_groq),
            ("OpenRouter", generate_summary_openrouter),
            ("Gemini", generate_summary_gemini),
            ("Cerebras", generate_summary_cerebras),
        ],
        args=(text, mode)
    )


def generate_flashcards(text):
    return _with_fallback(
        "flashcards",
        [
            ("Groq", generate_flashcards_groq),
            ("OpenRouter", generate_flashcards_openrouter),
            ("Gemini", generate_flashcards_gemini),
            ("Cerebras", generate_flashcards_cerebras),
        ],
        args=(text,)
    )


def generate_quiz(text):
    return _with_fallback(
        "quiz",
        [
            ("Groq", generate_quiz_groq),
            ("OpenRouter", generate_quiz_openrouter),
            ("Gemini", generate_quiz_gemini),
            ("Cerebras", generate_quiz_cerebras),
        ],
        args=(text,)
    )


def generate_mindmap(text):
    return _with_fallback(
        "mindmap",
        [
            ("Groq", generate_mindmap_groq),
            ("OpenRouter", generate_mindmap_openrouter),
            ("Gemini", generate_mindmap_gemini),
            ("Cerebras", generate_mindmap_cerebras),
        ],
        args=(text,)
    )


def generate_section_summary(text):
    return _with_fallback(
        "section_summary",
        [
            ("Groq", generate_section_summary_groq),
            ("OpenRouter", generate_section_summary_openrouter),
            ("Gemini", generate_section_summary_gemini),
            ("Cerebras", generate_section_summary_cerebras),
        ],
        args=(text,)
    )


def generate_chat_answer(text, question, history=None):
    return _with_fallback(
        "chat",
        [
            ("Groq", generate_chat_answer_groq),
            ("OpenRouter", generate_chat_answer_openrouter),
            ("Gemini", generate_chat_answer_gemini),
            ("Cerebras", generate_chat_answer_cerebras),
        ],
        args=(text, question, history)
    )
