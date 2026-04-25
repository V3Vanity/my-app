// src/supabase/client.js
import { createClient } from "@supabase/supabase-js";

// Переменные окружения
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Проверка наличия переменных
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "❌ Supabase credentials not found!\n" +
      "Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file",
  );
}

// Создаём клиент Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Сохраняем сессию в localStorage
    autoRefreshToken: true, // Автоматически обновляем токен
    detectSessionInUrl: true, // Определяем сессию из URL (для OAuth)
    storage: localStorage, // Хранилище для сессии
  },
});

// Вспомогательная функция для проверки статуса подписки
export const checkSubscriptionStatus = async (userId) => {
  const { data, error } = await supabase
    .from("users")
    .select("subscription_status")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error checking subscription:", error);
    return "inactive";
  }

  return data?.subscription_status || "inactive";
};

// Вспомогательная функция для получения текущего пользователя с данными из таблицы
export const getCurrentUserWithDetails = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: userData, error } = await supabase
    .from("users")
    .select("email, name, subscription_status")
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Error fetching user details:", error);
    return null;
  }

  return {
    id: user.id,
    email: userData.email,
    name: userData.name,
    subscription_status: userData.subscription_status,
  };
};
