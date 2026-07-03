import os
import json
from google import genai
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


def clean_json(text):
    text = text.strip()
    text = text.replace("```json", "")
    text = text.replace("```", "")
    return text.strip()


def generate_summary_gemini(text):

    prompt = f"""
You are an AI study assistant.

Return ONLY valid JSON.

{{
    "summary":"...",
    "key_points":[
        "...",
        "...",
        "...",
        "...",
        "..."
    ],
    "keywords":[
        "...",
        "...",
        "...",
        "...",
        "..."
    ]
}}

PDF:

{text[:7000]}
"""

    try:

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        result = clean_json(response.text)

        return json.loads(result)

    except Exception as e:

        raise Exception(str(e))


def generate_flashcards_gemini(text):

    prompt = f"""
Generate exactly 10 flashcards.

Return ONLY valid JSON.

[
    {{
        "question":"...",
        "answer":"..."
    }}
]

PDF:

{text[:7000]}
"""

    try:

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        result = clean_json(response.text)

        return {
            "success": True,
            "flashcards": json.loads(result)
        }

    except Exception as e:

        raise Exception(str(e))