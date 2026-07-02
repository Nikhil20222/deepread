// ==========================
// DEEPREAD
// script.js
// ==========================


// ==========================
// ELEMENTS
// ==========================

const pdfInput = document.getElementById("pdfInput");
const chooseBtn = document.getElementById("chooseBtn");
const startBtn = document.getElementById("startBtn");

const previewCard = document.querySelector(".preview-card");
const summaryCard = document.querySelector(".summary-card");

const sendBtn = document.getElementById("sendBtn");
const questionInput = document.getElementById("questionInput");
const chatMessages = document.getElementById("chatMessages");

const loading = document.getElementById("loading");

const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");

const themeBtn = document.getElementById("themeBtn");


// ==========================
// VARIABLES
// ==========================

let selectedPDF = null;

let currentSummary = "";

let flashcards = [];

let quiz = [];

let compareFiles = [];


// Backend URL

const API = "http://127.0.0.1:8000";



// ==========================
// START BUTTON
// ==========================

startBtn.addEventListener("click", function () {

    document
        .getElementById("upload")
        .scrollIntoView({
            behavior: "smooth"
        });

});



// ==========================
// CHOOSE BUTTON
// ==========================

chooseBtn.addEventListener("click", function () {

    pdfInput.click();

});



// ==========================
// PDF SELECT
// ==========================

pdfInput.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) {

        return;

    }

    selectedPDF = file;

    previewPDF(file);

});



// ==========================
// PREVIEW PDF
// ==========================

function previewPDF(file) {

    previewCard.innerHTML = "";

    const iframe = document.createElement("iframe");

    iframe.src = URL.createObjectURL(file);

    iframe.id = "pdfViewer";

    iframe.style.width = "100%";

    iframe.style.height = "650px";

    iframe.style.border = "none";

    previewCard.appendChild(iframe);

}



// ==========================
// DRAG & DROP
// ==========================

const uploadBox = document.querySelector(".upload-box");


uploadBox.addEventListener("dragover", function (e) {

    e.preventDefault();

    uploadBox.style.borderColor = "#2563eb";

});


uploadBox.addEventListener("dragleave", function () {

    uploadBox.style.borderColor = "#374151";

});


uploadBox.addEventListener("drop", function (e) {

    e.preventDefault();

    uploadBox.style.borderColor = "#374151";

    const file = e.dataTransfer.files[0];

    if (!file) {

        return;

    }

    selectedPDF = file;

    previewPDF(file);

});




// ==========================
// LOADING
// ==========================

function showLoading() {

    loading.style.display = "flex";

}


function hideLoading() {

    loading.style.display = "none";

}




// ==========================
// TOAST
// ==========================

function showToast(message) {

    toastMessage.textContent = message;

    toast.style.display = "block";

    setTimeout(function () {

        toast.style.display = "none";

    }, 3000);

}




// ==========================
// THEME
// ==========================

let darkMode = true;


themeBtn.addEventListener("click", function () {

    if (darkMode) {

        document.body.style.background = "#ffffff";

        document.body.style.color = "#111827";

        themeBtn.textContent = "Dark Mode";

    }

    else {

        document.body.style.background = "#111827";

        document.body.style.color = "#ffffff";

        themeBtn.textContent = "Light Mode";

    }

    darkMode = !darkMode;

});




// ==========================
// API HELPER
// ==========================

async function postData(url, data) {

    try {

        const response = await fetch(API + url, {

            method: "POST",

            body: data

        });

        return await response.json();

    }

    catch (error) {

        console.log(error);

        showToast("Server Error");

    }

}



// ==========================
// CLEAR CHAT
// ==========================

function clearChat() {

    chatMessages.innerHTML = "";

}



// ==========================
// ADD CHAT MESSAGE
// ==========================

function addMessage(text, type) {

    const message = document.createElement("div");

    message.className = "message " + type;

    message.innerHTML = "<p>" + text + "</p>";

    chatMessages.appendChild(message);

    chatMessages.scrollTop = chatMessages.scrollHeight;

}



