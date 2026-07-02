const pdfInput = document.getElementById("pdfInput");
const fileName = document.getElementById("fileName");
const analyzeBtn = document.getElementById("analyzeBtn");
const previewSection = document.getElementById("previewSection");
const previewBox = document.getElementById("previewBox");

let selectedFile = null;

pdfInput.addEventListener("change", () => {
  selectedFile = pdfInput.files[0];

  if (!selectedFile) return;

  fileName.textContent = selectedFile.name;

  analyzeBtn.disabled = false;
});

analyzeBtn.addEventListener("click", uploadPDF);
async function uploadPDF() {

  const formData = new FormData();

  formData.append("file", selectedFile);

  analyzeBtn.textContent = "Uploading...";

  try {

    const response = await fetch("http://127.0.0.1:8000/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    console.log(data);

    previewSection.classList.remove("hidden");

    previewBox.textContent = data.preview;

    analyzeBtn.textContent = "Generate Summary";

  } catch (error) {

    console.error(error);

    analyzeBtn.textContent = "Upload Failed";

  }

}