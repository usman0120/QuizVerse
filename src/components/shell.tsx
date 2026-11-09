"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useApp } from "./provider";
import { CONTACT_URL, Icon, Text } from "./ui";
import { Brand } from "./brand";

const nav = [
  ["/", "Home", "ہوم"],
  ["/quizzes", "Quizzes", "کوئز"],
  ["/learning", "Learning Hub", "مطالعہ"],
  ["/flashcards", "Flashcards", "فلیش کارڈز"],
  ["/personality", "Personality Tests", "شخصیت"],
  ["/leaderboard", "Leaderboard", "لیڈر بورڈ"],
  ["/about", "About", "تعارف"],
];
export function Header() {
  const app = useApp();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 bg-brand text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-base sm:text-xl shrink-0"
          aria-label="QuizVerse home"
        >
          <Brand />
        </Link>
        <nav
          aria-label="Main navigation"
          className="hidden xl:flex items-center gap-5 text-sm"
        >
          {nav.map(([href, en, ur]) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? "page" : undefined}
              className="hover:text-accent"
            >
              <Text en={en} ur={ur} />
            </Link>
          ))}
        </nav>
        <div className="flex gap-1 sm:gap-2 items-center">
          <button
            className="icon-btn"
            aria-label={
              app.settings.language === "en"
                ? "Switch to Urdu"
                : "Switch to English"
            }
            disabled={!app.ready}
            onClick={() =>
              app.updateSettings({
                language: app.settings.language === "en" ? "ur" : "en",
              })
            }
          >
            {app.settings.language === "en" ? "اردو" : "EN"}
          </button>
          <button
            className="icon-btn"
            aria-label="Toggle theme"
            disabled={!app.ready}
            onClick={() =>
              app.updateSettings({
                theme: app.settings.theme === "dark" ? "light" : "dark",
              })
            }
          >
            <Icon name={app.settings.theme === "dark" ? "sun" : "moon"} />
          </button>
          <Link
            href={app.user ? "/account" : "/auth"}
            className="bg-accent text-textDark px-3 py-2 rounded-lg text-sm font-medium"
          >
            <Text
              en={app.user ? "Profile" : "Sign In"}
              ur={app.user ? "پروفائل" : "لاگ اِن"}
            />
          </Link>
          <button
            className="icon-btn xl:hidden"
            aria-label="Toggle navigation"
            aria-controls="mobile-nav"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            <Icon name={open ? "times" : "bars"} />
          </button>
        </div>
      </div>
      {open && (
        <nav
          id="mobile-nav"
          aria-label="Mobile navigation"
          className="xl:hidden bg-secondary px-6 py-4 grid grid-cols-2 gap-4"
        >
          {nav.map(([href, en, ur]) => (
            <Link href={href} key={href} onClick={() => setOpen(false)}>
              <Text en={en} ur={ur} />
            </Link>
          ))}
          <Link href="/account" onClick={() => setOpen(false)}>
            <Text en="My progress" ur="میری پیش رفت" />
          </Link>
        </nav>
      )}
    </header>
  );
}
export function Footer() {
  return (
    <footer className="bg-gray-800 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div>
            <h2 className="text-xl font-bold mb-4">
              <Brand />
            </h2>
            <p className="text-gray-300 text-sm">
              Learn, challenge yourself, and have fun with free English and Urdu
              quizzes.
            </p>
          </div>
          <div>
            <h2 className="font-bold mb-3">Explore</h2>
            <div className="grid gap-2 text-gray-300">
              {nav.slice(1, 6).map(([href, en, ur]) => (
                <Link key={href} href={href}>
                  <Text en={en} ur={ur} />
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h2 className="font-bold mb-3">Information</h2>
            <div className="grid gap-2 text-gray-300">
              <Link href="/about">About QuizVerse</Link>
              <a href={CONTACT_URL}>Contact & Suggestions</a>
              <a href={CONTACT_URL}>Report an issue</a>
            </div>
          </div>
          <div>
            <h2 className="font-bold mb-3">Your data</h2>
            <div className="grid gap-2 text-gray-300">
              <Link href="/account">Profile & progress</Link>
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/terms">Terms of Service</Link>
              <Link href="/cookies">Cookies & Storage</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-6 text-sm text-gray-400 text-center">
          © {new Date().getFullYear()} QuizVerse. Developed by Usman Ahmad.
        </div>
      </div>
    </footer>
  );
}
export function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);
  return (
    visible && (
      <button
        aria-label="Back to top"
        className="fixed bottom-5 end-5 z-30 bg-brand text-white rounded-full w-12 h-12 shadow-lg"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <Icon name="arrow-up" />
      </button>
    )
  );
}
