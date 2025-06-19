import express from "express";
import { PrismaClient } from "@prisma/client";
import { protect, AuthRequest } from "../middleware/auth";

const router = express.Router();
const prisma = new PrismaClient();

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
      try {
        user = await prisma.user.create({
          data: {
            id: user_id,
            email,
            username: email.split("@")[0],
            avatarUrl: "https://img.freepik.com/free-vector/user-circles-set_78370-4704.jpg?uid=R167043860&semt=ais_hybrid&w=740",
          },
        });
      } catch (error: any) {
        // If there's a unique constraint error, try to find the user again
        // This handles race conditions where the user might have been created between our check and create
        if (error.code === 'P2002') {
          user = await prisma.user.findUnique({
            where: { id: user_id },
          });
          
          if (!user) {
            // If still not found, there might be an email conflict
            user = await prisma.user.findUnique({
              where: { email },
            });
          }
        } else {
          throw error;
        }
      }
    }

    if (!user) {
      return res.status(500).json({ message: "Failed to create or find user" });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/me", protect, (req: AuthRequest, res) => {
  res.json(req.user);
});

export default router;
