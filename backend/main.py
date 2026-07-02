from pathlib import Path

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from services.pdf_reader import extract_text

app = FastAPI()

UPLOAD_FOLDER = Path("uploads")
UPLOAD_FOLDER.mkdir(exist_ok=True)

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
        "message": "DeepRead API is running 🚀"
    }


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):

    # Check PDF
    if not file.filename.endswith(".pdf"):
        return {
            "success": False,
            "message": "Only PDF files are allowed."
        }

    # Save PDF
    save_path = UPLOAD_FOLDER / file.filename

    with open(save_path, "wb") as pdf:
        pdf.write(await file.read())

    # Extract text
    text = extract_text(save_path)

    # Return response
    return {
        "success": True,
        "filename": file.filename,
        "characters": len(text),
        "preview": text[:500]
    }