
import express from "express";
import {
  createMessage,
  getMessages,
  getMessageById,
  deleteMessage,
} from "../controllers/message.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router({
  caseSensitive: true,
  strict: false,
});

router.post("/", authMiddleware, createMessage);
router.get("/", authMiddleware, getMessages);
router.get("/:messageId", authMiddleware, getMessageById);
router.delete("/:messageId", authMiddleware, deleteMessage);

export default router;
