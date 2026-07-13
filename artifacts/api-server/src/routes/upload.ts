import { Router } from "express";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";
import { getSessionId, getSession } from "../lib/auth";

const router = Router();

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const upload = multer({
  storage: multer.memoryStorage(),
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

  // Generate a unique filename
  const fileExt = req.file.originalname.split(".").pop();
  const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from("posts") // bucket name
    .upload(fileName, req.file.buffer, {
      contentType: req.file.mimetype,
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Supabase upload error:", error);
    return res.status(500).json({ error: "Failed to upload image" });
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("posts")
    .getPublicUrl(fileName);

  const imageUrl = urlData.publicUrl;

  return res.json({ imageUrl });
});

export default router;
