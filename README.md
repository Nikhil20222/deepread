# DeepRead

I made this thing because I was tired of reading 80-page PDFs and still not knowing what the important stuff was. DeepRead takes a PDF, reads it for you, and gives you back a summary, flashcards, a quiz, a mind map, and a chat box so you can just ask it questions instead of scrolling through the whole thing again.

## why

My notes and papers are always PDFs. Always long. Always painful to skim through right before an exam. I just wanted something I could dump a file into and get the key points back in seconds. Couldn't find exactly what I wanted, so I built it.

## what it does

- Upload a PDF and preview it
- Get an AI summary — pick Quick, Detailed, or Exam Notes depending on how much time you have
- Get section-wise summaries if the doc is long and covers a bunch of different things
- Get flashcards you can flip through to revise
- Take a quiz it generates from the document and see your score right away
- Get a mind map so you can see how everything connects at a glance
- Chat with the PDF directly if you just want to ask something specific
- Dark mode, finally
- Uses multiple AI providers so it actually works when one of them decides to give up on you

## AI providers

Started with just Gemini. That lasted about two days before I kept hitting quota limits. So now it tries Groq first, then OpenRouter, then Gemini, and if all three are down at once it falls back to Cerebras. Way more reliable this way, and every single feature goes through the same fallback chain so nothing feels half-built.

## tech stuff

Frontend: Plain HTML, CSS, JS. Nothing fancy.
Backend: Python + FastAPI
AI: Groq, OpenRouter, Gemini, Cerebras

I didn't want to overcomplicate the stack. It does what it needs to do.

## how it works (the short version)

You upload a PDF through the frontend. FastAPI receives it, pulls out the text, and sends it to whatever AI provider is available. Whatever feature you asked for (summary, flashcards, quiz, mind map, chat answer, section summary) comes back as JSON, and the frontend displays it.

The tricky part was never really "building the feature" — it was making sure the AI responses actually parsed every single time, and that the AI stuck to what was actually in the PDF instead of just making stuff up because it sounded right.

## things that made me want to throw my laptop

Honestly this took way longer than it should have. Here's what went wrong along the way:

- Gemini kept saying "quota exceeded" right when I thought everything was working
- Flashcards would sometimes show data from a previous PDF instead of the current one
- There was a loading indicator sitting in the HTML since day one that I never actually hooked up, so buttons just looked frozen while stuff was processing
- The frontend would just... not update after getting a response back
- AI models don't always return clean JSON, so I had to handle all kinds of weird formatting
- The quiz would sometimes mark an answer wrong even when it was right, because the AI's "correct answer" text didn't match the option text exactly
- CORS errors. Obviously.
- Had a routing bug in FastAPI that took me an embarrassing amount of time to find

I'd say I spent 70% of my time debugging and 30% actually writing features. But I learned a ton from it so I guess it was worth it.

## running it locally

```
git clone https://github.com/yourusername/DeepRead.git
cd DeepRead/backend
pip install -r requirements.txt
```

Make a `.env` file in the backend folder:

```
GROQ_API_KEY=your_key_here
OPENROUTER_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here
CEREBRAS_API_KEY=your_key_here
```

Then start the server:

```
uvicorn main:app --reload
```

Open `http://127.0.0.1:8000` in your browser and you're good to go.

## using it

1. Upload a PDF
2. Pick a summary mode and hit "Generate Summary"
3. If the doc is long, try section-wise summaries too
4. Hit "Generate Flashcards" and flip through them when you want to revise
5. Try the quiz if you want to actually test yourself
6. Generate a mind map if you're more of a visual person
7. Ask the chat box anything specific you need answered
8. Flip on dark mode if the white background is too much at 2am

Pretty straightforward.

## what I learned

- How FastAPI actually works, not just copy-pasting from docs
- Integrating with multiple AI APIs and dealing with all their quirks
- That AI models will absolutely return malformed JSON right when you least expect it
- How to write prompts that actually keep the AI grounded in the document instead of hallucinating
- Frontend-backend communication beyond just a basic fetch call
- Debugging things that "should work but don't" — more patience than skill, honestly

## stuff I want to add later

- Export summary or quiz results as a PDF
- Support for DOCX and PPT files
- A login system so you can save your study history
- PDF highlighting
- Saving quiz scores over time so you can see if you're actually improving


## screenshots

<img width="1915" height="962" alt="sd" src="https://github.com/user-attachments/assets/faf66d90-28b3-4854-8a4b-f7d3b37afff1" />

<img width="1912" height="960" alt="image" src="https://github.com/user-attachments/assets/88fd6ad7-bc26-4bfb-9e72-52fb90c341a0" />

<img width="1902" height="887" alt="image" src="https://github.com/user-attachments/assets/176bdeac-78bc-444c-9e9f-32284249c9ee" />



That's pretty much it. DeepRead started as a "this should take a weekend" project and turned into something way more frustrating and educational than expected. Still glad I built it though — it actually helps me study now, and that was the whole point.

If you find it useful or have suggestions, feel free to open an issue or reach out.
