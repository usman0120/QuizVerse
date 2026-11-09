# Firebase and Vercel setup

The application is prepared, but Firebase resources, domains, credentials, and Vercel environment variables must be configured in your accounts. No real Firebase credentials are included.

## 1. Create or select a Firebase project

1. Open the Firebase console and register a **Web app**.
2. In **Authentication → Sign-in method**, enable **Google** and **Email/Password**.
3. Configure a support email for Google sign-in and customize verification/password-reset email templates if desired.
4. Enable email enumeration protection (usually enabled for new projects).
5. Set an appropriate password policy (the registration UI requires at least eight characters).
6. In **Firestore Database**, create a database in **production mode**, in a region appropriate for your audience.

Use one Firebase project for both web configuration and server credentials. Prefer separate projects for production and development when real users are present.

## 2. Local environment

Copy `.env.example` to `.env.local`. Fill in the four `NEXT_PUBLIC_FIREBASE_*` fields from the Web app’s Firebase configuration. They identify the browser application; they are not service-account secrets.

For the server, obtain a Firebase Admin service-account credential through **Project settings → Service accounts**, or use your organization's approved service-account mechanism. Set:

```dotenv
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
QUIZ_SESSION_SECRET=your-generated-random-secret
NEXT_PUBLIC_CONTACT_EMAIL=your-private-contact-address
```

Generate the quiz signing secret locally:

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Never put server secrets in `NEXT_PUBLIC_*` variables, upload credentials to GitHub, or paste them into chat. Store downloaded credentials outside the repository. Use a dedicated least-privilege service account with the necessary Firestore and Authentication administration permissions.

The signing secret must remain stable between start and submit requests and across Vercel instances. Development can use a temporary fallback; changing/restarting it invalidates active quizzes. Production deliberately fails closed without a configured secret.

## 3. Deploy Firestore rules

The supplied rules let a signed-in user read only their own account documents. Browser writes and direct leaderboard access are denied. All writes and public leaderboard reads go through validated Node.js API routes.

```sh
npx firebase-tools login
npx firebase-tools use --add
npx firebase-tools deploy --only firestore:rules,firestore:indexes
```

Select the correct project. Alternatively, copy `firestore.rules` into the Firebase console’s Rules editor and publish it. Never switch the database into open/test mode as a workaround.

No composite indexes are required by the current queries. If future filters require one, add it to `firestore.indexes.json` and deploy it.

## 4. Vercel

Your GitHub repository is already connected, so a push to `main` may deploy immediately.

1. Select the **Next.js** framework preset, repository root, and Node.js 24 runtime (or supported Node.js 22 runtime).
2. Use `npm install`/`npm ci`, `npm run build`, and the default Next.js output settings. **Do not configure a static export or use the old `dist/` directory.**
3. Add all environment variables above under **Project → Settings → Environment Variables**. Apply secrets only to the intended environments.
4. Add the browser Firebase settings as well as server settings. `NEXT_PUBLIC_*` values are embedded at build time: redeploy after changing them.
5. For `FIREBASE_PRIVATE_KEY`, Vercel accepts the actual multiline value or the escaped `\n` form supported by this application. Do not wrap the value in extra quote characters in the Vercel UI.
6. Add the production domain and any preview domains used for authentication to **Firebase Authentication → Settings → Authorized domains**. Add `localhost` explicitly if needed for local development.
7. Redeploy after environment configuration. Check Vercel function logs if account APIs fail.

Without Firebase, guest pages render and account screens explain the missing configuration. Production guest quiz start/submit still needs `QUIZ_SESSION_SECRET`.

## 5. Verify before public launch

- Google sign-in, registration, verification, password reset, and sign-out.
- New account initialization and correct profile synchronization across two browsers/devices.
- Quiz submission saves once; retrying the same session does not add XP or quiz counts again.
- The first knowledge quiz per category/day earns XP, subsequent practice does not.
- UTC streak rollover and missed-day behavior.
- Flashcard marks synchronize; concurrent updates to different cards are retained.
- Unverified accounts and guests do not appear on rankings.
- Opt-in publishes only display name, XP, and quiz count; opt-out removes the entry after cache expiry.
- One account cannot read another account’s documents or write scores directly from the client.
- Recent sign-in is required to delete an account; associated Firestore data and public entry are removed.
- Confirm the private contact email and review policies for your audience/jurisdiction.

Live Firebase flows cannot be fully verified without connecting a real test project. Use a disposable development project before deploying real user data.

## Cost and abuse controls

Configure Firebase/Vercel budget alerts and appropriate quotas. Use Vercel Firewall/rate limits for `/api/*` before a broad public launch, especially anonymous quiz endpoints. Signature validation, bounded JSON bodies, and daily XP credits are integrity controls, not a global rate limiter or complete bot defense. Consider Firebase App Check and stronger abuse controls as traffic grows.
