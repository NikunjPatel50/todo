"use client";

import { createClient, type InsForgeClient } from "@insforge/sdk";
import { INSFORGE_ANON_KEY, INSFORGE_URL } from "@/lib/insforge-config";

export type Todo = {
  id: string;
  title: string;
  is_completed: boolean;
  created_at: string;
};

let client: InsForgeClient | undefined;

export function getInsforge(): InsForgeClient {
  if (client) return client;

  const baseUrl =
    process.env.NEXT_PUBLIC_INSFORGE_URL ??
    process.env.NEXT_PUBLIC_INSFORGE_BASE_URL ??
    INSFORGE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY ?? INSFORGE_ANON_KEY;

  client = createClient({ baseUrl, anonKey });
  return client;
}
