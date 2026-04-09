import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false, // call tests need ordered timing
  retries: 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "e2e/report" }]],

  use: {
    baseURL: "http://localhost:5173",
    video: "on",                  // record every test run
    screenshot: "only-on-failure",
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium-fake-media",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          // Fake webcam + mic — no physical device required
          args: [
            "--use-fake-ui-for-media-stream",
            "--use-fake-device-for-media-stream",
            "--allow-file-access-from-files",
            "--disable-web-security",
            "--autoplay-policy=no-user-gesture-required",
          ],
        },
        permissions: ["camera", "microphone"],
      },
    },
  ],

  // Auto-start both servers before running E2E tests.
  // Set SKIP_SERVERS=1 if you start them manually.
  webServer: process.env.SKIP_SERVERS
    ? []
    : [
        {
          command: "cd server && node index.js",
          port: 3000,
          reuseExistingServer: true,
          timeout: 30_000,
          env: {
            PORT: "3000",
            MONGODB_URI: "mongodb://127.0.0.1:27017/chat_e2e_test",
            SECRET_KEY: "e2e_test_secret_key_playwright",
            NODE_ENV: "test",
          },
        },
        {
          command: "cd client && npx vite --port 5173",
          port: 5173,
          reuseExistingServer: true,
          timeout: 60_000,
        },
      ],
});
