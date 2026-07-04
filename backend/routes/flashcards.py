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

    result = generate_flashcards(payload.text)

    return result
