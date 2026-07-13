import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { getSessionId, getSession } from "../lib/auth";

const router = Router();

// Ensure storage directory exists
const storageDir = path.join(process.cwd(), "storage", "posts");
if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}

// Configure multer to save locally
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, storageDir);
    },
    filename: (req, file, cb) => {
      const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, unique + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// POST /api/upload/image
router.post("/image", upload.single("image"), async (req: any, res: any) => {
  const sid = getSessionId(req);
  const session = sid ? await getSession(sid) : null;
  if (!session?.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!req.file) {
    return res.status(400).json({ error: "No image file provided" });
  }

  // Return the URL to access the image
  const imageUrl = `/uploads/${req.file.filename}`;
  return res.json({ imageUrl });
});

// Static route to serve uploaded images
import express from "express";
router.use(
  "/uploads",
  express.static(path.join(process.cwd(), "storage", "posts")),
);

export default router;
