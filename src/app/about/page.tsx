import Link from "next/link";
import { CONTACT_URL, Icon } from "@/components/ui";
export const metadata = { title: "About QuizVerse" };
export default function Page() {
  return (
    <>
      <section className="bg-gradient-to-r from-brand to-secondary text-white py-16 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome to QuizVerse
          </h1>
          <p className="text-lg max-w-2xl mx-auto">
            A place to explore, learn, and test your knowledge—one question at a
            time.
          </p>
        </div>
      </section>
      <div className="page">
        <section className="mb-16">
          <h2 className="section-title text-center mb-10">
            Our Mission & Vision
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              [
                "bullseye",
                "Mission",
                "Make learning accessible, engaging, and enjoyable through quizzes and bite-sized learning resources.",
              ],
              [
                "eye",
                "Vision",
                "Build a welcoming learning space where curiosity has no boundaries and everyone can keep growing.",
              ],
            ].map(([icon, title, text]) => (
              <article className="panel text-center" key={title}>
                <Icon
                  name={icon}
                  className="text-brand dark:text-secondary text-4xl mb-5"
                />
                <h3 className="text-xl font-bold mb-4">{title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{text}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="panel mb-12">
          <h2 className="section-title">Why We Built This</h2>
          <p className="text-gray-600 dark:text-gray-300">
            QuizVerse began as an independent project by Usman Ahmad, combining
            a love of learning with web development. It brings science, history,
            Islamic studies, literature, and everyday knowledge together in one
            place.
          </p>
        </section>
        <section className="mb-16">
          <h2 className="section-title text-center mb-10">
            What Makes QuizVerse Different
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              [
                "globe",
                "Diverse Content",
                "Quiz categories and learning topics covering a variety of interests.",
              ],
              [
                "language",
                "English & Urdu",
                "Bilingual questions and available Urdu learning translations.",
              ],
              [
                "book-open",
                "Beyond Quizzes",
                "Personality quizzes, daily challenges, quotes, and progress tracking.",
              ],
              [
                "cloud",
                "Your Progress",
                "Guest access, optional accounts, and cross-device progress sync.",
              ],
            ].map(([icon, title, text]) => (
              <article key={title} className="panel">
                <Icon
                  name={icon}
                  className="text-3xl text-brand dark:text-secondary mb-5"
                />
                <h3 className="font-bold text-xl mb-3">{title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {text}
                </p>
              </article>
            ))}
          </div>
        </section>
        <section className="panel mb-12">
          <h2 className="section-title">How Content Is Prepared</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            The original question banks and learning resources are maintained as
            version-controlled JSON. The app checks question structure, excludes
            invalid answer indexes, and avoids repeated question text within a
            category.
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            Editorial accuracy, historical claims, translations, and quote
            attributions still require human review. Personality quizzes are for
            entertainment and reflection, not scientific assessments. If you
            spot a mistake, please report it.
          </p>
        </section>
        <section className="mb-12">
          <h2 className="section-title text-center mb-10">
            My Journey as Developer
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              [
                "The Idea",
                "Create an engaging learning project independently, with English and Urdu content.",
              ],
              [
                "Development",
                "Build the original HTML, Tailwind CSS, and JavaScript website with interactive quizzes.",
              ],
              [
                "The Next Chapter",
                "Move to a tested Next.js application with secure Firebase authentication and synchronized progress.",
              ],
            ].map(([title, text]) => (
              <article key={title} className="panel">
                <h3 className="font-bold text-xl mb-3">{title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{text}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="bg-gradient-to-r from-brand to-secondary text-white rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Get In Touch</h2>
          <p className="mb-6">
            Have a suggestion, content correction, or issue to report?
          </p>
          <a className="btn-accent" href={CONTACT_URL}>
            Contact Usman
          </a>
          <Link className="inline-block ms-5 underline" href="/quizzes">
            Explore QuizVerse
          </Link>
        </section>
      </div>
    </>
  );
}
