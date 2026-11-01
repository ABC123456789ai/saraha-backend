
import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../models/user.model.js";
import { getUserByEmail } from "./user.service.js";
import * as redisService from "./redis.service.js";
import { sendEmail } from "./email.service.js";

const generateOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

// Email Verification OTP
const sendVerificationOtp = async (user) => {
  const otp = generateOtp();

  user.emailVerificationOtp = otp;
  user.emailVerificationOtpExpiresAt = new Date(
    Date.now() + 10 * 60 * 1000
  );

  await user.save();

  await sendEmail(
    user.email,
    "Verify your Saraha account",
    `
      <h2>Welcome to Saraha 🌸</h2>
      <p>Your verification code is:</p>
      <h1>${otp}</h1>
      <p>This code will expire in 10 minutes.</p>
    `
  );
};

// Register
const registerUser = async (name, email, password) => {
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await getUserByEmail(normalizedEmail);

  if (existingUser) {
    throw new Error("Email already registered");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email: normalizedEmail,
    password: hashedPassword,
  });

  await sendVerificationOtp(user);

  return user;
};

// Confirm Email
const confirmEmail = async (email, otp) => {
  const user = await getUserByEmail(email);

  if (!user) {
    throw new Error("User not found");
  }

  if (user.emailVerified) {
    throw new Error("Email already verified");
  }

  if (!user.emailVerificationOtp) {
    throw new Error("Verification code not found");
  }

  if (user.emailVerificationOtpExpiresAt < new Date()) {
    throw new Error("Verification code expired");
  }

  if (user.emailVerificationOtp !== otp) {
    throw new Error("Invalid verification code");
  }

  user.emailVerified = true;
  user.emailVerificationOtp = undefined;
  user.emailVerificationOtpExpiresAt = undefined;

  await user.save();

  return user;
};

// Resend Verification OTP
const resendVerificationOtp = async (email) => {
  const user = await getUserByEmail(email);

  if (!user) {
    throw new Error("User not found");
  }

  if (user.emailVerified) {
    throw new Error("Email already verified");
  }

  const cooldownKey = `resend-otp:${email}`;

  const isBlocked = await redisService.get(cooldownKey);

  if (isBlocked) {
    throw new Error(
      "Please wait before requesting another verification code"
    );
  }

  const otp = generateOtp();

  user.emailVerificationOtp = otp;
  user.emailVerificationOtpExpiresAt = new Date(
    Date.now() + 10 * 60 * 1000
  );

  await user.save();

  await sendEmail(
    user.email,
    "New Saraha Verification Code",
    `
      <h2>Saraha Verification Code 🌸</h2>
      <p>Your new verification code is:</p>
      <h1>${otp}</h1>
      <p>This code will expire in 10 minutes.</p>
    `
  );

  await redisService.set(cooldownKey, "true", {
    EX: 60,
  });
};

// Enable Two Factor
const enableTwoFactor = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  if (user.twoFactorEnabled) {
    throw new Error("Two-factor authentication is already enabled");
  }

  const otp = generateOtp();

  user.twoFactorSetupOtp = otp;
  user.twoFactorSetupOtpExpiresAt = new Date(
    Date.now() + 10 * 60 * 1000
  );

  await user.save();

  await sendEmail(
    user.email,
    "Enable Two-Factor Authentication",
    `
      <h2>Saraha 2FA 🔐</h2>
      <p>Your verification code is:</p>
      <h1>${otp}</h1>
      <p>This code will expire in 10 minutes.</p>
    `
  );
};

// Verify Two Factor Setup
const verifyTwoFactorSetup = async (userId, otp) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  if (user.twoFactorEnabled) {
    throw new Error("Two-factor authentication is already enabled");
  }

  if (!user.twoFactorSetupOtp) {
    throw new Error("Two-factor setup code not found");
  }

  if (user.twoFactorSetupOtpExpiresAt < new Date()) {
    throw new Error("Two-factor setup code expired");
  }

  if (user.twoFactorSetupOtp !== otp) {
    throw new Error("Invalid two-factor setup code");
  }

  user.twoFactorEnabled = true;
  user.twoFactorSetupOtp = undefined;
  user.twoFactorSetupOtpExpiresAt = undefined;

  await user.save();
};

