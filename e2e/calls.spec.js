/**
 * Part B — Playwright E2E call tests
 *
 * Two browser contexts (caller + receiver) are launched with Chrome's built-in
 * fake camera and microphone (--use-fake-device-for-media-stream).
 * No physical media device is required.
 *
 * Users are registered ONCE via the signup API in beforeAll. Login is done by
 * injecting the JWT token directly into localStorage — this completely avoids
 * the auth rate limiter (20 req/15 min) since zero login API calls are made.
 *
 * Covered scenarios:
 *  - Audio call: initiate → answer → timer ticks → end call
 *  - Video call: initiate → answer → video elements visible → end call
 *  - Reject incoming call
 *  - Receiver ends active call
 *  - Mute button during active call
 *  - Camera toggle during active video call
 *  - Mute + camera off simultaneously
 *  - Screenshot capture of call modal states
 */

import { test, expect, chromium } from "@playwright/test";
import axios from "axios";

const API = "http://localhost:3000/api";
const APP = "http://localhost:5173";

// ── helpers ───────────────────────────────────────────────────────────────────

let _uid = 0;
function uid() { return `e2e_${Date.now()}_${++_uid}`; }

/** Register a fresh user via API, return credentials + JWT token. */
async function registerUser() {
  const id = uid();
  const payload = {
    fullname: `Test ${id}`,
    username: `user_${id}`,
    email: `${id}@e2e.test`,
    password: "Password123",
    confirmPassword: "Password123",
    gender: "male",
  };
  const res = await axios.post(`${API}/auth/signup`, payload);
  return {
    email: payload.email,
    password: payload.password,
    fullname: payload.fullname,
    token: res.data._token,
  };
}

/** Launch a fresh browser context. */
async function launchContext(browser) {
  const context = await browser.newContext({
    permissions: ["camera", "microphone"],
  });
  const page = await context.newPage();
  return { context, page };
}

/**
 * Login by injecting the JWT token into localStorage.
 * No API request is made — bypasses the auth rate limiter entirely.
 */
