// src/components/YooKassaPayment.jsx
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

const API_URL = "https://kostromagid.ru/backend/api";

export const YooKassaPayment = ({ amount = "990.00", onError }) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handlePayment = async () => {
    if (!user?.id) {
      onError?.(new Error("Пожалуйста, войдите в аккаунт"));
      return;
    }

    setLoading(true);

    try {
      const returnUrl = `${window.location.origin}/app`;

      const response = await fetch(`${API_URL}/payments/create.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          amount,
          description: "Доступ к электронному путеводителю по Костроме",
          returnUrl,
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ошибка создания платежа");
      }

      if (data.confirmationUrl) {
        window.location.href = data.confirmationUrl;
      }
    } catch (err) {
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="landing-pricing-btn"
      onClick={handlePayment}
      disabled={loading}
    >
      {loading ? "Перенаправление..." : "Купить воспоминания"}
    </button>
  );
};
