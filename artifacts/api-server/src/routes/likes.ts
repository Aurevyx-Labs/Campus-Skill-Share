import { Router, Request, Response } from "express";
import { db, likesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { getSessionId, getSession } from "../lib/auth";

const router = Router();

// GET /api/posts/:postId/likes - get like count and whether current user liked it
router.get("/:postId", async (req: Request, res: Response) => {
  const sid = getSessionId(req);
  const session = sid ? await getSession(sid) : null;
  if (!session?.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const postId = req.params.postId;
  const userId = session.user.id;

  // Count total likes
  const countResult = await db.$client.query(
    `SELECT COUNT(*) FROM likes WHERE post_id = $1`,
    [postId],
  );
  const total = parseInt(countResult.rows[0].count, 10);

  // Check if current user liked it
  const userLikeResult = await db.$client.query(
    `SELECT id FROM likes WHERE post_id = $1 AND user_id = $2`,
    [postId, userId],
  );
  const liked = userLikeResult.rows.length > 0;

  return res.json({ total, liked });
});

// POST /api/posts/:postId/like - like a post (or unlike if already liked)
router.post("/:postId", async (req: Request, res: Response) => {
  const sid = getSessionId(req);
  const session = sid ? await getSession(sid) : null;
  if (!session?.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const postId = req.params.postId;
  const userId = session.user.id;

  // Check if already liked
  const existing = await db.$client.query(
    `SELECT id FROM likes WHERE post_id = $1 AND user_id = $2`,
    [postId, userId],
  );

  if (existing.rows.length > 0) {
    // Unlike: remove the like
    await db.$client.query(
      `DELETE FROM likes WHERE post_id = $1 AND user_id = $2`,
      [postId, userId],
    );
    return res.json({ liked: false, message: "Unliked" });
  } else {
    // Like: insert
    await db.$client.query(
      `INSERT INTO likes (post_id, user_id) VALUES ($1, $2)`,
      [postId, userId],
    );
    return res.status(201).json({ liked: true, message: "Liked" });
  }
});

export default router;
