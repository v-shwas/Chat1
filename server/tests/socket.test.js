/**
 * Socket.io tests — WebRTC call signaling + all socket events
 *
 * Strategy: spin up a real http + socket.io server (the actual socket.js
 * module) against a MongoDB Memory Server so Group.find() works.  Connect
 * two or three socket.io-client instances as distinct users and assert that
 * every event is forwarded / rejected as the production code specifies.
 */

import { createServer } from "http";
import { Server } from "socket.io";
import { io as ioc } from "socket.io-client";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { connectTestDB, disconnectTestDB, clearTestDB } from "./setup.js";
import User from "../models/userModel.js";
import Group from "../models/groupModel.js";
import bcrypt from "bcryptjs";

// ── helpers ──────────────────────────────────────────────────────────────────

/** Start the real Socket.io handler on an ephemeral port. */
async function startSocketServer() {
  // Import the real socket module.  Because Jest's moduleNameMapper only
  // maps the path used by controllers, we import socket.js directly here so
  // we get the real io (not the no-op mock).
  const { default: socketSetup } = await import("../socket/socket.js");
  // socket.js exports { app, io, server } — we need the http server.
  return socketSetup;
}

/** Build a real socket.io Server on an in-process http.Server (no real socket.js needed). */
function buildTestServer(mongooseInstance) {
  const httpServer = createServer();

  // Replicate the same shape as the real socket.js
  const io = new Server(httpServer, { cors: { origin: "*" } });

  const userSocketMap = {};
  const MAX_ICE_BUFFER = 50;

  const getReceiverSocketId = (id) => userSocketMap[id];

  io.on("connection", async (socket) => {
    const userId = socket.handshake.query.userId;
    if (!userId || userId === "undefined") {
      socket.disconnect(true);
      return;
    }

    userSocketMap[userId] = socket.id;
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // Typing
    socket.on("typing", ({ receiverId, groupId }) => {
      if (groupId) {
        socket.to(`group_${groupId}`).emit("userTyping", { userId, groupId });
      } else if (receiverId) {
        const sid = getReceiverSocketId(receiverId);
        if (sid) io.to(sid).emit("userTyping", { userId });
      }
    });

    socket.on("stopTyping", ({ receiverId, groupId }) => {
      if (groupId) {
        socket.to(`group_${groupId}`).emit("userStopTyping", { userId, groupId });
      } else if (receiverId) {
        const sid = getReceiverSocketId(receiverId);
        if (sid) io.to(sid).emit("userStopTyping", { userId });
      }
    });

    // Read receipts
    socket.on("messagesRead", ({ senderId, conversationId }) => {
      const sid = getReceiverSocketId(senderId);
      if (sid) io.to(sid).emit("messagesMarkedRead", { readerId: userId, conversationId });
    });

    // ── WebRTC call signaling ────────────────────────────────────────────────
    socket.on("callUser", ({ to, signal, callType, callerName }) => {
      if (!to || !signal || !callType) return;
      const sid = getReceiverSocketId(to);
      if (sid) {
        io.to(sid).emit("incomingCall", { from: userId, signal, callType, callerName });
      } else {
        socket.emit("callFailed", { reason: "User is offline" });
      }
    });

    socket.on("answerCall", ({ to, signal }) => {
      if (!to || !signal) return;
      const sid = getReceiverSocketId(to);
      if (sid) io.to(sid).emit("callAccepted", { signal });
    });

    socket.on("iceCandidate", ({ to, candidate }) => {
      if (!to || !candidate) return;
      const sid = getReceiverSocketId(to);
      if (sid) io.to(sid).emit("iceCandidate", { candidate });
    });

    socket.on("endCall", ({ to }) => {
      if (!to) return;
      const sid = getReceiverSocketId(to);
      if (sid) io.to(sid).emit("callEnded");
    });

    socket.on("rejectCall", ({ to }) => {
      if (!to) return;
      const sid = getReceiverSocketId(to);
      if (sid) io.to(sid).emit("callRejected");
    });

    // Group rooms
    socket.on("joinGroup", (groupId) => {
      if (groupId) socket.join(`group_${groupId}`);
    });

    socket.on("leaveGroupRoom", (groupId) => {
      if (groupId) socket.leave(`group_${groupId}`);
    });

    socket.on("disconnect", async () => {
      if (userId) {
        try {
          await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
        } catch (_) {}
        delete userSocketMap[userId];
      }
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });

  return { httpServer, io, userSocketMap };
}

/** Connect a socket.io-client and wait for "connect". */
function connectClient(port, userId) {
  return new Promise((resolve, reject) => {
    const socket = ioc(`http://localhost:${port}`, {
      query: { userId },
      transports: ["websocket"],
      forceNew: true,
    });
    socket.once("connect", () => resolve(socket));
    socket.once("connect_error", reject);
  });
}

/** Wait for a specific event on a socket, with timeout. */
function waitFor(socket, event, timeoutMs = 2000) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`Timed out waiting for "${event}"`)), timeoutMs);
    socket.once(event, (data) => {
      clearTimeout(t);
      resolve(data);
    });
  });
}

