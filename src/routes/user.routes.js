import express from "express";

import { createUser } from "../controllers/user.controller.js";
import validate from "../middlewares/validation.middleware.js";
import { registerSchema } from "../validators/auth.validator.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  upload,
  validateImageContent,
} from "../middlewares/multer.middleware.js";
const router = express.Router();

router.post("/", validate(registerSchema), createUser);
router.post(
  "/upload-image",
  authMiddleware,
  upload.single("image"),
  validateImageContent,
  (req, res) => {
    return res.status(200).json({
      message: "Image uploaded successfully",
      file: req.file,
    });
  }
);
router.get("/profile", authMiddleware, (req, res) => {
  return res.status(200).json({
    message: "You are authenticated",
    user: req.user,
  });
});

export default router;