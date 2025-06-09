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
app.use(helmet());
app.use(cors());
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

// Handle shutdown gracefully
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
