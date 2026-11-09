import Link from 'next/link';
export const metadata = { title: 'Cookies and storage' };
export default function Page() {
  return <article className="prose">
    <h1>Cookies and browser storage</h1>
    <h2>Essential storage only</h2>
    <p>Firebase Authentication uses browser storage to keep signed-in users authenticated. This is necessary for account features. Guest theme and language choices use session storage; guest scores and study progress are not saved.</p>
    <h2>No optional analytics</h2>
    <p>There is no advertising tracker or optional analytics integration in the current application. We therefore do not show nonfunctional analytics switches or a misleading “accept all” banner.</p>
    <h2>Managing storage</h2>
    <p>Sign out from your <Link href="/account">account</Link> to end your application session. Your browser’s site settings let you clear local site data, which can sign you out. Clearing browser data does not delete cloud account data; use the explicit account-deletion control for that.</p>
    <p>External sign-in providers and optional image services may have their own policies. Fonts are self-hosted. See <Link href="/privacy">Privacy</Link> for details.</p>
  </article>;
}
