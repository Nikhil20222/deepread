from services.ai import generate_summary

text = """
Artificial Intelligence is transforming education.

Students use AI to summarize notes.

Teachers use AI to create study material.

AI also helps in research.
"""

result = generate_summary(text)

print(result)