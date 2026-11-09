# QuizVerse issue inventory

This inventory combines a static audit of the legacy application, a machine-readable content scan, and migration decisions confirmed by the owner. It is not a claim that every factual error or every possible browser edge case has been exhaustively found.

## Fixed or removed

| Issue | Evidence / previous location | Resolution |
| --- | --- | --- |
| No real application runtime | `package.json` only ran a Tailwind watch command | Next.js Node.js development, build, and production scripts |
| Build never completed normally | Original `build` used `--watch` | Finite production build |
| Misnamed package | `tailwind-starter` | `quizverse`, private package, version 2 |
| Undeclared Tailwind plugins | Original config required forms/filters not in package dependencies | Removed obsolete toolchain; shared CSS |
| Most pages absent from CSS content scanning | Original Tailwind scanned `index.html` plus nonexistent folders | No runtime scanning dependence |
| Multiple styling systems | CSS source, generated CSS, CDN Tailwind, per-page inline configs | Single shared CSS file |
| External font loading and privacy dependency | Google Fonts network requests | Self-hosted Poppins and Noto Nastaliq Urdu assets |
| Huge duplicated inline controllers/styles | Especially `quiz-categories.html`, `quiz.html`, `personality.html` | Reusable React components and central services |
| Shared script crashes on non-home pages | `main.js` dereferenced missing menu/theme/category/leaderboard elements | Page-specific React rendering; no global DOM assumptions |
| Missing script URLs | `/js/main.js`, `/js/analytics.js`, `/js/storage.js` in legacy pages | Module imports replace nonexistent script paths |
| Random category quiz counts | `main.js` used `Math.random()` for counts | Counts derived from validated source content |
| Mock homepage leaderboard | Hardcoded names and scores in `main.js` | Real optional Firestore-backed rankings; truthful empty/error states |
| Visitor statistics were browser-local, not site-wide | `src/js/analytics.js` | Removed misleading analytics |
| Consent switches did not govern tracking | Analytics script ignored legacy preference keys | Removed tracker and fake analytics switches |
| Cookie clearing wiped all site storage | `cookies.html` called `localStorage.clear()` | No blanket clearing behavior |
| Daily challenge depended on unreliable third-party behavior | OpenTDB call with an assumed daily seed | Deterministic local questions by UTC date |
| Broken category mappings / empty quiz routes | `science_nature`/`kids` links and placeholder categories | Catalog derives from actual valid files; invalid categories return 404 |
| 75 empty JSON category placeholders | Full names in `legacy-data-audit.json` | Deleted; never advertised as playable |
| Six out-of-range answer indexes | History source IDs 7, 15, 25, 81, 94, 116 | Excluded; all History MCQs quarantined due mixed conventions |
| 1,068 repeated prompt occurrences | Detailed first/duplicate references in audits | Per-category runtime deduplication, originals preserved |
| Question type aliases inconsistent | `fill-blanks` versus other spellings | Common validated type normalization |
| Shuffled choice/index consistency fragile | Client grading and rendering spread across controllers | Server grading maps display choices to original indexes |
| Client could invent scores/statistics | Legacy profile and leaderboard values in local storage | Server grading and transaction-only score/stat writes |
| Retry/double-submit could duplicate progress | No central durable attempt identity | Idempotent session-UUID history transactions |
| Replays could farm public points trivially | No daily credit ledger | One XP-bearing knowledge attempt per category/day |
| No true account identity | Browser-local profile masqueraded as an account | Firebase Google/email authentication |
| No cross-device progress | Many independent local-storage keys | Authenticated Firestore subscriptions and server APIs |
| Duplicated profile implementations | Homepage, quiz, categories, personality | Shared account model and account page |
| Mandatory unnecessary demographic data | Age/gender/country profile forms | Minimal profile, optional display-name-only public participation |
| Theme/language disagreement | `darkMode`, `theme`, `language`, `preferredLanguage`, multiple controllers | Shared typed preferences; account sync |
| Unprotected / corrupt browser JSON could stop flows | Direct local-storage JSON parsing across pages | No guest progress persistence; bounded guarded preference parsing |
| Unstable timer/streak concepts | Independent timers and dates across modules | Wall-clock practice deadlines and one UTC activity-streak model |
| Flashcard progress updates could conflict | Independent learned/difficult local maps | Transactional per-card marks; exclusive statuses |
| Unsupported personality certainty claims | Static accuracy/rarity/match fields | Not shown; entertainment disclaimer and point-based results |
| Nonfunctional feedback/contact forms | Missing storage helper or comments pretending to submit | GitHub issue link and optional real private contact email |
| Unrelated quote/favorites subsystem | Large `main.js` quote data/controller | Removed with owner approval |
| Learning feature explicitly unwanted | Learning pages, JSON content, notes/bookmarks controllers | Completely removed, including navigation; old learning URLs 404 |
| Broken setup documentation | README used wrong CSS paths and recommended `file://` | Actual Node.js/Firebase/Vercel instructions |
| Markdown pasted into `.gitignore` | Literal fences/headings in old ignore file | Clean ignore rules for secrets, dependencies, builds |
| Generated/obsolete files cluttered repository | Old compiled CSS, old configs, empty `1.json` | Removed, build output ignored |
| No automated regression checks | No tests or lint/type scripts | Unit tests, lint, strict TypeScript, build checks |
| Accessibility concerns from DOM-driven cards/modals | Nonsemantic clickable containers and scattered handlers | Links/buttons, accessible form labels, keyboard flashcards, skip link, reduced-motion support |
| Old bookmarked HTML links would break after migration | Original `.html` paths | Redirects to supported Next.js routes, preserving query strings |

