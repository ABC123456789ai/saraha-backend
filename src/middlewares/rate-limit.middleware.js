import { rateLimit } from "express-rate-limit";

const rateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000,
    limit = 3,
    message = "Too many requests, please try again later.",
  } = options;

  return rateLimit({
    windowMs,
    limit,
    message: {
      success: false,
      message,
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

export default rateLimiter;