from pathlib import Path
from routes.flashcards import router as flashcards_router
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from routes.summary import router as summary_router
from services.pdf_reader import extract_text_from_bytes

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

    pdf_bytes = await file.read()

    # Extracted fully in memory, nothing written to disk. This works the
    # same whether running locally or on a serverless host like Vercel.
    result = extract_text_from_bytes(pdf_bytes)

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
        "preview": result["text"][:1000],
        "text": result["text"]
    }


# Serve the frontend (index.html, style.css, script.js, assets/). These live
# inside backend/ itself, alongside main.py, so this works whether Vercel's
# Root Directory is set to "backend" or the repo root. Mounted last so it
# doesn't shadow the API routes above. html=True makes "/" return index.html.
FRONTEND_DIR = Path(__file__).resolve().parent
app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
