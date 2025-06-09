// src/routes/users.ts
import express, { Request } from "express";
import { PrismaClient } from "@prisma/client";
import { protect, AuthRequest } from "../middleware/auth";
import { supabase } from "../utils/supabase";
import multer from "multer";
import path from "path";

const router = express.Router();
const prisma = new PrismaClient();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (
    req: express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/quicktime",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only images and certain videos are allowed."
        )
      );
    }
  },
});
// Get user profile
router.get("/:username", async (req, res) => {
  try {
    const { username } = req.params;

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        fullName: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
        _count: {
          select: {
            tweets: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user profile (protected)
router.put("/profile", protect, async (req: AuthRequest, res) => {
  try {
    const { username, fullName, bio, avatarUrl } = req.body;

    // Check if username is taken
    if (username) {
      const existingUser = await prisma.user.findUnique({
        where: { username },
      });

      if (existingUser && existingUser.id !== req.user.id) {
        res.status(400).json({ message: "Username already taken" });
        return;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        username,
        fullName,
        bio,
        avatarUrl,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Follow a user
router.post("/follow/:userId", protect, async (req: AuthRequest, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.user.id) {
      res.status(400).json({ message: "You cannot follow yourself" });
      return;
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: req.user.id,
          followingId: userId,
        },
      },
    });

    if (existingFollow) {
      res.status(400).json({ message: "Already following this user" });
      return;
    }

    // Create follow
    await prisma.follow.create({
      data: {
        followerId: req.user.id,
        followingId: userId,
      },
    });

    res.status(200).json({ message: "Successfully followed user" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
// src/routes/users.ts
// Add a route to update profile picture
router.put(
  "/profile-picture",
  protect,
  upload.single("avatar"),
  async (req: AuthRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Create a unique filename
      const fileExt = path.extname(req.file.originalname);
      const fileName = `avatar-${req.user.id}${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from("profile-pictures")
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: true, // Override if exists
        });

      if (error) {
        console.error("Supabase storage error:", error);
        return res
          .status(500)
          .json({ message: "Failed to upload profile picture" });
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("profile-pictures").getPublicUrl(fileName);

      // Update user profile with new avatar URL
      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: { avatarUrl: publicUrl },
      });

      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile picture:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);
export default router;
