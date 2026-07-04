import os
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

_client = None


def get_client():
    global _client
    if _client is None:
        _client = OpenAI(
            api_key=os.getenv("OPENROUTER_API_KEY"),
            base_url="https://openrouter.ai/api/v1"
        )
    return _client


def clean_json(text):
    text = text.replace("```json", "")
    text = text.replace("```", "")
    return text.strip()


def generate_summary_openrouter(text):

    prompt = f"""
Return ONLY valid JSON.

{{
    "summary":"...",
    "key_points":["...","...","...","...","..."],
    "keywords":["...","...","...","...","..."]
}}

PDF:

{text[:7000]}
"""

    response = get_client().chat.completions.create(
        model="meta-llama/llama-3.3-70b-instruct:free",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    result = response.choices[0].message.content

    return json.loads(clean_json(result))


def generate_flashcards_openrouter(text):

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

    response = get_client().chat.completions.create(
        model="deepseek/deepseek-chat-v3-0324:free",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    result = response.choices[0].message.content

    return {
        "success": True,
        "flashcards": json.loads(clean_json(result))
    }
