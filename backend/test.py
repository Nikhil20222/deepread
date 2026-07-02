from services.pdf_reader import extract_text

result = extract_text("uploads/sample.pdf")

print(result["success"])

print(result["pages"])

print(result["text"][:500])