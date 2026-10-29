import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import emergencyRoutes from "./routes/emergencyRoutes.js";
import insuranceRoutes from "./routes/insuranceRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import qrRoutes from "./routes/qrRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";
import verificationRoutes from "./routes/verificationRoutes.js";
import responderEmergencyRoutes from "./routes/responderEmergencyRoutes.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
import {
  apiLimiter,
  authLimiter,
  publicLimiter,
} from "./middleware/rateLimitMiddleware.js";
import notificationRouter from './routes/notificationRoutes.js';

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || origin.startsWith("http://localhost:") || origin.startsWith("http://192.168.") || origin.startsWith("http://172.")) {
        return callback(null, true);
      }
      return callback(null, true); // Fallback allow for development flexibility
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Apply global API rate limiter to all /api routes
app.use("/api", apiLimiter);

// Specific rate limiters for sensitive / public endpoints
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/public", publicLimiter, publicRoutes);

app.use("/api/profile", profileRoutes);
app.use("/api/emergency", emergencyRoutes);
app.use("/api/insurance", insuranceRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/qr", qrRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/responder/emergency", responderEmergencyRoutes);
app.use('/api/notification',notificationRouter);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to Sankat Mochan API 🚑",
  });
});

// Centralized error handler middleware
app.use(errorMiddleware);

export default app;