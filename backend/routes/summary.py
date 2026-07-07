from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

from services.ai import generate_summary

router = APIRouter()


class SummaryRequest(BaseModel):
    text: str
    mode: Optional[str] = "detailed"  # "quick" | "detailed" | "exam"


@router.post("/summary")
def summary(payload: SummaryRequest):

    if not payload.text or not payload.text.strip():

        return {
            "success": False,
            "message": "Upload a PDF first."
        }

    mode = payload.mode if payload.mode in ("quick", "detailed", "exam") else "detailed"

    try:
        result = generate_summary(payload.text, mode)
    except Exception as e:
        return {
            "success": False,
            "message": f"AI generation failed: {str(e)}"
        }

    return {
        "success": True,
        "mode": mode,
        "summary": result
    }
