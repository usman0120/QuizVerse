# Content validation policy

## Source preservation

Populated quiz, personality, and flashcard JSON files remain unchanged. Only empty placeholders and the explicitly removed learning content were deleted. This avoids guessing factual corrections or destroying the source material.

Run `npm run audit:data` to regenerate `docs/data-audit.json`. The original inventory, including deleted empty filenames, is retained in `docs/legacy-data-audit.json`.

## Runtime validation

- Knowledge quiz filenames must match a safe category identifier; user input never becomes a filesystem path.
- Unsupported types, missing prompts, invalid choices, nonboolean true/false answers, and invalid answer indexes are excluded.
- MCQ answer indexes are **zero-based**. True/false answers are actual JSON booleans.
- Legacy fill-blank type aliases normalize to `fill-blanks`. English/Urdu text answers use Unicode, case, and whitespace normalization.
- Exact normalized repeated prompts are removed **within each category**, keeping the first valid source entry. Cross-category repetition remains allowed; a regular session draws from one category.
- Source array indexes identify questions within a category. Do not edit/reorder content during an active session; old sessions may require restarting after a content deployment.
- Urdu options fall back to English if their lengths do not match, rather than misaligning an answer index.
- Questions and options are rendered as React text, not injected HTML.

## History quarantine

The first History MCQ marks index `2` (Romans) for a question whose explanation identifies Egyptians at index `1`. Multiple later entries use `4` for four choices. Other portions use zero-based answers. Blindly subtracting one from every index would corrupt valid entries.

All **134 History MCQs** are therefore withheld from runtime grading, including the six structurally invalid ones. History true/false questions remain playable. Their populated source remains intact for an editorial review. To restore the MCQs, verify answers individually, use zero-based indexes consistently, then remove the category-specific quarantine in `src/lib/quiz-core.mjs` and update its test/documentation.

## Still requires human/editorial review

Structural validation is not a factual verification. Review ambiguous questions, conflicting answers for repeated prompts, outdated facts, explanations, and Urdu translations. Flashcard source claims (authors, references, and image rights) also need verification. Do not advertise the content as scientifically verified.

Personality accuracy/match/rarity fields from the legacy data are not displayed. Winners are based on option points, with deterministic ties; quizzes are clearly labeled as entertainment.
