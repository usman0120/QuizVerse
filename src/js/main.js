// Mobile Menu Toggle
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');

mobileMenuButton.addEventListener('click', () => {
  mobileMenu.classList.toggle('hidden');
});

// Dark Mode Toggle
const themeToggle = document.getElementById('theme-toggle');
const html = document.documentElement;

// Check for saved user preference or use system preference
const userTheme = localStorage.getItem('theme');
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;

// Initial theme check
const themeCheck = () => {
  if (userTheme === 'dark' || (!userTheme && systemTheme)) {
    html.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    html.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
};

// Manual theme switch
const themeSwitch = () => {
  if (html.classList.contains('dark')) {
    html.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  } else {
    html.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }
};

// Event listeners
themeToggle.addEventListener('click', themeSwitch);

// Invoke theme check on initial load
themeCheck();

// Back to Top Button
const backToTopButton = document.getElementById('back-to-top');

window.addEventListener('scroll', () => {
  if (window.pageYOffset > 300) {
    backToTopButton.classList.remove('opacity-0', 'invisible');
    backToTopButton.classList.add('opacity-100', 'visible');
  } else {
    backToTopButton.classList.remove('opacity-100', 'visible');
    backToTopButton.classList.add('opacity-0', 'invisible');
  }
});

backToTopButton.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

// Load Categories (without API)
const loadCategories = () => {
  const categoriesContainer = document.querySelector('#categories .grid');
  categoriesContainer.innerHTML = '';

  // Predefined categories with their colors and icons
  const predefinedCategories = [
    { name: 'Science', color: 'science', icon: 'fas fa-flask', id: 'science_nature' },
    { name: 'General Knowledge', color: 'general', icon: 'fas fa-globe', id: 'general_knowledge' },
    { name: 'Urdu Poetry', color: 'poetry', icon: 'fas fa-pen-fancy', id: 'urdu_poetry' },
    { name: 'History', color: 'history', icon: 'fas fa-landmark', id: 'history' },
    { name: 'Islamic Studies', color: 'islamic', icon: 'fas fa-mosque', id: 'islamic_studies' },
    { name: 'Technology', color: 'tech', icon: 'fas fa-laptop-code', id: 'technology' },
    { name: 'Arts & Culture', color: 'arts', icon: 'fas fa-palette', id: 'arts_culture' },
    { name: 'For Kids', color: 'kids', icon: 'fas fa-child', id: 'kids' },
    { name: 'For Boys', color: 'boys', icon: 'fas fa-male', id: 'kids' }, // Using same as kids
    { name: 'For Girls', color: 'girls', icon: 'fas fa-female', id: 'kids' } // Using same as kids
  ];

   // Color class mapping
  const colorMap = {
    science: {
      bg: 'bg-science/10',
      hoverBg: 'hover:bg-science/20',
      border: 'border-science/30',
      text: 'text-science'
    },
    islamic: {
      bg: 'bg-islamic/10',
      hoverBg: 'hover:bg-islamic/20',
      border: 'border-islamic/30',
      text: 'text-islamic'
    },
    poetry: {
      bg: 'bg-poetry/10',
      hoverBg: 'hover:bg-poetry/20',
      border: 'border-poetry/30',
      text: 'text-poetry'
    },
    history: {
      bg: 'bg-history/10',
      hoverBg: 'hover:bg-history/20',
      border: 'border-history/30',
      text: 'text-history'
    },
    tech: {
      bg: 'bg-tech/10',
      hoverBg: 'hover:bg-tech/20',
      border: 'border-tech/30',
      text: 'text-tech'
    },
    arts: {
      bg: 'bg-arts/10',
      hoverBg: 'hover:bg-arts/20',
      border: 'border-arts/30',
      text: 'text-arts'
    },
    kids: {
      bg: 'bg-kids/10',
      hoverBg: 'hover:bg-kids/20',
      border: 'border-kids/30',
      text: 'text-kids'
    },
    boys: {
      bg: 'bg-boys/10',
      hoverBg: 'hover:bg-boys/20',
      border: 'border-boys/30',
      text: 'text-boys'
    },
    girls: {
      bg: 'bg-girls/10',
      hoverBg: 'hover:bg-girls/20',
      border: 'border-girls/30',
      text: 'text-girls'
    },
    general: {
      bg: 'bg-general/10',
      hoverBg: 'hover:bg-general/20',
      border: 'border-general/30',
      text: 'text-general'
    }
  };

    predefinedCategories.forEach(category => {
    const classes = colorMap[category.color] || colorMap.general;

    const categoryCard = document.createElement('div');
    categoryCard.className = `${classes.bg} ${classes.hoverBg} border-2 ${classes.border} rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:shadow-md`;
    categoryCard.innerHTML = `
      <div class="w-16 h-16 rounded-full ${classes.bg.replace('10', '20')} ${classes.text} flex items-center justify-center mb-3">
        <i class="${category.icon} text-2xl"></i>
      </div>
      <h3 class="font-bold text-center">${category.name}</h3>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">${Math.floor(Math.random() * 50) + 10} Quizzes</p>
    `;

    categoryCard.addEventListener('click', () => {
      // Redirect to quiz.html with the category parameter
      window.location.href = `quiz.html?cat=${encodeURIComponent(category.id)}`;
    });

    categoriesContainer.appendChild(categoryCard);
  });
};

// Helper function to get category color
function getCategoryColor(categoryName) {
  const lowerName = categoryName.toLowerCase();

  if (lowerName.includes('science')) return 'science';
  if (lowerName.includes('islamic')) return 'islamic';
  if (lowerName.includes('poetry')) return 'poetry';
  if (lowerName.includes('history')) return 'history';
  if (lowerName.includes('tech') || lowerName.includes('computer')) return 'tech';
  if (lowerName.includes('art') || lowerName.includes('culture')) return 'arts';
  if (lowerName.includes('kids') || lowerName.includes('children')) return 'kids';
  if (lowerName.includes('general')) return 'general';

  // Default color
  return 'brand';
}

// Helper function to get category icon
function getCategoryIcon(categoryName) {
  const lowerName = categoryName.toLowerCase();

  // Main categories
  if (lowerName.includes('science') || lowerName.includes('nature')) return 'fas fa-flask';
  if (lowerName.includes('computer')) return 'fas fa-laptop-code';
  if (lowerName.includes('general knowledge')) return 'fas fa-globe';
  if (lowerName.includes('book')) return 'fas fa-book-open';
  if (lowerName.includes('film') || lowerName.includes('movie')) return 'fas fa-film';
  if (lowerName.includes('music')) return 'fas fa-music';
  if (lowerName.includes('theatre') || lowerName.includes('musical')) return 'fas fa-theater-masks';
  if (lowerName.includes('television') || lowerName.includes('tv')) return 'fas fa-tv';
  if (lowerName.includes('video game') || lowerName.includes('gaming')) return 'fas fa-gamepad';
  if (lowerName.includes('board game')) return 'fas fa-chess-board';

  // Your custom categories
  if (lowerName.includes('islamic')) return 'fas fa-mosque';
  if (lowerName.includes('poetry')) return 'fas fa-pen-fancy';
  if (lowerName.includes('history')) return 'fas fa-landmark';
  if (lowerName.includes('tech')) return 'fas fa-laptop-code';
  if (lowerName.includes('art') || lowerName.includes('culture')) return 'fas fa-palette';
  if (lowerName.includes('kids') || lowerName.includes('children')) return 'fas fa-child';

  // Default fallback
  return 'fas fa-question-circle';
}

// Load Leaderboard Data
const loadLeaderboard = async () => {
  try {
    // In a real app, this would come from your backend
    // For demo purposes, we'll use mock data
    const mockLeaderboard = [
      { rank: 1, name: "QuizMaster", score: 9850, quizzes: 42, avatar: "Q" },
      { rank: 2, name: "Brainiac", score: 8720, quizzes: 38, avatar: "B" },
      { rank: 3, name: "KnowledgeSeeker", score: 7650, quizzes: 35, avatar: "K" },
      { rank: 4, name: "HistoryBuff", score: 7430, quizzes: 32, avatar: "H" },
      { rank: 5, name: "ScienceWhiz", score: 6980, quizzes: 30, avatar: "S" },
      { rank: 6, name: "TriviaKing", score: 6540, quizzes: 28, avatar: "T" },
      { rank: 7, name: "IslamicScholar", score: 6210, quizzes: 27, avatar: "I" },
      { rank: 8, name: "PoetryLover", score: 5870, quizzes: 25, avatar: "P" },
      { rank: 9, name: "TechGuru", score: 5430, quizzes: 23, avatar: "T" },
      { rank: 10, name: "ArtEnthusiast", score: 4980, quizzes: 21, avatar: "A" }
    ];

    const leaderboardContainer = document.getElementById('leaderboard-content');
    leaderboardContainer.innerHTML = '';

    mockLeaderboard.forEach(player => {
      const playerRow = document.createElement('div');
      playerRow.className = 'grid grid-cols-12 py-3 px-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition';
      playerRow.innerHTML = `
        <div class="col-span-1 font-bold">${player.rank}</div>
        <div class="col-span-6 md:col-span-7 flex items-center">
          <div class="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center mr-3">
            ${player.avatar}
          </div>
          ${player.name}
        </div>
        <div class="col-span-3 md:col-span-2 font-medium">${player.score.toLocaleString()}</div>
        <div class="col-span-2 md:col-span-2">${player.quizzes}</div>
      `;
      leaderboardContainer.appendChild(playerRow);
    });

  } catch (error) {
    console.error('Error loading leaderboard:', error);
    const leaderboardContainer = document.getElementById('leaderboard-content');
    leaderboardContainer.innerHTML = `
      <div class="col-span-full text-center py-8">
        <p class="text-red-500">Failed to load leaderboard. Please check your connection.</p>
      </div>
    `;
  }
};

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
  loadCategories();
  loadLeaderboard();
  loadStreaksPreview();


  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();

      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth'
        });

        // Close mobile menu if open
        if (!mobileMenu.classList.contains('hidden')) {
          mobileMenu.classList.add('hidden');
        }
      }
    });
  });
});





