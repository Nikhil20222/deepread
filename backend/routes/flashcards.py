from fastapi import APIRouter
from pydantic import BaseModel

from services.ai import generate_flashcards

router = APIRouter()


class FlashcardRequest(BaseModel):
    text: str


@router.post("/flashcards")
def flashcards(payload: FlashcardRequest):

    if not payload.text or not payload.text.strip():
        return {
            "success": False,
            "message": "Upload a PDF first."
        }

    try:
        result = generate_flashcards(payload.text)
    except Exception as e:
        return {
            "success": False,
            "message": f"AI generation failed: {str(e)}"
        }

    return result
