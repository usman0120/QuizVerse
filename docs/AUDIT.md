# QuizVerse migration audit

## Current scope: Learning Hub removed

At the owner's request, the complete Learning Hub module has been retired: both routes, legacy redirects, navigation/homepage/result links, catalog and article reader, note/draft editor, types, CSS, all 24 article-data files, and unused sanitization dependencies are removed. Quizzes, flashcards, personality tests, quotes, accounts, and their progress remain supported. Existing users' retired records remain available through private exports; no production Firestore data was mass-deleted, and active flows do not recreate or re-sync those records.

The earlier migration findings and validation results below are historical. Claims about the removed module or its editor describe earlier versions, not current app functionality.

Removal validation: 22 unit/content tests, 12 browser tests (including 404s for the retired routes and absence of active links), and 2 Firestore permission tests passed. Lint, TypeScript, production build, and dependency audit also passed.

## Outcome and scope

The static HTML/JavaScript app was replaced by a Next.js App Router application using React, TypeScript, Tailwind CSS, Firebase Authentication, Cloud Firestore, and Vercel. There is **no admin panel, management system, internal contact inbox, Firebase Storage integration, Analytics, Realtime Database, or additional backend service**. Contact, suggestions, and reports go to the developer's portfolio form.

The original green/gold palette, fonts, category accents, hero, card layouts, main sections, dark theme, bilingual content, and working feature families were carried over into React components. The interfaces are not a pixel-for-pixel conversion of every old modal. Misleading placeholders and fake numbers were removed with the owner's approval. Educational JSON content is retained; empty files are removed.

## Findings and fixes

| Area                 | Observed problem                                                                                                      | Resolution                                                                                                                                                                                                        |
| -------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Accounts             | Passwords were saved as plaintext in `quizverse_profile`; a saved email was described as verified                     | Firebase Auth handles Google/email sign-in, registration, reset, and email verification. Legacy passwords are stripped; verification uses Auth state                                                              |
| Shared devices       | Browser profile impersonated an account; no real user separation                                                      | Guest cache and per-UID caches are separate; guest import is explicit; sign-out clears the active account cache                                                                                                   |
| Sync                 | Repeated page-specific storage logic, no cross-device persistence                                                     | Private per-item Firestore records; realtime subscriptions, local fallback, retry, timestamp merging, deletion tombstones                                                                                         |
| Theme/language       | `theme`, `darkMode`, `language`, and `preferredLanguage` disagreed; repeated toggle handlers                          | Shared settings provider and cross-tab storage handling; document language/RTL kept consistent                                                                                                                    |
| Shared code          | Homepage-only selectors were accessed on unrelated pages, causing null dereferences                                   | Shared React header/footer/provider; page components own their state and listeners                                                                                                                                |
| Resource paths       | `/js/main.js`, `/js/analytics.js`, `/js/storage.js`, `/css/styles.css`, and referenced local images did not exist     | Removed missing dependencies; bundled CSS/fonts/icons; media fallback and sanitized learning HTML                                                                                                                 |
| Build                | Tailwind build used `--watch`, preventing a terminating production build                                              | Separate `dev`, `build`, `start`, checks, and tests                                                                                                                                                               |
| Tailwind             | Content globs missed most HTML pages; undeclared plugins; mixed module syntax; CDN runtime compiler plus compiled CSS | One production Tailwind/PostCSS pipeline, full TSX content scanning, declared typography plugin                                                                                                                   |
| Quiz content         | 75 empty JSON files caused fetch/parse errors and unplayable category links                                           | Empty files removed; catalog built from actual playable content; unavailable category/type messages                                                                                                               |
| Question repetitions | 3,891 raw questions included 1,018 repeated type/text keys under the original exact-text comparison                   | Normalize case/spacing and suppress repeated question text at load time; source banks retained for editorial review                                                                                               |
| Answer indexes       | History uses one-based MCQ indexes, including six `4` indexes that were out of bounds in the old zero-based player    | Declared `meta.answerIndexBase: 1` and convert History answers to zero-based values at load time; other banks remain zero-based. Original answer numbers are retained; malformed records in any bank are excluded |
| Daily challenge      | External trivia request relied on an unsupported seed assumption and could fail independently                         | Deterministic UTC-date selection from the local General Knowledge bank                                                                                                                                            |
| Answer flow          | Scoring/timer callbacks could race or allow repeated actions                                                          | One-answer lock, explicit setup/play/result states, guarded completion, deadline-based timing and visibility handling                                                                                             |
| Question types       | Inconsistent type strings and silent fallback to other question types                                                 | MCQ, true/false, and fill-blanks use the existing JSON names; unavailable types are explained instead of silently changed                                                                                         |
| Personality          | Revisiting answers added/subtracted the wrong points, skewing final results                                           | Recompute scores once from final selected answers; stable tie handling; all 23 quizzes retained                                                                                                                   |
| Personality claims   | Fake accuracy, rarity, scientific-design claims; homepage tests did not match actual data                             | Actual quizzes displayed, entertainment disclaimer, unsupported numeric claims removed                                                                                                                            |
| Flashcards           | Learned state keyed to the current shuffled index, causing cards to swap progress                                     | IDs assigned before shuffle/filter; learned/difficult state and review due dates stored independently                                                                                                             |
| Study progress       | Mock streaks, incomplete badges rendering, browser activity presented as global usage                                 | Real personal activity streak, quiz totals, bookmarks, mastery, and study time; no fake global users/views                                                                                                        |
| Leaderboard          | Mock players/scores presented as real                                                                                 | Opt-in Firestore casual submissions, clear unverified label, bounded recent list; private profile fields excluded                                                                                                 |
| Learning             | Different object/array data schemas, incorrect topic links, global font resizing                                      | Normalize both learning schemas; category/topic routes; article-only font sizing; saved notes/bookmarks/highlights                                                                                                |
| HTML safety          | Profile/data strings inserted directly into `innerHTML`                                                               | React text rendering; learning HTML sanitized using an allowlist; highlight text inserted as text nodes                                                                                                           |
| Contact              | Forms showed success without delivering messages; logging stubs                                                       | Redirect/link to `https://usman-portfolio-silk.vercel.app/contact` everywhere                                                                                                                                     |
| Marketing            | Unimplemented multiplayer, AI assistance, voice recognition, community decks/forums, fake testimonials and counters   | Removed unsupported claims rather than inventing new services                                                                                                                                                     |
| Cookies/privacy      | Unused analytics toggles; blanket `localStorage.clear()` destroyed unrelated data                                     | Accurate storage/privacy copy; scoped QuizVerse clearing; explicit export/reset controls                                                                                                                          |
| Accessibility        | Clickable non-buttons, missing labels, modal focus issues, motion without preference handling                         | Buttons/links/labels, skip link, native dialog, responsive menu, reduced-motion support, progress semantics                                                                                                       |
| Navigation           | `.html` links and inconsistent query conventions                                                                      | Permanent compatibility redirects; old `learn?topic=<category>` supported; clean Next routes                                                                                                                      |
| Repository           | Markdown accidentally pasted into `.gitignore`, unignored generated output, outdated README                           | Correct ignore file, updated setup/audit/testing documents; originals and obsolete CSS removed                                                                                                                    |
| Dependencies         | Vulnerable transitive packages in initial install                                                                     | Compatible patched transitive overrides, lockfile committed; dependency audit included in validation                                                                                                              |

