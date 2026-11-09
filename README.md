# QuizVerse

A Node.js application built with **Next.js 16, React 19, TypeScript, Firebase Authentication, and Cloud Firestore**, ready for Vercel.

## Features

- English/Urdu knowledge quizzes with validated, deduplicated JSON content.
- Server grading, shuffled choices, optional practice timers, explanations, and result sharing.
- A deterministic five-question daily challenge, refreshed at midnight UTC.
- Personality quizzes for entertainment, without fabricated accuracy claims.
- Flashcard decks with shuffle, hints, optional images, and account-synced learned/difficult marks.
- Google and email/password sign-in, registration, verification, and password reset.
- Private profiles, preferences, quiz summaries, UTC streaks, and optional verified-user rankings.
- Free guest play. **Saving progress requires sign-in; guest progress is not stored or imported.**

The learning module, quote/favorites widget, mock statistics, and nonfunctional feedback forms have been removed as requested.

## Local development

Use Node.js 22 or newer (Node 24 LTS recommended).

```sh
npm install
npm run dev
```

Visit http://localhost:3000. Guest play works in development without Firebase. Account services require the environment settings in `.env.example`; copy these to `.env.local` and follow [Firebase setup](docs/firebase-setup.md).

```sh
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run audit:data
npm run build
npm start
```

Production requires a stable `QUIZ_SESSION_SECRET`, even if Firebase is not connected yet. Never commit `.env.local` or service-account keys.

## Content and data

```text
src/app/                 Pages and server API routes
src/components/          Shared React UI and account sync
src/lib/                 Content validation, scoring, Firebase configuration
data/questions/          Populated knowledge-quiz JSON sources
data/personality-quiz-data.json
data/flashcards.json
tests/                   Automated scoring and content tests
docs/                    Setup, audit reports, and remaining issues
firestore.rules          Owner-only reads; client writes denied
```

Quiz content stays in versioned JSON files, not Firestore. **Do not move quiz JSON into `public/`: answer keys belong on the server.** Firestore stores account data only.

There are 27 populated knowledge categories and 2,777 playable questions after per-category deduplication and safety exclusions. Original populated JSON has been preserved. History multiple-choice questions are withheld because the source mixes answer-index conventions; History true/false questions remain available. See [content policy](docs/content-policy.md).

## Deployment and audit

- [Firebase and Vercel setup](docs/firebase-setup.md)
- [Issue inventory and remaining work](docs/ISSUES.md)
- [Content audit](docs/data-audit.json)
- [Original audit, including the 75 removed empty files](docs/legacy-data-audit.json)
- [Architecture and security](docs/architecture.md)

Legacy `.html` links redirect to their new pages. Removed learning URLs intentionally return 404.

Created by Usman Ahmad. © QuizVerse. Existing ownership and third-party content rights remain applicable.

For browser regression tests, first run `npx playwright install chromium`. The suite starts its own local development server and tests guest flows without using a live Firebase project.
