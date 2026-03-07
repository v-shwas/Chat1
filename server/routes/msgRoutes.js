import express from "express";

import { sendMessage, getMessages, markAsRead, reactToMessage, deleteMessage } from "../controllers/msgController.js";
import protectRoute from "../middlewares/protectRoute.js";

const router = express.Router();

router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);
router.post("/read/:id", protectRoute, markAsRead);
router.post("/react/:id", protectRoute, reactToMessage);
router.delete("/:id", protectRoute, deleteMessage);

export default router;
