# QuizVerse

English and Urdu quizzes, personality tests, flashcards, and a learning hub. Migrated from the original static project to **Next.js, TypeScript, Firebase Auth, and Cloud Firestore**, deployed on **Vercel**.

## Run locally

Use Node.js **22 or 24 LTS** (Vercel should use the same major version).

```sh
npm ci
```

Copy `.env.example` to `.env.local`, populate the six Firebase web-app values, then:

```sh
npm run dev
```

Open `http://localhost:3000`. Production:

```sh
npm run build
npm start
```

Firebase web-app configuration is public client configuration, **not an authorization boundary**. Firestore rules protect data. Never commit private keys, service account credentials, or local environment files. No Firebase Admin key or Storage service is needed by this app.

## Firebase setup

1. In Firebase project `quizverse-84090`, enable **Google** and **Email/Password** in Authentication.
2. Add the production Vercel/custom domain and `localhost` to **Authentication → Settings → Authorized domains**. Add preview domains only if previews need sign-in.
   The current production host is `quiz-verse-nine.vercel.app`; Google sign-in requires this exact hostname in the authorized-domain list (without `https://` or a trailing slash).
3. Enable Firestore. Publish `firestore.rules`. If this project is shared with another app, merge the two explicit QuizVerse paths into its existing rules; do not overwrite unrelated rules blindly.
4. Firebase CLI alternative, after logging in: `firebase deploy --only firestore:rules --project quizverse-84090`.

Collections:

- `quizverse_users/{uid}/entries/{encodedKey}`: private profile, settings, results, notes, bookmarks, highlights, flashcard progress, activity, and sync markers.
- `quizverse_scores/{uid_resultId}`: opt-in casual public scores. No private profile fields.

Content stays in `data/`: **27 playable quiz banks**, **24 learning categories**, flashcard decks, and **23 personality quizzes**. New content is published through Git; no admin panel is included.

## Vercel deployment

The GitHub repository is connected to Vercel. `vercel.json` identifies Next.js, uses `npm ci`, `npm run build`, and the configured `.next-build` output directory.

1. In Vercel, set the framework to **Next.js**, repository root as the root directory, and Node **22 or 24**.
2. Add these variables for **Production** and any required **Preview** environment:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` (configuration only; Storage is not used)
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` (configuration only; Messaging is not used)
3. Optionally set `NEXT_PUBLIC_SITE_URL` to your final HTTPS domain for canonical metadata/sitemap.
4. Rebuild after changing `NEXT_PUBLIC_*` variables: Next.js includes these values at build time.
5. Push to `main` to trigger the connected production deployment.

Old `.html` URLs redirect to the corresponding Next routes and retain query parameters. All contact/suggestion/report links open [Usman's portfolio contact form](https://usman-portfolio-silk.vercel.app/contact).

## Features and data behavior

- Guest play with local progress; optional Google or email accounts.
- Timed/untimed quizzes, MCQ/true-false/fill-blanks, hints, skips, result review, sharing, and JSON/image downloads.
- Deterministic daily challenge; no external trivia API dependency.
- Learning sections/subtopics, search, bookmarks, notes, text highlights, font controls, and references.
- Flashcard text/image/mixed modes, shuffle, learned/difficult flags, due-card review, and progress statistics.
- All original personality quizzes with corrected scoring and result history.
- Shared dark theme, Urdu/RTL preferences, responsive navigation, and scoped data controls.
- Real, opt-in **casual** leaderboard; scores are client-reported, not competitive/verified.
- Guest/account caches are isolated. Guest import is explicit. Deletion markers keep cleared progress from reappearing on other devices.
- Unsaved notes recover on this device after navigation/reload; exports include drafts. Sign-out waits for pending writes before clearing the account cache.
- Sync timestamps use the app's uncached `/api/time` endpoint to tolerate an incorrect device clock. No additional backend service or Firebase Admin credential is needed.
- A local vector QuizVerse logo and matching favicon replace the emoji icon.

Exact-only source cleanup and editorial reports: [Content review](docs/CONTENT_REVIEW.md). Run `npm run audit:content` to generate the report without changing content; `npm run clean:content` removes only complete duplicates except ID.

## Checks

```sh
npm run check
npm audit
npx playwright install chromium
npm run test:e2e
```

Firestore rules tests require Java 21+ and Firebase CLI:

```sh
npm install -g firebase-tools
npm run test:rules
```

They use the local `demo-quizverse` project on port 18088, not production.

See [the full audit](docs/AUDIT.md) for removed files, fixed bugs, known limitations, and outstanding content-review work.

## Source layout

```text
src/app/          Next.js routes, metadata, styles
src/components/   Feature components and shared account/progress provider
src/lib/          Content normalization, quiz logic, Firebase and sync utilities
data/             Original version-controlled educational content
tests/            Unit, browser, and Firestore emulator tests
docs/AUDIT.md     Migration findings and remaining issues
firestore.rules   Owner-only progress and bounded casual score permissions
```

© QuizVerse. Developed by Usman Ahmad. Original ownership and third-party material licenses remain applicable.
