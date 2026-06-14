import { createClient } from "@supabase/supabase-js";
import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { queryOne } from "../db/pool.js";
import { HttpError } from "../utils/http.js";

const supabaseAuth = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;
  if (!token) return next(new HttpError(401, "Missing bearer token"));

  const { data, error } = await supabaseAuth.auth.getUser(token);
  if (error || !data.user) return next(new HttpError(401, "Invalid or expired token"));

  req.authUser = data.user;
  const row = await queryOne<{ id: string }>(
    `insert into users (id, email, full_name, avatar_url)
     values ($1, $2, $3, $4)
     on conflict (id) do update set
       email = excluded.email,
       full_name = excluded.full_name,
       avatar_url = excluded.avatar_url,
       updated_at = now()
     returning id`,
    [
      data.user.id,
      data.user.email ?? null,
      data.user.user_metadata?.full_name ?? data.user.user_metadata?.name ?? null,
      data.user.user_metadata?.avatar_url ?? null
    ]
  );
  req.ownerUserId = row?.id ?? data.user.id;
  return next();
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  const role = req.authUser?.app_metadata?.role;
  if (role !== "admin") return next(new HttpError(403, "Admin access required"));
  return next();
}
