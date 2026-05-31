// src/supabase/client.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: { "x-my-custom-header": "my-app" },
  },
  db: {
    schema: "public",
  },
  realtime: {
    params: {
      eventsPerSecond: 2, // Ограничиваем realtime события
    },
  },
});
