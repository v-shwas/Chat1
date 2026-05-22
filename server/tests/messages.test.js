/**
 * Message route tests
 * GET    /api/message/:id           — getMessages
 * POST   /api/message/send/:id      — sendMessage
 * POST   /api/message/read/:id      — markAsRead
 * POST   /api/message/react/:id     — reactToMessage
 * DELETE /api/message/:id           — deleteMessage
 */

import request from "supertest";
import mongoose from "mongoose";
import Message from "../models/msgModel.js";
import Conversation from "../models/convModel.js";
import { connectTestDB, clearTestDB, disconnectTestDB } from "./setup.js";
import { TEST_SECRET, createTestUser } from "./helpers.js";
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

// ── GET /api/message/:id ─────────────────────────────────────────────────────

describe("GET /api/message/:id", () => {
  it("returns 401 without a token", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/message/${fakeId}`);

    expect(res.status).toBe(401);
  });

  it("returns empty array when no conversation exists", async () => {
    const { token } = await createTestUser({
      username: "sender1",
      email: "sender1@example.com",
    });
    const { user: other } = await createTestUser({
      username: "receiver1",
      email: "receiver1@example.com",
    });

    const res = await request(app)
      .get(`/api/message/${other._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("returns messages for an existing conversation", async () => {
    const { user: sender, token } = await createTestUser({
      username: "msgsender",
      email: "msgsender@example.com",
    });
    const { user: receiver } = await createTestUser({
      username: "msgreceiver",
      email: "msgreceiver@example.com",
    });

    // Send a message to create the conversation
    await request(app)
      .post(`/api/message/send/${receiver._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ message: "Hello there!" });

    const res = await request(app)
      .get(`/api/message/${receiver._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].message).toBe("Hello there!");
  });
});

// ── POST /api/message/send/:id ───────────────────────────────────────────────

describe("POST /api/message/send/:id", () => {
  it("returns 401 without a token", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .post(`/api/message/send/${fakeId}`)
      .send({ message: "hi" });

    expect(res.status).toBe(401);
  });

  it("sends a text message and returns 201", async () => {
    const { user: sender, token } = await createTestUser({
      username: "sndr",
      email: "sndr@example.com",
    });
    const { user: receiver } = await createTestUser({
      username: "rcvr",
      email: "rcvr@example.com",
    });

    const res = await request(app)
      .post(`/api/message/send/${receiver._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ message: "Hey!" });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Hey!");
    expect(res.body.senderId.toString()).toBe(sender._id.toString());
  });

  it("creates a conversation if none exists", async () => {
    const { token } = await createTestUser({
      username: "sndr2",
      email: "sndr2@example.com",
    });
    const { user: receiver } = await createTestUser({
      username: "rcvr2",
      email: "rcvr2@example.com",
    });

    await request(app)
      .post(`/api/message/send/${receiver._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ message: "First message" });

    const conversations = await Conversation.find({});
    expect(conversations).toHaveLength(1);
    expect(conversations[0].messages).toHaveLength(1);
  });

  it("returns 400 when neither message nor image is provided", async () => {
    const { token } = await createTestUser({
      username: "sndr3",
      email: "sndr3@example.com",
    });
    const { user: receiver } = await createTestUser({
      username: "rcvr3",
      email: "rcvr3@example.com",
    });

    const res = await request(app)
      .post(`/api/message/send/${receiver._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/message content or file required/i);
  });

  it("returns 404 when the receiver does not exist", async () => {
    const { token } = await createTestUser({
      username: "sndrMissingReceiver",
      email: "sndrMissingReceiver@example.com",
    });
    const missingReceiverId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .post(`/api/message/send/${missingReceiverId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ message: "Nobody should receive this" });

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/receiver not found/i);
  });

  it("sends a second message in the existing conversation", async () => {
    const { user: sender, token } = await createTestUser({
      username: "sndr4",
      email: "sndr4@example.com",
    });
    const { user: receiver } = await createTestUser({
      username: "rcvr4",
      email: "rcvr4@example.com",
    });

    await request(app)
      .post(`/api/message/send/${receiver._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ message: "Msg 1" });

    await request(app)
      .post(`/api/message/send/${receiver._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ message: "Msg 2" });

    const conversations = await Conversation.find({});
    expect(conversations).toHaveLength(1);
    expect(conversations[0].messages).toHaveLength(2);
  });
});

// ── POST /api/message/read/:id ───────────────────────────────────────────────

