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


GROUNDING_RULE = """
Rules you must follow:
- Base your answer ONLY on the PDF text given below. Do not use outside knowledge.
- Do NOT invent facts, numbers, names or details that are not in the text.
- If the text is too short or unclear for a full answer, keep it short instead of making things up.
"""


def _summary_prompt(text, mode):

    if mode == "quick":
        shape = """{
    "summary":"A tight 2-3 sentence summary of the whole document.",
    "key_points":["...", "...", "..."],
    "keywords":["...", "...", "..."]
}"""
    elif mode == "exam":
        shape = """{
    "summary":"A clear summary written for last-minute exam revision.",
    "key_points":["...", "...", "...", "...", "..."],
    "keywords":["...", "...", "...", "...", "..."],
    "exam_notes":["Important point likely to be asked in exams", "...", "...", "...", "..."]
}"""
    else:
        shape = """{
    "summary":"A well-rounded summary of the document, 4-6 sentences.",
    "key_points":["...", "...", "...", "...", "..."],
    "keywords":["...", "...", "...", "...", "..."]
}"""

    return f"""
You are a study assistant summarizing a document for a student.
{GROUNDING_RULE}

Return ONLY valid JSON, in this exact shape (no extra keys, no comments):

{shape}

PDF:

{text[:7000]}
"""


def generate_summary_groq(text, mode="detailed"):

    prompt = _summary_prompt(text, mode)

    response = get_client().chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.2
    )

    result = response.choices[0].message.content

    return json.loads(clean_json(result))


def generate_flashcards_groq(text):

    prompt = f"""
You are creating flashcards to help a student revise.
{GROUNDING_RULE}
- Each flashcard must test a single fact or idea actually present in the text.
- Keep answers short and precise (1-2 sentences).

Return ONLY valid JSON. Generate exactly 10 flashcards.

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
        temperature=0.2
    )

    result = response.choices[0].message.content

    return {
        "success": True,
        "flashcards": json.loads(clean_json(result))
    }


def generate_quiz_groq(text):

    prompt = f"""
You are creating a multiple-choice quiz to test understanding of a document.
{GROUNDING_RULE}
- Each question must have exactly 4 options.
- Only one option is correct, and it must be clearly supported by the text.
- Keep the wrong options plausible but clearly wrong on a careful re-read of the text.

Return ONLY valid JSON. Generate exactly 5 questions.

[
    {{
        "question":"...",
        "options":["...", "...", "...", "..."],
        "answer":"the exact text of the correct option",
        "explanation":"one line on why this is correct, based on the PDF"
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
        temperature=0.2
    )

    result = response.choices[0].message.content

    return {
        "success": True,
        "quiz": json.loads(clean_json(result))
    }


def generate_mindmap_groq(text):

    prompt = f"""
You are turning a document into a mind map.
{GROUNDING_RULE}
- The root node is the main topic of the document.
- Each node should be a short phrase (max 6 words), not a full sentence.
- Go at most 3 levels deep (root -> branches -> sub-branches).
- Only include branches that are actually discussed in the text.

Return ONLY valid JSON, in this exact shape:

{{
    "title": "Main topic",
    "children": [
        {{
            "title": "Branch",
            "children": [
                {{"title": "Sub-branch", "children": []}}
            ]
        }}
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
        temperature=0.2
    )

    result = response.choices[0].message.content

    return {
        "success": True,
        "mindmap": json.loads(clean_json(result))
    }


def generate_section_summary_groq(text):

    prompt = f"""
You are splitting a document into its natural sections and summarizing each one.
{GROUNDING_RULE}
- Break the document into 3-6 logical sections based on how it actually flows (topics, headings, or paragraph groups).
- Give each section a short, descriptive title.
- Summarize each section in 2-3 sentences using only what that section says.

Return ONLY valid JSON, in this exact shape:

[
    {{
        "title": "Section title",
        "summary": "2-3 sentence summary of just this section"
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
        temperature=0.2
    )

    result = response.choices[0].message.content

    return {
        "success": True,
        "sections": json.loads(clean_json(result))
    }


def generate_chat_answer_groq(text, question, history=None):

    history = history or []

    history_text = ""
    for turn in history[-6:]:
        role = "Student" if turn.get("role") == "user" else "Assistant"
        history_text += f"{role}: {turn.get('content', '')}\n"

    prompt = f"""
You are answering a student's question about the PDF document below.
{GROUNDING_RULE}
- If the answer is not in the document, say clearly that the document doesn't cover it. Do not guess.
- Keep the answer focused and to the point.

PDF:

{text[:7000]}

Conversation so far:
{history_text}

Student's question: {question}

Return ONLY valid JSON, in this exact shape:

{{
    "answer": "..."
}}
"""

    response = get_client().chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.2
    )

    result = response.choices[0].message.content
    parsed = json.loads(clean_json(result))

    return {
        "success": True,
        "answer": parsed.get("answer", "")
    }
