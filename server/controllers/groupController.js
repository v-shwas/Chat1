import Group from "../models/groupModel.js";
import Message from "../models/msgModel.js";
import { io, getReceiverSocketId } from "../socket/socket.js";

// Create a new group
export const createGroup = async (req, res) => {
  try {
    const { name, description, members } = req.body;
    const creatorId = req.user._id;

    if (!name || !members || members.length < 1) {
      return res.status(400).json({ error: "Group name and at least 1 member required" });
    }

    // Include creator in members and admins
    const allMembers = [...new Set([creatorId.toString(), ...members])];

    const group = await Group.create({
      name,
      description: description || "",
      creator: creatorId,
      admins: [creatorId],
      members: allMembers,
    });

    const populated = await Group.findById(group._id)
      .populate("members", "fullname username profilePic")
      .populate("admins", "fullname username profilePic");

    // Notify all members via socket
    allMembers.forEach((memberId) => {
      const socketId = getReceiverSocketId(memberId);
      if (socketId) {
        io.to(socketId).emit("newGroup", populated);
      }
    });

    res.status(201).json(populated);
  } catch (error) {
    console.log("Error in createGroup:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all groups the user is a member of
export const getMyGroups = async (req, res) => {
  try {
    const userId = req.user._id;
    const groups = await Group.find({ members: userId })
      .populate("members", "fullname username profilePic")
      .populate("admins", "fullname username profilePic")
      .sort({ updatedAt: -1 });

    res.status(200).json(groups);
  } catch (error) {
    console.log("Error in getMyGroups:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get a single group
export const getGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("members", "fullname username profilePic")
      .populate("admins", "fullname username profilePic");

    if (!group) return res.status(404).json({ error: "Group not found" });
    res.status(200).json(group);
  } catch (error) {
    console.log("Error in getGroup:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Send a message in a group
export const sendGroupMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { id: groupId } = req.params;
    const senderId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });

    if (!group.members.includes(senderId)) {
      return res.status(403).json({ error: "Not a member of this group" });
    }

    const newMsg = new Message({
      senderId,
      groupId,
      message,
      messageType: "text",
    });

    group.messages.push(newMsg._id);
    await Promise.all([group.save(), newMsg.save()]);

    const populatedMsg = await Message.findById(newMsg._id)
      .populate("senderId", "fullname username profilePic");

    // Emit to the group room
    io.to(`group_${groupId}`).emit("newGroupMessage", {
      groupId,
      message: populatedMsg,
    });

    res.status(201).json(populatedMsg);
  } catch (error) {
    console.log("Error in sendGroupMessage:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get messages for a group
export const getGroupMessages = async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const group = await Group.findById(groupId).populate({
      path: "messages",
      populate: { path: "senderId", select: "fullname username profilePic" },
    });

    if (!group) return res.status(404).json({ error: "Group not found" });
    res.status(200).json(group.messages);
  } catch (error) {
    console.log("Error in getGroupMessages:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Add members to group
export const addMembers = async (req, res) => {
  try {
    const { members } = req.body;
    const { id: groupId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });

    if (!group.admins.includes(userId)) {
      return res.status(403).json({ error: "Only admins can add members" });
    }

    const newMembers = members.filter((m) => !group.members.includes(m));
    group.members.push(...newMembers);
    await group.save();

    const populated = await Group.findById(groupId)
      .populate("members", "fullname username profilePic")
      .populate("admins", "fullname username profilePic");

    // Notify new members
    newMembers.forEach((memberId) => {
      const socketId = getReceiverSocketId(memberId);
      if (socketId) {
        io.to(socketId).emit("addedToGroup", populated);
      }
    });

    // Notify group room
    io.to(`group_${groupId}`).emit("groupUpdated", populated);

    res.status(200).json(populated);
  } catch (error) {
    console.log("Error in addMembers:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Remove member from group
export const removeMember = async (req, res) => {
  try {
    const { memberId } = req.body;
    const { id: groupId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });

    if (!group.admins.includes(userId)) {
      return res.status(403).json({ error: "Only admins can remove members" });
    }

    group.members = group.members.filter((m) => m.toString() !== memberId);
    group.admins = group.admins.filter((a) => a.toString() !== memberId);
    await group.save();

    const populated = await Group.findById(groupId)
      .populate("members", "fullname username profilePic")
      .populate("admins", "fullname username profilePic");

    io.to(`group_${groupId}`).emit("groupUpdated", populated);

    // Notify removed member
    const socketId = getReceiverSocketId(memberId);
    if (socketId) {
      io.to(socketId).emit("removedFromGroup", groupId);
    }

    res.status(200).json(populated);
  } catch (error) {
    console.log("Error in removeMember:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Leave group
export const leaveGroup = async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });

    group.members = group.members.filter((m) => m.toString() !== userId.toString());
    group.admins = group.admins.filter((a) => a.toString() !== userId.toString());
    await group.save();

    io.to(`group_${groupId}`).emit("groupUpdated", group);

    res.status(200).json({ message: "Left group successfully" });
  } catch (error) {
    console.log("Error in leaveGroup:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