// Daily Challenge Quiz System
let currentQuestionIndex = 0;
let score = 0;
let dailyQuestions = [];
let hasAnswered = false;

const fetchDailyQuestions = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const seed = today.replace(/-/g, '');

    const response = await fetch(`https://opentdb.com/api.php?amount=5&encode=url3986&seed=${seed}`);
    const data = await response.json();

    if (data.response_code === 0) {
      dailyQuestions = data.results;
      displayQuestion();
    } else {
      throw new Error('Failed to load questions');
    }
  } catch (error) {
    console.error('Error loading daily questions:', error);
    document.getElementById('daily-quiz-container').innerHTML = `
      <div class="text-center py-4 text-red-500">
        Failed to load questions. Please try again later.
      </div>
    `;
  }
};

const displayQuestion = () => {
  if (currentQuestionIndex >= dailyQuestions.length) {
    document.getElementById('daily-quiz-container').innerHTML = `
      <div class="text-center">
        <h4 class="text-lg font-bold mb-2">Quiz Completed!</h4>
        <p class="mb-4">Your final score: ${score}/${dailyQuestions.length}</p>
        <button onclick="resetDailyQuiz()" class="bg-accent hover:bg-yellow-500 text-textDark px-4 py-2 rounded transition">
          Try Again
        </button>
      </div>
    `;
    document.getElementById('next-question-btn').classList.add('hidden');
    return;
  }

  const question = dailyQuestions[currentQuestionIndex];
  const decodedQuestion = decodeURIComponent(question.question);
  const correctAnswer = decodeURIComponent(question.correct_answer);
  let allAnswers = question.incorrect_answers.map(a => decodeURIComponent(a));
  allAnswers.push(correctAnswer);

  // Shuffle answers (except for True/False questions)
  if (question.type !== 'boolean') {
    for (let i = allAnswers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allAnswers[i], allAnswers[j]] = [allAnswers[j], allAnswers[i]];
    }
  }

  document.getElementById('daily-quiz-container').innerHTML = `
    <div class="mb-4">
      <p class="text-sm opacity-80">Question ${currentQuestionIndex + 1}/${dailyQuestions.length}</p>
      <p class="my-3">${decodedQuestion}</p>
      <div class="space-y-2" id="quiz-answers">
        ${allAnswers.map(answer => `
          <button class="quiz-answer w-full text-left bg-white/10 hover:bg-white/20 px-4 py-2 rounded transition border border-transparent"
                  data-correct="${answer === correctAnswer}">
            ${answer}
          </button>
        `).join('')}
      </div>
    </div>
  `;

  // Reset button state
  document.getElementById('next-question-btn').classList.add('opacity-50', 'cursor-not-allowed');
  document.getElementById('next-question-btn').disabled = true;
  hasAnswered = false;

  // Add answer event listeners
  document.querySelectorAll('.quiz-answer').forEach(button => {
    button.addEventListener('click', function () {
      if (hasAnswered) return;

      const isCorrect = this.getAttribute('data-correct') === 'true';

      // Highlight all answers
      document.querySelectorAll('.quiz-answer').forEach(btn => {
        btn.classList.remove('hover:bg-white/20', 'border-transparent');

        if (btn.getAttribute('data-correct') === 'true') {
          btn.classList.add('border-green-500', 'bg-green-100/30');
        } else if (btn === this && !isCorrect) {
          btn.classList.add('border-red-500', 'bg-red-100/30');
        }
      });

      // Update score if correct
      if (isCorrect) {
        score++;
        document.getElementById('quiz-score').textContent = `Score: ${score}`;
      }

      hasAnswered = true;
      document.getElementById('next-question-btn').classList.remove('opacity-50', 'cursor-not-allowed');
      document.getElementById('next-question-btn').disabled = false;
    });
  });
};

