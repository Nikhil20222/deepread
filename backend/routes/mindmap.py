from fastapi import APIRouter
from pydantic import BaseModel

from services.ai import generate_mindmap

router = APIRouter()


class MindmapRequest(BaseModel):
    text: str


@router.post("/mindmap")
def mindmap(payload: MindmapRequest):

    if not payload.text or not payload.text.strip():
        return {
            "success": False,
            "message": "Upload a PDF first."
        }

    try:
        result = generate_mindmap(payload.text)
    except Exception as e:
        return {
            "success": False,
            "message": f"AI generation failed: {str(e)}"
        }

    return result
