import Link from 'next/link';
export const metadata = { title: 'Privacy' };
export default function Page() {
  return <article className="prose">
    <h1>Privacy policy</h1>
    <p className="muted">Updated November 9, 2026</p>
    <h2>Guest use</h2>
    <p>Guests can play without creating an account. Guest quiz results and flashcard marks are not persisted. Language and theme preferences may remain in your browser’s session storage for the current tab.</p>
    <h2>Account information</h2>
    <p>Firebase Authentication processes your email address and sign-in details. If you use Google sign-in, Google supplies the account information allowed by that sign-in flow. QuizVerse stores a display name, preferences, server-graded quiz summaries, activity streaks, and flashcard progress in Cloud Firestore.</p>
    <h2>Public rankings</h2>
    <p>Leaderboard participation is opt-in and requires email verification. Only your display name, XP, and quiz count are published. You can opt out from your account. Public caches may take up to 90 seconds to reflect changes.</p>
    <h2>Service providers and browser storage</h2>
    <p>The application is hosted on Vercel and uses Google Firebase for authentication and account storage. These providers may process technical information such as IP addresses and service logs. Firebase uses essential browser storage to maintain your sign-in. Fonts are self-hosted. Optional flashcard images load from external providers, which receive your browser’s requests.</p>
    <p>QuizVerse does not currently run advertising, a site-wide visitor tracker, or optional analytics. See the <Link href="/cookies">storage policy</Link>.</p>
    <h2>Your controls</h2>
    <p>You can edit your profile, opt out of public rankings, sign out, or permanently delete your account and associated application data from the <Link href="/account">account page</Link>. Recent sign-in is required for deletion. Firebase and Vercel may retain service logs under their own retention policies.</p>
    <h2>Questions and corrections</h2>
    <p>For privacy inquiries, use the contact information on the <Link href="/contact">contact page</Link>. Do not post private account details in public GitHub issues.</p>
  </article>;
}
