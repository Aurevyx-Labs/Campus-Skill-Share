import { Router, Request, Response } from "express";
import { db } from "@workspace/db";
import { insertRatingSchema } from "@workspace/db"; // if you have it; if not, we can skip validation
import { getSessionId, getSession } from "../lib/auth";

const router = Router();

// POST /ratings - submit a rating for a completed exchange
router.post("/", async (req: Request, res: Response) => {
  const sid = getSessionId(req);
  const session = sid ? await getSession(sid) : null;
  if (!session?.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { postId, score, comment } = req.body;

  if (!postId || !score || score < 1 || score > 5) {
    return res.status(400).json({ error: "Invalid rating data" });
  }

  const raterId = session.user.id;

  // Check if post exists and get the author (ratedUserId)
  const postResult = await db.$client.query(
    `SELECT id, user_id FROM posts WHERE id = $1`,
    [postId],
  );

  if (postResult.rows.length === 0) {
    return res.status(404).json({ error: "Post not found" });
  }

  const ratedUserId = postResult.rows[0].user_id;

  if (ratedUserId === raterId) {
    return res.status(400).json({ error: "You cannot rate yourself" });
  }

  // Check if already rated
  const existing = await db.$client.query(
    `SELECT id FROM ratings WHERE post_id = $1 AND rater_id = $2`,
    [postId, raterId],
  );

  if (existing.rows.length > 0) {
    return res
      .status(409)
      .json({ error: "You have already rated this exchange" });
  }

  // Insert rating
  const insertResult = await db.$client.query(
    `INSERT INTO ratings (post_id, rater_id, rated_user_id, score, comment, created_at)
     VALUES ($1, $2, $3, $4, $5, now())
     RETURNING id, post_id, rater_id, rated_user_id, score, comment, created_at`,
    [postId, raterId, ratedUserId, score, comment || null],
  );

  const newRating = insertResult.rows[0];
  return res.status(201).json({
    id: newRating.id,
    postId: newRating.post_id,
    raterId: newRating.rater_id,
    ratedUserId: newRating.rated_user_id,
    score: newRating.score,
    comment: newRating.comment,
    createdAt:
      newRating.created_at instanceof Date
        ? newRating.created_at.toISOString()
        : newRating.created_at,
  });
});

// GET /ratings/user/:userId - fetch ratings received by a user
router.get("/user/:userId", async (req: Request, res: Response) => {
  const { userId } = req.params;

  const result = await db.$client.query(
    `SELECT r.id, r.post_id, r.score, r.comment, r.created_at,
            u.id as rater_id, u.display_name as rater_display_name,
            u.first_name as rater_first_name, u.last_name as rater_last_name
     FROM ratings r
     JOIN users u ON r.rater_id = u.id
     WHERE r.rated_user_id = $1
     ORDER BY r.created_at DESC`,
    [userId],
  );

  const rows = result.rows;

  const ratings = rows.map((r: any) => ({
    id: r.id,
    postId: r.post_id,
    score: r.score,
    comment: r.comment,
    createdAt:
      r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at,
    rater: {
      id: r.rater_id,
      displayName:
        r.rater_display_name ||
        `${r.rater_first_name || ""} ${r.rater_last_name || ""}`.trim() ||
        "User",
    },
  }));

  const average =
    ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
      : null;

  return res.json({ ratings, average, total: ratings.length });
});

// GET /api/ratings/post/:postId - get all ratings for a post
router.get("/post/:postId", async (req: Request, res: Response) => {
  const sid = getSessionId(req);
  const session = sid ? await getSession(sid) : null;
  if (!session?.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const postId = req.params.postId;

  const result = await db.$client.query(
    `SELECT r.id, r.score, r.comment, r.created_at,
            u.id as user_id, u.display_name, u.profile_image_url
     FROM ratings r
     JOIN users u ON r.rater_id = u.id
     WHERE r.post_id = $1
     ORDER BY r.created_at DESC`,
    [postId],
  );

  const ratings = result.rows.map((row: any) => ({
    id: row.id,
    score: row.score,
    comment: row.comment,
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : row.created_at,
    user: {
      id: row.user_id,
      displayName: row.display_name,
      profileImageUrl: row.profile_image_url,
    },
  }));

  const avgResult = await db.$client.query(
    `SELECT AVG(score) as average, COUNT(*) as total
     FROM ratings
     WHERE post_id = $1`,
    [postId],
  );

  const average = avgResult.rows[0]?.average
    ? parseFloat(avgResult.rows[0].average)
    : null;
  const total = parseInt(avgResult.rows[0]?.total || "0", 10);

  return res.json({ average, total, ratings });
});

export default router;
