from fastapi import APIRouter

import app_state

from services.pdf_reader import extract_text
from services.ai import generate_summary

router = APIRouter()


@router.post("/summary")
def summary():

    if app_state.last_uploaded_pdf is None:

        return {
            "success": False,
            "message": "Upload a PDF first."
        }

    pdf = extract_text(app_state.last_uploaded_pdf)

    if not pdf["success"]:

        return {
            "success": False,
            "message": "Unable to read PDF."
        }

    result = generate_summary(pdf["text"])

    return {
        "success": True,
        "pages": pdf["pages"],
        "summary": result
    }