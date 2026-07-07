// Same-origin by default. If you ever host the frontend and backend
// separately, set this to your backend's full URL, e.g. "https://your-backend.onrender.com"
const API_BASE = "";

const pdfInput = document.getElementById("pdfInput");
const uploadBtn = document.getElementById("uploadBtn");

const pdfFrame = document.getElementById("pdfFrame");
const previewText = document.getElementById("previewText");
const summaryText = document.getElementById("summaryText");

let lastObjectUrl = null;
let extractedText = "";

/* ---------- Loading overlay (bug fix: this was never shown before) ---------- */

const loadingBox = document.getElementById("loading");
const loadingText = document.getElementById("loadingText");

function showLoading(message) {
    loadingText.innerText = message || "Processing...";
    loadingBox.classList.add("visible");
}

function hideLoading() {
    loadingBox.classList.remove("visible");
}

/* ---------- Dark mode ---------- */

const themeToggle = document.getElementById("themeToggle");

function applyTheme(theme) {
    if (theme === "dark") {
        document.body.classList.add("dark");
        themeToggle.innerText = "☀️";
    } else {
        document.body.classList.remove("dark");
        themeToggle.innerText = "🌙";
    }
}

const savedTheme = localStorage.getItem("deepread-theme") || "light";
applyTheme(savedTheme);

themeToggle.addEventListener("click", () => {
    const isDark = document.body.classList.contains("dark");
    const next = isDark ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem("deepread-theme", next);
});

/* ---------- PDF preview ---------- */

function showPdfPreview(file) {
    if (!file) return;

    if (lastObjectUrl) {
        URL.revokeObjectURL(lastObjectUrl);
    }

    lastObjectUrl = URL.createObjectURL(file);
    pdfFrame.src = lastObjectUrl;
    pdfFrame.style.display = "block";
}

// Show the PDF as soon as the user picks a file, no need to wait for upload
pdfInput.addEventListener("change", () => {
    if (pdfInput.files.length) {
        showPdfPreview(pdfInput.files[0]);
    }
});

/* ---------- Upload ---------- */

uploadBtn.addEventListener("click", uploadPDF);

