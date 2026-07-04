from services.ai_groq import (
    generate_summary_groq,
    generate_flashcards_groq
)

from services.ai_openrouter import (
    generate_summary_openrouter,
    generate_flashcards_openrouter
)

from services.ai_gemini import (
    generate_summary_gemini,
    generate_flashcards_gemini
)

def generate_summary(text):

    try:
        print("Using Groq")
        return generate_summary_groq(text)

    except Exception as e:
        print("Groq Failed:", e)

        try:
            print("Using OpenRouter")
            return generate_summary_openrouter(text)

        except Exception as e:
            print("OpenRouter Failed:", e)

            try:
                print("Using Gemini")
                return generate_summary_gemini(text)

            except Exception as e:
                print("Gemini Failed:", e)
                raise Exception(f"All AI providers failed. Last error (Gemini): {e}")

    try:
        print("Using Groq")
        return generate_flashcards_groq(text)

    except Exception as e:
        print("Groq Failed:", e)

        try:
            print("Using OpenRouter")
            return generate_flashcards_openrouter(text)

        except Exception as e:
            print("OpenRouter Failed:", e)

            try:
                print("Using Gemini")
                return generate_flashcards_gemini(text)

            except Exception as e:
                print("Gemini Failed:", e)
                raise Exception(f"All AI providers failed. Last error (Gemini): {e}")