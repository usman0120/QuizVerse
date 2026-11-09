import Link from "next/link";
import { CONTACT_URL } from "@/components/ui";
export const metadata = { title: "Privacy Policy" };
export default function Page() {
  return (
    <article className="page max-w-4xl">
      <h1 className="section-title">Privacy Policy</h1>
      <div className="panel prose dark:prose-invert max-w-none">
        <p>Last updated: November 9, 2026.</p>
        <h2>Information you choose to provide</h2>
        <p>
          Guest progress stays in your browser. When you sign in, Firebase
          Authentication manages your account and Firestore stores your private
          QuizVerse profile, quiz results, preferences, and flashcard progress.
          Country, age, education level, and gender are optional. QuizVerse
          never stores passwords in profiles.
        </p>
        <h2>Public results</h2>
        <p>
          Publishing a casual score is optional. Only your display name, quiz
          title/category, score, question count, time taken, and submission date
          are published. Email, age, gender, country, and private account data
          are not included. Scores are client-reported and not verified.
        </p>
        <h2>Browser storage and synchronization</h2>
        <p>
          The article-and-note feature has been retired. Previously stored
          records are retained for private data exports rather than
          automatically purged from user accounts. New app flows do not create
          or re-sync those retired records. Signing out checks pending writes
          and warns before discarding unsynced device data.
        </p>
        <p>
          Local browser storage keeps guest progress and a per-account cache.
          Firebase maintains authentication state. Signing out removes the
          current account’s local progress cache, but not cloud data. On a
          shared device, sign out when finished. Progress changes synchronize
          when connectivity and Firestore permissions allow. Deletion markers
          contain no former progress values and prevent removed records from
          returning on another device.
        </p>
        <h2>Third-party services</h2>
        <p>
          This app uses Firebase Authentication, Cloud Firestore, and Vercel
          hosting. These providers process technical information required to
          operate their services under their own policies. Some educational
          images load from external providers such as Wikimedia and Unsplash;
          they receive normal image-request information. Fonts and icons are
          hosted with the app. No analytics or advertising tracker is added by
          this application.
        </p>
        <h2>Contact</h2>
        <p>
          Contact, suggestions, and issue reports open the developer’s portfolio
          form. That site’s own handling applies to information submitted there.{" "}
          <a href={CONTACT_URL}>Contact the developer</a>.
        </p>
        <h2>Your controls</h2>
        <p>
          You can export your data, clear private QuizVerse progress, and remove
          your published scores on the <Link href="/account">profile page</Link>
          . Profile edits replace former profile values. For account deletion or
          other privacy requests, contact the developer. Local guest storage can
          be cleared from <Link href="/cookies">Cookies & Storage</Link>.
        </p>
        <h2>Young learners</h2>
        <p>
          Young learners may use guest access without providing personal
          details. If you are below the age at which you can consent to an
          online account in your location, ask a parent or guardian before
          creating an account or publishing a display name. Do not include
          identifying information in public names or quiz shares.
        </p>
      </div>
    </article>
  );
}
