"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useApp } from "./provider";
import { Icon } from "./ui";
import { Brand } from "./brand";
import { navigation, footerGroups } from "@/lib/navigation";

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
          {navigation.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? "page" : undefined}
              className="hover:text-accent"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex gap-1 sm:gap-2 items-center">
          <button
            className="icon-btn"
            aria-label={
              app.settings.language === "en"
                ? "Switch content to Urdu"
                : "Switch content to English"
            }
            disabled={!app.ready}
            onClick={() =>
              app.updateSettings({
                language: app.settings.language === "en" ? "ur" : "en",
              })
            }
          >
            {app.settings.language === "en" ? "UR" : "EN"}
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
            {app.user ? "Profile" : "Sign In"}
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
          {navigation.map(([href, label]) => (
            <Link href={href} key={href} onClick={() => setOpen(false)}>
              {label}
            </Link>
          ))}
          <Link href="/account" onClick={() => setOpen(false)}>
            My progress
          </Link>
        </nav>
      )}
    </header>
  );
}
export function Footer() {
  return (
    <footer lang="en" dir="ltr" className="bg-gray-800 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="mb-10 max-w-xl">
          <h2 className="text-xl font-bold mb-4">
            <Brand />
          </h2>
          <p className="text-gray-300 text-sm">
            Learn, challenge yourself, and have fun with free English and Urdu
            quizzes.
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {footerGroups.map((group) => (
            <nav key={group.title} aria-label={`Footer ${group.title}`}>
              <h2 className="font-semibold text-accent mb-4">{group.title}</h2>
              <ul className="space-y-3 text-sm text-gray-300">
                {group.links.map(([href, label]) => (
                  <li key={href}>
                    {href.startsWith("https://") ? (
                      <a
                        className="hover:text-white transition-colors"
                        href={href}
                      >
                        {label}
                      </a>
                    ) : (
                      <Link
                        className="hover:text-white transition-colors"
                        href={href}
                      >
                        {label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
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
