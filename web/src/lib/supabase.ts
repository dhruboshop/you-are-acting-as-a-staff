"use client";

import { createBrowserClient } from "@supabase/ssr";
import { env } from "./env";

export function createBrowserSupabase() {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    return null;
  }
  return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
}
