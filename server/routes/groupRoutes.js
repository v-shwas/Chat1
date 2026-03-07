import express from "express";
import protectRoute from "../middlewares/protectRoute.js";
import {
  createGroup,
  getMyGroups,
  getGroup,
  sendGroupMessage,
  getGroupMessages,
  addMembers,
  removeMember,
  leaveGroup,
} from "../controllers/groupController.js";

const router = express.Router();

router.post("/create", protectRoute, createGroup);
router.get("/my-groups", protectRoute, getMyGroups);
router.get("/:id", protectRoute, getGroup);
router.post("/:id/message", protectRoute, sendGroupMessage);
router.get("/:id/messages", protectRoute, getGroupMessages);
router.post("/:id/add-members", protectRoute, addMembers);
router.post("/:id/remove-member", protectRoute, removeMember);
router.post("/:id/leave", protectRoute, leaveGroup);

export default router;