// Confirm Two Factor Login
const confirmTwoFactorLogin = async (userId, otp) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.twoFactorEnabled) {
    throw new Error("Two-factor authentication is not enabled");
  }

  if (!user.twoFactorOtp) {
    throw new Error("Two-factor login code not found");
  }

  if (user.twoFactorOtpExpiresAt < new Date()) {
    throw new Error("Two-factor login code expired");
  }

  if (user.twoFactorOtp !== otp) {
    throw new Error("Invalid two-factor login code");
  }

  user.twoFactorOtp = undefined;
  user.twoFactorOtpExpiresAt = undefined;

  await user.save();

  const token = jwt.sign(
    {
      userId: user._id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h",
    }
  );

  return {
    user,
    token,
  };
};

// Login
const loginUser = async (email, password) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await getUserByEmail(normalizedEmail);

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const attemptsKey = `login-attempts:${normalizedEmail}`;
  const banKey = `login-ban:${normalizedEmail}`;

  const isBanned = await redisService.get(banKey);

  if (isBanned) {
    throw new Error(
      "Account temporarily banned. Please try again after 5 minutes"
    );
  }

  const isPasswordCorrect = await bcrypt.compare(
    password,
    user.password
  );

  if (!isPasswordCorrect) {
    const attempts = await redisService.incr(attemptsKey);

    if (attempts === 1) {
      await redisService.set(attemptsKey, attempts, {
        EX: 300,
      });
    }

    if (attempts >= 5) {
      await redisService.set(banKey, "true", {
        EX: 300,
      });

      await redisService.del(attemptsKey);

      throw new Error(
        "Account temporarily banned for 5 minutes"
      );
    }

    throw new Error(
      `Invalid email or password. Attempt ${attempts}/5`
    );
  }

  await redisService.del(attemptsKey);

  if (!user.emailVerified) {
    throw new Error("Please verify your email before logging in");
  }

  if (user.twoFactorEnabled) {
    const otp = generateOtp();

    user.twoFactorOtp = otp;
    user.twoFactorOtpExpiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    await user.save();

    await sendEmail(
      user.email,
      "Your Saraha Login Code",
      `
        <h2>Login Verification 🔐</h2>
        <p>Your login verification code is:</p>
        <h1>${otp}</h1>
        <p>This code will expire in 10 minutes.</p>
      `
    );

    return {
      requiresTwoFactor: true,
      userId: user._id,
    };
  }

  const token = jwt.sign(
    {
      userId: user._id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h",
    }
  );

  return {
    user,
    token,
  };
};

// Logout / Revoke Token
const revokeToken = async (token) => {
  await redisService.set(`revoked:${token}`, "true", {
    EX: 3600,
  });
};

// Forgot Password
const forgotPassword = async (email) => {
  const user = await getUserByEmail(email);

  if (!user) {
    throw new Error("User not found");
  }

  const otp = generateOtp();

  user.passwordResetOtp = otp;
  user.passwordResetOtpExpiresAt = new Date(
    Date.now() + 10 * 60 * 1000
  );

  await user.save();

  await sendEmail(
    user.email,
    "Reset your Saraha password",
    `
      <h2>Password Reset 🌸</h2>
      <p>Your password reset code is:</p>
      <h1>${otp}</h1>
      <p>This code will expire in 10 minutes.</p>
    `
  );
};

// Verify Forgot Password OTP
const verifyForgotPasswordOtp = async (email, otp) => {
  const user = await getUserByEmail(email);

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.passwordResetOtp) {
    throw new Error("Password reset code not found");
  }

  if (user.passwordResetOtpExpiresAt < new Date()) {
    throw new Error("Password reset code expired");
  }

  if (user.passwordResetOtp !== otp) {
    throw new Error("Invalid password reset code");
  }

  return user;
};

// Reset Password
const resetPassword = async (email, otp, newPassword) => {
  const user = await getUserByEmail(email);

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.passwordResetOtp) {
    throw new Error("Password reset code not found");
  }

  if (user.passwordResetOtpExpiresAt < new Date()) {
    throw new Error("Password reset code expired");
  }

  if (user.passwordResetOtp !== otp) {
    throw new Error("Invalid password reset code");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;
  user.passwordResetOtp = undefined;
  user.passwordResetOtpExpiresAt = undefined;

  await user.save();
};

export {
  registerUser,
  loginUser,
  revokeToken,

  sendVerificationOtp,
  confirmEmail,
  resendVerificationOtp,

  forgotPassword,
  verifyForgotPasswordOtp,
  resetPassword,

  enableTwoFactor,
  verifyTwoFactorSetup,
  confirmTwoFactorLogin,
};