// ==========================
// RESET APP
// ==========================

function resetApp() {

    currentSummary = "";

    flashcards = [];

    quiz = [];

    compareFiles = [];

    clearChat();

}



// ==========================
// WINDOW LOAD
// ==========================

window.addEventListener("load", function () {

    console.log("DeepRead Ready");

});

// ==========================
// UPLOAD PDF
// ==========================

async function uploadPDF() {

    if (!selectedPDF) {

        showToast("Please select a PDF");

        return false;

    }

    showLoading();

    const formData = new FormData();

    formData.append("file", selectedPDF);

    const result = await postData("/upload", formData);

    hideLoading();

    if (result && result.success) {

        showToast("PDF Uploaded");

        return true;

    }

    showToast("Upload Failed");

    return false;

}



// ==========================
// GENERATE SUMMARY
// ==========================

async function generateSummary() {

    if (!selectedPDF) {

        showToast("Please upload a PDF");

        return;

    }

    showLoading();

    const formData = new FormData();

    formData.append("file", selectedPDF);

    const result = await postData("/summary", formData);

    hideLoading();

    if (!result) {

        return;

    }

    currentSummary = result.summary;

    displaySummary(result);

}



// ==========================
// DISPLAY SUMMARY
// ==========================

function displaySummary(data) {

    summaryCard.innerHTML = "";

    const title = document.createElement("h3");

    title.textContent = "Summary";

    summaryCard.appendChild(title);

    const para = document.createElement("p");

    para.textContent = data.summary;

    summaryCard.appendChild(para);

    if (data.keywords) {

        const heading = document.createElement("h3");

        heading.textContent = "Keywords";

        heading.style.marginTop = "20px";

        summaryCard.appendChild(heading);

        const list = document.createElement("ul");

        data.keywords.forEach(function (item) {

            const li = document.createElement("li");

            li.textContent = item;

            list.appendChild(li);

        });

        summaryCard.appendChild(list);

    }

}



// ==========================
// SEND QUESTION
// ==========================

sendBtn.addEventListener("click", function () {

    askQuestion();

});


questionInput.addEventListener("keypress", function (event) {

    if (event.key === "Enter") {

        askQuestion();

    }

});



// ==========================
// CHAT
// ==========================

async function askQuestion() {

    const question = questionInput.value.trim();

    if (question === "") {

        return;

    }

    addMessage(question, "user");

    questionInput.value = "";

    showLoading();

    const formData = new FormData();

    formData.append("question", question);

    const result = await postData("/chat", formData);

    hideLoading();

    if (!result) {

        return;

    }

    addMessage(result.answer, "ai");

}



// ==========================
// SEARCH
// ==========================

const searchBtn = document.getElementById("searchBtn");

const searchInput = document.getElementById("searchInput");

const searchResults = document.getElementById("searchResults");



searchBtn.addEventListener("click", function () {

    searchPDF();

});



async function searchPDF() {

    const query = searchInput.value.trim();

    if (query === "") {

        return;

    }

    showLoading();

    const formData = new FormData();

    formData.append("query", query);

    const result = await postData("/search", formData);

    hideLoading();

    if (!result) {

        return;

    }

    displaySearch(result.results);

}



// ==========================
// SEARCH RESULTS
// ==========================

function displaySearch(results) {

    searchResults.innerHTML = "";

    if (results.length === 0) {

        searchResults.innerHTML =

            "<p>No Results Found</p>";

        return;

    }

    results.forEach(function (item) {

        const box = document.createElement("div");

        box.className = "search-result";

        const title = document.createElement("h4");

        title.textContent = item.title;

        const text = document.createElement("p");

        text.textContent = item.text;

        box.appendChild(title);

        box.appendChild(text);

        searchResults.appendChild(box);

    });

}



// ==========================
// AUTO SUMMARY
// ==========================