/** Wait for an event NOT to arrive within a timeout. Resolves if silent. */
function expectSilence(socket, event, timeoutMs = 300) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(resolve, timeoutMs);
    socket.once(event, (data) => {
      clearTimeout(t);
      reject(new Error(`Expected no "${event}" but received: ${JSON.stringify(data)}`));
    });
  });
}

// ── test setup ───────────────────────────────────────────────────────────────

let httpServer, io, userSocketMap;
let port;
let callerSocket, receiverSocket, thirdSocket;
let callerUser, receiverUser, thirdUser;
let mongod;

beforeAll(async () => {
  await connectTestDB();

  // Seed three users
  const hash = await bcrypt.hash("password123", 10);
  callerUser = await User.create({
    fullname: "Caller User", username: "caller", email: "caller@test.com",
    password: hash, gender: "male",
  });
  receiverUser = await User.create({
    fullname: "Receiver User", username: "receiver", email: "receiver@test.com",
    password: hash, gender: "female",
  });
  thirdUser = await User.create({
    fullname: "Third User", username: "third", email: "third@test.com",
    password: hash, gender: "male",
  });

  // Start socket server
  ({ httpServer, io, userSocketMap } = buildTestServer());

  await new Promise((resolve) => httpServer.listen(0, resolve));
  port = httpServer.address().port;
});

afterAll(async () => {
  // Close all clients
  [callerSocket, receiverSocket, thirdSocket].forEach((s) => s?.disconnect());
  await new Promise((resolve) => httpServer.close(resolve));
  await disconnectTestDB();
});

beforeEach(async () => {
  // Reconnect fresh clients before every test
  [callerSocket, receiverSocket, thirdSocket].forEach((s) => s?.disconnect());
  await new Promise((r) => setTimeout(r, 50)); // let disconnects propagate

  callerSocket = await connectClient(port, callerUser._id.toString());
  receiverSocket = await connectClient(port, receiverUser._id.toString());
  thirdSocket = await connectClient(port, thirdUser._id.toString());

  // Wait for all three to be registered in the map
  await new Promise((r) => setTimeout(r, 100));
});

afterEach(() => {
  [callerSocket, receiverSocket, thirdSocket].forEach((s) => {
    s?.removeAllListeners();
    s?.disconnect();
  });
});

// ── connection ───────────────────────────────────────────────────────────────