document.getElementById('next-question-btn').addEventListener('click', () => {
  currentQuestionIndex++;
  displayQuestion();
});

window.resetDailyQuiz = () => {
  currentQuestionIndex = 0;
  score = 0;
  hasAnswered = false;
  document.getElementById('quiz-score').textContent = 'Score: 0';
  document.getElementById('next-question-btn').classList.remove('hidden');
  fetchDailyQuestions();
};

document.addEventListener('DOMContentLoaded', () => {
  fetchDailyQuestions();
});


//Quotes Section JS
// Quote of the Day System
let currentQuote = null;
let currentQuoteType = 'all';
const favoriteQuotes = JSON.parse(localStorage.getItem('favoriteQuotes')) || [];

// DOM Elements
const quoteTextElement = document.getElementById('quote-text');
const quoteAuthorElement = document.getElementById('quote-author');
const quoteCategoryElement = document.getElementById('quote-category');
const quoteContentElement = document.getElementById('quote-content');
const quoteErrorElement = document.getElementById('quote-error');
const newQuoteBtn = document.getElementById('new-quote-btn');
const copyQuoteBtn = document.getElementById('copy-quote-btn');
const downloadQuoteBtn = document.getElementById('download-quote-btn');
const favoriteQuoteBtn = document.getElementById('favorite-quote-btn');
const retryQuoteBtn = document.getElementById('retry-quote-btn');
const quoteTypeBtns = document.querySelectorAll('.quote-type-btn');

