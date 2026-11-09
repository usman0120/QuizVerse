export const navigation = [
  ["/", "Home"],
  ["/quizzes", "Quizzes"],
  ["/personality", "Personality Tests"],
  ["/leaderboard", "Leaderboard"],
  ["/about", "About"],
] as const;
export const footerGroups = [
  {
    title: "Modules",
    links: [
      ["/", "Home"],
      ["/quizzes", "Quiz Categories"],
      ["/quiz", "Quiz Player"],
      ["/personality", "Personality Tests"],
      ["/leaderboard", "Casual Leaderboard"],
    ],
  },
  {
    title: "Features",
    links: [
      ["/#daily-challenge", "Daily Challenge"],
      ["/quiz?random=true", "Random Quiz"],
      ["/quiz#quiz-tools", "Quiz Tools & Sharing"],
      ["/#quote-of-the-day", "Quotes & Favorites"],
      ["/personality#quiz-history", "Personality History"],
      ["/account#progress-summary", "Activity Streaks"],
      ["/#features", "All Features"],
    ],
  },
  {
    title: "Your Account",
    links: [
      ["/auth", "Sign In / Register"],
      ["/account", "Profile & Progress"],
      ["/account#quiz-history", "Quiz History"],
      ["/account#data-export", "Export Your Data"],
      ["/account#data-controls", "Data Controls"],
    ],
  },
  {
    title: "Help & Information",
    links: [
      ["/about", "About QuizVerse"],
      ["/contact", "Contact"],
      [
        "https://usman-portfolio-silk.vercel.app/contact",
        "Suggestions & Issue Reports",
      ],
      ["/privacy", "Privacy Policy"],
      ["/terms", "Terms of Service"],
      ["/cookies", "Cookies & Storage"],
    ],
  },
] as const;
