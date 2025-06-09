// src/routes/auth.ts
import express from "express";
import { PrismaClient } from "@prisma/client";
import { protect, AuthRequest } from "../middleware/auth";

const router = express.Router();
const prisma = new PrismaClient();

// Create or get user from Supabase auth
router.post("/user", async (req, res) => {
  try {
    const { user_id, email } = req.body;

    if (!user_id || !email) {
      res.status(400).json({ message: "User ID and email are required" });
      return;
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { id: user_id },
    });

    if (!user) {
      // Create user if not exists
      user = await prisma.user.create({
        data: {
          id: user_id,
          email,
          username: email.split("@")[0], // Default username
        },
      });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get current user (protected)
router.get("/me", protect, (req: AuthRequest, res) => {
  res.json(req.user);
});

export default router;
