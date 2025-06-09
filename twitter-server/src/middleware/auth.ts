// src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { supabase } from "../utils/supabase";

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  user?: any;
}

// src/middleware/auth.ts
export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ message: "Not authorized" });
      return; // Just return, don't return the response
    }

    const token = authHeader.split(" ")[1];

    // Verify token with Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    // Set user in request
    req.user = dbUser;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ message: "Not authorized" });
  }
};
