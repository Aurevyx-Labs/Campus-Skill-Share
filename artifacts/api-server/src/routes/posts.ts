import { Router, Request, Response } from "express";
import { db } from "@workspace/db";
import { resolveDisplayName } from "../lib/displayName";
import { getSessionId, getSession } from "../lib/auth";

const router = Router();

// GET /posts - list posts with optional search/category/authorId/type filter
router.get("/", async (req: Request, res: Response) => {
  const sid = getSessionId(req);
  const session = sid ? await getSession(sid) : null;
  if (!session?.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const {
    search,
    category,
    authorId,
    type, // ✅ ADDED
    limit = "50",
    offset = "0",
  } = req.query as Record<string, string>;

  let sqlQuery = `
    SELECT p.id, p.title, p.category, p.description, p.availability, p.price_rate, p.university, p.image_url, p.created_at, p.type,
           u.id as author_id, u.display_name as author_display_name, u.first_name as author_first_name,
           u.last_name as author_last_name, u.profile_image_url as author_profile_image_url
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE 1=1
  `;
  const params: any[] = [];
  let paramIndex = 1;

  if (category && category !== "all") {
    sqlQuery += ` AND p.category = $${paramIndex}`;
    params.push(category);
    paramIndex++;
  }
  if (authorId) {
    sqlQuery += ` AND p.user_id = $${paramIndex}`;
    params.push(authorId);
    paramIndex++;
  }
  if (search) {
    sqlQuery += ` AND (p.title ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }
  // ✅ ADD type filter
  if (type) {
    sqlQuery += ` AND p.type = $${paramIndex}`;
    params.push(type);
    paramIndex++;
  }

  // Count total
  const countQuery = sqlQuery.replace(
    /SELECT .*? FROM /,
    "SELECT COUNT(*) as total FROM ",
  );
  const countQueryClean = countQuery.replace(/ ORDER BY .*$/, "");
  const countResult = await db.$client.query(
    countQueryClean,
    params.slice(0, paramIndex - 1),
  );
  const total = parseInt(countResult.rows[0]?.total || "0", 10);

  sqlQuery += ` ORDER BY p.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(parseInt(limit), parseInt(offset));

  const result = await db.$client.query(sqlQuery, params);

  const posts = result.rows.map((row: any) => ({
    id: row.id,
    title: row.title,
    category: row.category,
    description: row.description,
    availability: row.availability ?? null,
    priceRate: row.price_rate ?? null,
    university: row.university ?? null,
    imageUrl: row.image_url ?? null,
    type: row.type ?? "skill",
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : row.created_at,
    author: {
      id: row.author_id,
      displayName: resolveDisplayName(
        row.author_display_name,
        row.author_first_name,
        row.author_last_name,
      ),
      profileImageUrl: row.author_profile_image_url ?? null,
    },
  }));

  return res.json({ posts, total });
});

// GET /posts/stats - category breakdown (fixed reduce types)
router.get("/stats", async (req: Request, res: Response) => {
  const sid = getSessionId(req);
  const session = sid ? await getSession(sid) : null;
  if (!session?.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const result = await db.$client.query(
    `SELECT category, COUNT(*) as count
     FROM posts
     GROUP BY category
     ORDER BY count DESC`,
  );

  const categories: { category: string; count: number }[] = result.rows.map(
    (row: any) => ({
      category: row.category,
      count: Number(row.count),
    }),
  );

  const total = categories.reduce(
    (sum: number, c: { category: string; count: number }) => sum + c.count,
    0,
  );

  return res.json({ categories, total });
});

// GET /posts/:id - get a single post by ID (fixed full query)
router.get("/:id", async (req: Request, res: Response) => {
  const sid = getSessionId(req);
  const session = sid ? await getSession(sid) : null;
  if (!session?.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const postId = req.params.id;

  const result = await db.$client.query(
    `SELECT p.id, p.title, p.description, p.category, p.availability, p.price_rate, p.university, p.image_url, p.created_at, p.status, p.type,
            u.id as author_id, u.display_name as author_display_name, u.profile_image_url as author_profile_image_url
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE p.id = $1`,
    [postId],
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Post not found" });
  }

  const row = result.rows[0];
  return res.json({
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    availability: row.availability,
    priceRate: row.price_rate,
    university: row.university,
    imageUrl: row.image_url,
    type: row.type ?? "skill",
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : row.created_at,
    status: row.status,
    author: {
      id: row.author_id,
      displayName: row.author_display_name,
      profileImageUrl: row.author_profile_image_url,
    },
  });
});

// POST /posts - create a new post
router.post("/", async (req: Request, res: Response) => {
  const sid = getSessionId(req);
  const session = sid ? await getSession(sid) : null;
  if (!session?.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const {
    title,
    category,
    description,
    availability,
    priceRate,
    university,
    imageUrl,
    type = "skill",
  } = req.body;

  if (!title || !category || !description) {
    return res
      .status(400)
      .json({ error: "title, category, and description are required" });
  }

  if (description.length < 20) {
    return res
      .status(400)
      .json({ error: "Description must be at least 20 characters" });
  }

  const validCategories = [
    "Tutoring",
    "Design",
    "Music",
    "Tech",
    "Language",
    "Other",
    "Textbooks",
    "Gadgets",
    "Fashion",
    "Hostel Essentials",
    "Tutor Booking",
    "Designers",
    "Programmers",
    "Photographers",
    "Makeup Artists",
    "Tailors",
    "Barbers",
  ];
  if (!validCategories.includes(category)) {
    return res.status(400).json({ error: "Invalid category" });
  }

  const result = await db.$client.query(
    `INSERT INTO posts (user_id, title, category, description, availability, price_rate, university, image_url, type)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id, title, category, description, availability, price_rate, university, image_url, created_at, type`,
    [
      session.user.id,
      title,
      category,
      description,
      availability || null,
      priceRate || null,
      university || null,
      imageUrl || null,
      type,
    ],
  );

  const post = result.rows[0];
  const user = session.user;

  return res.status(201).json({
    id: post.id,
    title: post.title,
    category: post.category,
    university: post.university,
    description: post.description,
    availability: post.availability ?? null,
    priceRate: post.price_rate ?? null,
    imageUrl: post.image_url ?? null,
    type: post.type ?? "skill",
    createdAt:
      post.created_at instanceof Date
        ? post.created_at.toISOString()
        : post.created_at,
    author: {
      id: user.id,
      displayName: resolveDisplayName(
        user.displayName,
        user.firstName,
        user.lastName,
      ),
      profileImageUrl: user.profileImageUrl ?? null,
    },
  });
});

// DELETE /posts/:postId - delete post (admin or owner)
router.delete("/:postId", async (req: Request, res: Response) => {
  const sid = getSessionId(req);
  const session = sid ? await getSession(sid) : null;
  if (!session?.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { postId } = req.params;

  const checkResult = await db.$client.query(
    `SELECT id, user_id FROM posts WHERE id = $1`,
    [postId],
  );

  if (checkResult.rows.length === 0) {
    return res.status(404).json({ error: "Post not found" });
  }

  const post = checkResult.rows[0];
  if (session.user.role !== "admin" && post.user_id !== session.user.id) {
    return res.status(403).json({ error: "Forbidden" });
  }

  await db.$client.query(`DELETE FROM posts WHERE id = $1`, [postId]);
  return res.json({ success: true });
});

// PATCH /posts/:postId/complete - mark exchange as complete
router.patch("/:postId/complete", async (req: Request, res: Response) => {
  const sid = getSessionId(req);
  const session = sid ? await getSession(sid) : null;
  if (!session?.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { postId } = req.params;

  const checkResult = await db.$client.query(
    `SELECT id, user_id FROM posts WHERE id = $1`,
    [postId],
  );

  if (checkResult.rows.length === 0) {
    return res.status(404).json({ error: "Post not found" });
  }

  const post = checkResult.rows[0];
  if (session.user.role !== "admin" && post.user_id !== session.user.id) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const result = await db.$client.query(
    `UPDATE posts SET status = 'completed' WHERE id = $1 RETURNING *`,
    [postId],
  );

  const updated = result.rows[0];
  return res.json({ success: true, post: updated });
});

export default router;
