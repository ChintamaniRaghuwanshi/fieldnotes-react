import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Sidebar from "./components/Sidebar.jsx";
import AskView from "./components/AskView.jsx";
import KnowledgeView from "./components/KnowledgeView.jsx";
import EvaluateView from "./components/EvaluateView.jsx";
import MethodDialog from "./components/MethodDialog.jsx";
import { answerQuestion, buildKnowledgeBase, emptyKnowledgeBase, prepareText } from "./lib/knowledge.js";
import { extractFileText, SUPPORTED_EXTENSIONS } from "./lib/readFile.js";
import { SAMPLE_LABEL, benchmarkCases, sampleDocument } from "./lib/sampleData.js";

const emptyBenchmark = () => ({
  metrics: { accuracy: "—", grounding: "—", latency: "—" },
  rows: [],
  status: "Not run yet"
});

const EMPTY_DOC = { label: "No document loaded", meta: "Upload or paste text", icon: "TXT", isSample: false };

function initialLoad() {
  return {
    kb: buildKnowledgeBase(sampleDocument),
    doc: { label: SAMPLE_LABEL, meta: "TXT · processed locally", icon: "TXT", isSample: true }
  };
}

export default function App() {
  const [{ kb, doc }, setState] = useState(initialLoad);
  const [view, setView] = useState("ask");
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [filter, setFilter] = useState("");
  const [benchmark, setBenchmark] = useState(emptyBenchmark);
  const [toast, setToast] = useState({ text: "", visible: false });
  const [searchFocus, setSearchFocus] = useState(0);

  const dialogRef = useRef(null);
  const searchRef = useRef(null);
  const toastTimer = useRef();
  const nextId = useRef(1);

  const showToast = useCallback((text) => {
    setToast({ text, visible: true });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3500);
  }, []);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const loadDocument = useCallback((text, label, extension = "txt") => {
    if (!text.trim()) {
      showToast("That document is empty. Add some text and try again.");
      return false;
    }
    let prepared;
    try {
      prepared = prepareText(text, extension);
    } catch (error) {
      showToast(error.message);
      return false;
    }
    if (!prepared.trim()) {
      showToast("No searchable text was found in that document.");
      return false;
    }
    setState({
      kb: buildKnowledgeBase(prepared),
      doc: {
        label,
        meta: `${extension.toUpperCase()} · processed locally`,
        icon: extension === "docx" ? "DOC" : extension.toUpperCase(),
        isSample: label === SAMPLE_LABEL
      }
    });
    setMessages([]);
    setBenchmark(emptyBenchmark());
    return true;
  }, [showToast]);

  const handleFile = useCallback(async (file) => {
    const extension = file.name.split(".").pop().toLowerCase();
    if (!SUPPORTED_EXTENSIONS.includes(extension)) {
      showToast("Use a PDF, DOCX, TXT, Markdown, CSV, or JSON file.");
      return;
    }
    try {
      showToast(`Reading ${file.name}…`);
      const text = await extractFileText(file, extension);
      if (loadDocument(text, file.name, extension === "markdown" ? "md" : extension)) {
        showToast(`${file.name} added to the knowledge base.`);
      }
    } catch (error) {
      showToast(`Could not read the file: ${error.message}`);
    }
  }, [loadDocument, showToast]);

  const handlePaste = useCallback((text) => {
    const ok = loadDocument(text, "Pasted document", "txt");
    if (ok) showToast("Knowledge base built from your text.");
    return ok;
  }, [loadDocument, showToast]);

  const handleClear = useCallback(() => {
    setState({ kb: emptyKnowledgeBase(), doc: EMPTY_DOC });
    setMessages([]);
    setBenchmark(emptyBenchmark());
    showToast("Document and knowledge base cleared.");
  }, [showToast]);

  const ask = useCallback((question) => {
    if (!kb.statements.length) {
      showToast("Add a document before asking a question.");
      return;
    }
    const result = answerQuestion(kb, question);
    setMessages((current) => [...current, { id: nextId.current++, question, result }]);
    setDraft("");
  }, [kb, showToast]);

  const selectStatement = useCallback((statement) => {
    setView("ask");
    ask(statement.text.split(/\s+/).slice(0, 7).join(" "));
  }, [ask]);

  const runBenchmark = useCallback(() => {
    if (!doc.isSample || kb.statements.length !== benchmarkCases.length + 4) {
      showToast("Load the Exploring Europa sample to run the fixed benchmark.");
      return;
    }
    const results = benchmarkCases.map((test) => {
      const start = performance.now();
      const result = answerQuestion(kb, test.question);
      const duration = performance.now() - start;
      return { ...test, duration, result, passed: result.answer?.id === test.expected };
    });
    const correct = results.filter((t) => t.passed).length;
    const grounded = results.filter((t) => t.result.answer && t.result.answer.line > 0).length;
    const mean = results.reduce((sum, t) => sum + t.duration, 0) / results.length;
    setBenchmark({
      metrics: {
        accuracy: `${Math.round((correct / results.length) * 100)}%`,
        grounding: `${Math.round((grounded / results.length) * 100)}%`,
        latency: `${mean.toFixed(2)} ms`
      },
      status: `${correct} of ${results.length} passed`,
      rows: results.map((t) => ({
        question: t.question,
        passed: t.passed,
        duration: t.duration,
        expected: kb.statements[t.expected].text,
        returned: t.result.answer ? t.result.answer.text : "No matching statement"
      }))
    });
  }, [doc.isSample, kb, showToast]);

  // Cmd/Ctrl+K opens the knowledge base and focuses its search field.
  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setView("knowledge");
        setSearchFocus((n) => n + 1);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (searchFocus && view === "knowledge" && searchRef.current) searchRef.current.focus();
  }, [searchFocus, view]);

  const tabs = useMemo(() => [
    { id: "ask", icon: "◉", name: "Ask" },
    { id: "knowledge", icon: "▤", name: "Knowledge base", count: kb.statements.length },
    { id: "evaluate", icon: "◷", name: "Evaluate" }
  ], [kb.statements.length]);

  return (
    <>
      <div className="app-shell">
        <Sidebar
          doc={doc}
          statementCount={kb.statements.length}
          termCount={kb.index.size}
          onFile={handleFile}
          onPaste={handlePaste}
          onClear={handleClear}
        />

        <main className="main-content">
          <header className="topbar">
            <div className="breadcrumbs">
              <span>Research desk</span><span className="crumb-divider">/</span><strong>{doc.label}</strong>
            </div>
            <div className="topbar-actions">
              <span className="privacy-label"><span className="privacy-dot"></span> Processed in your browser</span>
              <button className="help-button" type="button" onClick={() => dialogRef.current?.showModal()}>
                How it works <span>↗</span>
              </button>
            </div>
          </header>

          <nav className="tabs" aria-label="Workspace sections">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab${view === tab.id ? " active" : ""}`}
                type="button"
                onClick={() => setView(tab.id)}
              >
                <span className="tab-icon">{tab.icon}</span> {tab.name}
                {tab.count !== undefined && <span className="tab-count">{tab.count}</span>}
              </button>
            ))}
          </nav>

          <AskView
            active={view === "ask"}
            messages={messages}
            label={doc.label}
            hasStatements={kb.statements.length > 0}
            onAsk={ask}
            draft={draft}
            setDraft={setDraft}
          />
          <KnowledgeView
            active={view === "knowledge"}
            kb={kb}
            label={doc.label}
            filter={filter}
            setFilter={setFilter}
            searchRef={searchRef}
            onSelect={selectStatement}
          />
          <EvaluateView active={view === "evaluate"} kb={kb} benchmark={benchmark} onRun={runBenchmark} />
        </main>
      </div>

      <div className={`toast${toast.visible ? " visible" : ""}`} role="status" aria-live="polite">{toast.text}</div>
      <MethodDialog ref={dialogRef} />
    </>
  );
}
