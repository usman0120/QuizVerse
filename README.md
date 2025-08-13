# 🎯 QuizVerse – Interactive Quiz & Learning Hub

**QuizVerse** is a modern, feature-rich, and educational web platform for quizzes, learning, and fun challenges.  
It is built using **HTML**, **CSS/TailwindCSS**, and **JavaScript** with **no backend dependencies** – making it lightweight, fast, and easily deployable.

---

## 📌 Features

### 🧠 Quizzes
- Multiple quiz categories (General Knowledge, Science, History, Sports, etc.)
- Personality quizzes with conditional logic
- Timed and non-timed modes
- Fun & interactive design with animations

### 📚 Learning Hub
- Learning categories (Mini-articles, Fun Facts, Biographies, Urdu + English content)
- Sidebar navigation with dynamic content loading
- Search by tags & keywords
- Rich content with free images and infographics

### 🎮 Flashcards Mode
- Self-paced memorization tool
- Multiple modes: Text, Image, or Mixed
- Shuffle & Mark-as-Learned options
- Progress tracking

### 🏆 Leaderboard
- Local leaderboard for top quiz scores
- Confetti celebration for top scorer
- Reset & filter options

### 💫 Engagement Features
- Streak tracking
- Profile modal (Name, Country, Level, Age, Gender)
- Sharing results
- Error handling and smooth UI/UX

---

## 📂 Folder Structure

QuizVerse/
│
├── assets/ # Images, sounds, and media
│ ├── images/
│ └── sounds/
│
├── data/ # JSON data files for quizzes and learning content
│ ├── learn-data/
│ ├── questions/
│ ├── flashcards.json
│ └── personality-quiz-data.json
│
├── dist/ # Build output (if used for deployment)
│
├── src/ # JavaScript source files
│ └── js/
│ ├── analytics.js
│ └── main.js
│
├── index.css # Main CSS file (Tailwind compiled)
├── index.html # Homepage
├── about.html # About page
├── contact.html # Contact page
├── cookies.html # Cookies policy
├── flashcards.html # Flashcards mode
├── learn.html # Learning page
├── learning-categories.html # Learning category list
├── personality.html # Personality quizzes
├── privacy.html # Privacy policy
├── quiz.html # Quiz player
├── quiz-categories.html # Quiz category list
├── terms.html # Terms of service
│
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.js
├── README.md # Project documentation
└── .gitignore # Git ignore file


---

## 🚀 Installation & Usage

1. **Clone the Repository**
   git clone https://github.com/usman0120/quizverse.git
   cd quizverse

Install Dependencies

Only required if you're using TailwindCSS build tools.
npm install
Run Locally

Open index.html directly in your browser
Or use Live Server in VS Code for hot reload
Build TailwindCSS (if editing styles)
npx tailwindcss -i ./index.css -o ./dist/output.css --watch
🛠️ Tech Stack
HTML5
TailwindCSS
JavaScript (Vanilla)
Free Public APIs (Wikipedia API, Pixabay Images, etc. – No sign-up required)

📌 Roadmap
 Add multiplayer quiz mode
 Add offline mode with service workers
 Expand learning content
 Add PWA support for mobile

📄 Copyright Notice
© 2025 QuizVerse. All rights reserved. 
No part of this website, including its design, code, or content, may be copied, reproduced, distributed, or published in any form or by any means without the prior written permission of the copyright owner.
Violators will be subject to legal action under applicable copyright laws.

👨‍💻 Author
Developed by Usman Ahmad
For contributions, feel free to open a Pull Request or Issue.