## Removed unnecessary files

- Root static pages: `index.html`, `about.html`, `contact.html`, `cookies.html`, `flashcards.html`, `learn.html`, `learning-categories.html`, `personality.html`, `privacy.html`, `quiz-categories.html`, `quiz.html`, `terms.html`.
- Obsolete sources/output: `src/js/main.js`, `src/js/analytics.js`, `src/index.css`, `dist/style.css`, empty `1.json`.
- The 75 empty files below formerly lived in `data/questions/`:

```text
architecture.json currency.json dance.json dua_azkar.json english_grammar.json
environmental_science.json ethics_manners.json famous_landmarks.json fashion.json
film_cinema.json fiqh_basics.json flags_countries.json fun_facts.json fun_zone.json
gadgets.json geography_of_pakistan.json geology.json geometry.json health_hygiene.json
human_body.json internet.json inventions.json islamic_ethics.json languages_literature.json
learn.json load.json local_festivals.json medical_fields.json mental_math.json
mobile_technology.json mughals.json music.json national_heroes.json nature_in_urdu_literature.json
nature_life.json nobel_prize.json olympics.json painting_design.json pakistani_constitution.json
pakistani_culture.json pakistani_food.json pakistani_heroes.json pakistani_special.json
photography.json physics.json pillars_of_islam.json programming_basics.json prophets_stories.json
proverbs_idioms.json quran_hadith.json riddles.json riddles_rhymes.json safety_tips.json
seerah.json shapes_colors.json space_galaxy.json storytelling.json tareekh_e_pakistan.json
tareekh_e_pakistan_2.json technology.json tech_companies.json theatre.json time_management.json
translation.json true_false.json urdu_pakistan_special.json urdu_poetry_ghazals_nazms.json
urdu_riddles_idioms.json urdu_shayari_quiz.json vocabulary.json weather.json world_art.json
world_literature.json world_wars.json would_you_rather.json
```

Git history preserves the originals. A temporary pre-migration backup was also kept outside the repository. Pre-existing untracked `.next/` and test/build artifacts were left alone and ignored; the new app uses `.next-build/`.

