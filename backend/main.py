from pathlib import Path

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from services.pdf_reader import extract_text
from services.ai import generate_summary

app = FastAPI(title="DeepRead API")

UPLOAD_FOLDER = Path("uploads")
UPLOAD_FOLDER.mkdir(exist_ok=True)

last_uploaded_pdf = None

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "status": "running",
        "project": "DeepRead"
    }


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):

    global last_uploaded_pdf

    if not file.filename.lower().endswith(".pdf"):
        return {
            "success": False,
            "message": "Only PDF files are allowed."
        }

    save_path = UPLOAD_FOLDER / file.filename

    with open(save_path, "wb") as pdf:
        pdf.write(await file.read())

    last_uploaded_pdf = save_path

    text = extract_text(save_path)

    if not text.strip():
        return {
            "success": False,
            "message": "No readable text found in this PDF."
        }

    return {
        "success": True,
        "filename": file.filename,
        "characters": len(text),
        "preview": text[:1000]
    }


@app.post("/summary")
def summary():

    global last_uploaded_pdf

    if last_uploaded_pdf is None:
        return {
            "success": False,
            "message": "Upload a PDF first."
        }

    text = extract_text(last_uploaded_pdf)

    if not text.strip():
        return {
            "success": False,
            "message": "Unable to read text from PDF."
        }

    summary = generate_summary(text)

    return {
        "success": True,
        "summary": summary
    }