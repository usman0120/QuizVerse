import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  workers: 2,
  timeout: 60000,
  expect: { timeout: 15000 },
  use: { baseURL: 'http://127.0.0.1:3100', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], channel: 'chromium' } }],
  webServer: {
    command: 'npm run dev -- --hostname 127.0.0.1 --port 3100',
    url: 'http://127.0.0.1:3100',
    timeout: 120000,
    reuseExistingServer: false,
    env: { QUIZ_SESSION_SECRET: '', NEXT_PUBLIC_FIREBASE_API_KEY: '', NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: '', NEXT_PUBLIC_FIREBASE_PROJECT_ID: '', NEXT_PUBLIC_FIREBASE_APP_ID: '', FIREBASE_PROJECT_ID: '', FIREBASE_CLIENT_EMAIL: '', FIREBASE_PRIVATE_KEY: '' },
  },
});
