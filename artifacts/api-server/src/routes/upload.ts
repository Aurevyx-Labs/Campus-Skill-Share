import { Router } from "express";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";
import { getSessionId, getSession } from "../lib/auth";

const router = Router();

// Create Supabase client with SERVICE_ROLE key (bypasses RLS)
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!, // ← using service_role, not anon
);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
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
  try {
    const sid = getSessionId(req);
    const session = sid ? await getSession(sid) : null;
    if (!session?.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      return res.status(500).json({ error: "Supabase credentials missing" });
    }

    const fileExt = req.file.originalname.split(".").pop();
    const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from("posts")
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return res
        .status(500)
        .json({ error: "Supabase upload failed: " + error.message });
    }

    const { data: urlData } = supabase.storage
      .from("posts")
      .getPublicUrl(fileName);

    return res.json({ imageUrl: urlData.publicUrl });
  } catch (err: any) {
    console.error("Upload error:", err);
    return res.status(500).json({ error: "Upload error: " + err.message });
  }
});

export default router;
