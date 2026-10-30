
import jwt from "jsonwebtoken";
import { redisClient } from "../config/redis.js";

const authMiddleware = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({
        success: false,
        message: "Authorization header is required",
      });
    }

    const [type, token] = authorization.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const isRevoked = await redisClient.get(`revoked:${token}`);

    if (isRevoked) {
      return res.status(401).json({
        success: false,
        message: "Token has been revoked",
      });
    }

    req.user = decoded;
    return next();
  } catch (error) {
    console.error("AUTH MIDDLEWARE ERROR:", error.name, error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export default authMiddleware;
