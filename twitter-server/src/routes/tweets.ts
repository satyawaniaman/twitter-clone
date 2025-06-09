// src/routes/tweets.ts
import express, { Request } from "express";
import { PrismaClient } from "@prisma/client";
import { protect, AuthRequest } from "../middleware/auth";
import multer from "multer";
import path from "path";
import crypto from "crypto";
import { supabase } from "../utils/supabase";

const router = express.Router();
const prisma = new PrismaClient();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (
    req: Request,
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

// Get all tweets (feed)
router.get("/", async (req, res) => {
  try {
    const cursor = req.query.cursor as string | undefined;
    const limit = parseInt((req.query.limit as string) || "20");

    const tweets = await prisma.tweet.findMany({
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    let nextCursor = null;
    if (tweets.length === limit) {
      nextCursor = tweets[tweets.length - 1].id;
    }

    res.json({
      tweets,
      nextCursor,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get tweets by user
router.get("/user/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const cursor = req.query.cursor as string | undefined;
    const limit = parseInt((req.query.limit as string) || "20");

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const tweets = await prisma.tweet.findMany({
      where: {
        userId: user.id,
      },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    let nextCursor = null;
    if (tweets.length === limit) {
      nextCursor = tweets[tweets.length - 1].id;
    }

    res.json({
      tweets,
      nextCursor,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create tweet with optional media (protected)
router.post(
  "/",
  protect,
  upload.single("media"),
  async (req: AuthRequest, res) => {
    try {
      const { content } = req.body;

      if (!content || content.trim() === "") {
        return res.status(400).json({ message: "Content is required" });
      }

      if (content.length > 280) {
        return res
          .status(400)
          .json({ message: "Tweet cannot exceed 280 characters" });
      }

      // Prepare the tweet data
      const tweetData: any = {
        content,
        userId: req.user.id,
      };

      // Handle media upload to Supabase if file exists
      if (req.file) {
        // Create a unique filename
        const fileExt = path.extname(req.file.originalname);
        const fileName = `${crypto.randomUUID()}${fileExt}`;

        // Determine media type
        const mediaType = req.file.mimetype.startsWith("image/")
          ? "image"
          : "video";

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from("tweet-media")
          .upload(fileName, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: false,
          });

        if (error) {
          console.error("Supabase storage error:", error);
          return res.status(500).json({ message: "Failed to upload media" });
        }

        // Get public URL for the uploaded file
        const {
          data: { publicUrl },
        } = supabase.storage.from("tweet-media").getPublicUrl(fileName);

        // Add media info to tweet data
        tweetData.mediaUrl = publicUrl;
        tweetData.mediaType = mediaType;
      }

      // Create the tweet in database
      const tweet = await prisma.tweet.create({
        data: tweetData,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
        },
      });

      res.status(201).json(tweet);
    } catch (error) {
      console.error("Error creating tweet:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Like a tweet
router.post("/:id/like", protect, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Check if tweet exists
    const tweet = await prisma.tweet.findUnique({
      where: { id },
    });

    if (!tweet) {
      return res.status(404).json({ message: "Tweet not found" });
    }

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        tweetId_userId: {
          tweetId: id,
          userId: req.user.id,
        },
      },
    });

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: {
          tweetId_userId: {
            tweetId: id,
            userId: req.user.id,
          },
        },
      });

      return res.json({ liked: false });
    }

    // Like
    await prisma.like.create({
      data: {
        tweetId: id,
        userId: req.user.id,
      },
    });

    res.json({ liked: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
