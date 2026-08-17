/**
 * Supabase Cloud Storage Helper
 * Digunakan jika Anda menghubungkan project ke database Supabase Cloud di Vercel.
 *
 * Setup Environment Variables di Vercel:
 * - VITE_SUPABASE_URL = https://your-project-id.supabase.co
 * - VITE_SUPABASE_ANON_KEY = your-anon-key
 */

export const isSupabaseConfigured = () => {
  const meta = import.meta as any;
  const url = meta?.env?.VITE_SUPABASE_URL;
  const key = meta?.env?.VITE_SUPABASE_ANON_KEY;
  return Boolean(url && key && url !== "" && key !== "");
};

export const getSupabaseConfig = () => {
  const meta = import.meta as any;
  return {
    supabaseUrl: meta?.env?.VITE_SUPABASE_URL || "",
    supabaseKey: meta?.env?.VITE_SUPABASE_ANON_KEY || ""
  };
};

