import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { INITIAL_SEED_DATA } from "../data/initialData";

const STORAGE_KEY_SUPABASE_CONFIG = "rejekimacan_supabase_config";

export interface SupabaseConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

const DEFAULT_SUPABASE_URL = "https://sucuzvnbqotbbmlnlfwh.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1Y3V6dm5icW90YmJtbG5sZndoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5NTcxNDUsImV4cCI6MjEwMjUzMzE0NX0.7O8gqybWXt6s-I7bFsQYJBrWfC4GVMIcCx-cRKReiM8";

export function getSupabaseConfig(): SupabaseConfig {
  // 1. Check localStorage first (user configured in Admin Dashboard)
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SUPABASE_CONFIG);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.supabaseUrl && parsed.supabaseAnonKey) {
        // Auto-fix truncated key if user saved old key ending with ReiM without 8
        if (parsed.supabaseAnonKey.endsWith("ReiM")) {
          parsed.supabaseAnonKey = parsed.supabaseAnonKey + "8";
          localStorage.setItem(STORAGE_KEY_SUPABASE_CONFIG, JSON.stringify(parsed));
        }
        return parsed;
      }
    }
  } catch (e) {}

  // 2. Check import.meta.env, fallback to embedded default keys
  const meta = import.meta as any;
  const envUrl = meta?.env?.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const envKey = meta?.env?.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

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

    // If table exists but has no row yet (empty), automatically initialize with initial seed data!
    console.log("Supabase app_state is empty. Initializing first row...");
    const initData = JSON.parse(JSON.stringify(INITIAL_SEED_DATA));
    await saveSupabaseDB(initData);
    return initData;
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

// Comprehensive diagnostic test for Supabase connection
export async function testSupabaseConnectionDetails(): Promise<{
  ok: boolean;
  message: string;
  code?: string;
  details?: string;
}> {
  const config = getSupabaseConfig();
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    return {
      ok: false,
      message: "Supabase URL atau Anon Key masih kosong."
    };
  }

  const client = getSupabaseClient();
  if (!client) {
    return {
      ok: false,
      message: "Format URL atau Anon Key tidak valid."
    };
  }

  try {
    const { data, error } = await client
      .from("app_state")
      .select("key")
      .limit(1);

    if (error) {
      if (error.code === "42P01" || error.message?.includes("does not exist") || error.message?.includes("relation")) {
        return {
          ok: false,
          code: error.code,
          message: "Tabel 'app_state' belum ada di database Supabase Anda.",
          details: "Jalankan script SQL pembuatan tabel di Supabase SQL Editor."
        };
      }
      if (error.code === "42501" || error.message?.includes("row level security") || error.message?.includes("policy")) {
        return {
          ok: false,
          code: error.code,
          message: "Izin akses (RLS) memblokir tabel 'app_state'.",
          details: "Jalankan policy SQL: create policy \"Allow all access\" on app_state for all using (true) with check (true);"
        };
      }
      return {
        ok: false,
        code: error.code,
        message: `Supabase Error: ${error.message}`,
        details: error.details || error.hint || ""
      };
    }

    return {
      ok: true,
      message: "Koneksi Supabase Cloud Berhasil 100%! Tabel 'app_state' aktif dan siap sinkron."
    };
  } catch (err: any) {
    return {
      ok: false,
      message: `Gagal menghubungi server Supabase: ${err?.message || err}`
    };
  }
}
