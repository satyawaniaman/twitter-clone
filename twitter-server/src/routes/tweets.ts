import express, { Request } from "express";
import { PrismaClient } from "@prisma/client";
import { protect, AuthRequest } from "../middleware/auth";
import multer from "multer";
import path from "path";
import crypto from "crypto";
import { supabase } from "../utils/supabase";
import { Readable } from "stream";
const router = express.Router();
const prisma = new PrismaClient();
function bufferToStream(buffer: Buffer): Readable {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
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

// Get tweets by user
router.get("/user/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const cursor = req.query.cursor as string | undefined;
    const limit = parseInt((req.query.limit as string) || "20");

    // First find the user
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true }
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const tweets = await prisma.tweet.findMany({
      where: {
        userId: user.id
      },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: {
        createdAt: "desc"
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true
          }
        },
        _count: {
          select: {
            likes: true
          }
        }
      }
    });

    const nextCursor = tweets.length === limit ? tweets[tweets.length - 1].id : null;

    res.json({
      tweets,
      nextCursor
    });
  } catch (error) {
    console.error("Error fetching user tweets:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

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
      const tweetData: any = {
        content,
        userId: req.user.id,
      };
      if (req.file) {
        const fileExt = path.extname(req.file.originalname);
        const fileName = `${crypto.randomUUID()}${fileExt}`;
        const mediaType = req.file.mimetype.startsWith("image/")
          ? "image"
          : "video";

        const { data, error } = await supabase.storage
          .from("tweet-media")
          .upload(fileName, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: false,
          });

        if (error) {
          console.error("❌ Upload error:", error);
          return res.status(500).json({ message: "Failed to upload media" });
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("tweet-media").getPublicUrl(fileName);

        tweetData.mediaUrl = publicUrl;
        tweetData.mediaType = mediaType;
      }

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
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.post("/:id/like", protect, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const tweet = await prisma.tweet.findUnique({
      where: { id },
    });

    if (!tweet) {
      return res.status(404).json({ message: "Tweet not found" });
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        tweetId_userId: {
          tweetId: id,
          userId: req.user.id,
        },
      },
    });

    if (existingLike) {
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
