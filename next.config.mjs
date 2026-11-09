const redirects = ['index', 'quiz-categories', 'quiz', 'personality', 'flashcards', 'about', 'contact', 'privacy', 'terms', 'cookies'];

const nextConfig = {
  poweredByHeader: false,
  outputFileTracingIncludes: { '/api/quiz/*': ['./data/questions/*.json', './data/personality-quiz-data.json'], '/api/flashcards/progress': ['./data/flashcards.json'] },
  async redirects() {
    return redirects.map(page => ({
      source: `/${page}.html`,
      destination: page === 'index' ? '/' : page === 'quiz-categories' ? '/quizzes' : `/${page}`,
      permanent: true,
    }));
  },
  async headers() {
    return [{ source: '/:path*', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ] }];
  },
};
export default nextConfig;
