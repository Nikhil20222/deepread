import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

_client = None


def get_client():
    global _client
    if _client is None:
        _client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    return _client


def clean_json(text):
    text = text.replace("```json", "")
    text = text.replace("```", "")
    return text.strip()


def generate_summary_groq(text):

    prompt = f"""
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

    response = get_client().chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.3
    )

    result = response.choices[0].message.content

    return json.loads(clean_json(result))


def generate_flashcards_groq(text):

    prompt = f"""
Return ONLY valid JSON.

Generate exactly 10 flashcards.

[
    {{
        "question":"...",
        "answer":"..."
    }}
]

PDF:

{text[:7000]}
"""

    response = get_client().chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.3
    )

    result = response.choices[0].message.content

    return {
        "success": True,
        "flashcards": json.loads(clean_json(result))
    }
