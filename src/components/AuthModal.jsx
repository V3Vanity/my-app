// src/components/AuthModal.jsx
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { apiClient } from "../api/client";
import "./AuthModal.css";

export const AuthModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Добавляем отладочный вывод
    console.log("=== Form Submit ===");
    console.log("Mode:", isLogin ? "login" : "signup");
    console.log("Email:", email);
    console.log("Password:", password ? "***" : "empty");
    console.log("Name:", name);

    try {
      // Валидация
      if (!email || !email.trim()) {
        throw new Error("Пожалуйста, введите email");
      }

      if (!password || !password.trim()) {
        throw new Error("Пожалуйста, введите пароль");
      }

      if (!isLogin && (!name || !name.trim())) {
        throw new Error("Пожалуйста, введите имя");
      }

      let response;

      if (isLogin) {
        console.log("Calling login with:", {
          email: email.trim(),
          password: password,
        });
        response = await apiClient.login(email.trim(), password);
      } else {
        console.log("Calling signup with:", {
          email: email.trim(),
          password: password,
          name: name.trim(),
        });
        response = await apiClient.signup(email.trim(), password, name.trim());
      }

      console.log("API Response:", response);

      // Проверяем структуру ответа от функции
      if (response && response.success) {
        const userData = response.user;
        const token = response.session?.access_token;

        if (userData && token) {
          console.log("Login successful, storing token");
          login(userData, token);
          onClose();
        } else {
          throw new Error("Неверный формат ответа от сервера");
        }
      } else {
        throw new Error(response?.error || "Ошибка авторизации");
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError(err.message || "Произошла ошибка. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose}>
          ×
        </button>

        <h2>{isLogin ? "Вход" : "Регистрация"}</h2>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              placeholder="Имя"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />

          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />

          {error && <div className="auth-modal-error">{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? "Загрузка..." : isLogin ? "Войти" : "Зарегистрироваться"}
          </button>
        </form>

        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setError("");
            // Не очищаем поля при переключении, чтобы пользователь не терял введенные данные
          }}
          className="auth-modal-switch"
          disabled={loading}
        >
          {isLogin
            ? "Нет аккаунта? Зарегистрироваться"
            : "Уже есть аккаунт? Войти"}
        </button>
      </div>
    </div>
  );
};
