// src/components/YooKassaPayment.jsx
import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";

export const YooKassaPayment = ({ amount = "990.00", onError }) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handlePayment = async () => {
    setLoading(true);

    try {
      // ПРОВЕРКА: убедимся, что пользователь есть
      console.log("👤 useAuth user:", user);

      if (!user || !user.id) {
        console.error("❌ Нет user.id!", user);
        throw new Error("Пожалуйста, войдите в аккаунт");
      }

      const userId = user.id;
      console.log("✅ userId для платежа:", userId);

      const returnUrl = `${window.location.origin}/app`;
      console.log("🔙 returnUrl:", returnUrl);

      localStorage.setItem("last_payment_time", String(Date.now()));

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-redirect`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            amount,
            description: "Доступ к электронному путеводителю по Костроме",
            userId: userId, // 👈 Убедитесь, что это строка
            returnUrl,
          }),
        },
      );

      const data = await response.json();
      console.log("📦 Ответ функции:", data);

      if (!response.ok) {
        throw new Error(data.error || "Ошибка создания платежа");
      }

      if (data.confirmationUrl) {
        window.location.href = data.confirmationUrl;
      } else {
        throw new Error("No confirmation URL received");
      }
    } catch (err) {
      console.error("Payment error:", err);
      onError?.(err);
      setLoading(false);
    }
  };

  return (
    <button
      className="landing-pricing-btn"
      onClick={handlePayment}
      disabled={loading}
      style={{
        opacity: loading ? 0.7 : 1,
        cursor: loading ? "wait" : "pointer",
      }}
    >
      {loading ? "Перенаправление..." : "Купить воспоминания"}
    </button>
  );
};
