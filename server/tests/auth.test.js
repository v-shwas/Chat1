/**
 * Auth route tests
 * POST /api/auth/signup
 * POST /api/auth/login
 */

import request from "supertest";
import { connectTestDB, clearTestDB, disconnectTestDB } from "./setup.js";
import { TEST_SECRET } from "./helpers.js";
import buildApp from "./testApp.js";

// Must be set before any module that uses process.env.SECRET_KEY is loaded
process.env.SECRET_KEY = TEST_SECRET;

let app;

beforeAll(async () => {
  await connectTestDB();
  app = buildApp();
});

afterAll(async () => {
  await disconnectTestDB();
});

beforeEach(async () => {
  await clearTestDB();
});

// ── /api/auth/signup ─────────────────────────────────────────────────────────

describe("POST /api/auth/signup", () => {
  const validPayload = {
    fullname: "Alice Smith",
    username: "alice",
    email: "alice@example.com",
    password: "secret123",
    confirmPassword: "secret123",
    gender: "female",
  };

  it("registers a new user and returns a token", async () => {
    const res = await request(app).post("/api/auth/signup").send(validPayload);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("_token");
    expect(res.body.err).toBe(0);
  });

  it("returns 400 when username is already taken", async () => {
    // First registration
    await request(app).post("/api/auth/signup").send(validPayload);

    // Second registration with same username, different email
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ ...validPayload, email: "different@example.com" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/username already taken/i);
  });

  it("returns 400 when email is already registered", async () => {
    await request(app).post("/api/auth/signup").send(validPayload);

    // Same email, different username
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ ...validPayload, username: "alice2" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/email already registered/i);
  });

  it("returns 400 when passwords do not match", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ ...validPayload, confirmPassword: "wrongpass" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/passwords don't match/i);
  });

  it("returns 400 when required fields are missing", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ fullname: "Alice Smith", username: "alice" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("returns 400 when password is too short (weak password)", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ ...validPayload, password: "abc", confirmPassword: "abc" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/at least 6 characters/i);
  });

  it("returns 400 when email format is invalid", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ ...validPayload, email: "not-an-email" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/invalid email/i);
  });

  it("returns 400 when fullname is too short", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ ...validPayload, fullname: "A" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/2-50 characters/i);
  });

  it("returns 400 when username is too short", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ ...validPayload, username: "ab" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/3-30 characters/i);
  });

  it("returns 400 for invalid gender value", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ ...validPayload, gender: "other" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/invalid gender/i);
  });
});

// ── /api/auth/login ──────────────────────────────────────────────────────────

describe("POST /api/auth/login", () => {
  const signupPayload = {
    fullname: "Bob Jones",
    username: "bobjones",
    email: "bob@example.com",
    password: "mypassword",
    confirmPassword: "mypassword",
    gender: "male",
  };

  beforeEach(async () => {
    // Seed a user for login tests
    await request(app).post("/api/auth/signup").send(signupPayload);
  });

  it("logs in with email and returns a token", async () => {
    const res = await request(app).post("/api/auth/login").send({
      userInfo: "bob@example.com",
      password: "mypassword",
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("_token");
    expect(res.body.err).toBe(0);
  });

  it("logs in with username and returns a token", async () => {
    const res = await request(app).post("/api/auth/login").send({
      userInfo: "bobjones",
      password: "mypassword",
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("_token");
  });

  it("returns 401 for wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      userInfo: "bob@example.com",
      password: "wrongpassword",
    });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe(true);
    expect(res.body.message).toMatch(/invalid credentials/i);
  });

  it("returns 401 for non-existent user", async () => {
    const res = await request(app).post("/api/auth/login").send({
      userInfo: "nobody@example.com",
      password: "mypassword",
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid credentials/i);
  });

  it("returns 400 when fields are missing", async () => {
    const res = await request(app).post("/api/auth/login").send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/all fields are required/i);
  });

  it("returns 400 when password is missing", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ userInfo: "bob@example.com" });

    expect(res.status).toBe(400);
  });
});
