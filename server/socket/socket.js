import { Server } from "socket.io";
import http from "http";
import express from "express";
import Group from "../models/groupModel.js";
import User from "../models/userModel.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      // Match the CORS config in index.js
      // In production, set ALLOWED_ORIGINS env var
      if (!origin) return callback(null, true);
      const allowedOrigins = process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(",")
        : null;
      if (allowedOrigins) {
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
      }
      return callback(null, true);
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
  // Connection limits
  pingTimeout: 60000,
  pingInterval: 25000,
});

// userId → socketId mapping
const userSocketMap = {};
const MAX_ICE_BUFFER = 50; // Prevent unbounded ICE candidate buffering

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

io.on("connection", async (socket) => {
  console.log("User connected:", socket.id);

  const userId = socket.handshake.query.userId;
  if (!userId || userId === "undefined") {
    socket.disconnect(true);
    return;
  }

  userSocketMap[userId] = socket.id;

  // Join all group rooms this user belongs to
  try {
    const groups = await Group.find({ members: userId }).select("_id");
    groups.forEach((group) => {
      socket.join(`group_${group._id}`);
    });
  } catch (err) {
    console.error("Error joining group rooms:", err.message);
  }

  // Broadcast online users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // ── Typing Indicators ──
  socket.on("typing", ({ receiverId, groupId }) => {
    if (groupId) {
      socket.to(`group_${groupId}`).emit("userTyping", { userId, groupId });
    } else if (receiverId) {
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("userTyping", { userId });
      }
    }
  });

  socket.on("stopTyping", ({ receiverId, groupId }) => {
    if (groupId) {
      socket.to(`group_${groupId}`).emit("userStopTyping", { userId, groupId });
    } else if (receiverId) {
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("userStopTyping", { userId });
      }
    }
  });

  // ── Read Receipts ──
  socket.on("messagesRead", ({ senderId, conversationId }) => {
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesMarkedRead", { readerId: userId, conversationId });
    }
  });

  // ── WebRTC Signaling ──
  socket.on("callUser", ({ to, signal, callType, callerName }) => {
    if (!to || !signal || !callType) return;
    const receiverSocketId = getReceiverSocketId(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("incomingCall", {
        from: userId,
        signal,
        callType,
        callerName,
      });
    } else {
      // Notify caller that receiver is offline
      socket.emit("callFailed", { reason: "User is offline" });
    }
  });

  socket.on("answerCall", ({ to, signal }) => {
    if (!to || !signal) return;
    const callerSocketId = getReceiverSocketId(to);
    if (callerSocketId) {
      io.to(callerSocketId).emit("callAccepted", { signal });
    }
  });

  socket.on("iceCandidate", ({ to, candidate }) => {
    if (!to || !candidate) return;
    const targetSocketId = getReceiverSocketId(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit("iceCandidate", { candidate });
    }
  });

  socket.on("endCall", ({ to }) => {
    if (!to) return;
    const targetSocketId = getReceiverSocketId(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit("callEnded");
    }
  });

  socket.on("rejectCall", ({ to }) => {
    if (!to) return;
    const callerSocketId = getReceiverSocketId(to);
    if (callerSocketId) {
      io.to(callerSocketId).emit("callRejected");
    }
  });

  // ── Join Group Room (when a new group is created/joined) ──
  socket.on("joinGroup", (groupId) => {
    if (groupId) socket.join(`group_${groupId}`);
  });

  socket.on("leaveGroupRoom", (groupId) => {
    if (groupId) socket.leave(`group_${groupId}`);
  });

  // ── Disconnect ──
  socket.on("disconnect", async () => {
    console.log("User disconnected:", socket.id);
    if (userId) {
      try {
        await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
      } catch (err) {
        // ignore
      }
      delete userSocketMap[userId];
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, io, server };
