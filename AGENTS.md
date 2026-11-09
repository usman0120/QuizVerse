<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

QuizVerse uses Firebase Auth and Firestore only. Content stays in JSON. The owner removed the Learning Hub and flashcards modules; do not restore their routes, links, editors, or deck data. Keep quizzes, personality tests, quotes, and guest progress. Do not add an admin panel or internal contact forms. Contact links use the owner's portfolio. Run `npm run check`, browser tests, and Firestore emulator tests before publishing changes to account/progress flows. See `docs/AUDIT.md` for limitations.

The interface stays English and left-to-right: navigation, section headings, buttons, settings, and footer labels must not switch languages. The language preference applies only to educational content (quiz/category cards, questions, answers, hints, explanations, and personality results). Use scoped language/direction attributes on localized content rather than switching the document language. Footer shortcuts must target existing pages or section IDs; do not link to removed modules or invent unsupported features.