// All quotes database (min 20 per category, 100+ total)
const allQuotes = {
  motivational: [
    {
      text: "The only way to do great work is to love what you do.",
      author: "Steve Jobs",
      category: "Motivational"
    },
    {
      text: "Success is not final, failure is not fatal: It is the courage to continue that counts.",
      author: "Winston Churchill",
      category: "Motivational"
    },
    {
      text: "Believe you can and you're halfway there.",
      author: "Theodore Roosevelt",
      category: "Motivational"
    },
    {
      text: "Your time is limited, don't waste it living someone else's life.",
      author: "Steve Jobs",
      category: "Motivational"
    },
    {
      text: "The future belongs to those who believe in the beauty of their dreams.",
      author: "Eleanor Roosevelt",
      category: "Motivational"
    },
    {
      text: "Don't watch the clock; do what it does. Keep going.",
      author: "Sam Levenson",
      category: "Motivational"
    },
    {
      text: "The only limit to our realization of tomorrow is our doubts of today.",
      author: "Franklin D. Roosevelt",
      category: "Motivational"
    },
    {
      text: "You are never too old to set another goal or to dream a new dream.",
      author: "C.S. Lewis",
      category: "Motivational"
    },
    {
      text: "Act as if what you do makes a difference. It does.",
      author: "William James",
      category: "Motivational"
    },
    {
      text: "Success is stumbling from failure to failure with no loss of enthusiasm.",
      author: "Winston Churchill",
      category: "Motivational"
    },
    {
      text: "The secret of getting ahead is getting started.",
      author: "Mark Twain",
      category: "Motivational"
    },
    {
      text: "You don't have to be great to start, but you have to start to be great.",
      author: "Zig Ziglar",
      category: "Motivational"
    },
    {
      text: "What you get by achieving your goals is not as important as what you become by achieving your goals.",
      author: "Zig Ziglar",
      category: "Motivational"
    },
    {
      text: "The harder you work for something, the greater you'll feel when you achieve it.",
      author: "Anonymous",
      category: "Motivational"
    },
    {
      text: "Dream bigger. Do bigger.",
      author: "Anonymous",
      category: "Motivational"
    },
    {
      text: "Don't stop when you're tired. Stop when you're done.",
      author: "Anonymous",
      category: "Motivational"
    },
    {
      text: "Wake up with determination. Go to bed with satisfaction.",
      author: "Anonymous",
      category: "Motivational"
    },
    {
      text: "Do something today that your future self will thank you for.",
      author: "Anonymous",
      category: "Motivational"
    },
    {
      text: "Little things make big days.",
      author: "Anonymous",
      category: "Motivational"
    },
    {
      text: "It's going to be hard, but hard does not mean impossible.",
      author: "Anonymous",
      category: "Motivational"
    }
  ],
  islamic: [
    {
      text: "The best among you are those who have the best manners and character.",
      author: "Prophet Muhammad (PBUH)",
      category: "Islamic"
    },
    {
      text: "Do not lose hope, nor be sad.",
      author: "Quran 3:139",
      category: "Islamic"
    },
    {
      text: "Allah does not burden a soul beyond that it can bear.",
      author: "Quran 2:286",
      category: "Islamic"
    },
    {
      text: "Speak good or remain silent.",
      author: "Prophet Muhammad (PBUH)",
      category: "Islamic"
    },
    {
      text: "The strong person is not the one who can wrestle others down. The strong person is the one who can control himself when he is angry.",
      author: "Prophet Muhammad (PBUH)",
      category: "Islamic"
    },
    {
      text: "Whoever believes in Allah and the Last Day should speak good or remain silent.",
      author: "Prophet Muhammad (PBUH)",
      category: "Islamic"
    },
    {
      text: "The most perfect believer in faith is the one who is best in moral character.",
      author: "Prophet Muhammad (PBUH)",
      category: "Islamic"
    },
    {
      text: "Verily, with hardship comes ease.",
      author: "Quran 94:6",
      category: "Islamic"
    },
    {
      text: "And We have certainly created man in the best of stature.",
      author: "Quran 95:4",
      category: "Islamic"
    },
    {
      text: "Allah is with those who are patient.",
      author: "Quran 2:153",
      category: "Islamic"
    },
    {
      text: "The best charity is that given when one is in need.",
      author: "Prophet Muhammad (PBUH)",
      category: "Islamic"
    },
    {
      text: "The world is the believer's prison and the unbeliever's paradise.",
      author: "Prophet Muhammad (PBUH)",
      category: "Islamic"
    },
    {
      text: "The ink of the scholar is more sacred than the blood of the martyr.",
      author: "Prophet Muhammad (PBUH)",
      category: "Islamic"
    },
    {
      text: "Whoever treads a path in search of knowledge, Allah will make easy for him the path to Paradise.",
      author: "Prophet Muhammad (PBUH)",
      category: "Islamic"
    },
    {
      text: "The best of you are those who learn the Quran and teach it.",
      author: "Prophet Muhammad (PBUH)",
      category: "Islamic"
    },
    {
      text: "Kindness is a mark of faith, and whoever is not kind has no faith.",
      author: "Prophet Muhammad (PBUH)",
      category: "Islamic"
    },
    {
      text: "The most beloved of people to Allah are those who are most beneficial to people.",
      author: "Prophet Muhammad (PBUH)",
      category: "Islamic"
    },
    {
      text: "The best of you are those who are best to their families.",
      author: "Prophet Muhammad (PBUH)",
      category: "Islamic"
    },
    {
      text: "Do not be people without minds of your own, saying that if others treat you well you will treat them well, and that if they do wrong you will do wrong. But accustom yourselves to do good if people do good and not to do wrong if they do evil.",
      author: "Prophet Muhammad (PBUH)",
      category: "Islamic"
    },
    {
      text: "The believer's shade on the Day of Resurrection will be his charity.",
      author: "Prophet Muhammad (PBUH)",
      category: "Islamic"
    }
  ],
  urdu: [
    {
      text: "دنیا کی سب سے بڑی طاقت محبت ہے، جو دلوں کو جیت لے وہی سب کچھ جیت لیتا ہے۔",
      author: "علامہ اقبال",
      category: "Urdu"
    },
    {
      text: "خود کو پہچانو، خود کو بناؤ، یہی زندگی کا مقصد ہے۔",
      author: "سر سید احمد خان",
      category: "Urdu"
    },
    {
      text: "علم حاصل کرو، چاہے تمہیں چین ہی کیوں نہ جانا پڑے۔",
      author: "حدیث نبوی",
      category: "Urdu"
    },
    {
      text: "صبر کا پھل میٹھا ہوتا ہے، جو انتظار کرتا ہے اسے سب کچھ ملتا ہے۔",
      author: "مولانا رومی",
      category: "Urdu"
    },
    {
      text: "محنت سے کام لو، قسمت خود تمہارے قدم چومے گی۔",
      author: "فیض احمد فیض",
      category: "Urdu"
    },
    {
      text: "زندگی ایک سفر ہے، اسے بھرپور طریقے سے جیو۔",
      author: "احمد فراز",
      category: "Urdu"
    },
    {
      text: "دوستی وہ پھول ہے جو کانٹوں کے بیچ بھی کھل سکتا ہے۔",
      author: "منٹو",
      category: "Urdu"
    },
    {
      text: "حقیقی کامیابی وہ ہے جو دوسروں کو بھی کامیاب بنائے۔",
      author: "ابن انشا",
      category: "Urdu"
    },
    {
      text: "وقت سب سے قیمتی تحفہ ہے جو آپ کسی کو دے سکتے ہیں۔",
      author: "پروین شاکر",
      category: "Urdu"
    },
    {
      text: "خوشی بانٹنے سے بڑھتی ہے۔",
      author: "حفیظ جالندھری",
      category: "Urdu"
    },
    {
      text: "دنیا میں سب سے بڑا جہاد نفس کے خلاف جنگ ہے۔",
      author: "شاہ ولی اللہ",
      category: "Urdu"
    },
    {
      text: "علم بغیر عمل کے ایسے ہے جیسے درخت بغیر پھل کے۔",
      author: "مولانا محمد علی جوہر",
      category: "Urdu"
    },
    {
      text: "حق بات کہنے والے کو ہمیشہ تنہائی کا سامنا کرنا پڑتا ہے۔",
      author: "سعادت حسن منٹو",
      category: "Urdu"
    },
    {
      text: "زندگی میں کبھی ہار نہ مانو، کیونکہ مشکل وقت ہمیشہ کے لیے نہیں ہوتا۔",
      author: "جوش ملیح آبادی",
      category: "Urdu"
    },
    {
      text: "محبت وہ چیز ہے جو دلوں کو جوڑتی ہے اور نفرتیں ختم کرتی ہے۔",
      author: "امتاں غفور",
      category: "Urdu"
    },
    {
      text: "حقیقی دولت علم ہے، سونا چاندی نہیں۔",
      author: "خواجہ فرید",
      category: "Urdu"
    },
    {
      text: "دنیا کی سب سے بڑی دولت اطمینان قلب ہے۔",
      author: "بہاء الدین زکریا",
      category: "Urdu"
    },
    {
      text: "جس نے صبر کیا، اس نے سب کچھ پایا۔",
      author: "سعدی شیرازی",
      category: "Urdu"
    },
    {
      text: "دنیا میں سب سے بڑا راز وفا ہے۔",
      author: "مرزا غالب",
      category: "Urdu"
    },
    {
      text: "حقیقی انسان وہ ہے جو دوسروں کے دکھ درد کو سمجھے۔",
      author: "قرۃ العین حیدر",
      category: "Urdu"
    }
  ],
  famous: [
    {
      text: "Be the change that you wish to see in the world.",
      author: "Mahatma Gandhi",
      category: "Famous"
    },
    {
      text: "In three words I can sum up everything I've learned about life: it goes on.",
      author: "Robert Frost",
      category: "Famous"
    },
    {
      text: "If you tell the truth, you don't have to remember anything.",
      author: "Mark Twain",
      category: "Famous"
    },
    {
      text: "A friend is someone who knows all about you and still loves you.",
      author: "Elbert Hubbard",
      category: "Famous"
    },
    {
      text: "To live is the rarest thing in the world. Most people exist, that is all.",
      author: "Oscar Wilde",
      category: "Famous"
    },
    {
      text: "Without music, life would be a mistake.",
      author: "Friedrich Nietzsche",
      category: "Famous"
    },
    {
      text: "We accept the love we think we deserve.",
      author: "Stephen Chbosky",
      category: "Famous"
    },
    {
      text: "It is better to be hated for what you are than to be loved for what you are not.",
      author: "André Gide",
      category: "Famous"
    },
    {
      text: "Life is what happens to us while we are making other plans.",
      author: "Allen Saunders",
      category: "Famous"
    },
    {
      text: "I have not failed. I've just found 10,000 ways that won't work.",
      author: "Thomas Edison",
      category: "Famous"
    },
    {
      text: "Everything you can imagine is real.",
      author: "Pablo Picasso",
      category: "Famous"
    },
    {
      text: "Do what you can, with what you have, where you are.",
      author: "Theodore Roosevelt",
      category: "Famous"
    },
    {
      text: "The only thing we have to fear is fear itself.",
      author: "Franklin D. Roosevelt",
      category: "Famous"
    },
    {
      text: "Not all those who wander are lost.",
      author: "J.R.R. Tolkien",
      category: "Famous"
    },
    {
      text: "The journey of a thousand miles begins with one step.",
      author: "Lao Tzu",
      category: "Famous"
    },
    {
      text: "That which does not kill us makes us stronger.",
      author: "Friedrich Nietzsche",
      category: "Famous"
    },
    {
      text: "Life is really simple, but we insist on making it complicated.",
      author: "Confucius",
      category: "Famous"
    },
    {
      text: "May you live every day of your life.",
      author: "Jonathan Swift",
      category: "Famous"
    },
    {
      text: "You only live once, but if you do it right, once is enough.",
      author: "Mae West",
      category: "Famous"
    },
    {
      text: "Whatever you are, be a good one.",
      author: "Abraham Lincoln",
      category: "Famous"
    }
  ],
  wisdom: [
    {
      text: "Knowing yourself is the beginning of all wisdom.",
      author: "Aristotle",
      category: "Wisdom"
    },
    {
      text: "The only true wisdom is in knowing you know nothing.",
      author: "Socrates",
      category: "Wisdom"
    },
    {
      text: "Turn your wounds into wisdom.",
      author: "Oprah Winfrey",
      category: "Wisdom"
    },
    {
      text: "The fool doth think he is wise, but the wise man knows himself to be a fool.",
      author: "William Shakespeare",
      category: "Wisdom"
    },
    {
      text: "Wisdom is not a product of schooling but of the lifelong attempt to acquire it.",
      author: "Albert Einstein",
      category: "Wisdom"
    },
    {
      text: "Patience is the companion of wisdom.",
      author: "Saint Augustine",
      category: "Wisdom"
    },
    {
      text: "The wise man learns more from his enemies than the fool from his friends.",
      author: "Baltasar Gracián",
      category: "Wisdom"
    },
    {
      text: "Wisdom is the reward you get for a lifetime of listening when you'd have preferred to talk.",
      author: "Doug Larson",
      category: "Wisdom"
    },
    {
      text: "A wise man can learn more from a foolish question than a fool can learn from a wise answer.",
      author: "Bruce Lee",
      category: "Wisdom"
    },
    {
      text: "The invariable mark of wisdom is to see the miraculous in the common.",
      author: "Ralph Waldo Emerson",
      category: "Wisdom"
    },
    {
      text: "Wisdom is the right use of knowledge.",
      author: "Charles Spurgeon",
      category: "Wisdom"
    },
    {
      text: "The wise man does at once what the fool does finally.",
      author: "Niccolò Machiavelli",
      category: "Wisdom"
    },
    {
      text: "Wisdom is not wisdom when it is derived from books alone.",
      author: "Horace",
      category: "Wisdom"
    },
    {
      text: "A wise man proportions his belief to the evidence.",
      author: "David Hume",
      category: "Wisdom"
    },
    {
      text: "The doorstep to the temple of wisdom is a knowledge of our own ignorance.",
      author: "Benjamin Franklin",
      category: "Wisdom"
    },
    {
      text: "Wisdom is the supreme part of happiness.",
      author: "Sophocles",
      category: "Wisdom"
    },
    {
      text: "Wisdom begins in wonder.",
      author: "Socrates",
      category: "Wisdom"
    },
    {
      text: "The art of being wise is the art of knowing what to overlook.",
      author: "William James",
      category: "Wisdom"
    },
    {
      text: "Wisdom is the daughter of experience.",
      author: "Leonardo da Vinci",
      category: "Wisdom"
    },
    {
      text: "The wise man learns from the mistakes of others, the fool has to make his own.",
      author: "German Proverb",
      category: "Wisdom"
    }
  ]
};

