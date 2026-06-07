"use client";

import { createClient, type InsForgeClient } from "@insforge/sdk";

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
    process.env.NEXT_PUBLIC_INSFORGE_BASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

  if (!baseUrl || !anonKey) {
    throw new Error(
      "Missing InsForge configuration. Add NEXT_PUBLIC_INSFORGE_URL and NEXT_PUBLIC_INSFORGE_ANON_KEY to .env.local, then restart the dev server.",
    );
  }

  client = createClient({ baseUrl, anonKey });
  return client;
}
