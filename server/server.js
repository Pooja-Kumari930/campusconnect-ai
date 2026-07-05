import "dotenv/config";
import http from "http";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import { Server as SocketIOServer } from "socket.io";
import jwt from "jsonwebtoken";

import { connectDB } from "./config/db.js";
import { notFound, errorHandler } from "./middlewares/errorHandler.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";

const app = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// ---------- Security & core middleware ----------
app.use(helmet());
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please try again later." },
});
app.use("/api", apiLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many auth attempts. Please try again later." },
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

app.use("/uploads", express.static("uploads"));

// ---------- Routes ----------
app.get("/api/health", (req, res) => res.json({ success: true, message: "CampusConnect AI API is running." }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/categories", categoryRoutes);

app.use(notFound);
app.use(errorHandler);

// ---------- Socket.IO (real-time chat + notifications) ----------
const io = new SocketIOServer(server, {
  cors: { origin: CLIENT_URL, credentials: true },
});

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication required"));
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    socket.userId = decoded.id;
    next();
  } catch {
    next(new Error("Authentication failed"));
  }
});

io.on("connection", (socket) => {
  socket.join(`user:${socket.userId}`);

  socket.on("chat:join", (complaintId) => socket.join(`complaint:${complaintId}`));

  socket.on("chat:message", ({ complaintId, message, senderId }) => {
    io.to(`complaint:${complaintId}`).emit("chat:message", {
      complaintId,
      message,
      senderId,
      sentAt: new Date(),
    });
  });

  socket.on("chat:typing", ({ complaintId, userId, isTyping }) => {
    socket.to(`complaint:${complaintId}`).emit("chat:typing", { userId, isTyping });
  });

  socket.on("disconnect", () => {
    // socket.io auto-cleans room membership on disconnect
  });
});

app.set("io", io);

// ---------- Boot ----------
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`[server] CampusConnect AI API listening on port ${PORT}`);
  });
});

process.on("unhandledRejection", (err) => {
  console.error("[server] Unhandled rejection:", err.message);
});
