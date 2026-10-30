import * as authService from "../services/auth.service.js";

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await authService.loginUser(
      email,
      password
    );

    // 2FA required
    if (result.requiresTwoFactor) {
      return res.status(200).json({
        message: "Two-factor authentication required",
        requiresTwoFactor: true,
        userId: result.userId,
      });
    }

    const { user, token } = result;

    const { password: _, ...userWithoutPassword } =
      user.toObject();

    return res.status(200).json({
      message: "Login successful",
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    const [, token] = authorization.split(" ");

    await authService.revokeToken(token);

    return res.status(200).json({
      message: "Logout successful",
    });
  } catch (error) {
    next(error);
  }
};

const confirmEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await authService.confirmEmail(email, otp);

    return res.status(200).json({
      message: "Email verified successfully",
      emailVerified: user.emailVerified,
    });
  } catch (error) {
    next(error);
  }
};

const resendVerificationOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    await authService.resendVerificationOtp(email);

    return res.status(200).json({
      message: "Verification code resent successfully",
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    await authService.forgotPassword(email);

    return res.status(200).json({
      message: "Password reset code sent successfully",
    });
  } catch (error) {
    next(error);
  }
};

const verifyForgotPasswordOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    await authService.verifyForgotPasswordOtp(email, otp);

    return res.status(200).json({
      message: "Password reset code verified successfully",
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    await authService.resetPassword(
      email,
      otp,
      newPassword
    );

    return res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Two-Factor Authentication
|--------------------------------------------------------------------------
*/

const enableTwoFactor = async (req, res, next) => {
  try {
    await authService.enableTwoFactor(req.user.userId);

    return res.status(200).json({
      message: "Two-factor verification code sent successfully",
    });
  } catch (error) {
    next(error);
  }
};

const verifyTwoFactorSetup = async (req, res, next) => {
  try {
    const { otp } = req.body;

    await authService.verifyTwoFactorSetup(
      req.user.userId,
      otp
    );

    return res.status(200).json({
      message: "Two-factor authentication enabled successfully",
    });
  } catch (error) {
    next(error);
  }
};

const confirmTwoFactorLogin = async (req, res, next) => {
  try {
    const { userId, otp } = req.body;

    const { user, token } =
      await authService.confirmTwoFactorLogin(
        userId,
        otp
      );

    const { password: _, ...userWithoutPassword } =
      user.toObject();

    return res.status(200).json({
      message: "Two-factor login successful",
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    next(error);
  }
};

export {
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
};