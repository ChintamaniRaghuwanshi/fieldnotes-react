import { useRef, useState } from "react";

const ACCEPT =
  ".pdf,.docx,.txt,.md,.markdown,.csv,.json,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown,text/csv,application/json";

export function BrandMark({ small = false }) {
  return (
    <span className={`brand-mark${small ? " small" : ""}`} aria-hidden="true">
      <span></span><span></span><span></span>
    </span>
  );
}

export default function Sidebar({ doc, statementCount, termCount, onFile, onPaste, onClear }) {
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const fileRef = useRef(null);
  const pasteRef = useRef(null);

  const handleFile = async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    await onFile(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleBuild = () => {
    if (onPaste(pasteText)) {
      setPasteOpen(false);
      setPasteText("");
    }
  };

  const togglePaste = () => {
    setPasteOpen((open) => !open);
    setTimeout(() => pasteRef.current && pasteRef.current.focus(), 0);
  };

  return (
    <aside className="sidebar">
      <a className="brand" href="#" aria-label="Fieldnotes home">
        <BrandMark />
        <span>Fieldnotes<span className="brand-period">.</span></span>
      </a>

      <div className="workspace-label">WORKSPACE</div>
      <button className="workspace-switch" type="button" aria-label="Current workspace">
        <span className="workspace-icon">F</span>
        <span className="workspace-copy"><strong>Research desk</strong><small>Personal workspace</small></span>
        <span className="chevron">⌄</span>
      </button>

      <div className="side-section">
        <div className="section-heading">
          <span>YOUR DOCUMENT</span>
          <span className="live-dot" style={{ background: statementCount ? "#66a77c" : "#c5a065" }}></span>
        </div>
        <div className="document-card">
          <div className="file-icon" aria-hidden="true">{doc.icon}</div>
          <div className="document-meta"><strong>{doc.label}</strong><small>{doc.meta}</small></div>
          <button className="icon-button" type="button" title="Clear document" aria-label="Clear document" onClick={onClear}>×</button>
        </div>

        <div className="document-actions">
          <label className="upload-button" htmlFor="fileInput"><span>＋</span> Upload a file</label>
          <input id="fileInput" type="file" accept={ACCEPT} ref={fileRef} onChange={handleFile} />
          <button className="text-button" type="button" onClick={togglePaste}>Paste text instead</button>
        </div>
        <div className={`paste-panel${pasteOpen ? "" : " hidden"}`}>
          <label htmlFor="documentText">Document text</label>
          <textarea
            id="documentText"
            ref={pasteRef}
            value={pasteText}
            onChange={(event) => setPasteText(event.target.value)}
            placeholder="Paste or type your document here…"
          />
          <button className="build-button" type="button" onClick={handleBuild}>Build knowledge base <span>→</span></button>
        </div>
      </div>

      <div className="side-section kb-summary">
        <div className="section-heading">KNOWLEDGE BASE</div>
        <div className="summary-row"><span>Indexed statements</span><strong>{statementCount}</strong></div>
        <div className="summary-row"><span>Search terms</span><strong>{termCount}</strong></div>
        <div className="index-meter">
          <span style={{ width: `${statementCount ? Math.min(100, 25 + statementCount * 7) : 0}%` }}></span>
        </div>
        <p className="index-caption">
          {statementCount ? `${statementCount} source statements ready to search` : "Waiting for a document"}
        </p>
      </div>

      <div className="sidebar-bottom">
        <div className="method-note">
          <span className="method-icon">↗</span>
          <p><strong>Transparent by design</strong><br />Every answer links back to its source.</p>
        </div>
        <div className="profile">
          <div className="avatar">C</div>
          <div><strong>Chintamani</strong><small>Local session</small></div>
          <span className="profile-menu">···</span>
        </div>
      </div>
    </aside>
  );
}
