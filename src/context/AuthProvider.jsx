// src/context/AuthProvider.jsx
import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "../supabase/client";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const processingRef = useRef(false);

  const updateUserState = useCallback((userData) => {
    console.log("updateUserState called with:", userData);
    setUser(userData || null);
  }, []);

  const loadUserData = useCallback(async (email) => {
    if (!email) return null;
    console.log("loadUserData for:", email);
    return { email };
  }, []);

  const login = useCallback(
    async (email, password) => {
      console.log("=== LOGIN START ===");
      processingRef.current = true;

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        console.log("Login response:", { data, error });

        if (error) {
          processingRef.current = false;
          throw error;
        }

        if (data?.user?.email) {
          const userInfo = await loadUserData(data.user.email);
          updateUserState(userInfo);
        }

        setTimeout(() => {
          processingRef.current = false;
        }, 1000);

        return data;
      } catch (err) {
        processingRef.current = false;
        throw err;
      }
    },
    [loadUserData, updateUserState],
  );

  const register = useCallback(
    async (email, password, name) => {
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

        console.log("Register response:", { data, error });

        if (error) {
          processingRef.current = false;
          throw error;
        }

        if (data?.user?.email) {
          const userInfo = await loadUserData(data.user.email);
          updateUserState(userInfo);
        }

        setTimeout(() => {
          processingRef.current = false;
        }, 1000);

        return data;
      } catch (err) {
        processingRef.current = false;
        throw err;
      }
    },
    [loadUserData, updateUserState],
  );

  const logout = useCallback(async () => {
    console.log("=== LOGOUT START ===");

    processingRef.current = true;
    updateUserState(null);

    try {
      console.log("Calling supabase.auth.signOut()...");

      const { error } = await supabase.auth.signOut({
        scope: "local",
      });

      console.log("SignOut response:", { error });

      if (error) {
        console.error("Logout error:", error);
      }

      console.log("Clearing localStorage...");

      Object.keys(localStorage).forEach((key) => {
        if (key.includes("supabase") || key.startsWith("sb-")) {
          console.log("Removing:", key);
          localStorage.removeItem(key);
        }
      });

      sessionStorage.clear();

      console.log("Current localStorage:", { ...localStorage });
    } catch (err) {
      console.error("Logout exception:", err);
    } finally {
      console.log("Redirecting to / ...");

      setTimeout(() => {
        processingRef.current = false;
        window.location.replace("/");
      }, 200);
    }
  }, [updateUserState]);

  useEffect(() => {
    console.log("=== AuthProvider useEffect ===");

    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        console.log("Initial session:", session);

        if (session?.user?.email) {
          const userInfo = await loadUserData(session.user.email);
          updateUserState(userInfo);
        } else {
          updateUserState(null);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        updateUserState(null);
      } finally {
        setLoading(false);
        console.log("Loading set to false");
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("=== AUTH STATE CHANGE ===");
      console.log("Event:", event);
      console.log("Session:", session?.user?.email);
      console.log("processingRef.current:", processingRef.current);

      if (processingRef.current) {
        console.log("⚠️ Skipping - manual operation in progress");
        return;
      }

      try {
        switch (event) {
          case "SIGNED_IN":
            if (session?.user?.email) {
              console.log("✅ Handling SIGNED_IN");
              const userInfo = await loadUserData(session.user.email);
              updateUserState(userInfo);
            }
            break;

          case "SIGNED_OUT":
            console.log("✅ Handling SIGNED_OUT");
            updateUserState(null);
            break;

          case "USER_UPDATED":
            if (session?.user?.email) {
              console.log("✅ Handling USER_UPDATED");
              const userInfo = await loadUserData(session.user.email);
              updateUserState(userInfo);
            }
            break;

          case "TOKEN_REFRESHED":
            console.log("✅ Handling TOKEN_REFRESHED");
            if (session?.user?.email) {
              const userInfo = await loadUserData(session.user.email);
              updateUserState(userInfo);
            }
            break;

          case "INITIAL_SESSION":
            console.log("✅ Handling INITIAL_SESSION");
            if (session?.user?.email) {
              const userInfo = await loadUserData(session.user.email);
              updateUserState(userInfo);
            }
            break;

          default:
            console.log("ℹ️ Unhandled event:", event);
        }
      } catch (error) {
        console.error("Auth state change error:", error);
      }
    });

    return () => {
      console.log("Unsubscribing from auth changes");
      subscription.unsubscribe();
    };
  }, [loadUserData, updateUserState]);

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
