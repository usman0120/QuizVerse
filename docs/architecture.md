# Architecture and security

## Application

Next.js App Router provides server-rendered pages and Node.js API routes. React components centralize navigation, preferences, authentication state, and cloud subscriptions. Shared CSS preserves the original green/gold identity without Tailwind CDN/runtime configuration or duplicated page styles.

All content is maintained in local JSON. Server components expose only category metadata or flashcard data; knowledge answer keys are never imported into client components or served under `/public`. Next.js output tracing includes JSON dependencies in deployed API functions.

## Quiz flow

1. `/api/quiz/start` validates category/type/count/language and verifies Firebase identity if supplied.
2. The server chooses valid questions, shuffles choices, and returns prompts plus an HMAC-signed, one-hour session token.
3. Tokens identify original question indexes, content hashes, and option order, but contain no answer keys. They are bound to the user identity at start; changing sign-in or deploying changed question content during a quiz requires restarting rather than grading against the wrong revision.
4. `/api/quiz/submit` verifies signature, expiry, identity, and answer shape, then grades against the server content.
5. Guests receive an in-memory result only. Account results are saved in a transaction keyed by the session UUID. An answer hash rejects changed-answer resubmission; identical retries return the first stored summary rather than incrementing statistics twice.
6. The first knowledge quiz per category per UTC day earns 10 XP per correct answer. Replays and personality quizzes do not award XP. The credit rule reduces trivial score farming; it is not a full fairness model.

Practice timers use wall-clock deadlines so a backgrounded tab does not pause time. They are a UI practice aid, not server-enforced per-question proctoring. A one-hour overall server session expiry is enforced for all quizzes.

## Firestore documents

```text
users/{uid}                     profile, updatedAt
users/{uid}/stats/summary        quiz count, accuracy totals, XP, UTC activity streak
users/{uid}/history/{sessionId}  saved result summary, completion date, XP
users/{uid}/credits/{date_cat}   daily/category XP credit
users/{uid}/progress/flashcards  learned and difficult card IDs
leaderboard/{uid}               public display name, XP, quiz count, updatedAt
```

The history UI loads the latest 50 summaries. Full question/answer review is shown after play, not retained in Firestore. Quiz completion or marking a studied flashcard contributes to the shared UTC activity streak. Stale streaks display as zero once the previous activity is more than one UTC day old.

Flashcard writes use a transaction, merge per-card status, and keep learned/difficult sets mutually exclusive. Concurrent changes to different cards do not overwrite the whole account’s progress.

## Authentication and permissions

- Firebase client SDK handles Google/email sign-in and essential auth persistence.
- API routes verify Firebase ID tokens (including revocation checks) using server-only Admin credentials.
- All database writes are made through validated server APIs. Firestore rules allow owner-only client reads and deny direct client writes/public collection reads.
- Profiles collect only display name, language, theme, and optional public participation. No mandatory age, country, or gender.
- Ranked publication requires a verified email. Opt-out deletes the public document. Public API response caching can delay removal briefly.
- Account deletion requires a Firebase authentication time within five minutes and deletes the user subtree, public entry, and Firebase Auth user.
- Request bodies are limited to 32 KB of actual bytes; Zod rejects extra fields and invalid values.

## Limitations and operations

No client-submitted score totals are trusted. Nevertheless, a public content repository, external lookup tools, multiple accounts, and automated attempts mean the leaderboard is not cheat-proof. It is intentionally casual.

No global distributed rate limiter, App Check enforcement, email-delivery service, admin dashboard, analytics, Storage bucket, or paid service is assumed. Add Vercel Firewall rate limits, budgets, and monitored Firebase quotas before broad public use. Do not claim production Firebase verification until the connection and live checks are complete.
