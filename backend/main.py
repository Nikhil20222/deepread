from pathlib import Path

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

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
    return {"message": "DeepRead API is running 🚀"}


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):

    if not file.filename.endswith(".pdf"):
        return {
            "success": False,
            "message": "Only PDF files are allowed."
        }

    save_path = UPLOAD_FOLDER / file.filename

    with open(save_path, "wb") as pdf:
        pdf.write(await file.read())

    return {
        "success": True,
        "filename": file.filename
    }