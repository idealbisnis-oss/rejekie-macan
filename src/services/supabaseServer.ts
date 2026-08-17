import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseServerClient(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient;

  const url =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    "https://sucuzvnbqotbbmlnlfwh.supabase.co";

  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;

  if (url && key) {
    try {
      supabaseClient = createClient(url, key, {
        auth: { persistSession: false }
      });
    } catch (e) {
      console.error("Failed to initialize Supabase client:", e);
    }
  }

  return supabaseClient;
}

export async function fetchRemoteDB(initialFallback: any): Promise<any> {
  const client = getSupabaseServerClient();
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

    // If table exists but empty, seed it
    await saveRemoteDB(initialFallback);
    return initialFallback;
  } catch (err) {
    console.error("Error reading from Supabase:", err);
    return null;
  }
}

export async function saveRemoteDB(data: any): Promise<boolean> {
  const client = getSupabaseServerClient();
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
    console.error("Error saving to Supabase:", err);
    return false;
  }
}