// Combine all quotes for 'all' category
allQuotes.all = [
  ...allQuotes.motivational,
  ...allQuotes.islamic,
  ...allQuotes.urdu,
  ...allQuotes.famous,
  ...allQuotes.wisdom
];

// Fetch a random quote
const fetchQuote = (type = 'all') => {
  try {
    // Show loading state
    quoteContentElement.classList.remove('hidden');
    quoteErrorElement.classList.add('hidden');
    quoteTextElement.textContent = 'Loading wisdom...';
    quoteAuthorElement.textContent = '';
    quoteCategoryElement.textContent = '';

    // Get random quote from selected category
    const quotes = allQuotes[type] || allQuotes.all;
    const randomIndex = Math.floor(Math.random() * quotes.length);
    currentQuote = quotes[randomIndex];

    displayQuote();
  } catch (error) {
    console.error('Error fetching quote:', error);
    showQuoteError();
  }
};

// Display the fetched quote
const displayQuote = () => {
  if (!currentQuote) return;

  quoteTextElement.textContent = currentQuote.text;
  quoteAuthorElement.textContent = `— ${currentQuote.author}`;
  quoteCategoryElement.textContent = currentQuote.category
    ? `${currentQuote.category.charAt(0).toUpperCase() + currentQuote.category.slice(1)} Quote`
    : '';

  // Update favorite button state
  updateFavoriteButton();
};

// Show error state
const showQuoteError = () => {
  quoteContentElement.classList.add('hidden');
  quoteErrorElement.classList.remove('hidden');
};

// Copy quote to clipboard
const copyQuoteToClipboard = () => {
  if (!currentQuote) return;

  const quoteText = `"${currentQuote.text}" — ${currentQuote.author}`;

  navigator.clipboard.writeText(quoteText)
    .then(() => {
      // Show success feedback
      const originalText = copyQuoteBtn.innerHTML;
      copyQuoteBtn.innerHTML = '<i class="fas fa-check mr-2"></i> Copied!';
      copyQuoteBtn.classList.add('bg-green-100', 'text-green-800', 'border-green-300');
      copyQuoteBtn.classList.remove('bg-white', 'text-gray-800', 'border-gray-300');

      setTimeout(() => {
        copyQuoteBtn.innerHTML = originalText;
        copyQuoteBtn.classList.remove('bg-green-100', 'text-green-800', 'border-green-300');
        copyQuoteBtn.classList.add('bg-white', 'text-gray-800', 'border-gray-300');
      }, 2000);
    })
    .catch(err => {
      console.error('Failed to copy:', err);
      alert('Failed to copy quote to clipboard');
    });
};

// Download quote as image
const downloadQuoteAsImage = () => {
  if (!currentQuote) return;

  // Create a canvas element
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const width = 800;
  const height = 500;

  // Set canvas dimensions
  canvas.width = width;
  canvas.height = height;

  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#4f46e5');
  gradient.addColorStop(1, '#9333ea');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Add decorative elements
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.beginPath();
  ctx.arc(width * 0.8, height * 0.2, 80, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(width * 0.2, height * 0.7, 60, 0, Math.PI * 2);
  ctx.fill();

  // Add quote text
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';

  // Quote text
  ctx.font = 'italic 30px Poppins';
  wrapText(ctx, `"${currentQuote.text}"`, width / 2, height / 2 - 50, width - 100, 40);

  // Author
  ctx.font = 'bold 24px Poppins';
  ctx.fillText(`— ${currentQuote.author}`, width / 2, height - 100);

  // Category
  ctx.font = '16px Poppins';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillText(currentQuote.category ? `${currentQuote.category} Quote` : 'Daily Quote', width / 2, height - 70);

  // Watermark
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.font = '14px Poppins';
  ctx.fillText('QuizVerse - Daily Wisdom', width / 2, height - 30);

  // Convert to image and download
  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quote-${new Date().toISOString().split('T')[0]}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 'image/png');
};

// Helper function to wrap text on canvas
function wrapText(context, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let lines = [];

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = context.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && i > 0) {
      lines.push(line);
      line = words[i] + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line);

  for (let i = 0; i < lines.length; i++) {
    context.fillText(lines[i], x, y + (i * lineHeight));
  }
}

