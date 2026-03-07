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
      return callback(null, true);
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// userId → socketId mapping
const userSocketMap = {};

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

io.on("connection", async (socket) => {
  console.log("User connected:", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;

    // Join all group rooms this user belongs to
    try {
      const groups = await Group.find({ members: userId });
      groups.forEach((group) => {
        socket.join(`group_${group._id}`);
      });
    } catch (err) {
      console.log("Error joining group rooms:", err.message);
    }
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
    const receiverSocketId = getReceiverSocketId(to);
    if (receiverSocketId) {
      // IMPORTANT: Use userId from handshake, NOT socket.id
      // This ensures answerCall/iceCandidate/endCall can route back via getReceiverSocketId
      io.to(receiverSocketId).emit("incomingCall", {
        from: userId,
        signal,
        callType,
        callerName,
      });
    }
  });

  socket.on("answerCall", ({ to, signal }) => {
    const callerSocketId = getReceiverSocketId(to);
    if (callerSocketId) {
      io.to(callerSocketId).emit("callAccepted", { signal });
    }
  });

  socket.on("iceCandidate", ({ to, candidate }) => {
    const targetSocketId = getReceiverSocketId(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit("iceCandidate", { candidate });
    }
  });

  socket.on("endCall", ({ to }) => {
    const targetSocketId = getReceiverSocketId(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit("callEnded");
    }
  });

  socket.on("rejectCall", ({ to }) => {
    const callerSocketId = getReceiverSocketId(to);
    if (callerSocketId) {
      io.to(callerSocketId).emit("callRejected");
    }
  });

  // ── Join Group Room (when a new group is created/joined) ──
  socket.on("joinGroup", (groupId) => {
    socket.join(`group_${groupId}`);
  });

  socket.on("leaveGroupRoom", (groupId) => {
    socket.leave(`group_${groupId}`);
  });

  // ── Disconnect ──
  socket.on("disconnect", async () => {
    console.log("User disconnected:", socket.id);
    if (userId) {
      // Update last seen
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
