from pathlib import Path
from routes.flashcards import router as flashcards_router
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

import app_state

from routes.summary import router as summary_router
from services.pdf_reader import extract_text

app = FastAPI(title="DeepRead API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(summary_router)
app.include_router(flashcards_router)

UPLOAD_FOLDER = Path("uploads")
UPLOAD_FOLDER.mkdir(exist_ok=True)


@app.get("/api/status")
def home():

    return {
        "status": "running",
        "project": "DeepRead"
    }


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):

    if not file.filename.lower().endswith(".pdf"):

        return {
            "success": False,
            "message": "Only PDF files are allowed."
        }

    save_path = UPLOAD_FOLDER / file.filename

    with open(save_path, "wb") as pdf:
        pdf.write(await file.read())

    app_state.last_uploaded_pdf = str(save_path)

    result = extract_text(str(save_path))

    if not result["success"]:

        return {
            "success": False,
            "message": "Unable to read PDF."
        }

    return {
        "success": True,
        "filename": file.filename,
        "pages": result["pages"],
        "characters": len(result["text"]),
        "preview": result["text"][:1000]
    }

FRONTEND_DIR = Path(__file__).resolve().parent
app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")