// src/supabase/client.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "❌ Supabase credentials not found!\n" +
      "Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file",
  );
}

console.log("=== SUPABASE INIT ===");
console.log("URL:", supabaseUrl);
console.log("KEY present:", !!supabaseAnonKey);
console.log("Hostname:", new URL(supabaseUrl).hostname);

// Создаём клиент с минимальными настройками
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false, // Меняем на false для теста
    storage: localStorage,
  },
});
