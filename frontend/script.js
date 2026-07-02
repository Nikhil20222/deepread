const pdfInput = document.getElementById("pdfInput");
const fileName = document.getElementById("fileName");
const analyzeBtn = document.getElementById("analyzeBtn");

pdfInput.addEventListener("change", () => {

const file = pdfInput.files[0];

if(!file) return;

fileName.textContent = file.name;

analyzeBtn.disabled = false;

});