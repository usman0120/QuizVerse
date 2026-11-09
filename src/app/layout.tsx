import type { Metadata } from 'next';
import { AppProvider } from '@/components/app-provider';
import { SiteShell } from '@/components/site-shell';
import '@fontsource/poppins/latin-400.css';
import '@fontsource/poppins/latin-600.css';
import '@fontsource/poppins/latin-700.css';
import '@fontsource/poppins/latin-800.css';
import '@fontsource/noto-nastaliq-urdu/400.css';
import '@fontsource/noto-nastaliq-urdu/600.css';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'QuizVerse — Test your knowledge', template: '%s | QuizVerse' },
  description: 'Free English and Urdu quizzes, personality challenges, and flashcards. Play as a guest or sign in to sync your progress.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><AppProvider><SiteShell>{children}</SiteShell></AppProvider></body></html>;
}
