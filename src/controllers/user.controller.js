import * as userService from "../services/user.service.js";
import { sendVerificationOtp } from "../services/auth.service.js";

const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);

    await sendVerificationOtp(user);

    const { password, ...userWithoutPassword } = user.toObject();

    return res.status(201).json({
      message:
        "User created successfully. Verification code sent to your email.",
      user: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};

export { createUser };