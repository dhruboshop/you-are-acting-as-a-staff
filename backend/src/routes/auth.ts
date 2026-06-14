import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/http.js";

const router = Router();

router.get("/me", requireAuth, asyncHandler(async (req, res) => {
  res.json({
    user: {
      id: req.authUser?.id,
      email: req.authUser?.email,
      fullName: req.authUser?.user_metadata?.full_name ?? req.authUser?.user_metadata?.name ?? null,
      avatarUrl: req.authUser?.user_metadata?.avatar_url ?? null
    }
  });
}));

export default router;
