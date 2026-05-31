// src/hooks/usePreloadData.js
import { useEffect } from "react";
import { supabase } from "../supabase/client";

export function usePreloadData(userId) {
  useEffect(() => {
    if (!userId) return;

    // Предзагружаем данные в кеш
    const preload = async () => {
      // Предзагружаем профиль
      const { data } = await supabase
        .from("user_profiles")
        .select("has_paid_access, subscription_status")
        .eq("id", userId)
        .limit(1);

      if (data) {
        localStorage.setItem(`profile_${userId}`, JSON.stringify(data[0]));
      }
    };

    preload();
  }, [userId]);
}
