import { useEffect, useRef, useState } from "react";
import { BrandMark } from "./Sidebar.jsx";
import { suggestions } from "../lib/sampleData.js";

function Message({ message, label }) {
  const { question, result } = message;
  return (
    <>
      <div className="user-message"><div className="user-bubble">{question}</div></div>
      <div className="assistant-message">
        <div className="assistant-avatar"><BrandMark small /></div>
        <div className="message-content">
          <div className="message-author">Fieldnotes <span className="message-time">{result.rule.toUpperCase()} RULE</span></div>
          {result.answer ? (
            <div className="answer-card">
              <div className="answer-label">ANSWER FROM YOUR DOCUMENT</div>
              <div className="answer-text">{result.answer.text}</div>
              <div className="source-row">
                <span className="source-tag"><span>↳</span> SOURCE</span>
                <span>{label} · line {result.answer.line}</span>
                <span className="relevance">
                  {result.ranked.length} match{result.ranked.length === 1 ? "" : "es"} · {Math.round(result.ranked[0].score * 100)}% term match
                </span>
              </div>
            </div>
          ) : (
            <div className="no-answer">
              I couldn't find an exact matching term in this document. Try using a word or phrase that appears in the source. I won't guess beyond the indexed statements.
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function AskView({ active, messages, label, hasStatements, onAsk, draft, setDraft }) {
  const chatRef = useRef(null);
  const inputRef = useRef(null);
  const [, force] = useState(0);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 115)}px`;
  }, [draft, active]);

  const submit = (event) => {
    event.preventDefault();
    if (!draft.trim()) return;
    onAsk(draft.trim());
    force((n) => n + 1);
  };

  const onKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit(event);
    }
  };

  return (
    <section className={`view${active ? " active" : ""}`} id="askView" aria-labelledby="pageTitle">
      <div className="welcome-block">
        <div className="eyebrow"><span className="eyebrow-line"></span> DOCUMENT INTELLIGENCE <span className="eyebrow-line"></span></div>
        <h1 id="pageTitle">Good questions.<br /><span>Grounded answers.</span></h1>
        <p className="welcome-subtitle">Ask something about your document. Each answer is found in the source — never guessed.</p>
      </div>

      <div className="chat-area" id="chatArea" ref={chatRef} aria-live="polite">
        <div className="assistant-message starter-message">
          <div className="assistant-avatar"><BrandMark small /></div>
          <div className="message-content">
            <div className="message-author">Fieldnotes <span className="message-time">READY</span></div>
            <p>
              {hasStatements
                ? "Your document is indexed into searchable statements. Ask a question to find the most relevant passage."
                : "Add a document to build a searchable knowledge base. Answers are always grounded in its source statements."}
            </p>
          </div>
        </div>
        {messages.map((message) => (
          <Message key={message.id} message={message} label={label} />
        ))}
      </div>

      <div className="suggestions">
        <div className="suggestion-label">TRY ASKING</div>
        {suggestions.map((text) => (
          <button key={text} type="button" className="suggestion-chip" onClick={() => onAsk(text)}>
            <span>↗</span> {text}
          </button>
        ))}
      </div>

      <form className="question-form" onSubmit={submit}>
        <label className="sr-only" htmlFor="questionInput">Ask a question about this document</label>
        <textarea
          id="questionInput"
          ref={inputRef}
          rows={1}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask a question about your document…"
          autoComplete="off"
        />
        <div className="composer-footer">
          <span><kbd>↵</kbd> to ask <span className="composer-divider">·</span> <kbd>Shift ↵</kbd> for a new line</span>
          <button className="send-button" type="submit" aria-label="Send question" disabled={!draft.trim()}>
            <span>Ask</span><span className="send-arrow">↑</span>
          </button>
        </div>
      </form>
      <div className="engine-note">
        <span className="engine-spark">✳</span> Exact-term search <span>·</span> Rule-based retrieval <span>·</span> No NLP or RAG
      </div>
      <Footer />
    </section>
  );
}

export function Footer() {
  return (
    <footer className="main-footer">
      <span>FIELDNOTES <span className="footer-dot">·</span> DOCUMENT Q&amp;A SYSTEM</span>
      <span>Built for clarity, not speculation.</span>
    </footer>
  );
}
