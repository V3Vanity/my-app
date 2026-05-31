// src/context/AuthProvider.jsx
import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "../supabase/client";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const processingRef = useRef(false);

  const updateUserState = (userData) => {
    console.log("updateUserState called with:", userData);
    setUser(userData || null);
  };

  // 🔧 ИСПРАВЛЕНО: загружаем ПОЛНЫЙ объект пользователя
  const loadUserData = async (supabaseUser) => {
    if (!supabaseUser) return null;

    console.log("loadUserData for:", supabaseUser.email);

    // Возвращаем ВСЕ данные пользователя из Supabase Auth
    return {
      id: supabaseUser.id, // 👈 ДОБАВЛЯЕМ ID!
      email: supabaseUser.email,
      name: supabaseUser.user_metadata?.name,
      created_at: supabaseUser.created_at,
    };
  };

  const login = useCallback(async (email, password) => {
    console.log("=== LOGIN START ===");
    processingRef.current = true;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log("Login response:", { data, error });

      if (error) throw error;

      if (data?.user) {
        const userInfo = await loadUserData(data.user);
        updateUserState(userInfo);
      }

      return data;
    } finally {
      setTimeout(() => {
        processingRef.current = false;
      }, 1000);
    }
  }, []);

  const register = useCallback(async (email, password, name) => {
    console.log("=== REGISTER START ===");
    processingRef.current = true;

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });

      console.log("Register response:", {
        user: data?.user,
        session: data?.session ? "Session created" : "No session",
        error,
      });

      if (error) throw error;

      if (data?.user) {
        console.log("User registered:", data.user.email);
        console.log("Confirmation email sent to:", data.user.email);

        if (data.session) {
          console.log("⚠️ Session created — waiting for email confirmation");
          await supabase.auth.signOut({ scope: "local" });
          updateUserState(null);
        }
      }

      return data;
    } finally {
      setTimeout(() => {
        processingRef.current = false;
      }, 1000);
    }
  }, []);

  const logout = useCallback(async () => {
    console.log("=== LOGOUT START ===");
    processingRef.current = true;
    updateUserState(null);

    try {
      await supabase.auth.signOut({ scope: "local" });

      Object.keys(localStorage).forEach((key) => {
        if (key.includes("supabase") || key.startsWith("sb-")) {
          localStorage.removeItem(key);
        }
      });
      sessionStorage.clear();
    } catch (err) {
      console.error("Logout exception:", err);
    } finally {
      setTimeout(() => {
        processingRef.current = false;
        window.location.replace("/");
      }, 200);
    }
  }, []);

  useEffect(() => {
    console.log("=== AuthProvider useEffect ===");

    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        console.log("Initial session:", session);

        if (session?.user) {
          const userInfo = await loadUserData(session.user);
          updateUserState(userInfo);
        } else {
          updateUserState(null);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        updateUserState(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("=== AUTH STATE CHANGE ===");
      console.log("Event:", event);
      console.log("processingRef.current:", processingRef.current);

      if (processingRef.current) {
        console.log("⚠️ Skipping - manual operation in progress");
        return;
      }

      try {
        if (
          (event === "SIGNED_IN" ||
            event === "USER_UPDATED" ||
            event === "TOKEN_REFRESHED" ||
            event === "INITIAL_SESSION") &&
          session?.user
        ) {
          const userInfo = await loadUserData(session.user);
          updateUserState(userInfo);
        } else if (event === "SIGNED_OUT") {
          updateUserState(null);
        }
      } catch (error) {
        console.error("Auth state change error:", error);
      }
    });

    return () => {
      console.log("Unsubscribing from auth changes");
      subscription.unsubscribe();
    };
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
