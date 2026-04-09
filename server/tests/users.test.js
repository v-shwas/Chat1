/**
 * User route tests
 * GET  /api/users
 * GET  /api/users/profile/:id
 * PUT  /api/users/profile
 */

import request from "supertest";
import mongoose from "mongoose";
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

// ── GET /api/users ────────────────────────────────────────────────────────────

describe("GET /api/users", () => {
  it("returns 401 when no token is provided", async () => {
    const res = await request(app).get("/api/users");

    expect(res.status).toBe(401);
  });

  it("returns all users except the authenticated user", async () => {
    const { user: self, token } = await createTestUser({
      username: "selfuser",
      email: "self@example.com",
    });
    await createTestUser({ username: "other1", email: "other1@example.com" });
    await createTestUser({ username: "other2", email: "other2@example.com" });

    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // Should return 2 users (other1, other2) — not self
    expect(res.body).toHaveLength(2);
    const returnedIds = res.body.map((u) => u._id.toString());
    expect(returnedIds).not.toContain(self._id.toString());
  });

  it("does not expose password field", async () => {
    const { token } = await createTestUser({
      username: "nopassuser",
      email: "nopass@example.com",
    });
    await createTestUser({ username: "another", email: "another@example.com" });

    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    res.body.forEach((u) => {
      expect(u).not.toHaveProperty("password");
    });
  });

  it("returns empty array when no other users exist", async () => {
    const { token } = await createTestUser({
      username: "lonely",
      email: "lonely@example.com",
    });

    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

// ── GET /api/users/profile/:id ────────────────────────────────────────────────

describe("GET /api/users/profile/:id", () => {
  it("returns 401 without a token", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/users/profile/${fakeId}`);

    expect(res.status).toBe(401);
  });

  it("returns a user profile by id", async () => {
    const { user: target, token } = await createTestUser({
      username: "targetuser",
      email: "target@example.com",
      fullname: "Target Person",
    });

    const res = await request(app)
      .get(`/api/users/profile/${target._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body._id.toString()).toBe(target._id.toString());
    expect(res.body.username).toBe("targetuser");
    expect(res.body).not.toHaveProperty("password");
  });

  it("returns 404 for a non-existent user id", async () => {
    const { token } = await createTestUser({
      username: "requester",
      email: "requester@example.com",
    });
    const nonExistentId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .get(`/api/users/profile/${nonExistentId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/user not found/i);
  });
});

// ── PUT /api/users/profile ────────────────────────────────────────────────────

describe("PUT /api/users/profile", () => {
  it("returns 401 without a token", async () => {
    const res = await request(app)
      .put("/api/users/profile")
      .send({ fullname: "New Name" });

    expect(res.status).toBe(401);
  });

  it("updates the fullname", async () => {
    const { token } = await createTestUser({
      username: "updater",
      email: "updater@example.com",
      fullname: "Old Name",
    });

    const res = await request(app)
      .put("/api/users/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ fullname: "New Name" });

    expect(res.status).toBe(200);
    expect(res.body.fullname).toBe("New Name");
  });

  it("updates the about field", async () => {
    const { token } = await createTestUser({
      username: "aboutuser",
      email: "about@example.com",
    });

    const res = await request(app)
      .put("/api/users/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ about: "I love coding" });

    expect(res.status).toBe(200);
    expect(res.body.about).toBe("I love coding");
  });

  it("updates the profilePic field", async () => {
    const { token } = await createTestUser({
      username: "picuser",
      email: "pic@example.com",
    });

    const res = await request(app)
      .put("/api/users/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ profilePic: "https://example.com/new-pic.jpg" });

    expect(res.status).toBe(200);
    expect(res.body.profilePic).toBe("https://example.com/new-pic.jpg");
  });

  it("returns 400 when no updates are provided", async () => {
    const { token } = await createTestUser({
      username: "noupdate",
      email: "noupdate@example.com",
    });

    const res = await request(app)
      .put("/api/users/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/no updates provided/i);
  });

  it("returns 400 when fullname is too short", async () => {
    const { token } = await createTestUser({
      username: "shortname",
      email: "shortname@example.com",
    });

    const res = await request(app)
      .put("/api/users/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ fullname: "X" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/2-50 characters/i);
  });

  it("returns 400 when about is too long", async () => {
    const { token } = await createTestUser({
      username: "longabout",
      email: "longabout@example.com",
    });

    const res = await request(app)
      .put("/api/users/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ about: "x".repeat(201) });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/under 200 characters/i);
  });

  it("does not expose password in the response", async () => {
    const { token } = await createTestUser({
      username: "safeupdate",
      email: "safeupdate@example.com",
    });

    const res = await request(app)
      .put("/api/users/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ about: "safe" });

    expect(res.status).toBe(200);
    expect(res.body).not.toHaveProperty("password");
  });
});
