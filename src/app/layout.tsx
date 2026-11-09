import type { Metadata } from "next";
import { AppProvider } from "@/components/provider";
import { Header, Footer, BackToTop } from "@/components/shell";
import { siteUrl } from "@/lib/site";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "@fontsource/noto-nastaliq-urdu/400.css";
import "@fontsource/noto-nastaliq-urdu/700.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./globals.css";

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  title: {
    default: "QuizVerse — Test Your Knowledge",
    template: "%s | QuizVerse",
  },
  description:
    "Free English and Urdu quizzes and personality tests. Play as a guest or sign in to sync your progress.",
  icons: { icon: { url: "/brand/quizverse-mark.svg", type: "image/svg+xml" } },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body>
        <AppProvider>
          <a href="#main" className="skip-link">
            Skip to content
          </a>
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <BackToTop />
        </AppProvider>
      </body>
    </html>
  );
}
