import path from "path";
import express from "express";
import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";
import errorHandler from "./middlewares/error.middleware.js";
import helmet from "helmet";
import cors from "cors";
import rateLimiter from "./middlewares/rate-limit.middleware.js";
import morgan from "morgan";
const app = express();
const uploadsPath = path.resolve("uploads");

app.use("/uploads", express.static(uploadsPath));
app.use(express.json());
app.use(helmet());
app.use(cors());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to Saraha API 🌸",
  });
});
app.use(
  rateLimiter({
    windowMs: 60 * 1000,
    limit: 3,
  })
);
app.use(morgan("dev"));
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/message", messageRoutes);

app.use(errorHandler);
export default app;