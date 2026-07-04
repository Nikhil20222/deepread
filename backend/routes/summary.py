from fastapi import APIRouter
from pydantic import BaseModel

from services.ai import generate_summary

router = APIRouter()


class SummaryRequest(BaseModel):
    text: str


@router.post("/summary")
def summary(payload: SummaryRequest):

    if not payload.text or not payload.text.strip():

        return {
            "success": False,
            "message": "Upload a PDF first."
        }

    try:
        result = generate_summary(payload.text)
    except Exception as e:
        return {
            "success": False,
            "message": f"AI generation failed: {str(e)}"
        }

    return {
        "success": True,
        "summary": result
    }
