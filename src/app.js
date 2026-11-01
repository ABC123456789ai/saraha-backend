
import path from "path";
import express from "express";
import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";
import errorHandler from "./middlewares/error.middleware.js";
import rateLimiter from "./middlewares/rate-limit.middleware.js";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";

const app = express();
const uploadsPath = path.resolve("uploads");

app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));

app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 100,
  })
);

app.use("/uploads", express.static(uploadsPath));
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Saraha API 🌸",
  });
});
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/message", messageRoutes);
app.use(errorHandler);

export default app;
