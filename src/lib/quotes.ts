export interface Quote {
  text: string;
  author: string;
  category: string;
}
// Preserved from the original quote collection. Attribution needs editorial review.
const groups: Record<string, [string, string][]> = {
  motivational: [
    ["The only way to do great work is to love what you do.", "Steve Jobs"],
    [
      "Success is not final, failure is not fatal: It is the courage to continue that counts.",
      "Winston Churchill",
    ],
    ["Believe you can and you're halfway there.", "Theodore Roosevelt"],
    [
      "Your time is limited, don't waste it living someone else's life.",
      "Steve Jobs",
    ],
    [
      "The future belongs to those who believe in the beauty of their dreams.",
      "Eleanor Roosevelt",
    ],
    ["Don't watch the clock; do what it does. Keep going.", "Sam Levenson"],
    [
      "The only limit to our realization of tomorrow is our doubts of today.",
      "Franklin D. Roosevelt",
    ],
    [
      "You are never too old to set another goal or to dream a new dream.",
      "C.S. Lewis",
    ],
    ["Act as if what you do makes a difference. It does.", "William James"],
    [
      "Success is stumbling from failure to failure with no loss of enthusiasm.",
      "Winston Churchill",
    ],
    ["The secret of getting ahead is getting started.", "Mark Twain"],
    [
      "You don't have to be great to start, but you have to start to be great.",
      "Zig Ziglar",
    ],
    [
      "What you get by achieving your goals is not as important as what you become by achieving your goals.",
      "Zig Ziglar",
    ],
    [
      "The harder you work for something, the greater you'll feel when you achieve it.",
      "Anonymous",
    ],
    ["Dream bigger. Do bigger.", "Anonymous"],
    ["Don't stop when you're tired. Stop when you're done.", "Anonymous"],
    ["Wake up with determination. Go to bed with satisfaction.", "Anonymous"],
    [
      "Do something today that your future self will thank you for.",
      "Anonymous",
    ],
    ["Little things make big days.", "Anonymous"],
    ["It's going to be hard, but hard does not mean impossible.", "Anonymous"],
  ],
  islamic: [
    [
      "The best among you are those who have the best manners and character.",
      "Prophet Muhammad (PBUH)",
    ],
    ["Do not lose hope, nor be sad.", "Quran 3:139"],
    ["Allah does not burden a soul beyond that it can bear.", "Quran 2:286"],
    ["Speak good or remain silent.", "Prophet Muhammad (PBUH)"],
    [
      "The strong person is not the one who can wrestle others down. The strong person is the one who can control himself when he is angry.",
      "Prophet Muhammad (PBUH)",
    ],
    [
      "Whoever believes in Allah and the Last Day should speak good or remain silent.",
      "Prophet Muhammad (PBUH)",
    ],
    [
      "The most perfect believer in faith is the one who is best in moral character.",
      "Prophet Muhammad (PBUH)",
    ],
    ["Verily, with hardship comes ease.", "Quran 94:6"],
    ["And We have certainly created man in the best of stature.", "Quran 95:4"],
    ["Allah is with those who are patient.", "Quran 2:153"],
    [
      "The best charity is that given when one is in need.",
      "Prophet Muhammad (PBUH)",
    ],
    [
      "The world is the believer's prison and the unbeliever's paradise.",
      "Prophet Muhammad (PBUH)",
    ],
    [
      "The ink of the scholar is more sacred than the blood of the martyr.",
      "Prophet Muhammad (PBUH)",
    ],
    [
      "Whoever treads a path in search of knowledge, Allah will make easy for him the path to Paradise.",
      "Prophet Muhammad (PBUH)",
    ],
    [
      "The best of you are those who learn the Quran and teach it.",
      "Prophet Muhammad (PBUH)",
    ],
    [
      "Kindness is a mark of faith, and whoever is not kind has no faith.",
      "Prophet Muhammad (PBUH)",
    ],
    [
      "The most beloved of people to Allah are those who are most beneficial to people.",
      "Prophet Muhammad (PBUH)",
    ],
    [
      "The best of you are those who are best to their families.",
      "Prophet Muhammad (PBUH)",
    ],
    [
      "Do not be people without minds of your own, saying that if others treat you well you will treat them well, and that if they do wrong you will do wrong. But accustom yourselves to do good if people do good and not to do wrong if they do evil.",
      "Prophet Muhammad (PBUH)",
    ],
    [
      "The believer's shade on the Day of Resurrection will be his charity.",
      "Prophet Muhammad (PBUH)",
    ],
  ],
  urdu: [
    [
      "دنیا کی سب سے بڑی طاقت محبت ہے، جو دلوں کو جیت لے وہی سب کچھ جیت لیتا ہے۔",
      "علامہ اقبال",
    ],
    ["خود کو پہچانو، خود کو بناؤ، یہی زندگی کا مقصد ہے۔", "سر سید احمد خان"],
    ["علم حاصل کرو، چاہے تمہیں چین ہی کیوں نہ جانا پڑے۔", "حدیث نبوی"],
    [
      "صبر کا پھل میٹھا ہوتا ہے، جو انتظار کرتا ہے اسے سب کچھ ملتا ہے۔",
      "مولانا رومی",
    ],
    ["محنت سے کام لو، قسمت خود تمہارے قدم چومے گی۔", "فیض احمد فیض"],
    ["زندگی ایک سفر ہے، اسے بھرپور طریقے سے جیو۔", "احمد فراز"],
    ["دوستی وہ پھول ہے جو کانٹوں کے بیچ بھی کھل سکتا ہے۔", "منٹو"],
    ["حقیقی کامیابی وہ ہے جو دوسروں کو بھی کامیاب بنائے۔", "ابن انشا"],
    ["وقت سب سے قیمتی تحفہ ہے جو آپ کسی کو دے سکتے ہیں۔", "پروین شاکر"],
    ["خوشی بانٹنے سے بڑھتی ہے۔", "حفیظ جالندھری"],
    ["دنیا میں سب سے بڑا جہاد نفس کے خلاف جنگ ہے۔", "شاہ ولی اللہ"],
    ["علم بغیر عمل کے ایسے ہے جیسے درخت بغیر پھل کے۔", "مولانا محمد علی جوہر"],
    [
      "حق بات کہنے والے کو ہمیشہ تنہائی کا سامنا کرنا پڑتا ہے۔",
      "سعادت حسن منٹو",
    ],
    [
      "زندگی میں کبھی ہار نہ مانو، کیونکہ مشکل وقت ہمیشہ کے لیے نہیں ہوتا۔",
      "جوش ملیح آبادی",
    ],
    [
      "محبت وہ چیز ہے جو دلوں کو جوڑتی ہے اور نفرتیں ختم کرتی ہے۔",
      "امتاں غفور",
    ],
    ["حقیقی دولت علم ہے، سونا چاندی نہیں۔", "خواجہ فرید"],
    ["دنیا کی سب سے بڑی دولت اطمینان قلب ہے۔", "بہاء الدین زکریا"],
    ["جس نے صبر کیا، اس نے سب کچھ پایا۔", "سعدی شیرازی"],
    ["دنیا میں سب سے بڑا راز وفا ہے۔", "مرزا غالب"],
    ["حقیقی انسان وہ ہے جو دوسروں کے دکھ درد کو سمجھے۔", "قرۃ العین حیدر"],
  ],
  famous: [
    ["Be the change that you wish to see in the world.", "Mahatma Gandhi"],
    [
      "In three words I can sum up everything I've learned about life: it goes on.",
      "Robert Frost",
    ],
    [
      "If you tell the truth, you don't have to remember anything.",
      "Mark Twain",
    ],
    [
      "A friend is someone who knows all about you and still loves you.",
      "Elbert Hubbard",
    ],
    [
      "To live is the rarest thing in the world. Most people exist, that is all.",
      "Oscar Wilde",
    ],
    ["Without music, life would be a mistake.", "Friedrich Nietzsche"],
    ["We accept the love we think we deserve.", "Stephen Chbosky"],
    [
      "It is better to be hated for what you are than to be loved for what you are not.",
      "André Gide",
    ],
    [
      "Life is what happens to us while we are making other plans.",
      "Allen Saunders",
    ],
    [
      "I have not failed. I've just found 10,000 ways that won't work.",
      "Thomas Edison",
    ],
    ["Everything you can imagine is real.", "Pablo Picasso"],
    [
      "Do what you can, with what you have, where you are.",
      "Theodore Roosevelt",
    ],
    ["The only thing we have to fear is fear itself.", "Franklin D. Roosevelt"],
    ["Not all those who wander are lost.", "J.R.R. Tolkien"],
    ["The journey of a thousand miles begins with one step.", "Lao Tzu"],
    ["That which does not kill us makes us stronger.", "Friedrich Nietzsche"],
    [
      "Life is really simple, but we insist on making it complicated.",
      "Confucius",
    ],
    ["May you live every day of your life.", "Jonathan Swift"],
    ["You only live once, but if you do it right, once is enough.", "Mae West"],
    ["Whatever you are, be a good one.", "Abraham Lincoln"],
  ],
  wisdom: [
    ["Knowing yourself is the beginning of all wisdom.", "Aristotle"],
    ["The only true wisdom is in knowing you know nothing.", "Socrates"],
    ["Turn your wounds into wisdom.", "Oprah Winfrey"],
    [
      "The fool doth think he is wise, but the wise man knows himself to be a fool.",
      "William Shakespeare",
    ],
    [
      "Wisdom is not a product of schooling but of the lifelong attempt to acquire it.",
      "Albert Einstein",
    ],
    ["Patience is the companion of wisdom.", "Saint Augustine"],
    [
      "The wise man learns more from his enemies than the fool from his friends.",
      "Baltasar Gracián",
    ],
    [
      "Wisdom is the reward you get for a lifetime of listening when you'd have preferred to talk.",
      "Doug Larson",
    ],
    [
      "A wise man can learn more from a foolish question than a fool can learn from a wise answer.",
      "Bruce Lee",
    ],
    [
      "The invariable mark of wisdom is to see the miraculous in the common.",
      "Ralph Waldo Emerson",
    ],
    ["Wisdom is the right use of knowledge.", "Charles Spurgeon"],
    [
      "The wise man does at once what the fool does finally.",
      "Niccolò Machiavelli",
    ],
    ["Wisdom is not wisdom when it is derived from books alone.", "Horace"],
    ["A wise man proportions his belief to the evidence.", "David Hume"],
    [
      "The doorstep to the temple of wisdom is a knowledge of our own ignorance.",
      "Benjamin Franklin",
    ],
    ["Wisdom is the supreme part of happiness.", "Sophocles"],
    ["Wisdom begins in wonder.", "Socrates"],
    [
      "The art of being wise is the art of knowing what to overlook.",
      "William James",
    ],
    ["Wisdom is the daughter of experience.", "Leonardo da Vinci"],
    [
      "The wise man learns from the mistakes of others, the fool has to make his own.",
      "German Proverb",
    ],
  ],
};
export const quotes: Quote[] = Object.entries(groups).flatMap(
  ([category, items]) =>
    items.map(([text, author]) => ({ text, author, category })),
);