async function uploadPDF() {

    if (!pdfInput.files.length) {
        alert("Select a PDF first");
        return;
    }

    uploadBtn.disabled = true;
    uploadBtn.innerText = "Uploading...";
    showLoading("Reading your PDF...");

    const formData = new FormData();
    formData.append("file", pdfInput.files[0]);

    try {

        const response = await fetch(`${API_BASE}/upload`, {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        console.log("UPLOAD RESPONSE:", data);

        if (!data.success) {
            alert(data.message);
            uploadBtn.disabled = false;
            uploadBtn.innerText = "Upload PDF";
            hideLoading();
            return;
        }

        showPdfPreview(pdfInput.files[0]);

        extractedText = data.text || "";

        previewText.innerHTML = `
            <h3>${data.filename ?? "Untitled"}</h3>

            <p><b>Characters:</b> ${data.characters ?? 0}</p>

            <hr>

            <pre>${data.preview && data.preview.trim().length > 0 ? data.preview : "No preview available (backend returned empty preview)"}</pre>
        `;

        resetAllFeatures();

        alert("PDF Uploaded Successfully");

    } catch (err) {

        console.error(err);
        alert("Upload Failed: " + err.message);

    }

    uploadBtn.disabled = false;
    uploadBtn.innerText = "Upload PDF";
    hideLoading();
}

function resetAllFeatures() {
    // A fresh PDF means old answers from a previous document should not linger.
    flashcards = [];
    currentCard = 0;
    showCard();

    quizData = [];
    quizList.innerHTML = `<p class="empty-hint">Generate a quiz to get started.</p>`;
    quizScore.innerText = "";

    mindmapCard.innerHTML = `<p class="empty-hint">Generate a mind map to get started.</p>`;

    sectionList.innerHTML = `<p class="empty-hint">Generate section summaries to get started.</p>`;

    chatHistory = [];
    chatMessages.innerHTML = `
        <div class="chat-msg chat-msg-bot">
            PDF loaded. Ask me anything about it.
        </div>
    `;
}

/* ---------- Summary (with Quick / Detailed / Exam Notes modes) ---------- */

const summaryBtn = document.getElementById("summaryBtn");
summaryBtn.addEventListener("click", generateSummary);

function getSelectedSummaryMode() {
    const checked = document.querySelector('input[name="summaryMode"]:checked');
    return checked ? checked.value : "detailed";
}

async function generateSummary() {

    if (!extractedText) {
        summaryText.innerHTML = `<p style="color:var(--danger)">Upload a PDF first.</p>`;
        return;
    }

    const mode = getSelectedSummaryMode();

    summaryBtn.disabled = true;
    summaryBtn.innerText = "Generating...";
    showLoading("Writing your summary...");

    try {

        const response = await fetch(`${API_BASE}/summary`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: extractedText, mode })
        });

        const data = await response.json();

        console.log(data);

        if (!data.success) {

            summaryText.innerHTML = `
                <p style="color:var(--danger)">${data.message}</p>
            `;

            hideLoading();
            summaryBtn.disabled = false;
            summaryBtn.innerText = "Generate Summary";
            return;
        }

        const result = data.summary;

        if (!result) {
            summaryText.innerHTML = "No summary returned.";
            hideLoading();
            summaryBtn.disabled = false;
            summaryBtn.innerText = "Generate Summary";
            return;
        }

        let html = `
            <h3>Summary</h3>
            <p>${result.summary}</p>

            <h4>Key Points</h4>
            <ul>
                ${(result.key_points || []).map(x => `<li>${x}</li>`).join("")}
            </ul>

            <h4>Keywords</h4>
            <p>${(result.keywords || []).map(k => `<span class="keyword">${k}</span>`).join("")}</p>
        `;

        if (mode === "exam" && Array.isArray(result.exam_notes)) {
            html += `
                <h4>Exam Notes</h4>
                <ul>
                    ${result.exam_notes.map(x => `<li>${x}</li>`).join("")}
                </ul>
            `;
        }

        summaryText.innerHTML = html;

    } catch (err) {

        console.log(err);

        summaryText.innerHTML =
            "<p style='color:var(--danger)'>Server Error</p>";
    }

    summaryBtn.disabled = false;
    summaryBtn.innerText = "Generate Summary";
    hideLoading();
}

/* ---------- Section-wise summary ---------- */

const sectionSummaryBtn = document.getElementById("sectionSummaryBtn");
const sectionList = document.getElementById("sectionList");

sectionSummaryBtn.addEventListener("click", generateSectionSummary);

async function generateSectionSummary() {

    if (!extractedText) {
        sectionList.innerHTML = `<p class="empty-hint" style="color:var(--danger)">Upload a PDF first.</p>`;
        return;
    }

    sectionSummaryBtn.disabled = true;
    sectionSummaryBtn.innerText = "Generating...";
    showLoading("Splitting the document into sections...");

    try {

        const response = await fetch(`${API_BASE}/section-summary`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: extractedText })
        });

        const data = await response.json();

        if (!data.success) {
            sectionList.innerHTML = `<p class="empty-hint" style="color:var(--danger)">${data.message || "Unable to generate section summaries."}</p>`;
        } else {

            const sections = data.sections || [];

            if (!sections.length) {
                sectionList.innerHTML = `<p class="empty-hint">No sections found.</p>`;
            } else {
                sectionList.innerHTML = sections.map(s => `
                    <div class="section-item">
                        <h4>${s.title || "Section"}</h4>
                        <p>${s.summary || ""}</p>
                    </div>
                `).join("");
            }
        }

    } catch (err) {
        console.error(err);
        sectionList.innerHTML = `<p class="empty-hint" style="color:var(--danger)">Server Error</p>`;
    }

    sectionSummaryBtn.disabled = false;
    sectionSummaryBtn.innerText = "Generate Section Summaries";
    hideLoading();
}

/* ---------- Flashcards (flip + Show Answer) ---------- */

const flashcardBtn = document.getElementById("flashcardBtn");

const question = document.getElementById("flashQuestion");
const answer = document.getElementById("flashAnswer");
const flashcardInner = document.getElementById("flashcardInner");
const showAnswerBtn = document.getElementById("showAnswerBtn");
const flashCounter = document.getElementById("flashCounter");

