import Conversation from "../models/convModel.js";
import Message from "../models/msgModel.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

const sendMessage = async (req, res) => {
  try {
    const { message, messageType, replyTo } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

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
      message: message || "",
      messageType: messageType || "text",
      replyTo: replyTo || undefined,
    });

    if (newMsg) {
      conversation.messages.push(newMsg._id);
    }

    await Promise.all([conversation.save(), newMsg.save()]);

    // Populate replyTo if present
    let populatedMsg = newMsg;
    if (replyTo) {
      populatedMsg = await Message.findById(newMsg._id).populate("replyTo");
    }

    // Real-time delivery
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", populatedMsg);
    }

    res.status(201).json(populatedMsg);
  } catch (error) {
    console.log("Error in sendMessage:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const senderId = req.user._id;

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
    console.log("Error in getMessages controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Mark messages as read
const markAsRead = async (req, res) => {
  try {
    const { id: senderId } = req.params;
    const readerId = req.user._id;

    await Message.updateMany(
      {
        senderId: senderId,
        receiverId: readerId,
        status: { $ne: "read" },
      },
      {
        $set: { status: "read", readAt: new Date() },
      }
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.log("Error in markAsRead:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// React to a message
const reactToMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ error: "Message not found" });

    // Remove existing reaction from this user
    message.reactions = message.reactions.filter(
      (r) => r.userId.toString() !== userId.toString()
    );

    // Add new reaction (if emoji is not empty — empty means remove)
    if (emoji) {
      message.reactions.push({ userId, emoji });
    }

    await message.save();

    // Notify via socket
    const targetId = message.senderId.toString() === userId.toString()
      ? message.receiverId
      : message.senderId;

    const targetSocketId = getReceiverSocketId(targetId);
    if (targetSocketId) {
      io.to(targetSocketId).emit("messageReaction", {
        messageId,
        reactions: message.reactions,
      });
    }

    // For group messages
    if (message.groupId) {
      io.to(`group_${message.groupId}`).emit("messageReaction", {
        messageId,
        reactions: message.reactions,
      });
    }

    res.status(200).json(message);
  } catch (error) {
    console.log("Error in reactToMessage:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete a message (soft delete)
const deleteMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ error: "Message not found" });

    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Can only delete your own messages" });
    }

    message.isDeleted = true;
    message.message = "";
    message.image = "";
    await message.save();

    // Notify via socket
    if (message.receiverId) {
      const targetSocketId = getReceiverSocketId(message.receiverId);
      if (targetSocketId) {
        io.to(targetSocketId).emit("messageDeleted", { messageId });
      }
    }
    if (message.groupId) {
      io.to(`group_${message.groupId}`).emit("messageDeleted", { messageId });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.log("Error in deleteMessage:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export { sendMessage, getMessages, markAsRead, reactToMessage, deleteMessage };
