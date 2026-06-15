"use client";

import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

export function createBrowserSupabase() {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    return null;
  }
  return createClient(env.supabaseUrl, env.supabaseAnonKey);
}
