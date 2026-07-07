from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional, Dict

from services.ai import generate_chat_answer

router = APIRouter()


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    text: str
    question: str
    history: Optional[List[ChatMessage]] = None


@router.post("/chat")
def chat(payload: ChatRequest):

    if not payload.text or not payload.text.strip():
        return {
            "success": False,
            "message": "Upload a PDF first."
        }

    if not payload.question or not payload.question.strip():
        return {
            "success": False,
            "message": "Type a question first."
        }

    history: List[Dict] = (
        [turn.dict() for turn in payload.history] if payload.history else []
    )

    try:
        result = generate_chat_answer(payload.text, payload.question, history)
    except Exception as e:
        return {
            "success": False,
            "message": f"AI generation failed: {str(e)}"
        }

    return result