## Remaining / requires owner setup or review

| Priority | Issue | Next action |
| --- | --- | --- |
| Required | Firebase project, providers, credentials, rules, and authorized domains are not connected | Follow `firebase-setup.md`; test with a disposable project |
| Required | Vercel environment variables are not set by repository code | Configure browser/server env values and signing secret, then redeploy |
| Required | Live Google/email auth, Firestore isolation, cross-device sync, and deletion need integration verification | Run the setup checklist after connecting Firebase |
| High | History MCQs mix answer-index conventions; in-range indexes can still be wrong | Keep quarantine; perform individual editorial corrections before restoring |
| High | Structural validation does not establish factual correctness | Review duplicated/conflicting prompts, ambiguous facts, explanations, translations |
| High | No distributed API rate limiter or verified App Check enforcement | Configure Vercel Firewall/rate limits and Firebase budgets before public traffic |
| Medium | Casual ranking fairness is limited | First-attempt credit is a simple anti-farming rule; question counts/difficulties differ and outside lookup remains possible |
| Medium | Content authorship, external image availability/rights, and references may be unverifiable | Review populated flashcard/personality sources before making attribution claims |
| Medium | Policies should be reviewed for your actual audience/jurisdiction | Verify legal text and configure a private contact email |
| Medium | Optional images still rely on external providers | Consider self-hosting licensed media if privacy/offline reliability is a priority |
| Low | ESLint 9 is deprecated upstream, but bundled Next.js plugins still declare ESLint 9 compatibility | Keep compatible, security-patched tooling; upgrade together when plugin compatibility permits |
| Low | Full completed answer reviews are not retained, only summaries | Deliberate scope choice; add retained reviews only if desired |
| Low | Guest historical data from the old site is not migrated | Deliberate owner decision: saving requires login, no guest imports |
| Low | No admin panel, email feedback delivery, multiplayer, PWA/offline mode | Not requested; do not add complexity until needed |

## Data counts

- Original knowledge source: **102 files**, **75 empty**, **3,891 questions**.
- Retained populated knowledge files: **27**.
- Structurally valid questions: **3,885**; all **134 History MCQs** withheld, including the six invalid entries.
- Runtime playable questions after safety exclusions and per-category deduplication: **2,777**.
- Repeated prompt occurrences across the raw catalog: **1,068**. These are question-level repetitions, not identical file duplicates.
- No duplicate question IDs within individual files or byte-identical populated files were found by this scan.

See the JSON audits for exact source filenames/indexes. Populated source content is intentionally preserved rather than deleted or guessed at.
