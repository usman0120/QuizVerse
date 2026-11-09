import { readFile, writeFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

// Canonical comparison ignores only the ID; wording, options, translations,
// explanations, hints, timing, and other source fields must all match.
export function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonical(value[key])]),
    );
  return value;
}
export function exactKey(question) {
  const { id: ignored, ...content } = question;
  void ignored;
  return JSON.stringify(canonical(content));
}
export function deduplicateExact(questions) {
  const seen = new Map();
  const removed = [];
  const kept = [];
  for (const question of questions) {
    const key = exactKey(question);
    if (seen.has(key))
      removed.push({
        id: question.id,
        retainedId: seen.get(key),
        fingerprint: createHash("sha256").update(key).digest("hex"),
      });
    else {
      seen.set(key, question.id);
      kept.push(question);
    }
  }
  return { kept, removed };
}
export async function auditContent(apply = false) {
  const files = (await readdir("data/questions"))
    .filter((file) => file.endsWith(".json"))
    .sort();
  const report = {
    policy:
      "Remove exact complete-question duplicates only, ignoring ID. Preserve all differing versions.",
    files: [],
    totals: { original: 0, remaining: 0, exactDuplicates: 0, variantGroups: 0 },
  };
  for (const file of files) {
    const path = `data/questions/${file}`;
    const text = await readFile(path, "utf8");
    const data = JSON.parse(text);
    const { kept, removed } = deduplicateExact(data.questions);
    const groups = new Map();
    for (const q of kept) {
      const key = `${q.type}:${q.question.normalize("NFKC").trim().toLowerCase().replace(/\s+/g, " ")}`;
      const group = groups.get(key) || [];
      group.push(q);
      groups.set(key, group);
    }
    const variants = [...groups.values()]
      .filter((group) => group.length > 1)
      .map((group) => ({
        question: group[0].question,
        ids: group.map((q) => q.id),
        differingFields: [
          ...new Set(group.flatMap((question) => Object.keys(question))),
        ].filter(
          (field) =>
            field !== "id" &&
            new Set(
              group.map((question) =>
                JSON.stringify(canonical(question[field])),
              ),
            ).size > 1,
        ),
        answers: group.map((question) => ({
          id: question.id,
          answer:
            question.type === "mcq"
              ? question.options?.en?.[
                  question.correctAnswer - (data.meta?.answerIndexBase || 0)
                ]
              : String(question.correctAnswer),
        })),
        answerConflict:
          new Set(
            group.map((q) =>
              q.type === "mcq"
                ? q.options?.en?.[
                    q.correctAnswer - (data.meta?.answerIndexBase || 0)
                  ]
                : String(q.correctAnswer),
            ),
          ).size > 1,
      }));
    report.files.push({
      file: path,
      original: data.questions.length,
      remaining: kept.length,
      removed,
      variants,
    });
    report.totals.original += data.questions.length;
    report.totals.remaining += kept.length;
    report.totals.exactDuplicates += removed.length;
    report.totals.variantGroups += variants.length;
    if (apply && removed.length) {
      // Keep untouched source formatting around retained records using their exact
      // JSON slices. This avoids rewriting thousands of unrelated content lines.
      const marker = text.indexOf('"questions"');
      const arrayStart = text.indexOf("[", marker);
      let depth = 0;
      let start = -1;
      let quoted = false;
      let escaped = false;
      const slices = [];
      let arrayEnd = -1;
      for (let i = arrayStart + 1; i < text.length; i++) {
        const c = text[i];
        if (quoted) {
          if (escaped) escaped = false;
          else if (c === "\\") escaped = true;
          else if (c === '"') quoted = false;
          continue;
        }
        if (c === '"') {
          quoted = true;
          continue;
        }
        if (c === "{" || c === "[") {
          if (!depth) start = i;
          depth++;
        }
        if (c === "}" || c === "]") {
          if (!depth && c === "]") {
            arrayEnd = i;
            break;
          }
          depth--;
          if (!depth) slices.push(text.slice(start, i + 1));
        }
      }
      if (slices.length !== data.questions.length || arrayEnd < 0)
        throw new Error(`Cannot safely rewrite ${file}`);
      const retainedKeys = new Set();
      const retainedSlices = slices.filter((slice) => {
        const key = exactKey(JSON.parse(slice));
        if (retainedKeys.has(key)) return false;
        retainedKeys.add(key);
        return true;
      });
      const newline = text.includes("\r\n") ? "\r\n" : "\n";
      const output = `${text.slice(0, arrayStart + 1)}${newline}    ${retainedSlices.join(`,${newline}    `)}${newline}  ${text.slice(arrayEnd)}`;
      if (
        JSON.stringify(JSON.parse(output)) !==
        JSON.stringify({ ...data, questions: kept })
      )
        throw new Error(`Rewrite verification failed for ${file}`);
      await writeFile(path, output);
    }
  }
  return report;
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const apply = process.argv.includes("--apply");
  const report = await auditContent(apply);
  await writeFile(
    apply && report.totals.exactDuplicates > 0
      ? "docs/content-cleanup.json"
      : "docs/content-review.json",
    `${JSON.stringify(report, null, 2)}\n`,
  );
  console.log(JSON.stringify({ applied: apply, ...report.totals }, null, 2));
}
