const pdfInput = document.getElementById("pdfInput");
const uploadBtn = document.getElementById("uploadBtn");

const previewText = document.getElementById("previewText");
const summaryText = document.getElementById("summaryText");

const summaryBtn = document.getElementById("summaryBtn");

const flashcardBtn = document.getElementById("flashcardBtn");

const question = document.getElementById("flashQuestion");
const answer = document.getElementById("flashAnswer");

const prevBtn = document.getElementById("prevFlash");
const nextBtn = document.getElementById("nextFlash");

let flashcards = [];
let currentCard = 0;

uploadBtn.addEventListener("click", uploadPDF);
summaryBtn.addEventListener("click", generateSummary);
flashcardBtn.addEventListener("click", generateFlashcards);
async function uploadPDF() {

    if (!pdfInput.files.length) {
        alert("Select a PDF first");
        return;
    }

    uploadBtn.disabled = true;
    uploadBtn.innerText = "Uploading...";

    const formData = new FormData();
    formData.append("file", pdfInput.files[0]);

    try {

        const response = await fetch("http://127.0.0.1:8000/upload", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        console.log("UPLOAD RESPONSE:", data);

        if (!data.success) {
            alert(data.message);
            uploadBtn.disabled = false;
            uploadBtn.innerText = "Upload PDF";
            return;
        }

        previewText.innerHTML = `
            <h3>${data.filename ?? "Untitled"}</h3>

            <p><b>Characters:</b> ${data.characters ?? 0}</p>

            <hr>

            <pre>${data.preview && data.preview.trim().length > 0 ? data.preview : "No preview available (backend returned empty preview)"}</pre>
        `;

        alert("PDF Uploaded Successfully");

    } catch (err) {

        console.error(err);
        alert("Upload Failed: " + err.message);

    }

    uploadBtn.disabled = false;
    uploadBtn.innerText = "Upload PDF";

}
async function generateSummary() {

    summaryBtn.disabled = true;
    summaryBtn.innerText = "Generating...";

    try {

        const response = await fetch("http://127.0.0.1:8000/summary", {
            method: "POST"
        });

        const data = await response.json();

        console.log(data);

        if (!data.success) {

            summaryText.innerHTML = `
                <p style="color:red">${data.message}</p>
            `;

            return;
        }

        const result = data.summary;

        if (!result) {
            summaryText.innerHTML = "No summary returned.";
            return;
        }

        summaryText.innerHTML = `
            <h3>Summary</h3>
            <p>${result.summary}</p>

            <h4>Key Points</h4>
            <ul>
                ${result.key_points.map(x => `<li>${x}</li>`).join("")}
            </ul>

            <h4>Keywords</h4>
            <p>${result.keywords.join(", ")}</p>
        `;

    } catch (err) {

        console.log(err);

        summaryText.innerHTML =
            "<p style='color:red'>Server Error</p>";
    }

    summaryBtn.disabled = false;
    summaryBtn.innerText = "Generate Summary";
}
async function generateFlashcards() {

    flashcardBtn.disabled = true;
    flashcardBtn.innerText = "Generating...";

    try {

        const response = await fetch("http://127.0.0.1:8000/flashcards", {
            method: "POST"
        });

        const data = await response.json();

        console.log("FLASHCARD RESPONSE:", data);

        if (!data.success) {
            alert(data.error || data.message || "Unable to generate flashcards");
            flashcardBtn.disabled = false;
            flashcardBtn.innerText = "Generate Flashcards";
            return;
        }

        // Backend kabhi {flashcards:[...]} bhej raha hai
        // aur kabhi {success:true, flashcards:{success:true, flashcards:[...]}}
        if (Array.isArray(data.flashcards)) {

            flashcards = data.flashcards;

        } else if (
            data.flashcards &&
            Array.isArray(data.flashcards.flashcards)
        ) {

            flashcards = data.flashcards.flashcards;

        } else {

            console.log("Unknown Response:", data);
            alert("Invalid flashcard response");
            flashcardBtn.disabled = false;
            flashcardBtn.innerText = "Generate Flashcards";
            return;
        }

        currentCard = 0;

        showCard();

    }
    catch (err) {

        console.error(err);
        alert("Server Error");

    }

    flashcardBtn.disabled = false;
    flashcardBtn.innerText = "Generate Flashcards";
}
function showCard() {

    if (!flashcards || flashcards.length === 0) {
        question.innerText = "No Flashcards";
        answer.innerText = "";
        return;
    }

    question.innerText = flashcards[currentCard].question || "";
    answer.innerText = flashcards[currentCard].answer || "";
}

nextBtn.onclick = () => {

    if (currentCard < flashcards.length - 1) {
        currentCard++;
        showCard();
    }

}

prevBtn.onclick = () => {

    if (currentCard > 0) {
        currentCard--;
        showCard();
    }

}