// Toggle favorite status
const toggleFavoriteQuote = () => {
  if (!currentQuote) return;

  const quoteString = JSON.stringify(currentQuote);
  const index = favoriteQuotes.indexOf(quoteString);

  if (index === -1) {
    // Add to favorites
    favoriteQuotes.push(quoteString);
    favoriteQuoteBtn.innerHTML = '<i class="fas fa-heart mr-2 text-red-500"></i> Favorited';
    favoriteQuoteBtn.classList.add('bg-red-100', 'text-red-800', 'border-red-300');
    favoriteQuoteBtn.classList.remove('bg-white', 'text-gray-800', 'border-gray-300');
  } else {
    // Remove from favorites
    favoriteQuotes.splice(index, 1);
    updateFavoriteButton();
  }

  // Save to localStorage
  localStorage.setItem('favoriteQuotes', JSON.stringify(favoriteQuotes));
};

// Update favorite button appearance
const updateFavoriteButton = () => {
  if (!currentQuote) return;

  const quoteString = JSON.stringify(currentQuote);
  const isFavorite = favoriteQuotes.includes(quoteString);

  if (isFavorite) {
    favoriteQuoteBtn.innerHTML = '<i class="fas fa-heart mr-2 text-red-500"></i> Favorited';
    favoriteQuoteBtn.classList.add('bg-red-100', 'text-red-800', 'border-red-300');
    favoriteQuoteBtn.classList.remove('bg-white', 'text-gray-800', 'border-gray-300');
  } else {
    favoriteQuoteBtn.innerHTML = '<i class="far fa-heart mr-2"></i> Favorite';
    favoriteQuoteBtn.classList.remove('bg-red-100', 'text-red-800', 'border-red-300');
    favoriteQuoteBtn.classList.add('bg-white', 'text-gray-800', 'border-gray-300');
  }
};

// Event Listeners
newQuoteBtn.addEventListener('click', () => fetchQuote(currentQuoteType));
copyQuoteBtn.addEventListener('click', copyQuoteToClipboard);
downloadQuoteBtn.addEventListener('click', downloadQuoteAsImage);
favoriteQuoteBtn.addEventListener('click', toggleFavoriteQuote);
retryQuoteBtn.addEventListener('click', () => fetchQuote(currentQuoteType));

// Quote type selector buttons
quoteTypeBtns.forEach(btn => {
  btn.addEventListener('click', function () {
    const type = this.dataset.type;
    currentQuoteType = type;

    // Update active state
    quoteTypeBtns.forEach(b => b.classList.remove('active', 'bg-brand', 'text-white'));
    quoteTypeBtns.forEach(b => {
      if (b.dataset.type === type) {
        b.classList.add('active', 'bg-brand', 'text-white');
      } else {
        b.classList.add('bg-gray-200', 'dark:bg-gray-700');
      }
    });

    fetchQuote(type);
  });
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  fetchQuote();

  // Add animation styles dynamically
  const style = document.createElement('style');
  style.textContent = `
    @keyframes blob {
      0% { transform: translate(0px, 0px) scale(1); }
      33% { transform: translate(30px, -50px) scale(1.1); }
      66% { transform: translate(-20px, 20px) scale(0.9); }
      100% { transform: translate(0px, 0px) scale(1); }
    }
    .animate-blob {
      animation: blob 7s infinite;
    }
    .animation-delay-2000 {
      animation-delay: 2s;
    }
    .animation-delay-4000 {
      animation-delay: 4s;
    }
  `;
  document.head.appendChild(style);
});



//streacks and badges section js
// Streaks & Badges Preview JS (add to your main.js)
const loadStreaksPreview = () => {
  const streaksContainer = document.getElementById('streaks-container');

  try {
    // In a real app, this would come from your backend
    // Mock data for demonstration
    const mockStreaksData = {
      currentStreak: 5,
      longestStreak: 12,
      recentBadges: [
        { name: "3-Day Streak", icon: "fas fa-fire", color: "text-orange-500", earned: true },
        { name: "Quick Learner", icon: "fas fa-bolt", color: "text-yellow-500", earned: true },
        { name: "Weekend Warrior", icon: "fas fa-umbrella-beach", color: "text-blue-500", earned: false },
        { name: "Knowledge Seeker", icon: "fas fa-search", color: "text-green-500", earned: true }
      ]
    };

  } catch (error) {
    console.error('Error loading streaks:', error);
    streaksContainer.innerHTML = `
      <div class="col-span-full text-center py-4">
        <i class="fas fa-exclamation-triangle text-yellow-500 text-2xl mb-2"></i>
        <p class="text-red-500">Couldn't load your progress</p>
        <button onclick="loadStreaksPreview()" class="mt-2 text-sm text-brand dark:text-accent hover:underline">
          Try Again
        </button>
      </div>
    `;
  }
};




//profile modal and profile views js
  // Enhanced Modal Functions
 // Enhanced Modal Functions
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) {
    console.error(`Modal with ID ${modalId} not found`);
    return;
  }
  
  // Close any other open modals first
  document.querySelectorAll('.modal-overlay:not(.hidden)').forEach(openModal => {
    if (openModal.id !== modalId) {
      openModal.classList.remove('active');
      setTimeout(() => {
        openModal.classList.add('hidden');
      }, 300);
    }
  });
  
  // Prepare to open new modal
  document.body.style.overflow = 'hidden';
  modal.classList.remove('hidden');
  
  // Small delay to allow CSS transition
  setTimeout(() => {
    modal.classList.add('active');
  }, 10);
  
  // Focus management
  const focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (focusable) focusable.focus();
  
  // Keyboard event listener
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeModal(modalId);
    }
    
    // Trap focus within modal
    if (e.key === 'Tab') {
      const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      if (e.shiftKey && document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  };
  
  modal._keydownHandler = handleKeyDown;
  document.addEventListener('keydown', handleKeyDown);
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  
  modal.classList.remove('active');
  setTimeout(() => {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }, 300);
  
  // Clean up event listeners
  if (modal._keydownHandler) {
    document.removeEventListener('keydown', modal._keydownHandler);
    delete modal._keydownHandler;
  }
}

