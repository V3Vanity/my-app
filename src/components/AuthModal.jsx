// src/components/AuthModal.jsx
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { apiClient } from "../api/client";
import "./AuthModal.css";

export const AuthModal = ({ isOpen, onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Новые состояния для соглашений
  const [agreeLocation, setAgreeLocation] = useState(false);
  const [agreeOffer, setAgreeOffer] = useState(false);
  const [showOfferText, setShowOfferText] = useState(false);

  const { login } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Проверка обязательных соглашений ТОЛЬКО при регистрации
    if (!isLogin && (!agreeLocation || !agreeOffer)) {
      setError("Для регистрации необходимо принять все условия");
      return;
    }

    setLoading(true);

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

        // При регистрации сохраняем согласия в localStorage
        if (response && response.success) {
          localStorage.setItem("location_consent", "true");
          localStorage.setItem("offer_consent", "true");
          localStorage.setItem("offer_consent_date", new Date().toISOString());
        }
      }

      console.log("API Response:", response);

      if (response && response.success) {
        const userData = response.user;
        const token = response.session?.access_token;

        if (userData && token) {
          console.log("Login successful, storing token");
          login(userData, token);

          // Вызываем onSuccess если передан
          if (onSuccess) {
            onSuccess();
          }
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

  // Сброс формы при переключении режима
  const handleSwitchMode = () => {
    setIsLogin(!isLogin);
    setError("");
    // Сбрасываем соглашения только при переключении на вход
    if (!isLogin) {
      setAgreeLocation(false);
      setAgreeOffer(false);
    }
  };

  return (
    <>
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

            {/* Соглашения - показываются только при регистрации */}
            {!isLogin && (
              <div className="agreements-section">
                {/* Соглашение на геопозицию */}
                <label className="agreement-checkbox">
                  <input
                    type="checkbox"
                    checked={agreeLocation}
                    onChange={(e) => setAgreeLocation(e.target.checked)}
                  />
                  <span className="agreement-text">
                    Я согласен(на) на обработку геолокационных данных для работы
                    карты и построения маршрутов в приложении
                  </span>
                </label>

                {/* Договор оферты */}
                <label className="agreement-checkbox">
                  <input
                    type="checkbox"
                    checked={agreeOffer}
                    onChange={(e) => setAgreeOffer(e.target.checked)}
                  />
                  <span className="agreement-text">
                    Я принимаю условия{" "}
                    <button
                      type="button"
                      className="agreement-link"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowOfferText(true);
                      }}
                    >
                      Договора оферты
                    </button>
                  </span>
                </label>
              </div>
            )}

            {error && <div className="auth-modal-error">{error}</div>}

            <button type="submit" disabled={loading}>
              {loading
                ? "Загрузка..."
                : isLogin
                  ? "Войти"
                  : "Зарегистрироваться"}
            </button>
          </form>

          <button
            onClick={handleSwitchMode}
            className="auth-modal-switch"
            disabled={loading}
          >
            {isLogin
              ? "Нет аккаунта? Зарегистрироваться"
              : "Уже есть аккаунт? Войти"}
          </button>
        </div>
      </div>

      {/* Модальное окно с текстом оферты */}
      {showOfferText && (
        <div
          className="offer-modal-overlay"
          onClick={() => setShowOfferText(false)}
        >
          <div className="offer-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="offer-modal-close"
              onClick={() => setShowOfferText(false)}
            >
              ×
            </button>
            <div className="offer-content">
              <h2>Договор оферты</h2>
              <div className="offer-text">
                <h3>1. Общие положения</h3>
                <p>
                  1.1. Настоящий Договор является официальной офертой
                  (предложением) Индивидуального предпринимателя [Твои данные]
                  (далее — «Исполнитель») любому физическому лицу (далее —
                  «Заказчик») заключить договор на оказание информационных услуг
                  на условиях, изложенных ниже.
                </p>

                <h3>2. Предмет договора</h3>
                <p>
                  2.1. Исполнитель предоставляет Заказчику доступ к электронному
                  путеводителю по городу Кострома, включающему:
                </p>
                <ul>
                  <li>Квест-экскурсию «Мазайские зайцы»</li>
                  <li>Гастро-тур по ресторанам</li>
                  <li>Культурную карту (храмы, музеи, семейные развлечения)</li>
                </ul>
                <p>
                  2.2. Стоимость Услуг составляет 990 (Девятьсот девяносто)
                  рублей.
                </p>
                <p>
                  2.3. Доступ предоставляется бессрочно с момента подтверждения
                  оплаты.
                </p>

                <h3>3. Права и обязанности сторон</h3>
                <p>
                  <strong>Исполнитель обязуется:</strong>
                </p>
                <ul>
                  <li>Обеспечить круглосуточный доступ к Услугам</li>
                  <li>Технически поддерживать работу Сайта</li>
                </ul>
                <p>
                  <strong>Заказчик обязуется:</strong>
                </p>
                <ul>
                  <li>Оплатить Услуги в полном объеме</li>
                  <li>Не передавать данные для входа третьим лицам</li>
                  <li>
                    Использовать Услуги только в личных некоммерческих целях
                  </li>
                </ul>

                <h3>4. Геопозиция</h3>
                <p>
                  4.1. Для корректной работы карты и построения маршрутов
                  необходимо предоставить доступ к геолокации.
                </p>
                <p>
                  4.2. Данные о местоположении используются только для работы
                  приложения и не передаются третьим лицам.
                </p>

                <h3>5. Ответственность сторон</h3>
                <p>
                  5.1. Исполнитель не несет ответственности за работу мобильных
                  операторов и интернет-провайдеров.
                </p>
                <p>5.2. Услуги предоставляются «как есть» (as is).</p>

                <h3>6. Возврат денежных средств</h3>
                <p>
                  6.1. Услуги надлежащего качества возврату не подлежат согласно
                  Постановлению Правительства РФ № 2463.
                </p>
                <p>
                  6.2. При технических проблемах, препятствующих использованию,
                  возврат осуществляется по заявлению.
                </p>

                <h3>7. Конфиденциальность</h3>
                <p>
                  7.1. Исполнитель обрабатывает персональные данные в
                  соответствии с Федеральным законом № 152-ФЗ «О персональных
                  данных».
                </p>

                <h3>8. Реквизиты</h3>
                <p>
                  ИП [Твои ФИО]
                  <br />
                  ИНН: [твой ИНН]
                  <br />
                  ОГРНИП: [твой ОГРНИП]
                  <br />
                  Email: [твой email]
                </p>

                <p>
                  <strong>Дата публикации:</strong> 1 марта 2025 г.
                </p>
              </div>
              <button
                className="offer-accept-btn"
                onClick={() => {
                  setAgreeOffer(true);
                  setShowOfferText(false);
                }}
              >
                Принимаю условия
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
