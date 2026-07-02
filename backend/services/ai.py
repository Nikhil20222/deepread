import os

from dotenv import load_dotenv

import google.generativeai as genai

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-2.5-flash")


def generate_summary(text):

    prompt = f"""
You are helping a student understand a research paper.

Summarize this paper in this format:

Main Idea

Key Findings

Methodology

Limitations

Conclusion

Paper:

{text[:12000]}
"""

    response = model.generate_content(prompt)

    return response.text