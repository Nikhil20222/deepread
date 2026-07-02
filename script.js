const pdfInput = document.getElementById("pdfInput");
const fileName = document.getElementById("fileName");
const analyzeBtn = document.getElementById("analyzeBtn");

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

    analyzeBtn.textContent = "Uploaded ✓";

    console.log(data);
    alert(
      `PDF Uploaded!

Characters: ${data.characters}

Preview:

${data.preview.substring(0, 200)}...`,
    );
  } catch (error) {
    console.error(error);

    analyzeBtn.textContent = "Upload Failed";
  }
}
