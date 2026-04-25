// src/context/AuthProvider.jsx
import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { supabase } from "../supabase/client";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionActive, setSubscriptionActive] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);

      // Получаем текущую сессию из Supabase
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        // Получаем данные пользователя из таблицы users
        const { data: userData, error } = await supabase
          .from("users")
          .select("email, name, subscription_status")
          .eq("email", session.user.email)
          .single();

        if (userData && !error) {
          const userInfo = {
            email: userData.email,
            name: userData.name,
            subscription_status: userData.subscription_status,
          };
          setUser(userInfo);
          setSubscriptionActive(userData.subscription_status === "active");

          // Сохраняем в localStorage для быстрого доступа
          localStorage.setItem("user_data", JSON.stringify(userInfo));
        }
      } else {
        // Очищаем localStorage если нет сессии
        localStorage.removeItem("user_data");
      }

      setLoading(false);
    };

    initAuth();

    // Подписываемся на изменения авторизации
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        // При входе — загружаем данные пользователя
        const { data: userData } = await supabase
          .from("users")
          .select("email, name, subscription_status")
          .eq("email", session.user.email)
          .single();

        if (userData) {
          const userInfo = {
            email: userData.email,
            name: userData.name,
            subscription_status: userData.subscription_status,
          };
          setUser(userInfo);
          setSubscriptionActive(userData.subscription_status === "active");
          localStorage.setItem("user_data", JSON.stringify(userInfo));
        }
      } else if (event === "SIGNED_OUT") {
        // При выходе — очищаем всё
        setUser(null);
        setSubscriptionActive(false);
        localStorage.removeItem("user_data");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // После успешного входа, загружаем данные пользователя
    const { data: userData } = await supabase
      .from("users")
      .select("email, name, subscription_status")
      .eq("email", data.user.email)
      .single();

    const userInfo = {
      email: userData.email,
      name: userData.name,
      subscription_status: userData.subscription_status,
    };

    setUser(userInfo);
    setSubscriptionActive(userData.subscription_status === "active");
    localStorage.setItem("user_data", JSON.stringify(userInfo));

    return { user: userInfo, session: data.session };
  };

  const signup = async (email, password, name) => {
    // 1. Регистрируем пользователя в Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    // 2. Создаём запись в таблице users
    const { data: userData, error: userError } = await supabase
      .from("users")
      .insert([
        {
          email,
          name,
          subscription_status: "inactive",
          user_id: authData.user?.id,
        },
      ])
      .select()
      .single();

    if (userError) throw userError;

    const userInfo = {
      email: userData.email,
      name: userData.name,
      subscription_status: userData.subscription_status,
    };

    setUser(userInfo);
    setSubscriptionActive(false);
    localStorage.setItem("user_data", JSON.stringify(userInfo));

    return { user: userInfo, session: authData.session };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSubscriptionActive(false);
    localStorage.removeItem("user_data");
  };

  const updateUser = (userData) => {
    localStorage.setItem("user_data", JSON.stringify(userData));
    setUser(userData);
    setSubscriptionActive(userData.subscription_status === "active");
  };

  const updateSubscription = async (isActive) => {
    if (!user) return;

    const newStatus = isActive ? "active" : "inactive";

    // Обновляем в Supabase
    const { error } = await supabase
      .from("users")
      .update({ subscription_status: newStatus })
      .eq("email", user.email);

    if (error) {
      console.error("Ошибка обновления подписки:", error);
      return;
    }

    // Обновляем локальное состояние
    setSubscriptionActive(isActive);
    const updatedUser = {
      ...user,
      subscription_status: newStatus,
    };
    localStorage.setItem("user_data", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
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
