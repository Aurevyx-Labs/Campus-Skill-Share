import { Router, Request, Response } from "express";
import { db } from "@workspace/db";
import { getSessionId, getSession } from "../lib/auth";

const router = Router();

// GET /api/bookmarks - get all bookmarked posts for the current user
router.get("/", async (req: Request, res: Response) => {
  const sid = getSessionId(req);
  const session = sid ? await getSession(sid) : null;
  if (!session?.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = session.user.id;

  const result = await db.$client.query(
    `SELECT b.created_at as bookmarked_at,
            p.id, p.title, p.description, p.category, p.availability, p.price_rate, p.university, p.image_url, p.created_at,
            u.id as author_id, u.display_name as author_display_name, u.profile_image_url as author_profile_image_url
     FROM bookmarks b
     JOIN posts p ON b.post_id = p.id
     JOIN users u ON p.user_id = u.id
     WHERE b.user_id = $1
     ORDER BY b.created_at DESC`,
    [userId],
  );

  const posts = result.rows.map((row: any) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    availability: row.availability,
    priceRate: row.price_rate,
    university: row.university,
    imageUrl: row.image_url,
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : row.created_at,
    bookmarkedAt:
      row.bookmarked_at instanceof Date
        ? row.bookmarked_at.toISOString()
        : row.bookmarked_at,
    author: {
      id: row.author_id,
      displayName: row.author_display_name,
      profileImageUrl: row.author_profile_image_url,
    },
  }));

  return res.json({ posts });
});

// POST /api/bookmarks/:postId - toggle bookmark (add or remove)
router.post("/:postId", async (req: Request, res: Response) => {
  const sid = getSessionId(req);
  const session = sid ? await getSession(sid) : null;
  if (!session?.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = session.user.id;
  const postId = req.params.postId;

  // Check if already bookmarked
  const existing = await db.$client.query(
    `SELECT id FROM bookmarks WHERE user_id = $1 AND post_id = $2`,
    [userId, postId],
  );

  if (existing.rows.length > 0) {
    // Remove bookmark
    await db.$client.query(
      `DELETE FROM bookmarks WHERE user_id = $1 AND post_id = $2`,
      [userId, postId],
    );
    return res.json({ bookmarked: false });
  } else {
    // Add bookmark
    const id = require("crypto").randomBytes(16).toString("hex");
    await db.$client.query(
      `INSERT INTO bookmarks (id, user_id, post_id) VALUES ($1, $2, $3)`,
      [id, userId, postId],
    );
    return res.status(201).json({ bookmarked: true });
  }
});

// GET /api/bookmarks/:postId/status - check if a post is bookmarked
router.get("/:postId/status", async (req: Request, res: Response) => {
  const sid = getSessionId(req);
  const session = sid ? await getSession(sid) : null;
  if (!session?.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = session.user.id;
  const postId = req.params.postId;

  const result = await db.$client.query(
    `SELECT id FROM bookmarks WHERE user_id = $1 AND post_id = $2`,
    [userId, postId],
  );

  return res.json({ bookmarked: result.rows.length > 0 });
});

export default router;
