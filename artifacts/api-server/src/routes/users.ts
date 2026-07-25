import { Router, Request, Response } from "express";
import { db } from "@workspace/db";
import { resolveDisplayName } from "../lib/displayName";
import { getSessionId, getSession } from "../lib/auth";

const router = Router();

// GET /api/users - list all users (Explore People)
router.get("/", async (req: Request, res: Response) => {
  const sid = getSessionId(req);
  const session = sid ? await getSession(sid) : null;
  if (!session?.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const result = await db.$client.query(
    `SELECT id, display_name, first_name, last_name, profile_image_url, university
     FROM users
     ORDER BY display_name ASC`,
  );

  const rows = result.rows;

  const users = rows.map((u: any) => ({
    id: u.id,
    displayName: resolveDisplayName(u.display_name, u.first_name, u.last_name),
    profileImageUrl: u.profile_image_url ?? null,
    university: u.university ?? null,
  }));

  return res.json({ users });
});

// GET /api/users/me - current user profile (includes preferences)
router.get("/me", async (req: Request, res: Response) => {
  const sid = getSessionId(req);
  const session = sid ? await getSession(sid) : null;
  if (!session?.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = session.user.id;

  const result = await db.$client.query(
    `SELECT id, email, display_name, first_name, last_name, profile_image_url, role, university, created_at, preferences
     FROM users
     WHERE id = $1`,
    [userId],
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: "User not found" });
  }

  const u = result.rows[0];
  return res.json({
    id: u.id,
    email: u.email ?? null,
    displayName: resolveDisplayName(u.display_name, u.first_name, u.last_name),
    role: u.role,
    profileImageUrl: u.profile_image_url ?? null,
    university: u.university ?? null,
    preferences: u.preferences ?? {},
    createdAt:
      u.created_at instanceof Date ? u.created_at.toISOString() : u.created_at,
  });
});

// PATCH /api/users/me - update current user profile
router.patch("/me", async (req: Request, res: Response) => {
  const sid = getSessionId(req);
  const session = sid ? await getSession(sid) : null;
  if (!session?.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = session.user.id;
  const { firstName, lastName, displayName, profileImageUrl, university } =
    req.body;

  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (firstName !== undefined) {
    updates.push(`first_name = $${paramIndex}`);
    values.push(firstName);
    paramIndex++;
  }
  if (lastName !== undefined) {
    updates.push(`last_name = $${paramIndex}`);
    values.push(lastName);
    paramIndex++;
  }
  if (displayName !== undefined) {
    if (typeof displayName !== "string" || displayName.length < 2) {
      return res
        .status(400)
        .json({ error: "displayName must be at least 2 characters" });
    }
    updates.push(`display_name = $${paramIndex}`);
    values.push(displayName);
    paramIndex++;
  }
  if (profileImageUrl !== undefined) {
    updates.push(`profile_image_url = $${paramIndex}`);
    values.push(profileImageUrl);
    paramIndex++;
  }
  if (university !== undefined) {
    updates.push(`university = $${paramIndex}`);
    values.push(university);
    paramIndex++;
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: "No fields to update" });
  }

  values.push(userId);

  const query = `
    UPDATE users
    SET ${updates.join(", ")}
    WHERE id = $${paramIndex}
    RETURNING id, email, display_name, first_name, last_name, profile_image_url, role, university, created_at, preferences
  `;

  const result = await db.$client.query(query, values);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: "User not found" });
  }

  const u = result.rows[0];
  return res.json({
    id: u.id,
    email: u.email ?? null,
    displayName: resolveDisplayName(u.display_name, u.first_name, u.last_name),
    role: u.role,
    profileImageUrl: u.profile_image_url ?? null,
    university: u.university ?? null,
    preferences: u.preferences ?? {},
    createdAt:
      u.created_at instanceof Date ? u.created_at.toISOString() : u.created_at,
  });
});

// PATCH /api/users/me/preferences - update user preferences
router.patch("/me/preferences", async (req: Request, res: Response) => {
  const sid = getSessionId(req);
  const session = sid ? await getSession(sid) : null;
  if (!session?.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = session.user.id;
  const { preferences } = req.body;

  if (!preferences || typeof preferences !== "object") {
    return res.status(400).json({ error: "Invalid preferences data" });
  }

  const result = await db.$client.query(
    `UPDATE users SET preferences = $1 WHERE id = $2 RETURNING preferences`,
    [preferences, userId],
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.json({ preferences: result.rows[0].preferences });
});

// PATCH /api/users/me/password - change password (placeholder)
router.patch("/me/password", async (req: Request, res: Response) => {
  const sid = getSessionId(req);
  const session = sid ? await getSession(sid) : null;
  if (!session?.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Since we use Firebase Auth, password change isn't handled here.
  // This is a placeholder for future implementation (e.g., email link).
  return res.status(501).json({ error: "Not implemented" });
});

// DELETE /api/users/me - delete account
router.delete("/me", async (req: Request, res: Response) => {
  const sid = getSessionId(req);
  const session = sid ? await getSession(sid) : null;
  if (!session?.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = session.user.id;

  // Delete user from database (cascade will delete posts, ratings, etc.)
  await db.$client.query(`DELETE FROM users WHERE id = $1`, [userId]);

  // Clear session cookie
  res.clearCookie("sid", { path: "/" });

  return res.json({ success: true });
});

// GET /api/users/:userId - get a specific user by ID (for public profile)
// This must be the LAST route to avoid conflicting with /me and /me/*
router.get("/:userId", async (req: Request, res: Response) => {
  const sid = getSessionId(req);
  const session = sid ? await getSession(sid) : null;
  if (!session?.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = req.params.userId;

  const result = await db.$client.query(
    `SELECT id, display_name, first_name, last_name, profile_image_url, university
     FROM users
     WHERE id = $1`,
    [userId],
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: "User not found" });
  }

  const u = result.rows[0];
  return res.json({
    id: u.id,
    displayName: resolveDisplayName(u.display_name, u.first_name, u.last_name),
    profileImageUrl: u.profile_image_url ?? null,
    university: u.university ?? null,
  });
});

export default router;
