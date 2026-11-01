import express from "express";
import {
  register,
  login,
  logout,
  confirmEmail,
  resendVerificationOtp,
  forgotPassword,
  verifyForgotPasswordOtp,
  resetPassword,
  enableTwoFactor,
  verifyTwoFactorSetup,
  confirmTwoFactorLogin,
} from "../controllers/auth.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validation.middleware.js";
import { loginSchema } from "../validators/auth.validator.js";

const router = express.Router();

router.post("/register", register);
router.post(
  "/login",
  validate(loginSchema),
  login
);
router.post(
  "/logout",
  authMiddleware,
  logout
);
router.post(
  "/confirm-email",
  confirmEmail
);
router.post(
  "/resend-code",
  resendVerificationOtp
);
router.post(
  "/forgot-password",
  forgotPassword
);
router.post(
  "/verify-forgot-password",
  verifyForgotPasswordOtp
);
router.post(
  "/reset-password",
  resetPassword
);
router.post(
  "/enable-2fa",
  authMiddleware,
  enableTwoFactor
);
router.post(
  "/verify-2fa",
  authMiddleware,
  verifyTwoFactorSetup
);
router.post(
  "/confirm-2fa",
  confirmTwoFactorLogin
);
export default router;
