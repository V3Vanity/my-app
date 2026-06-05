// src/context/AuthProvider.jsx
import { useEffect, useState, useCallback } from "react";
import { AuthContext } from "./AuthContext";

const API_URL = "https://kostromagid.ru/backend/api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Проверка авторизации при загрузке
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/me.php`, {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Регистрация
  const register = useCallback(async (email, password, name) => {
    console.log("=== REGISTER API CALL ===");

    const response = await fetch(`${API_URL}/auth/register.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password, name }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Ошибка регистрации");
    }

    console.log("Register response:", data);
    return data;
  }, []);

  // Логин
  const login = useCallback(async (email, password) => {
    console.log("=== LOGIN API CALL ===");

    const response = await fetch(`${API_URL}/auth/login.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Ошибка входа");
    }

    setUser(data.user);
    console.log("Login response:", data);
    return data;
  }, []);

  // Выход
  const logout = useCallback(async () => {
    try {
      await fetch(`${API_URL}/auth/logout.php`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      window.location.href = "/";
    }
  }, []);

  const value = {
    user,
    loading,
    login,
    register,
    signup: register,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
