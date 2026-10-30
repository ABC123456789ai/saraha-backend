import express from "express";

import {
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

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Email Verification
|--------------------------------------------------------------------------
*/

router.post(
  "/confirm-email",
  confirmEmail
);

router.post(
  "/resend-code",
  resendVerificationOtp
);

/*
|--------------------------------------------------------------------------
| Password Reset
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Two-Factor Authentication
|--------------------------------------------------------------------------
*/

// Send OTP to enable 2FA
router.post(
  "/enable-2fa",
  authMiddleware,
  enableTwoFactor
);

// Verify OTP and enable 2FA
router.post(
  "/verify-2fa",
  authMiddleware,
  verifyTwoFactorSetup
);

// Confirm OTP during login
router.post(
  "/confirm-2fa",
  confirmTwoFactorLogin
);

export default router;
