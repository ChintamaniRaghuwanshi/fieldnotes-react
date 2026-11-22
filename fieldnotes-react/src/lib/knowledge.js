const ignoredTerms = new Set([
  "a", "an", "and", "are", "as", "at", "be", "been", "being", "but", "by",
  "did", "do", "does", "for", "from", "had", "has", "have", "how", "i",
  "in", "into", "is", "it", "its", "of", "on", "or", "that", "the", "their",
  "them", "there", "these", "this", "those", "to", "was", "were", "what",
  "when", "where", "which", "who", "will", "with", "would", "you", "your"
]);

const datePattern = /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b|\b(?:19|20)\d{2}\b/i;
const quantityPattern = /\b\d[\d,]*(?:\.\d+)?(?:\s+(?:to|[-–])\s*\d[\d,]*(?:\.\d+)?)?(?:\s*(?:kilometers?|km|miles?|days?|years?|flybys|percent|%))?\b/gi;

export const emptyKnowledgeBase = () => ({ statements: [], index: new Map() });

export function normalizeTerms(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter((term) => term && !ignoredTerms.has(term));
}

export function splitStatements(text) {
  const statements = [];
  let start = 0;
  for (let i = 0; i < text.length; i += 1) {
    const character = text[i];
    if (character === "\n" || character === "\r") {
      const line = text.slice(start, i).trim();
      if (line) statements.push({ text: line, start });
      if (character === "\r" && text[i + 1] === "\n") i += 1;
      start = i + 1;
      continue;
    }
    if (character === "." && /\d/.test(text[i - 1] || "") && /\d/.test(text[i + 1] || "")) continue;
    if (".!?".includes(character) && (i + 1 === text.length || /\s/.test(text[i + 1]))) {
      const sentence = text.slice(start, i + 1).trim();
      if (sentence) statements.push({ text: sentence, start });
      start = i + 1;
    }
  }
  const remainder = text.slice(start).trim();
  if (remainder) statements.push({ text: remainder, start });
  return statements;
}

function flattenJson(value, path, output) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => flattenJson(item, `${path}[${index + 1}]`, output));
  } else if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, item]) =>
      flattenJson(item, path ? `${path}.${key}` : key, output));
  } else if (value !== null && value !== undefined) {
    output.push(`${path}: ${String(value)}`);
  }
}

export function prepareText(text, extension) {
  if (extension === "json") {
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (error) {
      throw new Error(`Could not read JSON: ${error.message}`);
    }
    const lines = [];
    flattenJson(parsed, "", lines);
    return lines.join("\n");
  }
  return text;
}

export function buildKnowledgeBase(text) {
  const parts = splitStatements(text);
  const index = new Map();
  const statements = parts.map((part, position) => {
    const terms = new Set(normalizeTerms(part.text));
    const statement = {
      id: position,
      text: part.text,
      line: text.slice(0, part.start).split(/\r\n|\r|\n/).length,
      terms,
      quantities: part.text.match(quantityPattern) || [],
      hasDate: datePattern.test(part.text),
      hasDefinition: /\b(?:is|are|means|refers to)\b/i.test(part.text)
    };
    terms.forEach((term) => {
      if (!index.has(term)) index.set(term, []);
      index.get(term).push(position);
    });
    return statement;
  });
  return { statements, index };
}

export function classifyQuestion(question) {
  const value = question.trim().toLowerCase();
  if (/^(when|what date|what year)\b/.test(value)) return "date";
  if (/^how many\b/.test(value) || /^how much\b/.test(value) || /^how (?:long|far|thick|old|high|deep|large|big|heavy|wide)\b/.test(value)) return "quantity";
  if (/^who\b/.test(value)) return "person";
  if (/^where\b/.test(value)) return "place";
  if (/^(what|who) (?:is|are)\b/.test(value)) return "definition";
  return "statement";
}

export function retrieve(kb, question) {
  const terms = Array.from(new Set(normalizeTerms(question)));
  const rule = classifyQuestion(question);
  if (!terms.length) return { terms, ranked: [], rule };
  const hits = new Map();
  terms.forEach((term) => {
    (kb.index.get(term) || []).forEach((id) => {
      hits.set(id, (hits.get(id) || 0) + 1);
    });
  });
  const ranked = Array.from(hits, ([id, matchedTerms]) => {
    const statement = kb.statements[id];
    let score = matchedTerms / terms.length;
    if (rule === "date" && statement.hasDate) score += 0.08;
    if (rule === "quantity" && statement.quantities.length) score += 0.08;
    if (rule === "definition" && statement.hasDefinition) score += 0.04;
    return { statement, matchedTerms, score: Math.min(score, 1) };
  }).sort((left, right) =>
    right.score - left.score ||
    right.matchedTerms - left.matchedTerms ||
    left.statement.id - right.statement.id);
  return { terms, ranked, rule };
}

export function answerQuestion(kb, question) {
  const result = retrieve(kb, question);
  if (!result.ranked.length) return { ...result, answer: null };
  return { ...result, answer: result.ranked[0].statement };
}
