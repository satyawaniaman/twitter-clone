// src/server.ts
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";

import userRoutes from "./routes/users";
import tweetRoutes from "./routes/tweets";
import authRoutes from "./routes/auth";

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(
  helmet({
    crossOriginEmbedderPolicy: false, // If you need to embed resources
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", "https://api.supabase.co"], // For Supabase
      },
    },
  })
);
app.use(
  cors({
    origin: [
      "https://twitter-clone-llh1.vercel.app",
      "http://localhost:3001",
      `${process.env.FRONTEND_URL}`,
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tweets", tweetRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Handle shutdown gracefully
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