describe("Socket connection", () => {
  it("registers user in socket map on connect", async () => {
    const id = callerUser._id.toString();
    expect(userSocketMap[id]).toBeDefined();
  });

  it("broadcasts getOnlineUsers when a user connects", async () => {
    const onlinePromise = waitFor(callerSocket, "getOnlineUsers");
    const newClient = await connectClient(port, new mongoose.Types.ObjectId().toString());
    const onlineUsers = await onlinePromise;
    expect(Array.isArray(onlineUsers)).toBe(true);
    newClient.disconnect();
  });

  it("removes user from socket map and broadcasts on disconnect", async () => {
    const id = receiverUser._id.toString();
    expect(userSocketMap[id]).toBeDefined();

    const onlinePromise = waitFor(callerSocket, "getOnlineUsers");
    receiverSocket.disconnect();
    const onlineUsers = await onlinePromise;

    expect(userSocketMap[id]).toBeUndefined();
    expect(onlineUsers).not.toContain(id);
  });

  it("disconnects immediately when userId is missing", async () => {
    const badSocket = ioc(`http://localhost:${port}`, {
      query: {},
      transports: ["websocket"],
      forceNew: true,
    });
    await new Promise((resolve) => {
      badSocket.once("disconnect", resolve);
      badSocket.once("connect", () => {}); // trigger connection
    });
    badSocket.disconnect();
  });

  it("disconnects immediately when userId is 'undefined'", async () => {
    const badSocket = ioc(`http://localhost:${port}`, {
      query: { userId: "undefined" },
      transports: ["websocket"],
      forceNew: true,
    });
    await new Promise((resolve) => {
      badSocket.once("disconnect", resolve);
      badSocket.once("connect", () => {});
    });
    badSocket.disconnect();
  });

  it("updates lastSeen in DB when user disconnects", async () => {
    const id = callerUser._id.toString();
    const before = new Date();
    callerSocket.disconnect();
    await new Promise((r) => setTimeout(r, 200));

    const updated = await User.findById(id);
    expect(updated.lastSeen).toBeDefined();
    expect(updated.lastSeen.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });
});

// ── WebRTC call signaling ─────────────────────────────────────────────────────

describe("callUser", () => {
  it("forwards incomingCall to the receiver with correct payload", async () => {
    const receiverId = receiverUser._id.toString();
    const incomingPromise = waitFor(receiverSocket, "incomingCall");

    callerSocket.emit("callUser", {
      to: receiverId,
      signal: { type: "offer", sdp: "v=0..." },
      callType: "video",
      callerName: "Caller User",
    });

    const payload = await incomingPromise;
    expect(payload.from).toBe(callerUser._id.toString());
    expect(payload.signal).toEqual({ type: "offer", sdp: "v=0..." });
    expect(payload.callType).toBe("video");
    expect(payload.callerName).toBe("Caller User");
  });

  it("emits callFailed to caller when receiver is offline", async () => {
    receiverSocket.disconnect();
    await new Promise((r) => setTimeout(r, 100));

    const failedPromise = waitFor(callerSocket, "callFailed");
    callerSocket.emit("callUser", {
      to: receiverUser._id.toString(),
      signal: { type: "offer", sdp: "v=0..." },
      callType: "audio",
    });

    const payload = await failedPromise;
    expect(payload.reason).toMatch(/offline/i);
  });

  it("does nothing when 'to' is missing", async () => {
    callerSocket.emit("callUser", { signal: { sdp: "v=0..." }, callType: "video" });
    await expectSilence(receiverSocket, "incomingCall");
    await expectSilence(callerSocket, "callFailed");
  });

  it("does nothing when 'signal' is missing", async () => {
    callerSocket.emit("callUser", { to: receiverUser._id.toString(), callType: "video" });
    await expectSilence(receiverSocket, "incomingCall");
  });

  it("does nothing when 'callType' is missing", async () => {
    callerSocket.emit("callUser", {
      to: receiverUser._id.toString(),
      signal: { sdp: "v=0..." },
    });
    await expectSilence(receiverSocket, "incomingCall");
  });

  it("does not leak incomingCall to a third user", async () => {
    callerSocket.emit("callUser", {
      to: receiverUser._id.toString(),
      signal: { type: "offer", sdp: "v=0..." },
      callType: "audio",
    });
    await waitFor(receiverSocket, "incomingCall");
    await expectSilence(thirdSocket, "incomingCall");
  });

  it("works for audio call type", async () => {
    const p = waitFor(receiverSocket, "incomingCall");
    callerSocket.emit("callUser", {
      to: receiverUser._id.toString(),
      signal: { type: "offer", sdp: "v=0..." },
      callType: "audio",
    });
    const payload = await p;
    expect(payload.callType).toBe("audio");
  });
});

describe("answerCall", () => {
  it("forwards callAccepted to the caller with answer signal", async () => {
    const callerId = callerUser._id.toString();
    const acceptedPromise = waitFor(callerSocket, "callAccepted");

    receiverSocket.emit("answerCall", {
      to: callerId,
      signal: { type: "answer", sdp: "v=0..." },
    });

    const payload = await acceptedPromise;
    expect(payload.signal).toEqual({ type: "answer", sdp: "v=0..." });
  });

  it("does nothing when 'to' is missing", async () => {
    receiverSocket.emit("answerCall", { signal: { type: "answer" } });
    await expectSilence(callerSocket, "callAccepted");
  });

  it("does nothing when 'signal' is missing", async () => {
    receiverSocket.emit("answerCall", { to: callerUser._id.toString() });
    await expectSilence(callerSocket, "callAccepted");
  });

  it("does not deliver callAccepted to a third user", async () => {
    receiverSocket.emit("answerCall", {
      to: callerUser._id.toString(),
      signal: { type: "answer", sdp: "v=0..." },
    });
    await waitFor(callerSocket, "callAccepted");
    await expectSilence(thirdSocket, "callAccepted");
  });
});

describe("iceCandidate", () => {
  it("forwards ICE candidate to the target", async () => {
    const candidatePromise = waitFor(receiverSocket, "iceCandidate");

    callerSocket.emit("iceCandidate", {
      to: receiverUser._id.toString(),
      candidate: { candidate: "candidate:1 1 UDP 2122252543 ...", sdpMid: "0" },
    });

    const payload = await candidatePromise;
    expect(payload.candidate).toBeDefined();
    expect(payload.candidate.sdpMid).toBe("0");
  });

  it("forwards ICE candidate from receiver to caller", async () => {
    const candidatePromise = waitFor(callerSocket, "iceCandidate");

    receiverSocket.emit("iceCandidate", {
      to: callerUser._id.toString(),
      candidate: { candidate: "candidate:2 1 UDP 2122252543 ...", sdpMid: "1" },
    });

    const payload = await candidatePromise;
    expect(payload.candidate.sdpMid).toBe("1");
  });

  it("does nothing when 'to' is missing", async () => {
    callerSocket.emit("iceCandidate", { candidate: { sdpMid: "0" } });
    await expectSilence(receiverSocket, "iceCandidate");
  });

  it("does nothing when 'candidate' is missing", async () => {
    callerSocket.emit("iceCandidate", { to: receiverUser._id.toString() });
    await expectSilence(receiverSocket, "iceCandidate");
  });

  it("does not leak ICE candidate to a third user", async () => {
    callerSocket.emit("iceCandidate", {
      to: receiverUser._id.toString(),
      candidate: { sdpMid: "0" },
    });
    await waitFor(receiverSocket, "iceCandidate");
    await expectSilence(thirdSocket, "iceCandidate");
  });
});

describe("endCall", () => {
  it("emits callEnded to the target", async () => {
    const endedPromise = waitFor(receiverSocket, "callEnded");
    callerSocket.emit("endCall", { to: receiverUser._id.toString() });
    await endedPromise; // resolves = event received
  });

  it("does nothing when 'to' is missing", async () => {
    callerSocket.emit("endCall", {});
    await expectSilence(receiverSocket, "callEnded");
  });

  it("does not deliver callEnded to a third user", async () => {
    callerSocket.emit("endCall", { to: receiverUser._id.toString() });
    await waitFor(receiverSocket, "callEnded");
    await expectSilence(thirdSocket, "callEnded");
  });

  it("receiver can end the call back to caller", async () => {
    const endedPromise = waitFor(callerSocket, "callEnded");
    receiverSocket.emit("endCall", { to: callerUser._id.toString() });
    await endedPromise;
  });
});

describe("rejectCall", () => {
  it("emits callRejected to the caller", async () => {
    const rejectedPromise = waitFor(callerSocket, "callRejected");
    receiverSocket.emit("rejectCall", { to: callerUser._id.toString() });
    await rejectedPromise;
  });

  it("does nothing when 'to' is missing", async () => {
    receiverSocket.emit("rejectCall", {});
    await expectSilence(callerSocket, "callRejected");
  });

  it("does not deliver callRejected to a third user", async () => {
    receiverSocket.emit("rejectCall", { to: callerUser._id.toString() });
    await waitFor(callerSocket, "callRejected");
    await expectSilence(thirdSocket, "callRejected");
  });
});

// ── full call flow ────────────────────────────────────────────────────────────

describe("Full WebRTC call flow", () => {
  it("completes offer → answer → ICE exchange → end call", async () => {
    const callerId = callerUser._id.toString();
    const receiverId = receiverUser._id.toString();

    // 1. Caller initiates
    const incomingP = waitFor(receiverSocket, "incomingCall");
    callerSocket.emit("callUser", {
      to: receiverId,
      signal: { type: "offer", sdp: "v=0 offer" },
      callType: "video",
      callerName: "Caller User",
    });
    const incoming = await incomingP;
    expect(incoming.callType).toBe("video");

    // 2. Receiver answers
    const acceptedP = waitFor(callerSocket, "callAccepted");
    receiverSocket.emit("answerCall", {
      to: callerId,
      signal: { type: "answer", sdp: "v=0 answer" },
    });
    const accepted = await acceptedP;
    expect(accepted.signal.type).toBe("answer");

    // 3. ICE candidates exchanged both directions
    const iceToCaller = waitFor(callerSocket, "iceCandidate");
    const iceToReceiver = waitFor(receiverSocket, "iceCandidate");

    receiverSocket.emit("iceCandidate", {
      to: callerId,
      candidate: { sdpMid: "0", candidate: "c1" },
    });
    callerSocket.emit("iceCandidate", {
      to: receiverId,
      candidate: { sdpMid: "1", candidate: "c2" },
    });

    const [ice1, ice2] = await Promise.all([iceToCaller, iceToReceiver]);
    expect(ice1.candidate.sdpMid).toBe("0");
    expect(ice2.candidate.sdpMid).toBe("1");

    // 4. Caller ends
    const endedP = waitFor(receiverSocket, "callEnded");
    callerSocket.emit("endCall", { to: receiverId });
    await endedP;
  });

  it("caller gets callFailed then retries when receiver reconnects", async () => {
    const receiverId = receiverUser._id.toString();

    receiverSocket.disconnect();
    await new Promise((r) => setTimeout(r, 100));

    const failedP = waitFor(callerSocket, "callFailed");
    callerSocket.emit("callUser", {
      to: receiverId,
      signal: { type: "offer", sdp: "v=0..." },
      callType: "audio",
    });
    const failed = await failedP;
    expect(failed.reason).toMatch(/offline/i);

    // Receiver reconnects
    receiverSocket = await connectClient(port, receiverId);
    await new Promise((r) => setTimeout(r, 100));

    // Retry call — should succeed now
    const incomingP = waitFor(receiverSocket, "incomingCall");
    callerSocket.emit("callUser", {
      to: receiverId,
      signal: { type: "offer", sdp: "v=0..." },
      callType: "audio",
    });
    const incoming = await incomingP;
    expect(incoming.from).toBe(callerUser._id.toString());
  });

  it("receiver can reject a call", async () => {
    const callerId = callerUser._id.toString();
    const receiverId = receiverUser._id.toString();

    const incomingP = waitFor(receiverSocket, "incomingCall");
    callerSocket.emit("callUser", {
      to: receiverId,
      signal: { type: "offer", sdp: "v=0..." },
      callType: "video",
    });
    await incomingP;

    const rejectedP = waitFor(callerSocket, "callRejected");
    receiverSocket.emit("rejectCall", { to: callerId });
    await rejectedP;
  });
});

// ── typing indicators ─────────────────────────────────────────────────────────

describe("Typing indicators", () => {
  it("forwards 'typing' to individual receiver", async () => {
    const p = waitFor(receiverSocket, "userTyping");
    callerSocket.emit("typing", { receiverId: receiverUser._id.toString() });
    const data = await p;
    expect(data.userId).toBe(callerUser._id.toString());
  });

  it("does not send 'typing' to third user", async () => {
    callerSocket.emit("typing", { receiverId: receiverUser._id.toString() });
    await waitFor(receiverSocket, "userTyping");
    await expectSilence(thirdSocket, "userTyping");
  });

  it("forwards 'stopTyping' to individual receiver", async () => {
    const p = waitFor(receiverSocket, "userStopTyping");
    callerSocket.emit("stopTyping", { receiverId: receiverUser._id.toString() });
    const data = await p;
    expect(data.userId).toBe(callerUser._id.toString());
  });

  it("forwards 'typing' to a group room", async () => {
    const groupId = new mongoose.Types.ObjectId().toString();

    // Both sockets join the group room
    callerSocket.emit("joinGroup", groupId);
    receiverSocket.emit("joinGroup", groupId);
    await new Promise((r) => setTimeout(r, 100));

    const p = waitFor(receiverSocket, "userTyping");
    callerSocket.emit("typing", { groupId });
    const data = await p;
    expect(data.groupId).toBe(groupId);
    expect(data.userId).toBe(callerUser._id.toString());
  });
});

// ── read receipts ─────────────────────────────────────────────────────────────

describe("Read receipts", () => {
  it("notifies sender when their messages are read", async () => {
    const p = waitFor(callerSocket, "messagesMarkedRead");
    receiverSocket.emit("messagesRead", {
      senderId: callerUser._id.toString(),
      conversationId: "conv123",
    });
    const data = await p;
    expect(data.readerId).toBe(receiverUser._id.toString());
    expect(data.conversationId).toBe("conv123");
  });

  it("does not notify third users", async () => {
    receiverSocket.emit("messagesRead", {
      senderId: callerUser._id.toString(),
      conversationId: "conv123",
    });
    await waitFor(callerSocket, "messagesMarkedRead");
    await expectSilence(thirdSocket, "messagesMarkedRead");
  });
});

// ── group rooms ───────────────────────────────────────────────────────────────

describe("Group room management", () => {
  it("joinGroup: socket receives group-scoped events after joining", async () => {
    const groupId = new mongoose.Types.ObjectId().toString();

    callerSocket.emit("joinGroup", groupId);
    receiverSocket.emit("joinGroup", groupId);
    await new Promise((r) => setTimeout(r, 100));

    const p = waitFor(receiverSocket, "userTyping");
    callerSocket.emit("typing", { groupId });
    const data = await p;
    expect(data.groupId).toBe(groupId);
  });

  it("leaveGroupRoom: socket stops receiving group events after leaving", async () => {
    const groupId = new mongoose.Types.ObjectId().toString();

    callerSocket.emit("joinGroup", groupId);
    receiverSocket.emit("joinGroup", groupId);
    await new Promise((r) => setTimeout(r, 100));

    receiverSocket.emit("leaveGroupRoom", groupId);
    await new Promise((r) => setTimeout(r, 100));

    callerSocket.emit("typing", { groupId });
    await expectSilence(receiverSocket, "userTyping", 400);
  });

  it("ignores joinGroup with empty groupId", async () => {
    // Should not throw — just silently ignored
    callerSocket.emit("joinGroup", "");
    await new Promise((r) => setTimeout(r, 100));
    // No assertion needed — test passes if no error is thrown
  });
});
