# DeepRead

I made this thing because I was tired of reading 80-page PDFs and still not knowing what the important stuff was. DeepRead takes a PDF, reads it for you, and spits out a summary + flashcards. That's it. That's the whole thing.


## why

My notes and papers are always PDFs. Always long. Always painful to skim through right before an exam. I just wanted something I could dump a file into and get the key points back in seconds. Couldn't find exactly what I wanted, so I built it.


## what it does

- Upload a PDF
- Get an AI summary
- Get flashcards to revise from
- Uses multiple AI providers so it actually works when one fails

## AI providers

Started with just Gemini. That lasted about two days before I kept hitting quota limits. So now it tries Groq first, then OpenRouter, then falls back to Gemini. Way more reliable this way.


## tech stuff

**Frontend:** Plain HTML, CSS, JS. Nothing fancy.  
**Backend:** Python + FastAPI  
**AI:** Groq, OpenRouter, Gemini  

I didn't want to overcomplicate the stack. It does what it needs to do.

## how it works (the short version)

You upload a PDF through the frontend. FastAPI receives it, pulls out the text, and sends it to whatever AI provider is available. The AI returns a summary or flashcards in JSON format, and the frontend displays it.

The tricky part wasn't building it — it was making sure the AI responses actually parsed correctly every time. More on that below.



## things that made me want to throw my laptop

Honestly this project took way longer than it should have. Here's what went wrong:

- Gemini kept saying "quota exceeded" right when I thought everything was working
- Flashcards would sometimes show data from a previous PDF instead of the current one
- The frontend would just... not update after getting a response from the backend
- AI models don't always return clean JSON so I had to handle all kinds of weird formats
- CORS errors. Obviously.
- Had a routing bug in FastAPI that took me an embarrassing amount of time to find

I probably spent 70% of my time debugging and 30% actually writing features. But I learned a ton from it so I guess it was worth it.



## running it locally

```bash
git clone https://github.com/yourusername/DeepRead.git
cd backend
pip install -r requirements.txt
```

Make a `.env` file in the backend folder:

```
GROQ_API_KEY=your_key_here
OPENROUTER_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here
```

Then start the server:

```bash
uvicorn main:app --reload
```

Open `index.html` in your browser and you're good to go.


## using it

1. Upload a PDF
2. Hit "Generate Summary"
3. Wait a few seconds
4. Read the summary
5. Hit "Generate Flashcards" when you want to revise
6. Use Previous/Next to flip through them

Pretty straightforward.

---

## what I learned

- How FastAPI actually works (not just copying from docs)
- Integrating with multiple AI APIs and dealing with their quirks
- That AI models will absolutely return malformed JSON when you least expect it
- Frontend-backend communication beyond just fetch calls
- Debugging things that "should work but don't"


## stuff I want to add later

- Dark mode (I keep saying I'll add it)
- Quiz mode where it tests you on the flashcards
- Export summary as a PDF
- Support for DOCX and PPT files
- Login system so you can save your study history
- PDF highlighting

No promises on when though.



## screenshots

<img width="1917" height="922" alt="image" src="https://github.com/user-attachments/assets/28255da4-eb56-4c3c-88c8-63f0d64841d2" />
<img width="1917" height="822" alt="image" src="https://github.com/user-attachments/assets/f6dfadbb-91a2-4189-90e2-87c468fd7637" />
<img width="1917" height="877" alt="image" src="https://github.com/user-attachments/assets/b11a3131-2e41-44f7-8769-eae690357460" />



## demo

https://github.com/user-attachments/assets/37e01f45-479f-49a5-8671-53b022d75f35



That's pretty much it. DeepRead started as a "this should take a weekend" project and turned into something way more frustrating and educational. I'm glad I built it though — it actually helps me study now, and that was the whole point.

If you find it useful or have suggestions, feel free to open an issue or reach out.
