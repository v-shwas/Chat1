/**
 * Middleware tests — protectRoute
 *
 * We test the middleware indirectly by hitting an authenticated route
 * (GET /api/users) with various token conditions.
 */

import request from "supertest";
import jwt from "jsonwebtoken";
import { connectTestDB, clearTestDB, disconnectTestDB } from "./setup.js";
import { TEST_SECRET, createTestUser, makeToken } from "./helpers.js";
import buildApp from "./testApp.js";

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

describe("protectRoute middleware", () => {
  it("allows a request with a valid JWT to proceed", async () => {
    const { token } = await createTestUser({
      username: "validjwtuser",
      email: "validjwt@example.com",
    });

    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it("allows the token to be passed as a raw header (no Bearer prefix)", async () => {
    const { token } = await createTestUser({
      username: "rawTokenUser",
      email: "rawtoken@example.com",
    });

    const res = await request(app)
      .get("/api/users")
      .set("Authorization", token);

    expect(res.status).toBe(200);
  });

  it("rejects a request with no Authorization header", async () => {
    const res = await request(app).get("/api/users");

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/no token provided/i);
  });

  it("rejects a request with a malformed (garbage) token", async () => {
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", "Bearer this.is.not.a.valid.token");

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/invalid token/i);
  });

  it("rejects an expired token", async () => {
    const { user } = await createTestUser({
      username: "expiredUser",
      email: "expired@example.com",
    });

    // Sign a token that expired 1 second ago
    const expiredToken = jwt.sign(
      { _id: user._id, username: user.username },
      TEST_SECRET,
      { expiresIn: "-1s" }
    );

    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${expiredToken}`);

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/token expired/i);
  });

  it("rejects a token signed with a different secret", async () => {
    const { user } = await createTestUser({
      username: "wrongSecretUser",
      email: "wrongsecret@example.com",
    });

    const wrongToken = jwt.sign(
      { _id: user._id, username: user.username },
      "completely_different_secret"
    );

    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${wrongToken}`);

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/invalid token/i);
  });

  it("rejects a valid token whose user was deleted from the database", async () => {
    const { user, token } = await createTestUser({
      username: "deletedUser",
      email: "deleteduser@example.com",
    });

    // Manually delete the user from the DB
    const User = (await import("../models/userModel.js")).default;
    await User.findByIdAndDelete(user._id);

    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/user not found/i);
  });

  it("rejects a token with only whitespace/empty string", async () => {
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", "Bearer ");

    expect(res.status).toBe(401);
  });
});
