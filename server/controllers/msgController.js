import mongoose from "mongoose";
import Conversation from "../models/convModel.js";
import Group from "../models/groupModel.js";
import Message from "../models/msgModel.js";
import User from "../models/userModel.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
const sameId = (a, b) => a?.toString() === b?.toString();
const includesId = (ids, id) => ids.some((item) => sameId(item, id));
const allowedMessageTypes = new Set(["text", "image", "file", "audio"]);

const validateUserId = async (id, res, label = "User") => {
  if (!isValidId(id)) {
    res.status(400).json({ error: `Invalid ${label.toLowerCase()} id` });
    return null;
  }

  const user = await User.findById(id).select("_id");
  if (!user) {
    res.status(404).json({ error: `${label} not found` });
    return null;
  }

  return user;
};

const canAccessMessage = async (message, userId) => {
  if (message.groupId) {
    const group = await Group.findById(message.groupId).select("members");
    return Boolean(group && includesId(group.members, userId));
  }

  return sameId(message.senderId, userId) || sameId(message.receiverId, userId);
};

const sendMessage = async (req, res) => {
  try {
    const { message, messageType, replyTo, image, fileName, fileSize, fileMimeType } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;
    const text = typeof message === "string" ? message.trim() : "";

    if (!text && !image) {
      return res.status(400).json({ error: "Message content or file required" });
    }

    const receiver = await validateUserId(receiverId, res, "Receiver");
    if (!receiver) return;

    if (sameId(senderId, receiverId)) {
      return res.status(400).json({ error: "Cannot send a direct message to yourself" });
    }

    const type = messageType || (image ? "file" : "text");
    if (!allowedMessageTypes.has(type)) {
      return res.status(400).json({ error: "Invalid message type" });
    }

    if (replyTo) {
      if (!isValidId(replyTo)) {
        return res.status(400).json({ error: "Invalid reply message id" });
      }
      const replyMessage = await Message.findById(replyTo);
      if (!replyMessage || !(await canAccessMessage(replyMessage, senderId))) {
        return res.status(400).json({ error: "Invalid reply target" });
      }
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    const newMsg = new Message({
      senderId,
      receiverId,
      message: text,
      messageType: type,
      image: image || "",
      fileName: fileName || "",
      fileSize: Number(fileSize) || 0,
      fileMimeType: fileMimeType || "",
      replyTo: replyTo || undefined,
    });

    conversation.messages.push(newMsg._id);
    await Promise.all([conversation.save(), newMsg.save()]);

    const populatedMsg = await Message.findById(newMsg._id).populate("replyTo");

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", populatedMsg);
    }

    res.status(201).json(populatedMsg);
  } catch (error) {
    console.error("Error in sendMessage:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const senderId = req.user._id;

    const userToChat = await validateUserId(userToChatId, res, "User");
    if (!userToChat) return;

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, userToChatId] },
    }).populate({
      path: "messages",
      populate: [
        { path: "replyTo" },
        { path: "reactions.userId", select: "fullname" },
      ],
    });

    if (!conversation) {
      return res.status(200).json([]);
    }

    res.status(200).json(conversation.messages);
  } catch (error) {
    console.error("Error in getMessages controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id: senderId } = req.params;
    const readerId = req.user._id;

    const sender = await validateUserId(senderId, res, "Sender");
    if (!sender) return;

    await Message.updateMany(
      {
        senderId,
        receiverId: readerId,
        status: { $ne: "read" },
      },
      {
        $set: { status: "read", readAt: new Date() },
      }
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error in markAsRead:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const reactToMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    if (!isValidId(messageId)) {
      return res.status(400).json({ error: "Invalid message id" });
    }

    if (!emoji && emoji !== "") {
      return res.status(400).json({ error: "Emoji is required" });
    }

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ error: "Message not found" });

    if (!(await canAccessMessage(message, userId))) {
      return res.status(403).json({ error: "Not allowed to react to this message" });
    }

    message.reactions = message.reactions.filter(
      (reaction) => !sameId(reaction.userId, userId)
    );

    if (emoji) {
      message.reactions.push({ userId, emoji });
    }

    await message.save();

    const targetId = sameId(message.senderId, userId)
      ? message.receiverId
      : message.senderId;

    if (targetId) {
      const targetSocketId = getReceiverSocketId(targetId);
      if (targetSocketId) {
        io.to(targetSocketId).emit("messageReaction", {
          messageId,
          reactions: message.reactions,
        });
      }
    }

    if (message.groupId) {
      io.to(`group_${message.groupId}`).emit("messageReaction", {
        messageId,
        reactions: message.reactions,
      });
    }

    res.status(200).json(message);
  } catch (error) {
    console.error("Error in reactToMessage:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const userId = req.user._id;

    if (!isValidId(messageId)) {
      return res.status(400).json({ error: "Invalid message id" });
    }

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ error: "Message not found" });

    if (!sameId(message.senderId, userId)) {
      return res.status(403).json({ error: "Can only delete your own messages" });
    }

    message.isDeleted = true;
    message.message = "";
    message.image = "";
    message.fileName = "";
    await message.save();

    if (message.receiverId) {
      const targetSocketId = getReceiverSocketId(message.receiverId);
      if (targetSocketId) io.to(targetSocketId).emit("messageDeleted", { messageId });
    }

    if (message.groupId) {
      io.to(`group_${message.groupId}`).emit("messageDeleted", { messageId });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error in deleteMessage:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export { sendMessage, getMessages, markAsRead, reactToMessage, deleteMessage };
