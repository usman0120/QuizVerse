'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { useApp } from './app-provider';

export function SiteShell({ children }: { children: ReactNode }) {
  const { user, loading, profile, updateProfile, syncError } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [error, setError] = useState('');
  const pathname = usePathname();
  const ur = profile.language === 'ur';
  const links = [{ href: '/quizzes', text: ur ? 'کوئز' : 'Quizzes' }, { href: '/personality', text: ur ? 'شخصیت' : 'Personality' }, { href: '/flashcards', text: ur ? 'فلیش کارڈز' : 'Flashcards' }, { href: '/leaderboard', text: ur ? 'درجہ بندی' : 'Leaderboard' }];
  async function preference(updates: Parameters<typeof updateProfile>[0]) {
    try { setError(''); await updateProfile(updates); } catch (error) { setError(error instanceof Error ? error.message : 'Could not save preference.'); }
  }
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header">
      <div className="container header-row">
        <Link href="/" className="brand" onClick={() => setMenuOpen(false)}><span aria-hidden="true">🧠</span> QuizVerse</Link>
        <button className="icon-button menu-toggle" aria-label="Toggle navigation" aria-expanded={menuOpen} aria-controls="main-nav" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
        <nav id="main-nav" className={menuOpen ? 'nav-links open' : 'nav-links'} aria-label="Main navigation">
          {links.map(link => <Link key={link.href} href={link.href} aria-current={pathname === link.href ? 'page' : undefined} onClick={() => setMenuOpen(false)}>{link.text}</Link>)}
        </nav>
        <div className="header-actions">
          <button className="icon-button" disabled={loading} onClick={() => void preference({ language: ur ? 'en' : 'ur' })} aria-label={ur ? 'Switch to English' : 'Switch to Urdu'}>{ur ? 'EN' : 'اردو'}</button>
          <button className="icon-button" disabled={loading} onClick={() => void preference({ theme: document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark' })} aria-label="Toggle color theme">◐</button>
          <Link className="button small" href={user ? '/account' : '/auth'}>{user ? (ur ? 'اکاؤنٹ' : 'Account') : (ur ? 'لاگ ان' : 'Sign in')}</Link>
        </div>
      </div>
    </header>
    {(syncError || error) && <div className="container alert error" role="alert">{syncError || error}</div>}
    <main id="main" className="container main-content" lang={ur ? 'ur' : 'en'} dir={ur ? 'rtl' : 'ltr'}>{children}</main>
    <footer className="site-footer"><div className="container footer-row"><div><Link href="/" className="brand">🧠 QuizVerse</Link><p>Challenge yourself. Discover something new.</p><small>© {new Date().getFullYear()} QuizVerse · Created by Usman Ahmad</small></div><nav aria-label="Footer navigation"><Link href="/about">About</Link><Link href="/contact">Contact</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/cookies">Cookies</Link></nav></div></footer>
  </>;
}