## Remaining issues / deliberate limitations

1. **Editorial review is still needed.** Structural validation cannot certify factual answers, time-sensitive statements, Urdu poetry attribution/transliteration, religious quotations, or translations. The 100 original quotes are retained with unverified-attribution wording. Short one-paragraph learning entries should not be described as comprehensive lessons.
2. **Exact duplicates are now removed.** The approved exact-only cleanup removed 864 records (3,891 → 3,027); 115 groups of differing versions remain, including 8 groups with differing answer text that need semantic review. Reports are in `docs/content-cleanup.json` and `docs/content-review.json`. No differing versions were deleted by guessing.
3. **Casual scores are not cheat-proof.** Rule validation prevents cross-user writes and obviously invalid ranges, not fabricated in-range results. There are no prizes or competitive claims. Strong verification would require a separate approved server-side design.
4. **Live cloud configuration is partially verified.** The owner reports publishing Firestore rules. Production pages and a bounded public leaderboard read were checked successfully. Firebase Auth's public configuration showed that `quiz-verse-nine.vercel.app` was not authorized: add it in Authentication → Settings → Authorized domains. Actual Google/email sign-in and private cross-device sync still require a signed-in live check; nobody's private account was accessed.
5. **Last-write-wins remains deliberate.** Concurrent changes to the same profile/preference/progress item use timestamp-based merging. Sync timestamps are calibrated against the same-origin Vercel clock endpoint; clock/network failures retain local data and show an error. The retired note editor and its conflict/draft flows are no longer part of the app.
6. **Legacy recovery is improved, but ambiguity remains.** Profiles, personality history, and exact matching quote favorites migrate. Retired feature records are export-only. Old passwords are scrubbed even if a v2 cache already exists, and corrupt records do not crash valid profiles. Old flashcard indexes may already be wrong due to the original shuffle bug; ambiguous records remain in the export rather than being guessed.
7. **Scale is improved, not unlimited.** Quiz payloads are bounded to a 50-question practice pool; repeat question text across combined banks is suppressed. Personal history has Show More rather than silently hiding everything after 100 records. Study checkpoints accumulate into a per-day/per-tab counter instead of creating a document for every deck visit. Initial private hydration still reads the user's entries; very large accounts would benefit from true server-side history paging/archiving. Public rankings remain bounded to the latest 100 submissions.
8. **Offline data protection is improved.** Sign-out waits for pending Firestore writes; failed/offline sync requires explicit discard confirmation before clearing caches. Exports include retained historical device data. The app is not a service-worker/PWA and cannot guarantee offline page loads; use Export before discarding unsynced device data.
9. **Media failures are handled more consistently.** Flashcard/personality images have fallbacks and retry when their source changes. Third-party licensing/attribution still needs review before commercial use. The QuizVerse Q/question-mark logo is a local SVG used in header/footer/favicon.
10. **Legal wording** is implementation-aligned, not a substitute for legal review, especially for young learners, public display names, jurisdiction-specific consent, and deletion requests.

## Validation commands

```sh
npm run check
npm run test:rules
npx playwright install chromium
npm run test:e2e
npm audit
```

Rules tests run against the **demo-quizverse emulator**, never production. Google popup behavior and live email delivery require a final manual check on the authorized production domain.

### Local verification result (November 9, 2026)

- Lint, generated route types, TypeScript, and optimized production build: passed.
- Logic/content/storage unit tests: 16 passed.
- Chromium browser regressions: 10 passed, including timed expiry, fill-blanks, guest persistence, mobile navigation, Urdu/theme, notes/bookmarks, flashcards, personality scoring, and old URL behavior.
- Firestore emulator permission tests: 2 passed; owner isolation, stale writes, public score validation, and bounded reads checked.
- `npm audit`: zero reported vulnerabilities.
- Firestore production rules were **not deployed**, as requested. Vercel environment variables were confirmed by the owner; the live deployment and Google/email delivery still require verification after the push.

## Follow-up after rule publication

The owner subsequently confirmed rule publication. The follow-up keeps the approved stack and design, adds the professional green/gold vector logo, exact-only content cleanup, two source-verified History corrections, draft recovery, safer flush/sign-out and sync error reporting, server-aligned clocks, cache validation, bounded quiz payloads, study counters, and better media fallbacks. See `docs/CONTENT_REVIEW.md` for editorial evidence. No new Firestore rules or admin system are required by these changes.

Follow-up validation: **23 unit/content tests, 13 Chromium browser tests, and 2 Firestore permission tests passed**, along with lint, TypeScript, the production build, and a zero-vulnerability dependency audit. The logo was visually checked at mobile size. The remaining authorized-domain action above is a Firebase console setting, not something a code deployment can fix.