describe("POST /api/message/read/:id", () => {
  it("returns 401 without a token", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).post(`/api/message/read/${fakeId}`);

    expect(res.status).toBe(401);
  });

  it("marks unread messages as read and returns success", async () => {
    const { user: sender, token: senderToken } = await createTestUser({
      username: "markSndr",
      email: "markSndr@example.com",
    });
    const { user: reader, token: readerToken } = await createTestUser({
      username: "markRdr",
      email: "markRdr@example.com",
    });

    // Sender sends a message
    await request(app)
      .post(`/api/message/send/${reader._id}`)
      .set("Authorization", `Bearer ${senderToken}`)
      .send({ message: "Read me" });

    // Reader marks as read
    const res = await request(app)
      .post(`/api/message/read/${sender._id}`)
      .set("Authorization", `Bearer ${readerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify in DB
    const messages = await Message.find({
      senderId: sender._id,
      receiverId: reader._id,
    });
    expect(messages.every((m) => m.status === "read")).toBe(true);
  });

  it("returns success even when there are no unread messages", async () => {
    const { user: sender } = await createTestUser({
      username: "noUnread",
      email: "noUnread@example.com",
    });
    const { token: readerToken } = await createTestUser({
      username: "noUnreadRdr",
      email: "noUnreadRdr@example.com",
    });

    const res = await request(app)
      .post(`/api/message/read/${sender._id}`)
      .set("Authorization", `Bearer ${readerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// ── POST /api/message/react/:id ──────────────────────────────────────────────

describe("POST /api/message/react/:id", () => {
  it("returns 401 without a token", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).post(`/api/message/react/${fakeId}`);

    expect(res.status).toBe(401);
  });

  it("adds a reaction to a message", async () => {
    const { user: sender, token } = await createTestUser({
      username: "reactSndr",
      email: "reactSndr@example.com",
    });
    const { user: receiver } = await createTestUser({
      username: "reactRcvr",
      email: "reactRcvr@example.com",
    });

    // Send a message first
    const sendRes = await request(app)
      .post(`/api/message/send/${receiver._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ message: "React to this" });

    const messageId = sendRes.body._id;

    const res = await request(app)
      .post(`/api/message/react/${messageId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ emoji: "👍" });

    expect(res.status).toBe(200);
    expect(res.body.reactions).toHaveLength(1);
    expect(res.body.reactions[0].emoji).toBe("👍");
  });

  it("returns 403 when a non-participant reacts to a direct message", async () => {
    const { token: senderToken } = await createTestUser({
      username: "reactSecSender",
      email: "reactSecSender@example.com",
    });
    const { user: receiver } = await createTestUser({
      username: "reactSecReceiver",
      email: "reactSecReceiver@example.com",
    });
    const { token: outsiderToken } = await createTestUser({
      username: "reactSecOutsider",
      email: "reactSecOutsider@example.com",
    });

    const sendRes = await request(app)
      .post(`/api/message/send/${receiver._id}`)
      .set("Authorization", `Bearer ${senderToken}`)
      .send({ message: "Private message" });

    const res = await request(app)
      .post(`/api/message/react/${sendRes.body._id}`)
      .set("Authorization", `Bearer ${outsiderToken}`)
      .send({ emoji: "👍" });

    expect(res.status).toBe(403);
  });

  it("removes a reaction when an empty emoji is sent", async () => {
    const { user: sender, token } = await createTestUser({
      username: "reactRemSndr",
      email: "reactRemSndr@example.com",
    });
    const { user: receiver } = await createTestUser({
      username: "reactRemRcvr",
      email: "reactRemRcvr@example.com",
    });

    const sendRes = await request(app)
      .post(`/api/message/send/${receiver._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ message: "React then remove" });

    const messageId = sendRes.body._id;

    // Add reaction
    await request(app)
      .post(`/api/message/react/${messageId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ emoji: "❤️" });

    // Remove reaction with empty emoji
    const res = await request(app)
      .post(`/api/message/react/${messageId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ emoji: "" });

    expect(res.status).toBe(200);
    expect(res.body.reactions).toHaveLength(0);
  });

  it("returns 404 for a non-existent message", async () => {
    const { token } = await createTestUser({
      username: "reactNone",
      email: "reactNone@example.com",
    });
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .post(`/api/message/react/${fakeId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ emoji: "😂" });

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/message not found/i);
  });

  it("replaces an existing reaction from the same user", async () => {
    const { user: sender, token } = await createTestUser({
      username: "reactReplace",
      email: "reactReplace@example.com",
    });
    const { user: receiver } = await createTestUser({
      username: "reactReplaceRcvr",
      email: "reactReplaceRcvr@example.com",
    });

    const sendRes = await request(app)
      .post(`/api/message/send/${receiver._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ message: "Change reaction" });

    const messageId = sendRes.body._id;

    await request(app)
      .post(`/api/message/react/${messageId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ emoji: "👍" });

    const res = await request(app)
      .post(`/api/message/react/${messageId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ emoji: "🔥" });

    expect(res.status).toBe(200);
    // Still only 1 reaction (replaced)
    expect(res.body.reactions).toHaveLength(1);
    expect(res.body.reactions[0].emoji).toBe("🔥");
  });
});

// ── DELETE /api/message/:id ──────────────────────────────────────────────────

describe("DELETE /api/message/:id", () => {
  it("returns 401 without a token", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).delete(`/api/message/${fakeId}`);

    expect(res.status).toBe(401);
  });

  it("soft-deletes a message by its owner", async () => {
    const { user: sender, token } = await createTestUser({
      username: "delSndr",
      email: "delSndr@example.com",
    });
    const { user: receiver } = await createTestUser({
      username: "delRcvr",
      email: "delRcvr@example.com",
    });

    const sendRes = await request(app)
      .post(`/api/message/send/${receiver._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ message: "Delete me" });

    const messageId = sendRes.body._id;

    const res = await request(app)
      .delete(`/api/message/${messageId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify soft delete in DB
    const msg = await Message.findById(messageId);
    expect(msg.isDeleted).toBe(true);
    expect(msg.message).toBe("");
  });

  it("returns 403 when a non-owner tries to delete", async () => {
    const { user: sender, token: senderToken } = await createTestUser({
      username: "delOwner",
      email: "delOwner@example.com",
    });
    const { user: receiver, token: receiverToken } = await createTestUser({
      username: "delOther",
      email: "delOther@example.com",
    });

    const sendRes = await request(app)
      .post(`/api/message/send/${receiver._id}`)
      .set("Authorization", `Bearer ${senderToken}`)
      .send({ message: "Try to delete me" });

    const messageId = sendRes.body._id;

    // Receiver tries to delete sender's message
    const res = await request(app)
      .delete(`/api/message/${messageId}`)
      .set("Authorization", `Bearer ${receiverToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/can only delete your own messages/i);
  });

  it("returns 404 for a non-existent message", async () => {
    const { token } = await createTestUser({
      username: "del404",
      email: "del404@example.com",
    });
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .delete(`/api/message/${fakeId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/message not found/i);
  });
});
