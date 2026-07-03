from fastapi import APIRouter
from pathlib import Path

from services.pdf_reader import extract_text
from services.ai import generate_flashcards

router = APIRouter()

UPLOAD_FOLDER = Path("uploads")


@router.post("/flashcards")
def flashcards():

    files = list(UPLOAD_FOLDER.glob("*.pdf"))

    files.sort(key=lambda f: f.stat().st_mtime)


    if not files:
        return {
            "success": False,
            "message": "Upload a PDF first."
        }

    pdf = files[-1]

    pdf_data = extract_text(pdf)

    if not pdf_data["success"]:
        return {
            "success": False,
            "message": "Unable to read PDF."
        }

    result = generate_flashcards(pdf_data["text"])

    return result