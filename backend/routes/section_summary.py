from fastapi import APIRouter
from pydantic import BaseModel

from services.ai import generate_section_summary

router = APIRouter()


class SectionSummaryRequest(BaseModel):
    text: str


@router.post("/section-summary")
def section_summary(payload: SectionSummaryRequest):

    if not payload.text or not payload.text.strip():
        return {
            "success": False,
            "message": "Upload a PDF first."
        }

    try:
        result = generate_section_summary(payload.text)
    except Exception as e:
        return {
            "success": False,
            "message": f"AI generation failed: {str(e)}"
        }

    return result