// Profile form handling
document.addEventListener('DOMContentLoaded', function() {
  // Check if profile exists
  const profile = localStorage.getItem('quizverse_profile');
  const profileSkipped = localStorage.getItem('quizverse_profile_skipped');
  
  // Show profile modal if no profile exists and not skipped
  if (!profile && !profileSkipped) {
    setTimeout(() => openModal('profile-modal'), 1000);
  }
  
  // Update header button based on profile
  updateHeaderButton();
  
  // Profile form submission
  const profileForm = document.getElementById('profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Reset errors
      document.querySelectorAll('[id$="-error"]').forEach(el => el.classList.add('hidden'));
      document.getElementById('profile-success').classList.add('hidden');
      document.getElementById('profile-error').classList.add('hidden');
      
      // Validate form
      let isValid = true;
      const name = document.getElementById('profile-name').value.trim();
      const country = document.getElementById('profile-country').value;
      const age = document.getElementById('profile-age').value;
      const level = document.getElementById('profile-level').value;
      const gender = document.getElementById('profile-gender').value;
      const password = document.getElementById('profile-password').value;
      
      if (name.length < 2) {
        document.getElementById('name-error').classList.remove('hidden');
        isValid = false;
      }
      
      if (!country) {
        document.getElementById('country-error').classList.remove('hidden');
        isValid = false;
      }
      
      if (!age || age < 5 || age > 99) {
        document.getElementById('age-error').classList.remove('hidden');
        isValid = false;
      }
      
      if (!level) {
        document.getElementById('level-error').classList.remove('hidden');
        isValid = false;
      }
      
      if (!gender) {
        document.getElementById('gender-error').classList.remove('hidden');
        isValid = false;
      }
      
      if (password && password.length < 6) {
        document.getElementById('password-error').classList.remove('hidden');
        isValid = false;
      }
      
      if (isValid) {
        // Save profile (update existing or create new)
        const profileData = {
          name,
          country,
          age,
          level,
          gender,
          email: document.getElementById('profile-email').value.trim(),
          password: password || null,
          createdAt: localStorage.getItem('quizverse_profile') ? 
            JSON.parse(localStorage.getItem('quizverse_profile')).createdAt : 
            new Date().toISOString(),
          quizStats: localStorage.getItem('quizverse_profile') ? 
            JSON.parse(localStorage.getItem('quizverse_profile')).quizStats || {
              totalQuizzes: 0,
              totalScore: 0,
              totalQuestions: 0,
              lastQuizDate: null
            } : {
              totalQuizzes: 0,
              totalScore: 0,
              totalQuestions: 0,
              lastQuizDate: null
            }
        };
        
        try {
          localStorage.setItem('quizverse_profile', JSON.stringify(profileData));
          localStorage.removeItem('quizverse_profile_skipped');
          
          // Show success
          document.getElementById('profile-success').classList.remove('hidden');
          
          // Update header button
          updateHeaderButton();
          
          // Close modal after delay
          setTimeout(() => {
            closeModal('profile-modal');
          }, 1500);
        } catch (e) {
          console.error('Error saving profile:', e);
          document.getElementById('profile-error').classList.remove('hidden');
        }
      }
    });
  }
  
  // Sign in/profile buttons in header
  const signInButtons = document.querySelectorAll('[data-action="sign-in"]');
  signInButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      if (localStorage.getItem('quizverse_profile')) {
        // Show profile view/edit modal
        openProfileView();
      } else {
        openModal('profile-modal');
      }
    });
  });
  
  // Close buttons in modals
  document.querySelectorAll('[onclick^="closeModal"]').forEach(btn => {
    const modalId = btn.getAttribute('onclick').match(/'([^']+)'/)[1];
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      closeModal(modalId);
    });
  });
});

function skipProfile() {
  localStorage.setItem('quizverse_profile_skipped', 'true');
  closeModal('profile-modal');
}

function updateHeaderButton() {
  const profile = localStorage.getItem('quizverse_profile');
  const signInButtons = document.querySelectorAll('[data-action="sign-in"]');
  
  signInButtons.forEach(btn => {
    if (profile) {
      const profileData = JSON.parse(profile);
      btn.innerHTML = `
        <i class="fas fa-user-circle mr-2"></i>
        ${profileData.name.split(' ')[0]}
      `;
      btn.classList.remove('bg-accent', 'text-textDark');
      btn.classList.add('bg-white/10', 'text-white');
    } else {
      btn.innerHTML = 'Sign In';
      btn.classList.add('bg-accent', 'text-textDark');
      btn.classList.remove('bg-white/10', 'text-white');
    }
  });
}

function openEditProfile() {
  const profile = JSON.parse(localStorage.getItem('quizverse_profile'));
  if (!profile) return;
  
  // Pre-fill the profile form with existing data
  document.getElementById('profile-name').value = profile.name;
  document.getElementById('profile-country').value = profile.country;
  document.getElementById('profile-age').value = profile.age;
  document.getElementById('profile-level').value = profile.level;
  document.getElementById('profile-gender').value = profile.gender;
  document.getElementById('profile-email').value = profile.email || '';
  document.getElementById('profile-password').value = '';
  
  // Close profile view modal and open edit modal
  closeModal('profile-view-modal');
  openModal('profile-modal');
}

// ... (keep all existing code above the openProfileView function unchanged)

