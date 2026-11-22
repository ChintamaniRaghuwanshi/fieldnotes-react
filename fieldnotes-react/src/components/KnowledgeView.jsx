import { useMemo } from "react";
import { normalizeTerms } from "../lib/knowledge.js";
import { Footer } from "./AskView.jsx";

export default function KnowledgeView({ active, kb, label, filter, setFilter, searchRef, onSelect }) {
  const matching = useMemo(() => {
    const queryTerms = Array.from(new Set(normalizeTerms(filter)));
    return kb.statements.filter((statement) => queryTerms.every((term) => statement.terms.has(term)));
  }, [kb, filter]);

  return (
    <section className={`view secondary-view${active ? " active" : ""}`} id="knowledgeView" aria-labelledby="knowledgeTitle">
      <div className="view-heading">
        <div>
          <div className="eyebrow left-eyebrow"><span className="eyebrow-line"></span> YOUR SOURCE, MADE SEARCHABLE</div>
          <h1 id="knowledgeTitle">Knowledge base</h1>
          <p>Atomic statements extracted from your document. Select any statement to see its source.</p>
        </div>
        <div className="kb-heading-count"><strong>{kb.statements.length}</strong><span>statements</span></div>
      </div>
      <div className="search-box">
        <span>⌕</span>
        <input
          ref={searchRef}
          type="search"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          placeholder="Filter statements by exact terms…"
          aria-label="Filter statements"
        />
        <kbd>⌘ K</kbd>
      </div>
      <div className="knowledge-list">
        {matching.length === 0 ? (
          <div className="empty-state">
            {kb.statements.length
              ? "No statements contain all of those exact terms."
              : "Upload or paste a document to build your knowledge base."}
          </div>
        ) : (
          matching.map((statement) => (
            <article
              key={statement.id}
              className="knowledge-item"
              tabIndex={0}
              role="button"
              aria-label={`Ask about statement ${statement.id + 1}`}
              onClick={() => onSelect(statement)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(statement);
                }
              }}
            >
              <span className="statement-number">{String(statement.id + 1).padStart(2, "0")}</span>
              <span className="statement-body">
                <span className="statement-text">{statement.text}</span>
                <span className="statement-source">
                  <span>↳</span> {label} · line {statement.line}
                  {statement.quantities.length ? ` · ${statement.quantities.join(", ")}` : ""}
                </span>
              </span>
            </article>
          ))
        )}
      </div>
      <Footer />
    </section>
  );
}
