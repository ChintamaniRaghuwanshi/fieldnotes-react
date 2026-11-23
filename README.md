# Fieldnotes - Document Q&A

Hi! This is my project called **Fieldnotes**. You give it a document, ask it a question, and it shows you the exact sentence from the document that answers it. 

It does **not** guess and it does **not** use any AI model. Everything runs inside your browser.

🔗 **Live demo:**[ (https://bejewelled-llama-0378bc.netlify.app)](https://bejewelled-llama-0378bc.netlify.app)

---

## Why did I make this?

When I use chatbots, sometimes they give an answer that sounds right but isn't in my notes at all. I wanted to build something simpler, where I can always see *where* the answer came from.

So I made a small search system with simple rules. If the answer isn't in the document, it just says so instead of making something up.

---

## What can it do?

- Upload a file: **PDF, DOCX, TXT, Markdown, CSV or JSON**
- Or just paste some text
- Ask a question and get the best matching sentence
- See the **source** of every answer (file name and line number)
- Browse all the sentences it found in the **Knowledge base** tab
- Test how well it works in the **Evaluate** tab (there is a small benchmark with 6 questions)
- Press `Ctrl + K` (or `Cmd + K` on Mac) to jump to the search box

It comes with a sample document about Europa, one of Jupiter's moons, so you can try it right away. Try asking *"How thick is the ice shell?"*

---

## How does it work?

I kept it simple on purpose. There are four steps:

1. **Extract:** the document is split into sentences (I call them statements).
2. **Index:** every important word is saved with the sentences it appears in. Small words like "the" and "is" are ignored. This is like the index at the back of a textbook.
3. **Retrieve:** when you ask a question, I find the sentences that share the most words with it and give each one a score.
4. **Verify:** the top sentence is shown with its source, so you can check it yourself.



## Built with

- **React 18** for the user interface
- **Vite** to run and build the project
- **pdf.js** to read PDF files
- **Mammoth** to read Word (.docx) files
- Plain **CSS** for the dark theme
- **Netlify** for hosting


## What I learned

- This started as plain HTML, CSS and JavaScript. Moving it to **React** taught me how state works. Before, I was changing the page by hand with `document.querySelector`. In React, I just change the data and the page updates itself.
- Keeping the search logic in its own file (`knowledge.js`) made it much easier to test without opening the browser.
- Deploying was harder than I expected. I got stuck on a few Netlify errors (wrong folder, and `node_modules` accidentally uploaded to GitHub). Now I know to add a `.gitignore` **before** the first commit!

---

## Limitations (being honest)

- It only matches **exact words**. If you ask about "cost" but the document says "price", it won't find it.
- It returns **one sentence**, not a written-out answer.
- Scanned PDFs (pictures of text) won't work, because there is no OCR.
- The benchmark only works on the Europa sample document. On it, all 6 questions pass, but that is a tiny test.

## Ideas for later

- Match word forms (like "launch" and "launched")
- Show the top 3 answers instead of only 1
- Highlight the matching words inside the sentence
- Add a light theme

---

Thanks for checking out my project! If you have any suggestions, feel free to open an issue. 😊
