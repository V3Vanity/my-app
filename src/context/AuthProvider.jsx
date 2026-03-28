// src/context/AuthProvider.jsx
import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionActive, setSubscriptionActive] = useState(false);

  useEffect(() => {
    const loadAuthData = async () => {
      const token = localStorage.getItem("auth_token");
      const userData = localStorage.getItem("user_data");

      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);

          // Проверяем статус подписки
          try {
            const { apiClient } = await import("../api/client");
            const response = await apiClient.checkSubscription();
            setSubscriptionActive(response.is_active);

            // Обновляем статус в localStorage
            const updatedUser = {
              ...parsedUser,
              subscription_status: response.subscription_status,
            };
            localStorage.setItem("user_data", JSON.stringify(updatedUser));
            setUser(updatedUser);
          } catch (err) {
            console.error("Error checking subscription:", err);
          }
        } catch (error) {
          console.error("Ошибка при загрузке данных пользователя:", error);
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user_data");
        }
      }
      setLoading(false);
    };

    loadAuthData();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem("auth_token", token);
    localStorage.setItem("user_data", JSON.stringify(userData));
    setUser(userData);
    setSubscriptionActive(userData.subscription_status === "active");
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    setUser(null);
    setSubscriptionActive(false);
  };

  const updateUser = (userData) => {
    localStorage.setItem("user_data", JSON.stringify(userData));
    setUser(userData);
    setSubscriptionActive(userData.subscription_status === "active");
  };

  const updateSubscription = (isActive) => {
    setSubscriptionActive(isActive);
    if (user) {
      const updatedUser = {
        ...user,
        subscription_status: isActive ? "active" : "inactive",
      };
      localStorage.setItem("user_data", JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        updateUser,
        updateSubscription,
        isAuthenticated: !!user,
        hasSubscription: subscriptionActive,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