async function loginWithToken(page, token) {
  // Navigate to the app so localStorage is on the right origin
  await page.goto(`${APP}/login`, { waitUntil: "domcontentloaded" });
  // Set the token (key is "_token" — see useAuthStore.js)
  await page.evaluate((t) => localStorage.setItem("_token", t), token);
  // Navigate to dashboard — checkAuth() will decode the token and log in
  await page.goto(`${APP}/dashboard`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector('input[placeholder="Search conversations..."]', { timeout: 15_000 });
}

/** Click the first user in the sidebar whose name contains `name`. */
async function openChatWith(page, name) {
  const btn = page.locator(`button:has-text("${name}")`).first();
  await btn.waitFor({ state: "visible", timeout: 10_000 });
  await btn.click();
  await page.waitForSelector('button[title="Voice Call"]', { timeout: 8_000 });
}

/** Wait for the call modal overlay to appear. */
async function waitForCallModal(page) {
  await page.waitForSelector('button[title="End Call"], button[title="Accept"]', { timeout: 12_000 });
}

// ── test suite ────────────────────────────────────────────────────────────────

test.describe("WebRTC Calls — E2E with fake media", () => {
  let browser;
  let callerCtx, callerPage;
  let receiverCtx, receiverPage;
  let callerCreds, receiverCreds;

  test.beforeAll(async () => {
    browser = await chromium.launch({
      headless: false,
      args: [
        "--use-fake-ui-for-media-stream",
        "--use-fake-device-for-media-stream",
        "--autoplay-policy=no-user-gesture-required",
        "--disable-web-security",
      ],
    });

    // Register both accounts once — only 2 API requests total
    callerCreds = await registerUser();
    receiverCreds = await registerUser();
  });

  test.afterAll(async () => {
    await browser.close();
  });

  test.beforeEach(async () => {
    ({ context: callerCtx, page: callerPage } = await launchContext(browser));
    ({ context: receiverCtx, page: receiverPage } = await launchContext(browser));

    // Token-based login — zero API calls
    await loginWithToken(callerPage, callerCreds.token);
    await loginWithToken(receiverPage, receiverCreds.token);
  });

  test.afterEach(async () => {
    await callerCtx?.close();
    await receiverCtx?.close();
  });

  // ── Audio call ───────────────────────────────────────────────────────────────

  test("audio call: initiate → answer → timer ticks → caller ends", async () => {
    await openChatWith(callerPage, receiverCreds.fullname);
    await openChatWith(receiverPage, callerCreds.fullname);

    await callerPage.click('button[title="Voice Call"]');

    // Caller shows "Calling..." modal
    await callerPage.waitForSelector('h3:has-text("Calling...")', { timeout: 8_000 });
    await expect(callerPage.locator('p').filter({ hasText: /INITIATING AUDIO LINK/i }).first()).toBeVisible();

    // Receiver shows incoming call modal
    await waitForCallModal(receiverPage);
    await expect(receiverPage.locator("p").filter({ hasText: /INCOMING AUDIO CALL/i }).first()).toBeVisible();
    await expect(receiverPage.locator('h3').filter({ hasText: callerCreds.fullname }).first()).toBeVisible();

    // Receiver answers
    await receiverPage.click('button[title="Accept"]');

    // Both sides reach inCall — mute + end call controls appear
    await callerPage.waitForSelector('button[title="Mute"]', { timeout: 10_000 });
    await callerPage.waitForSelector('button[title="End Call"]', { timeout: 5_000 });

    // Let timer tick
    await callerPage.waitForTimeout(1500);

    // Caller ends the call
    await callerPage.click('button[title="End Call"]');

    // Both modals disappear
    await expect(callerPage.locator('button[title="End Call"]')).not.toBeVisible({ timeout: 8_000 });
    await expect(receiverPage.locator('button[title="End Call"]')).not.toBeVisible({ timeout: 8_000 });
  });

  // ── Video call ───────────────────────────────────────────────────────────────

  test("video call: video elements visible with fake media stream", async () => {
    await openChatWith(callerPage, receiverCreds.fullname);
    await openChatWith(receiverPage, callerCreds.fullname);

    await callerPage.click('button[title="Video Call"]');
    await callerPage.waitForSelector('h3:has-text("Calling...")', { timeout: 8_000 });

    await waitForCallModal(receiverPage);
    await expect(receiverPage.locator("p").filter({ hasText: /INCOMING VIDEO CALL/i }).first()).toBeVisible();

    await receiverPage.click('button[title="Accept"]');

    // Video elements appear in caller's modal
    await callerPage.waitForSelector('video', { timeout: 12_000 });
    await expect(callerPage.locator("video").first()).toBeVisible({ timeout: 10_000 });

    // Camera toggle button present (video call only)
    await expect(callerPage.locator('button[title="Camera"]')).toBeVisible({ timeout: 8_000 });

    await callerPage.click('button[title="End Call"]');
    await expect(callerPage.locator('video')).not.toBeVisible({ timeout: 8_000 });
  });

  // ── Reject call ───────────────────────────────────────────────────────────────

  test("receiver rejects call — both modals disappear", async () => {
    await openChatWith(callerPage, receiverCreds.fullname);
    await openChatWith(receiverPage, callerCreds.fullname);

    await callerPage.click('button[title="Voice Call"]');
    await callerPage.waitForSelector('h3:has-text("Calling...")', { timeout: 8_000 });

    await waitForCallModal(receiverPage);
    await expect(receiverPage.locator('button[title="Reject"]')).toBeVisible();

    await receiverPage.click('button[title="Reject"]');

    await expect(callerPage.locator('h3:has-text("Calling...")')).not.toBeVisible({ timeout: 8_000 });
    await expect(receiverPage.locator('button[title="Accept"]')).not.toBeVisible({ timeout: 8_000 });
  });

  // ── Receiver ends call ────────────────────────────────────────────────────────

  test("receiver ends active call — caller modal disappears", async () => {
    await openChatWith(callerPage, receiverCreds.fullname);
    await openChatWith(receiverPage, callerCreds.fullname);

    await callerPage.click('button[title="Voice Call"]');
    await waitForCallModal(receiverPage);
    await receiverPage.click('button[title="Accept"]');

    await callerPage.waitForSelector('button[title="End Call"]', { timeout: 12_000 });
    await receiverPage.waitForSelector('button[title="End Call"]', { timeout: 12_000 });

    await receiverPage.click('button[title="End Call"]');

    await expect(callerPage.locator('button[title="End Call"]')).not.toBeVisible({ timeout: 8_000 });
    await expect(receiverPage.locator('button[title="End Call"]')).not.toBeVisible({ timeout: 8_000 });
  });

  // ── Mute control ──────────────────────────────────────────────────────────────

  test("mute button visible and clickable during active audio call", async () => {
    await openChatWith(callerPage, receiverCreds.fullname);
    await openChatWith(receiverPage, callerCreds.fullname);

    await callerPage.click('button[title="Voice Call"]');
    await waitForCallModal(receiverPage);
    await receiverPage.click('button[title="Accept"]');

    const muteBtn = callerPage.locator('button[title="Mute"]');
    await muteBtn.waitFor({ state: "visible", timeout: 12_000 });

    // Click mute — call should stay active
    await muteBtn.click();
    await expect(callerPage.locator('button[title="End Call"]')).toBeVisible();

    await callerPage.click('button[title="End Call"]');
  });

  // ── Camera toggle ─────────────────────────────────────────────────────────────

  test("camera toggle works during active video call", async () => {
    await openChatWith(callerPage, receiverCreds.fullname);
    await openChatWith(receiverPage, callerCreds.fullname);

    await callerPage.click('button[title="Video Call"]');
    await waitForCallModal(receiverPage);
    await receiverPage.click('button[title="Accept"]');

    const cameraBtn = callerPage.locator('button[title="Camera"]');
    await cameraBtn.waitFor({ state: "visible", timeout: 12_000 });

    // Toggle off then on
    await cameraBtn.click();
    await expect(callerPage.locator('button[title="End Call"]')).toBeVisible();
    await cameraBtn.click();
    await expect(callerPage.locator('button[title="End Call"]')).toBeVisible();

    await callerPage.click('button[title="End Call"]');
  });

  // ── Mute + camera off ────────────────────────────────────────────────────────

  test("mute and camera-off together — call stays alive", async () => {
    await openChatWith(callerPage, receiverCreds.fullname);
    await openChatWith(receiverPage, callerCreds.fullname);

    await callerPage.click('button[title="Video Call"]');
    await waitForCallModal(receiverPage);
    await receiverPage.click('button[title="Accept"]');

    await callerPage.waitForSelector('button[title="Mute"]', { timeout: 12_000 });
    await callerPage.waitForSelector('button[title="Camera"]', { timeout: 5_000 });

    await callerPage.click('button[title="Mute"]');
    await callerPage.click('button[title="Camera"]');

    await expect(callerPage.locator('button[title="End Call"]')).toBeVisible();

    await callerPage.click('button[title="End Call"]');
    await expect(callerPage.locator('button[title="End Call"]')).not.toBeVisible({ timeout: 8_000 });
  });

  // ── Screenshots ──────────────────────────────────────────────────────────────

  test("call modal renders correctly — screenshots captured", async () => {
    await openChatWith(callerPage, receiverCreds.fullname);
    await openChatWith(receiverPage, callerCreds.fullname);

    await callerPage.click('button[title="Voice Call"]');
    await callerPage.waitForSelector('h3:has-text("Calling...")', { timeout: 8_000 });

    await callerPage.screenshot({ path: "e2e/screenshots/caller-calling-state.png" });

    await waitForCallModal(receiverPage);
    await receiverPage.screenshot({ path: "e2e/screenshots/receiver-incoming-call.png" });

    await receiverPage.click('button[title="Accept"]');
    await callerPage.waitForSelector('button[title="Mute"]', { timeout: 12_000 });

    await callerPage.screenshot({ path: "e2e/screenshots/caller-in-call.png" });

    await callerPage.click('button[title="End Call"]');
  });
});
