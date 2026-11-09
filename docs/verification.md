# Verification

Local verification on November 9, 2026, using Node.js 24 on Windows:

- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm test`: 15 passing scoring/content regression tests.
- `npm run build`: successful optimized Next.js build.
- `npm run test:production`: 13 public pages, legacy redirect/query preservation, removed learning URLs, private JSON URLs, and guest API grading passed.
- `npm run test:e2e`: six passing Chromium integration/browser scenarios.
- `npm audit`: zero reported vulnerabilities, including development dependencies.
- Deployment traces include JSON content dependencies for quiz and flashcard API functions.

The browser suite covers English/Urdu server grading, signature tampering, deterministic daily questions, personality results, rejected anonymous writes, bounded request bodies, guest quiz completion, session-language consistency when preferences change, no guest saved progress, search, preference persistence, mobile navigation, and keyboard-operated flashcards. It also exercises development without Firebase or a preconfigured signing secret; production smoke testing supplies a random signing secret.

This does **not** verify a live Firebase project or Vercel deployment. No real credentials were supplied. Google/email sign-in, database isolation/rules, cloud subscriptions, concurrent account transactions, leaderboard opt-out, and account deletion need the live checklist in `firebase-setup.md` after connection. Content validation is structural, not a full factual audit.

ESLint remains on the latest compatible version 9 because bundled Next.js plugins still declare version-9 peer support. Patched transitive overrides address current advisories; upgrade the lint stack together when plugin compatibility permits.
