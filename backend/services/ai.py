import os

from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY not found in .env file")

genai.configure(api_key=api_key)

model = genai.GenerativeModel("gemini-2.5-flash")


def generate_summary(text):

    if not text.strip():
        return "No readable text found in this PDF."

    prompt = f"""
You are an AI research assistant.

Read the research paper below and write a clean summary.

Use exactly this format.

# Main Idea

# Key Findings

# Methodology

# Limitations

# Conclusion


Paper:

{text[:15000]}
"""

    response = model.generate_content(prompt)

    return response.text