const prevBtn = document.getElementById("prevFlash");
const nextBtn = document.getElementById("nextFlash");

let flashcards = [];
let currentCard = 0;

flashcardBtn.addEventListener("click", generateFlashcards);

async function generateFlashcards() {

    if (!extractedText) {
        alert("Upload a PDF first.");
        return;
    }

    flashcardBtn.disabled = true;
    flashcardBtn.innerText = "Generating...";
    showLoading("Building your flashcards...");

    try {

        const response = await fetch(`${API_BASE}/flashcards`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: extractedText })
        });

        const data = await response.json();

        console.log("FLASHCARD RESPONSE:", data);

        if (!data.success) {
            alert(data.error || data.message || "Unable to generate flashcards");
            flashcardBtn.disabled = false;
            flashcardBtn.innerText = "Generate Flashcards";
            hideLoading();
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
            hideLoading();
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
    hideLoading();
}

function showCard() {

    flashcardInner.classList.remove("flipped");

    if (!flashcards || flashcards.length === 0) {
        question.innerText = "No Flashcards";
        answer.innerText = "";
        flashCounter.innerText = "";
        return;
    }

    question.innerText = flashcards[currentCard].question || "";
    answer.innerText = flashcards[currentCard].answer || "";
    flashCounter.innerText = `Card ${currentCard + 1} of ${flashcards.length}`;
}

showAnswerBtn.addEventListener("click", () => {
    if (!flashcards.length) return;
    flashcardInner.classList.toggle("flipped");
});

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

/* ---------- Quiz generator ---------- */

const quizBtn = document.getElementById("quizBtn");
const quizList = document.getElementById("quizList");
const quizScore = document.getElementById("quizScore");

let quizData = [];

quizBtn.addEventListener("click", generateQuiz);

async function generateQuiz() {

    if (!extractedText) {
        quizList.innerHTML = `<p class="empty-hint" style="color:var(--danger)">Upload a PDF first.</p>`;
        return;
    }

    quizBtn.disabled = true;
    quizBtn.innerText = "Generating...";
    quizScore.innerText = "";
    showLoading("Writing quiz questions...");

    try {

        const response = await fetch(`${API_BASE}/quiz`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: extractedText })
        });

        const data = await response.json();

        if (!data.success) {
            quizList.innerHTML = `<p class="empty-hint" style="color:var(--danger)">${data.message || "Unable to generate quiz."}</p>`;
        } else {

            quizData = data.quiz || [];
            renderQuiz();
        }

    } catch (err) {
        console.error(err);
        quizList.innerHTML = `<p class="empty-hint" style="color:var(--danger)">Server Error</p>`;
    }

    quizBtn.disabled = false;
    quizBtn.innerText = "Generate Quiz";
    hideLoading();
}

function renderQuiz() {

    if (!quizData.length) {
        quizList.innerHTML = `<p class="empty-hint">No quiz questions returned.</p>`;
        return;
    }

    quizList.innerHTML = quizData.map((q, qIndex) => `
        <div class="quiz-item" id="quiz-item-${qIndex}">
            <h4>${qIndex + 1}. ${q.question}</h4>
            <div class="quiz-options">
                ${(q.options || []).map((opt, optIndex) => `
                    <button class="quiz-option" data-q="${qIndex}" data-opt="${optIndex}">
                        ${opt}
                    </button>
                `).join("")}
            </div>
            <p class="quiz-explanation" id="quiz-explanation-${qIndex}"></p>
        </div>
    `).join("");

    quizList.querySelectorAll(".quiz-option").forEach(btn => {
        btn.addEventListener("click", handleQuizAnswer);
    });
}

function handleQuizAnswer(e) {

    const qIndex = Number(e.target.dataset.q);
    const q = quizData[qIndex];

    const optionButtons = document.querySelectorAll(`#quiz-item-${qIndex} .quiz-option`);

    optionButtons.forEach(btn => {
        btn.disabled = true;

        if (btn.innerText.trim() === q.answer) {
            btn.classList.add("correct");
        } else if (btn === e.target) {
            btn.classList.add("wrong");
        }
    });

    const explanationEl = document.getElementById(`quiz-explanation-${qIndex}`);
    if (explanationEl && q.explanation) {
        explanationEl.innerText = q.explanation;
    }

    updateQuizScore();
}

