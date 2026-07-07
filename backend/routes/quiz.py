from fastapi import APIRouter
from pydantic import BaseModel

from services.ai import generate_quiz

router = APIRouter()


class QuizRequest(BaseModel):
    text: str


@router.post("/quiz")
def quiz(payload: QuizRequest):

    if not payload.text or not payload.text.strip():
        return {
            "success": False,
            "message": "Upload a PDF first."
        }

    try:
        result = generate_quiz(payload.text)
    except Exception as e:
        return {
            "success": False,
            "message": f"AI generation failed: {str(e)}"
        }

    return result
