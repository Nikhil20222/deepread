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


def generate_summary(text):

    prompt = f"""
You are an AI study assistant.

Read the following PDF and return ONLY valid JSON.

Format:

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

{text[:8000]}
"""

    try:

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        result = clean_json(response.text)

        return json.loads(result)

    except Exception as error:

        return {
            "success": False,
            "summary": "",
            "key_points": [],
            "keywords": [],
            "error": str(error)
        }


def generate_flashcards(text):

    prompt = f"""
Read the following PDF.

Generate exactly 10 flashcards.

Return ONLY valid JSON.

Format:

[
    {{
        "question":"...",
        "answer":"..."
    }}
]

PDF:

{text[:8000]}
"""

    try:

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        result = clean_json(response.text)

        cards = json.loads(result)

        return {
            "success": True,
            "flashcards": cards
        }

    except Exception as error:

        return {
            "success": False,
            "flashcards": [],
            "error": str(error)
        }