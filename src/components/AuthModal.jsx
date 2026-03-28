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

    try {
      let response;

      if (isLogin) {
        response = await apiClient.login(email, password);
      } else {
        response = await apiClient.signup(email, password, name);
      }

      // Проверяем структуру ответа от функции
      if (response && response.success) {
        const userData = response.user;
        const token = response.session?.access_token;

        if (userData && token) {
          login(userData, token);
          onClose();
        } else {
          throw new Error("Неверный формат ответа от сервера");
        }
      } else {
        throw new Error(response.error || "Ошибка авторизации");
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
