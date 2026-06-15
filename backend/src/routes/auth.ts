import { Router } from "express";
import { queryOne } from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/http.js";

const router = Router();

type OnboardingShopRow = {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  merchant_status: "TRIAL" | "ACTIVE" | "EXPIRED" | "BLOCKED";
  trial_ends_at: string | null;
  whatsapp_status: string | null;
  whatsapp_instance_name: string | null;
};

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

router.get("/onboarding", requireAuth, asyncHandler(async (req, res) => {
  const shop = await queryOne<OnboardingShopRow>(
    `select
       s.id,
       s.name,
       s.phone,
       s.address,
       s.merchant_status,
       s.trial_ends_at,
       wc.status as whatsapp_status,
       wc.instance_name as whatsapp_instance_name
     from shops s
     left join whatsapp_connections wc on wc.shop_id = s.id
     where s.owner_user_id = $1 and s.deleted_at is null
     order by s.created_at desc
     limit 1`,
    [req.ownerUserId]
  );

  const hasShop = Boolean(shop);
  const isWhatsAppConnected = shop?.whatsapp_status === "open" || shop?.whatsapp_status === "connected";
  const nextRoute = !hasShop
    ? "/onboarding/shop"
    : !isWhatsAppConnected
      ? "/onboarding/whatsapp"
      : "/app/dashboard";

  res.json({
    user: {
      id: req.authUser?.id,
      email: req.authUser?.email,
      fullName: req.authUser?.user_metadata?.full_name ?? req.authUser?.user_metadata?.name ?? null,
      avatarUrl: req.authUser?.user_metadata?.avatar_url ?? null
    },
    merchant: {
      id: req.ownerUserId
    },
    shop: shop
      ? {
          id: shop.id,
          name: shop.name,
          phone: shop.phone,
          address: shop.address,
          merchantStatus: shop.merchant_status,
          trialEndsAt: shop.trial_ends_at
        }
      : null,
    whatsapp: shop?.whatsapp_status
      ? {
          status: shop.whatsapp_status,
          instanceName: shop.whatsapp_instance_name,
          connected: isWhatsAppConnected
        }
      : {
          status: "not_connected",
          instanceName: null,
          connected: false
        },
    nextRoute,
    onboardingComplete: nextRoute === "/app/dashboard"
  });
}));

export default router;
