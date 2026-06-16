import mongoose from "mongoose";
import Group from "../models/groupModel.js";
import Message from "../models/msgModel.js";
import User from "../models/userModel.js";
import { io, getReceiverSocketId } from "../socket/socket.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
const sameId = (a, b) => a?.toString() === b?.toString();
const includesId = (ids, id) => ids.some((item) => sameId(item, id));

const populateGroup = (id) =>
  Group.findById(id)
    .populate("members", "fullname username profilePic")
    .populate("admins", "fullname username profilePic");

const findGroup = async (id, res) => {
  if (!isValidId(id)) {
    res.status(400).json({ error: "Invalid group id" });
    return null;
  }

  const group = await Group.findById(id);
  if (!group) {
    res.status(404).json({ error: "Group not found" });
    return null;
  }

  return group;
};

const requireMember = (group, userId, res) => {
  if (!includesId(group.members, userId)) {
    res.status(403).json({ error: "Not a member of this group" });
    return false;
  }
  return true;
};

const requireAdmin = (group, userId, res, errorMessage = "Only admins can manage this group") => {
  if (!includesId(group.admins, userId)) {
    res.status(403).json({ error: errorMessage });
    return false;
  }
  return true;
};

const validateUserIds = async (ids, res) => {
  const uniqueIds = [...new Set(ids.map((id) => id?.toString()))];
  if (uniqueIds.some((id) => !isValidId(id))) {
    res.status(400).json({ error: "Invalid member id" });
    return null;
  }

  const count = await User.countDocuments({ _id: { $in: uniqueIds } });
  if (count !== uniqueIds.length) {
    res.status(400).json({ error: "One or more members do not exist" });
    return null;
  }

  return uniqueIds;
};

export const createGroup = async (req, res) => {
  try {
    const { name, description, members } = req.body;
    const creatorId = req.user._id;
    const trimmedName = typeof name === "string" ? name.trim() : "";

    if (!trimmedName || !Array.isArray(members) || members.length < 1) {
      return res.status(400).json({ error: "Group name and at least 1 member required" });
    }

    if (trimmedName.length > 80) {
      return res.status(400).json({ error: "Group name must be 80 characters or fewer" });
    }

    const memberIds = await validateUserIds(members, res);
    if (!memberIds) return;

    const allMembers = [...new Set([creatorId.toString(), ...memberIds])];

    const group = await Group.create({
      name: trimmedName,
      description: typeof description === "string" ? description.trim().slice(0, 240) : "",
      creator: creatorId,
      admins: [creatorId],
      members: allMembers,
    });

    const populated = await populateGroup(group._id);

    allMembers.forEach((memberId) => {
      const socketId = getReceiverSocketId(memberId);
      if (socketId) io.to(socketId).emit("newGroup", populated);
    });

    res.status(201).json(populated);
  } catch (error) {
    console.log("Error in createGroup:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

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

export const getGroup = async (req, res) => {
  try {
    const group = await findGroup(req.params.id, res);
    if (!group || !requireMember(group, req.user._id, res)) return;

    const populated = await populateGroup(group._id);
    res.status(200).json(populated);
  } catch (error) {
    console.log("Error in getGroup:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendGroupMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { id: groupId } = req.params;
    const senderId = req.user._id;
    const text = typeof message === "string" ? message.trim() : "";

    if (!text) return res.status(400).json({ error: "Message is required" });

    const group = await findGroup(groupId, res);
    if (!group || !requireMember(group, senderId, res)) return;

    const newMsg = new Message({
      senderId,
      groupId,
      message: text,
      messageType: "text",
    });

    group.messages.push(newMsg._id);
    await Promise.all([group.save(), newMsg.save()]);

    const populatedMsg = await Message.findById(newMsg._id)
      .populate("senderId", "fullname username profilePic");

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

export const getGroupMessages = async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const group = await findGroup(groupId, res);
    if (!group || !requireMember(group, req.user._id, res)) return;

    const populated = await Group.findById(groupId).populate({
      path: "messages",
      populate: { path: "senderId", select: "fullname username profilePic" },
    });

    res.status(200).json(populated.messages);
  } catch (error) {
    console.log("Error in getGroupMessages:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const addMembers = async (req, res) => {
  try {
    const { members } = req.body;
    const { id: groupId } = req.params;
    const userId = req.user._id;

    if (!Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ error: "At least one member is required" });
    }

    const group = await findGroup(groupId, res);
    if (!group || !requireAdmin(group, userId, res, "Only admins can add members")) return;

    const memberIds = await validateUserIds(members, res);
    if (!memberIds) return;

    const newMembers = memberIds.filter((memberId) => !includesId(group.members, memberId));
    if (newMembers.length > 0) {
      group.members.push(...newMembers);
      await group.save();
    }

    const populated = await populateGroup(groupId);

    newMembers.forEach((memberId) => {
      const socketId = getReceiverSocketId(memberId);
      if (socketId) io.to(socketId).emit("addedToGroup", populated);
    });

    io.to(`group_${groupId}`).emit("groupUpdated", populated);
    res.status(200).json(populated);
  } catch (error) {
    console.log("Error in addMembers:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { memberId } = req.body;
    const { id: groupId } = req.params;
    const userId = req.user._id;

    if (!isValidId(memberId)) {
      return res.status(400).json({ error: "Invalid member id" });
    }

    const group = await findGroup(groupId, res);
    if (!group || !requireAdmin(group, userId, res, "Only admins can remove members")) return;

    if (!includesId(group.members, memberId)) {
      return res.status(400).json({ error: "User is not a member of this group" });
    }

    if (sameId(group.creator, memberId)) {
      return res.status(400).json({ error: "Group creator cannot be removed" });
    }

    const remainingAdmins = group.admins.filter((adminId) => !sameId(adminId, memberId));
    if (remainingAdmins.length === 0) {
      return res.status(400).json({ error: "Group must have at least one admin" });
    }

    group.members = group.members.filter((member) => !sameId(member, memberId));
    group.admins = remainingAdmins;
    await group.save();

    const populated = await populateGroup(groupId);
    io.to(`group_${groupId}`).emit("groupUpdated", populated);

    const socketId = getReceiverSocketId(memberId);
    if (socketId) io.to(socketId).emit("removedFromGroup", groupId);

    res.status(200).json(populated);
  } catch (error) {
    console.log("Error in removeMember:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const leaveGroup = async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const userId = req.user._id;

    const group = await findGroup(groupId, res);
    if (!group || !requireMember(group, userId, res)) return;

    group.members = group.members.filter((member) => !sameId(member, userId));
    group.admins = group.admins.filter((admin) => !sameId(admin, userId));

    if (group.members.length === 0) {
      await Group.findByIdAndDelete(groupId);
      return res.status(200).json({ message: "Left group successfully" });
    }

    if (group.admins.length === 0) {
      group.admins = [group.members[0]];
    }

    await group.save();
    const populated = await populateGroup(groupId);
    io.to(`group_${groupId}`).emit("groupUpdated", populated);

    res.status(200).json({ message: "Left group successfully" });
  } catch (error) {
    console.log("Error in leaveGroup:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
