import { forwardRef } from "react";

const MethodDialog = forwardRef(function MethodDialog(_props, ref) {
  return (
    <dialog
      className="method-dialog"
      ref={ref}
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
    >
      <form method="dialog"><button className="dialog-close" aria-label="Close">×</button></form>
      <div className="dialog-eyebrow">THE APPROACH</div>
      <h2>Search, rules, and source evidence.</h2>
      <p>This system deliberately avoids NLP and retrieval-augmented generation. It splits a text document into statements, builds a simple inverted index of exact terms, and ranks statements by term overlap. Question prefixes select small deterministic rules; the selected source statement is returned with its location.</p>
      <div className="method-steps">
        <div><span>01</span><strong>Extract</strong><small>Plain-text statements</small></div>
        <div><span>02</span><strong>Index</strong><small>Exact terms only</small></div>
        <div><span>03</span><strong>Retrieve</strong><small>Term-overlap ranking</small></div>
        <div><span>04</span><strong>Verify</strong><small>Visible source citation</small></div>
      </div>
      <p className="dialog-note">This trades semantic flexibility for transparency, offline operation, and answers that can be checked directly against the document.</p>
    </dialog>
  );
});

export default MethodDialog;