function openProfileView() {
  const profile = JSON.parse(localStorage.getItem('quizverse_profile'));
  if (!profile) return;
  
  // Gender display text
  const genderDisplay = {
    'male': 'Male',
    'female': 'Female',
    'other': 'Other',
    'prefer-not': 'Prefer not to say'
  };
  
  // Create a comprehensive profile view modal
  const profileHTML = `
    <div class="space-y-6">
      <div class="flex flex-col items-center justify-center mb-6">
        <div class="w-24 h-24 rounded-full bg-brand/10 flex items-center justify-center text-4xl mb-4">
          <i class="fas fa-user text-brand"></i>
        </div>
        <h3 class="text-xl font-bold">${profile.name}</h3>
        <p class="text-gray-500">${profile.age} years • ${profile.country}</p>
      </div>
      
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div class="bg-bgLight dark:bg-gray-700 p-3 rounded-lg">
          <p class="text-sm text-gray-500">Level</p>
          <p class="font-medium capitalize">${profile.level.replace('-', ' ')}</p>
        </div>
        <div class="bg-bgLight dark:bg-gray-700 p-3 rounded-lg">
          <p class="text-sm text-gray-500">Gender</p>
          <p class="font-medium">${genderDisplay[profile.gender] || profile.gender}</p>
        </div>
        <div class="bg-bgLight dark:bg-gray-700 p-3 rounded-lg">
          <p class="text-sm text-gray-500">Member Since</p>
          <p class="font-medium">${new Date(profile.createdAt).toLocaleDateString()}</p>
        </div>
        <div class="bg-bgLight dark:bg-gray-700 p-3 rounded-lg">
          <p class="text-sm text-gray-500">Account</p>
          <p class="font-medium">${profile.email ? 'Verified' : 'Guest'}</p>
        </div>
      </div>
      
      ${profile.quizStats ? `
      <div class="bg-bgLight dark:bg-gray-700 p-4 rounded-lg mb-6">
        <div class="flex justify-between items-center mb-3">
          <h4 class="text-lg font-bold">Quiz Statistics</h4>
          <div class="flex space-x-2">
            <button onclick="downloadQuizStats()" class="text-xs bg-brand/10 hover:bg-brand/20 text-brand dark:text-brandLight px-2 py-1 rounded transition">
              <i class="fas fa-download mr-1"></i> Download
            </button>
            <button onclick="confirmResetStats()" class="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-500 dark:text-red-400 px-2 py-1 rounded transition">
              <i class="fas fa-redo mr-1"></i> Reset
            </button>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-white dark:bg-gray-800 p-2 rounded">
            <p class="text-sm text-gray-500">Total Quizzes</p>
            <p class="font-bold text-lg">${profile.quizStats.totalQuizzes}</p>
          </div>
          <div class="bg-white dark:bg-gray-800 p-2 rounded">
            <p class="text-sm text-gray-500">Total Score</p>
            <p class="font-bold text-lg">${profile.quizStats.totalScore}</p>
          </div>
          <div class="bg-white dark:bg-gray-800 p-2 rounded">
            <p class="text-sm text-gray-500">Total Questions</p>
            <p class="font-bold text-lg">${profile.quizStats.totalQuestions}</p>
          </div>
          <div class="bg-white dark:bg-gray-800 p-2 rounded">
            <p class="text-sm text-gray-500">Accuracy</p>
            <p class="font-bold text-lg">${profile.quizStats.totalQuestions > 0 ? Math.round((profile.quizStats.totalScore / profile.quizStats.totalQuestions) * 100) : 0}%</p>
          </div>
        </div>
        ${profile.quizStats.lastQuizDate ? `
        <div class="mt-3 text-sm text-gray-500">
          Last quiz taken: ${new Date(profile.quizStats.lastQuizDate).toLocaleString()}
        </div>
        ` : ''}
      </div>
      ` : ''}
      
      <div class="flex flex-col space-y-3">
        <button onclick="openEditProfile()" class="w-full bg-brand hover:bg-secondary text-white dark:hover:bg-gray-600 px-4 py-2 rounded-lg transition">
          <i class="fas fa-edit mr-2"></i> Edit Profile
        </button>
        <button onclick="closeModal('profile-view-modal')" class="w-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2 rounded-lg transition">
          Close
        </button>
      </div>
    </div>
  `;
  
  // Create or update profile view modal
  let profileViewModal = document.getElementById('profile-view-modal');
  if (!profileViewModal) {
    profileViewModal = document.createElement('div');
    profileViewModal.id = 'profile-view-modal';
    profileViewModal.className = 'modal-overlay hidden';
    profileViewModal.innerHTML = `
      <div class="modal-container">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-2xl font-bold text-brand dark:text-white">Your Profile</h3>
            <button onclick="closeModal('profile-view-modal')" class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              <i class="fas fa-times"></i>
            </button>
          </div>
          ${profileHTML}
        </div>
      </div>
    `;
    document.body.appendChild(profileViewModal);
  } else {
    const contentDiv = profileViewModal.querySelector('.modal-container > div');
    if (contentDiv) {
      contentDiv.innerHTML = `
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-2xl font-bold text-brand dark:text-white">Your Profile</h3>
          <button onclick="closeModal('profile-view-modal')" class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <i class="fas fa-times"></i>
          </button>
        </div>
        ${profileHTML}
      `;
    }
  }
  
  openModal('profile-view-modal');
}

// New functions for statistics handling
function confirmResetStats() {
  const confirmModal = document.createElement('div');
  confirmModal.id = 'confirm-reset-modal';
  confirmModal.className = 'modal-overlay hidden';
  confirmModal.innerHTML = `
    <div class="modal-container max-w-md">
      <div class="p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold text-red-500">Reset Statistics</h3>
          <button onclick="closeModal('confirm-reset-modal')" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <p class="mb-6">Are you sure you want to reset all your quiz statistics? This action cannot be undone.</p>
        <div class="flex justify-end space-x-3">
          <button onclick="closeModal('confirm-reset-modal')" class="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">
            Cancel
          </button>
          <button onclick="resetQuizStats()" class="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white">
            Reset Statistics
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(confirmModal);
  openModal('confirm-reset-modal');
}

function resetQuizStats() {
  const profile = JSON.parse(localStorage.getItem('quizverse_profile'));
  if (!profile) return;
  
  profile.quizStats = {
    totalQuizzes: 0,
    totalScore: 0,
    totalQuestions: 0,
    lastQuizDate: null
  };
  
  localStorage.setItem('quizverse_profile', JSON.stringify(profile));
  closeModal('confirm-reset-modal');
  
  // Show success message
  const successMsg = document.createElement('div');
  successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
  successMsg.innerHTML = '<i class="fas fa-check-circle mr-2"></i> Statistics reset successfully!';
  document.body.appendChild(successMsg);
  
  setTimeout(() => {
    successMsg.remove();
    // Refresh profile view
    openProfileView();
  }, 2000);
}

function downloadQuizStats() {
  const profile = JSON.parse(localStorage.getItem('quizverse_profile'));
  if (!profile || !profile.quizStats) return;
  
  // Calculate accuracy
  const accuracy = profile.quizStats.totalQuestions > 0 
    ? Math.round((profile.quizStats.totalScore / profile.quizStats.totalQuestions) * 100) 
    : 0;
  
  // Create a canvas for the image
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');
  
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#4f46e5');
  gradient.addColorStop(1, '#06b6d4');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add decorative elements
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(
      Math.random() * canvas.width,
      Math.random() * canvas.height,
      Math.random() * 50 + 20,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
  
  // Add logo or title
  ctx.fillStyle = 'white';
  ctx.font = 'bold 32px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('QuizVerse Statistics', canvas.width / 2, 60);
  
  // Add user info
  ctx.font = '20px Arial';
  ctx.fillText(`${profile.name}'s Quiz Performance`, canvas.width / 2, 100);
  
  // Add stats boxes
  const stats = [
    { label: 'Total Quizzes', value: profile.quizStats.totalQuizzes },
    { label: 'Total Score', value: profile.quizStats.totalScore },
    { label: 'Total Questions', value: profile.quizStats.totalQuestions },
    { label: 'Accuracy', value: `${accuracy}%` }
  ];
  
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'left';
  
  stats.forEach((stat, index) => {
    const x = index % 2 === 0 ? 100 : 450;
    const y = 180 + Math.floor(index / 2) * 120;
    
    // Stat box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.roundRect(x, y, 250, 80, 10);
    ctx.fill();
    
    // Stat text
    ctx.fillStyle = 'white';
    ctx.fillText(stat.label, x + 20, y + 30);
    ctx.font = 'bold 28px Arial';
    ctx.fillText(stat.value.toString(), x + 20, y + 65);
    ctx.font = 'bold 16px Arial';
  });
  
  // Add footer
  ctx.font = '14px Arial';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillText(`Generated on ${new Date().toLocaleDateString()}`, canvas.width / 2, 550);
  ctx.fillText('quizverse.example.com', canvas.width / 2, 580);
  
  // Convert to image and download
  canvas.toBlob(blob => {
    const link = document.createElement('a');
    link.download = `quizverse-stats-${profile.name.replace(' ', '-')}.png`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  }, 'image/png', 1);
}