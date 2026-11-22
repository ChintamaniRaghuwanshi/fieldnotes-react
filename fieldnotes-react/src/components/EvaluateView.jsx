import { Footer } from "./AskView.jsx";

export default function EvaluateView({ active, kb, benchmark, onRun }) {
  const { metrics, rows, status } = benchmark;
  return (
    <section className={`view secondary-view${active ? " active" : ""}`} id="evaluateView" aria-labelledby="evaluateTitle">
      <div className="view-heading">
        <div>
          <div className="eyebrow left-eyebrow"><span className="eyebrow-line"></span> MEASURE, DON'T ASSUME</div>
          <h1 id="evaluateTitle">Evaluate answers</h1>
          <p>Run a fixed set of questions against the sample document and measure retrieval quality.</p>
        </div>
        <div className="evaluation-stamp"><span>QA</span><small>BENCHMARK<br />01</small></div>
      </div>
      <div className="evaluation-callout">
        <span className="callout-icon">i</span>
        <p><strong>What this measures</strong><br />Each test checks whether the expected source statement is ranked first and returned with a citation. This evaluates retrieval and grounding, not open-ended language generation.</p>
      </div>
      <div className="benchmark-bar">
        <div><strong>Europa document benchmark</strong><span>6 questions · Fixed expected answers · Exact statement match</span></div>
        <button className="run-button" type="button" onClick={onRun}>Run benchmark <span>→</span></button>
      </div>
      <div className="metrics-grid">
        <div className="metric-card"><span>TOP-1 ACCURACY</span><strong>{metrics.accuracy}</strong><small>Expected statement ranked first</small></div>
        <div className="metric-card"><span>GROUNDED ANSWERS</span><strong>{metrics.grounding}</strong><small>Answers with a source citation</small></div>
        <div className="metric-card"><span>MEAN RETRIEVAL TIME</span><strong>{metrics.latency}</strong><small>Client-side, in milliseconds</small></div>
      </div>
      <div className="results-heading"><strong>Test cases</strong><span>{status}</span></div>
      <div className="evaluation-results">
        {rows.map((row) => (
          <div className="evaluation-row" key={row.question}>
            <span className={`result-status${row.passed ? "" : " fail"}`}>{row.passed ? "✓" : "×"}</span>
            <span className="result-copy">
              <strong>{row.question}</strong>
              <small>Expected: {row.expected} · Returned: {row.returned}</small>
            </span>
            <span className="result-score">{row.duration.toFixed(2)} ms</span>
          </div>
        ))}
      </div>
      <div className="evaluation-footnote"><span>ⓘ</span> Benchmark cases and expected statements are fixed in the client code so results are repeatable. Load the sample document to run this assessment.</div>
      <Footer />
    </section>
  );
}