pdfInput.addEventListener("change", async function () {

    const uploaded = await uploadPDF();

    if (uploaded) {

        generateSummary();

    }

}); 

// ==========================
// FLASHCARDS
// ==========================

const prevFlash = document.getElementById("prevFlash");
const nextFlash = document.getElementById("nextFlash");

prevFlash.addEventListener("click", previousFlashcard);
nextFlash.addEventListener("click", nextFlashcard);

async function generateFlashcards() {

    showLoading();

    const result = await postData("/flashcards", new FormData());

    hideLoading();

    if (!result) return;

    flashcards = result.flashcards;

    currentFlashcard = 0;

    showFlashcard();

}

function showFlashcard() {

    if (flashcards.length === 0) {

        return;

    }

    document.getElementById("flashQuestion").textContent =
        flashcards[currentFlashcard].question;

    document.getElementById("flashAnswer").textContent =
        flashcards[currentFlashcard].answer;

}

function nextFlashcard() {

    if (flashcards.length === 0) return;

    currentFlashcard++;

    if (currentFlashcard >= flashcards.length) {

        currentFlashcard = 0;

    }

    showFlashcard();

}

function previousFlashcard() {

    if (flashcards.length === 0) return;

    currentFlashcard--;

    if (currentFlashcard < 0) {

        currentFlashcard = flashcards.length - 1;

    }

    showFlashcard();

}



// ==========================
// QUIZ
// ==========================

const optionButtons =
    document.querySelectorAll(".option");

let currentQuestion = 0;

let score = 0;

async function generateQuiz() {

    showLoading();

    const result = await postData("/quiz", new FormData());

    hideLoading();

    if (!result) return;

    quiz = result.quiz;

    currentQuestion = 0;

    score = 0;

    showQuestion();

}

function showQuestion() {

    if (quiz.length === 0) return;

    const question = quiz[currentQuestion];

    document.getElementById("quizQuestion").textContent =
        question.question;

    optionButtons.forEach(function (button, index) {

        button.textContent = question.options[index];

        button.onclick = function () {

            checkAnswer(index);

        };

    });

}

function checkAnswer(index) {

    if (index === quiz[currentQuestion].correct) {

        score++;

        showToast("Correct");

    }

    else {

        showToast("Wrong");

    }

}

document
.getElementById("nextQuestion")
.addEventListener("click", function () {

    currentQuestion++;

    if (currentQuestion >= quiz.length) {

        alert("Quiz Finished\nScore : " + score);

        return;

    }

    showQuestion();

});



// ==========================
// COMPARE
// ==========================

document
.getElementById("compareBtn")
.addEventListener("click", comparePDFs);

async function comparePDFs() {

    const first =
        document.getElementById("pdfOne").files[0];

    const second =
        document.getElementById("pdfTwo").files[0];

    if (!first || !second) {

        showToast("Select both PDFs");

        return;

    }

    const formData = new FormData();

    formData.append("file1", first);

    formData.append("file2", second);

    showLoading();

    const result =
        await postData("/compare", formData);

    hideLoading();

    if (!result) return;

    document
    .getElementById("compareResult")
    .innerHTML =
    "<p>" + result.result + "</p>";

}



// ==========================
// EXPORT
// ==========================

document
.getElementById("exportPdf")
.addEventListener("click", function () {

    window.open(API + "/export/pdf");

});

document
.getElementById("exportTxt")
.addEventListener("click", function () {

    window.open(API + "/export/txt");

});

document
.getElementById("exportMd")
.addEventListener("click", function () {

    window.open(API + "/export/md");

});



// ==========================
// GRAPH
// ==========================

async function generateGraph() {

    const result =
        await postData("/graph", new FormData());

    if (!result) return;

    document
    .querySelector(".graph-box")
    .innerHTML =
    result.graph;

}



// ==========================
// INITIALIZE
// ==========================

async function initialize() {

    console.log("DeepRead Started");

}

initialize();