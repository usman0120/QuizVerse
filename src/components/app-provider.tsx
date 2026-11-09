'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { onIdTokenChanged, signOut as firebaseSignOut, type User } from 'firebase/auth';
import { collection, doc, limit, onSnapshot, orderBy, query, type Unsubscribe } from 'firebase/firestore';
import { getFirebaseClient } from '@/lib/firebase-client';
import { defaultProfile, defaultStats, type FlashProgress, type HistoryItem, type Profile, type Stats } from '@/lib/types';

type AppContext = {
  user: User | null; loading: boolean; configured: boolean; profile: Profile; stats: Stats; history: HistoryItem[]; flashProgress: FlashProgress; syncError: string;
  request: <T>(url: string, body?: unknown, method?: string) => Promise<T>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  signOut: () => Promise<void>;
};
const Context = createContext<AppContext | null>(null);
export async function apiRequest<T>(user: User | null, url: string, body?: unknown, method = 'POST'): Promise<T> {
  const token = user ? await user.getIdToken() : null;
  const response = await fetch(url, { method, signal: AbortSignal.timeout(20000), headers: { ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? 'Request failed. Please try again.');
  return data as T;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [stats, setStats] = useState<Stats>(defaultStats);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [flashProgress, setFlashProgress] = useState<FlashProgress>({ learned: [], difficult: [] });
  const [syncError, setSyncError] = useState('');
  const configured = Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && process.env.NEXT_PUBLIC_FIREBASE_APP_ID);

  useEffect(() => {
    const client = getFirebaseClient();
    let subscriptions: Unsubscribe[] = [];
    let cancelled = false;
    let generation = 0;
    const reset = () => {
      subscriptions.forEach(unsubscribe => unsubscribe()); subscriptions = [];
      setStats(defaultStats); setHistory([]); setFlashProgress({ learned: [], difficult: [] }); setSyncError('');
    };
    async function guest() {
      await Promise.resolve();
      if (cancelled) return;
      try {
        const preferences = JSON.parse(sessionStorage.getItem('quizverse:preferences') ?? '{}');
        setProfile({ ...defaultProfile, language: preferences.language === 'ur' ? 'ur' : 'en', theme: ['light', 'dark'].includes(preferences.theme) ? preferences.theme : 'system' });
      } catch { setProfile(defaultProfile); }
      setLoading(false);
    }
    if (!client) { void guest(); return () => { cancelled = true; }; }
    const unsubscribeAuth = onIdTokenChanged(client.auth, async current => {
      const version = ++generation;
      reset(); setUser(current); setLoading(true); setProfile(defaultProfile);
      if (!current) { await guest(); return; }
      try {
        const savedProfile = await apiRequest<Profile>(current, '/api/account', {}, 'PATCH');
        if (cancelled || version !== generation) return;
        setProfile(savedProfile);
        const active = () => !cancelled && version === generation;
        const failure = () => { if (active()) setSyncError('Cloud sync failed. Check your connection and deployed Firestore rules.'); };
        subscriptions = [
          onSnapshot(doc(client.db, 'users', current.uid), snapshot => { if (active() && snapshot.exists()) setProfile({ ...defaultProfile, ...snapshot.data().profile }); }, failure),
          onSnapshot(doc(client.db, 'users', current.uid, 'stats', 'summary'), snapshot => { if (active()) setStats({ ...defaultStats, ...snapshot.data() }); }, failure),
          onSnapshot(doc(client.db, 'users', current.uid, 'progress', 'flashcards'), snapshot => { if (active()) setFlashProgress({ learned: [], difficult: [], ...snapshot.data() }); }, failure),
          onSnapshot(query(collection(client.db, 'users', current.uid, 'history'), orderBy('completedAt', 'desc'), limit(50)), snapshot => { if (active()) setHistory(snapshot.docs.map(item => item.data() as HistoryItem)); }, failure),
        ];
      } catch (error) { if (!cancelled && version === generation) setSyncError(error instanceof Error ? error.message : 'Cloud sync failed.'); }
      finally { if (!cancelled && version === generation) setLoading(false); }
    });
    return () => { cancelled = true; ++generation; unsubscribeAuth(); subscriptions.forEach(unsubscribe => unsubscribe()); };
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => { document.documentElement.dataset.theme = profile.theme === 'system' ? (media.matches ? 'dark' : 'light') : profile.theme; };
    apply(); media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [profile.theme]);

  const request = useCallback(<T,>(url: string, body?: unknown, method?: string) => apiRequest<T>(user, url, body, method), [user]);
  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (user) { await apiRequest<Profile>(user, '/api/account', updates, 'PATCH'); }
    else {
      setProfile(current => {
        const next = { ...current, ...updates };
        try { sessionStorage.setItem('quizverse:preferences', JSON.stringify({ language: next.language, theme: next.theme })); } catch { /* Preferences remain usable when browser storage is blocked. */ }
        return next;
      });
    }
  }, [user]);
  const signOut = useCallback(async () => { const client = getFirebaseClient(); if (client) await firebaseSignOut(client.auth); }, []);
  return <Context.Provider value={{ user, loading, configured, profile, stats, history, flashProgress, syncError, request, updateProfile, signOut }}>{children}</Context.Provider>;
}
export function useApp() { const context = useContext(Context); if (!context) throw new Error('AppProvider is required.'); return context; }
