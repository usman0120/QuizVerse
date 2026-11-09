import { CONTACT_URL } from "@/components/ui";
export const metadata = { title: "Terms of Service" };
export default function Page() {
  return (
    <article className="page max-w-4xl">
      <h1 className="section-title">Terms of Service</h1>
      <div className="panel prose dark:prose-invert max-w-none">
        <p>Last updated: November 9, 2026.</p>
        <h2>Using QuizVerse</h2>
        <p>
          QuizVerse provides educational and entertainment quizzes, personality
          tests, and quotes. Use the platform responsibly, keep account
          credentials private, and do not submit abusive public display names or
          attempt to access other users’ data.
        </p>
        <h2>Content and results</h2>
        <p>
          Question answers, translations, historical claims, and quotes may
          contain errors or become outdated. They are not professional advice.
          Personality results are for entertainment and reflection, not
          psychological diagnoses. Public leaderboard scores are self-reported,
          unverified, and not a competitive certification.
        </p>
        <h2>Your account and data</h2>
        <p>
          Accounts are optional. Guest progress is local to a browser and can be
          lost if storage is cleared. Signed-in progress depends on Firebase
          availability, connectivity, and permissions. Export important progress
          or results. Never put sensitive information in a public display name.
        </p>
        <h2>Ownership</h2>
        <p>
          © QuizVerse. Original code, design, and content remain subject to the
          owner’s rights. Third-party materials retain their respective rights
          and licenses. No permission to redistribute protected material is
          granted by these terms.
        </p>
        <h2>Availability</h2>
        <p>
          The application may change, be temporarily unavailable, or require
          updates. Reasonable efforts are made to keep it useful, but
          uninterrupted service and error-free content are not guaranteed.
        </p>
        <h2>Contact and corrections</h2>
        <p>
          For issues, suggestions, content corrections, or account requests, use{" "}
          <a href={CONTACT_URL}>the developer’s portfolio contact form</a>.
        </p>
      </div>
    </article>
  );
}
