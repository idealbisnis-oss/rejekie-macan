import { createClient, SupabaseClient } from "@supabase/supabase-js";

const STORAGE_KEY_SUPABASE_CONFIG = "rejekimacan_supabase_config";

export interface SupabaseConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

const DEFAULT_SUPABASE_URL = "https://sucuzvnbqotbbmlnlfwh.supabase.co";

export function getSupabaseConfig(): SupabaseConfig {
  // 1. Check localStorage first (user configured in Admin Dashboard)
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SUPABASE_CONFIG);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.supabaseUrl && parsed.supabaseAnonKey) {
        return parsed;
      }
    }
  } catch (e) {}

  // 2. Check import.meta.env
  const meta = import.meta as any;
  const envUrl = meta?.env?.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const envKey = meta?.env?.VITE_SUPABASE_ANON_KEY || "";

  return {
    supabaseUrl: envUrl,
    supabaseAnonKey: envKey
  };
}

export function saveSupabaseConfig(config: SupabaseConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_SUPABASE_CONFIG, JSON.stringify(config));
    clientInstance = null; // Reset cached client
  } catch (e) {}
}

let clientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (clientInstance) return clientInstance;
  const config = getSupabaseConfig();
  if (config.supabaseUrl && config.supabaseAnonKey && config.supabaseAnonKey.trim() !== "") {
    try {
      clientInstance = createClient(config.supabaseUrl.trim(), config.supabaseAnonKey.trim(), {
        auth: { persistSession: false }
      });
    } catch (err) {
      console.error("Failed to create client-side Supabase client:", err);
      clientInstance = null;
    }
  }
  return clientInstance;
}

export const isSupabaseConfigured = (): boolean => {
  const config = getSupabaseConfig();
  return Boolean(config.supabaseUrl && config.supabaseAnonKey && config.supabaseAnonKey.trim() !== "");
};

// Fetch app state directly from Supabase
export async function fetchSupabaseDB(): Promise<any | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from("app_state")
      .select("data")
      .eq("key", "main")
      .maybeSingle();

    if (error) {
      console.warn("Supabase fetch warning:", error.message);
      return null;
    }

    if (data && data.data) {
      return data.data;
    }
    return null;
  } catch (err) {
    console.error("Supabase direct fetch error:", err);
    return null;
  }
}

// Save app state directly to Supabase
export async function saveSupabaseDB(data: any): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from("app_state").upsert(
      {
        key: "main",
        data: data,
        updated_at: new Date().toISOString()
      },
      { onConflict: "key" }
    );

    if (error) {
      console.warn("Supabase save warning:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Supabase direct save error:", err);
    return false;
  }
}
