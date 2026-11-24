import express from "express";
import cors from "cors";
// import helmet from "helmet";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import { env } from "./config/env.js";
import authRoutes from "./routes/auth.js";
import fileRoutes from "./routes/files.js";
import { errorHandler, notFound } from "./middleware/errors.js";

const app = express();

app.disable("x-powered-by");

// Allowed frontend origins
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  env.CLIENT_URL,
].filter((origin): origin is string => Boolean(origin));

// Security headers
// app.use(helmet());
// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Request parsing
app.use(express.json({ limit: "32kb" }));
app.use(cookieParser());

// API rate limiting
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "swiftdrive-api",
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
