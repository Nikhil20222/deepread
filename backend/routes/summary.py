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

    result = generate_summary(payload.text)

    return {
        "success": True,
        "summary": result
    }