function updateQuizScore() {

    let answered = 0;
    let correct = 0;

    quizData.forEach((q, qIndex) => {
        const optionButtons = document.querySelectorAll(`#quiz-item-${qIndex} .quiz-option`);
        const wasAnswered = Array.from(optionButtons).some(btn => btn.disabled);

        if (wasAnswered) {
            answered++;
            const gotItRight = Array.from(optionButtons).some(
                btn => btn.classList.contains("wrong")
            ) === false;
            if (gotItRight) correct++;
        }
    });

    if (answered === 0) {
        quizScore.innerText = "";
        return;
    }

    quizScore.innerText = `Score: ${correct} / ${answered} answered so far`;
}

/* ---------- Mind map ---------- */

const mindmapBtn = document.getElementById("mindmapBtn");
const mindmapCard = document.getElementById("mindmapCard");

mindmapBtn.addEventListener("click", generateMindmap);

async function generateMindmap() {

    if (!extractedText) {
        mindmapCard.innerHTML = `<p class="empty-hint" style="color:var(--danger)">Upload a PDF first.</p>`;
        return;
    }

    mindmapBtn.disabled = true;
    mindmapBtn.innerText = "Generating...";
    showLoading("Mapping out the ideas...");

    try {

        const response = await fetch(`${API_BASE}/mindmap`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: extractedText })
        });

        const data = await response.json();

        if (!data.success) {
            mindmapCard.innerHTML = `<p class="empty-hint" style="color:var(--danger)">${data.message || "Unable to generate mind map."}</p>`;
        } else {
            mindmapCard.innerHTML = renderMindmapNode(data.mindmap);
        }

    } catch (err) {
        console.error(err);
        mindmapCard.innerHTML = `<p class="empty-hint" style="color:var(--danger)">Server Error</p>`;
    }

    mindmapBtn.disabled = false;
    mindmapBtn.innerText = "Generate Mind Map";
    hideLoading();
}

function renderMindmapNode(node) {

    if (!node || !node.title) {
        return `<p class="empty-hint">No mind map returned.</p>`;
    }

    function buildBranch(n) {
        const children = Array.isArray(n.children) ? n.children : [];
        const childrenHtml = children.length
            ? `<ul>${children.map(child => `<li>${buildBranch(child)}</li>`).join("")}</ul>`
            : "";

        return `<span class="mindmap-node">${n.title}</span>${childrenHtml}`;
    }

    return `<ul class="mindmap-tree"><li>${buildBranch(node)}</li></ul>`;
}

/* ---------- Chat with PDF ---------- */

const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const chatSendBtn = document.getElementById("chatSendBtn");

let chatHistory = [];

chatSendBtn.addEventListener("click", sendChatMessage);
chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendChatMessage();
});

function appendChatMessage(role, content) {
    const bubble = document.createElement("div");
    bubble.className = `chat-msg ${role === "user" ? "chat-msg-user" : "chat-msg-bot"}`;
    bubble.innerText = content;
    chatMessages.appendChild(bubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendChatMessage() {

    const question = chatInput.value.trim();

    if (!question) return;

    if (!extractedText) {
        appendChatMessage("bot", "Upload a PDF first, then ask away.");
        return;
    }

    appendChatMessage("user", question);
    chatInput.value = "";
    chatInput.disabled = true;
    chatSendBtn.disabled = true;
    showLoading("Reading through your PDF...");

    try {

        const response = await fetch(`${API_BASE}/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                text: extractedText,
                question,
                history: chatHistory
            })
        });

        const data = await response.json();

        if (!data.success) {
            appendChatMessage("bot", data.message || "Something went wrong answering that.");
        } else {
            appendChatMessage("bot", data.answer || "No answer returned.");

            chatHistory.push({ role: "user", content: question });
            chatHistory.push({ role: "assistant", content: data.answer || "" });
        }

    } catch (err) {
        console.error(err);
        appendChatMessage("bot", "Server Error - please try again.");
    }

    chatInput.disabled = false;
    chatSendBtn.disabled = false;
    chatInput.focus();
    hideLoading();
}
