// src/context/AuthProvider.jsx
import React, { useState, useEffect } from "react";
import { apiClient } from "../api/client";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  const signup = async (email, password) => {
    const result = await apiClient.signup(email, password);
    if (result.success) {
      setCurrentUser(result.user);
      setToken(result.session.access_token);
      localStorage.setItem("app_token", result.session.access_token);
      localStorage.setItem("app_user", JSON.stringify(result.user));
    }
    return result;
  };

  const login = async (email, password) => {
    const result = await apiClient.login(email, password);
    if (result.success) {
      setCurrentUser(result.user);
      setToken(result.session.access_token);
      localStorage.setItem("app_token", result.session.access_token);
      localStorage.setItem("app_user", JSON.stringify(result.user));
    }
    return result;
  };

  const logout = async () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem("app_token");
    localStorage.removeItem("app_user");
    return { success: true };
  };

  const activate = async (key) => {
    if (!token) return { success: false, error: "Не авторизован" };
    const result = await apiClient.activate(key, token);
    if (result.success) {
      setHasAccess(true);
      setSubscription({ status: "active" });
    }
    return result;
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("app_token");
    const savedUser = localStorage.getItem("app_user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setCurrentUser(JSON.parse(savedUser));
      // TODO: проверить статус подписки через API
    }
    setLoading(false);
  }, []);

  const value = {
    currentUser,
    hasAccess,
    subscription,
    signup,
    login,
    logout,
    activate,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
