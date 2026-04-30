// src/components/AuthModal.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import "./AuthModal.css";

export const AuthModal = ({ isOpen, onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  // Состояния для соглашений
  const [agreeLocation, setAgreeLocation] = useState(false);
  const [agreeOffer, setAgreeOffer] = useState(false);
  const [showOfferText, setShowOfferText] = useState(false);

  const { login, register } = useAuth();

  // Сбрасываем форму при открытии модалки
  useEffect(() => {
    if (isOpen) {
      setIsLogin(true);
      setEmail("");
      setPassword("");
      setName("");
      setError("");
      setLoading(false);
      setShowEmailConfirmation(false);
      setRegisteredEmail("");
      setAgreeLocation(false);
      setAgreeOffer(false);
      setShowOfferText(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setShowEmailConfirmation(false);

    if (!isLogin && (!agreeLocation || !agreeOffer)) {
      setError("Для регистрации необходимо принять все условия");
      return;
    }

    setLoading(true);

    console.log("=== Form Submit ===");
    console.log("Mode:", isLogin ? "login" : "signup");
    console.log("Email:", email);

    try {
      if (!email || !email.trim()) {
        throw new Error("Пожалуйста, введите email");
      }

      if (!password || !password.trim()) {
        throw new Error("Пожалуйста, введите пароль");
      }

      if (!isLogin && (!name || !name.trim())) {
        throw new Error("Пожалуйста, введите имя");
      }

      if (isLogin) {
        console.log("Calling login with:", { email: email.trim() });
        await login(email.trim(), password);
        console.log("Login successful");

        // После успешного входа
        if (onSuccess) onSuccess();
        onClose();
      } else {
        // РЕГИСТРАЦИЯ
        console.log("Calling register with:", {
          email: email.trim(),
          name: name.trim(),
        });

        const result = await register(email.trim(), password, name.trim());

        console.log("Register result:", result);

        // Сохраняем соглашения
        localStorage.setItem("location_consent", "true");
        localStorage.setItem("offer_consent", "true");
        localStorage.setItem("offer_consent_date", new Date().toISOString());

        // Показываем окно подтверждения email ВМЕСТО автоматического входа
        setRegisteredEmail(email.trim());
        setShowEmailConfirmation(true);

        // Очищаем поля формы
        setEmail("");
        setPassword("");
        setName("");
        setAgreeLocation(false);
        setAgreeOffer(false);
      }
    } catch (err) {
      console.error("Auth error:", err);

      // Обработка ошибок
      if (err.message === "Invalid login credentials") {
        setError("Неверный email или пароль");
      } else if (
        err.message &&
        err.message.includes("User already registered")
      ) {
        setError("Пользователь с таким email уже зарегистрирован");
      } else if (err.message === "Email not confirmed") {
        setError("Подтвердите email. Письмо отправлено на вашу почту.");
      } else {
        setError(err.message || "Произошла ошибка. Попробуйте позже.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setShowEmailConfirmation(false);
    setEmail("");
    setPassword("");
    setName("");
    setAgreeLocation(false);
    setAgreeOffer(false);
  };

  const handleCloseConfirmation = () => {
    setShowEmailConfirmation(false);
    onClose();
  };

  return (
    <>
      <div className="auth-modal-overlay" onClick={onClose}>
        <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
          <button className="auth-modal-close" onClick={onClose}>
            ×
          </button>

          {!showEmailConfirmation ? (
            <>
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

                {!isLogin && (
                  <div className="agreements-section">
                    <label className="agreement-checkbox">
                      <input
                        type="checkbox"
                        checked={agreeLocation}
                        onChange={(e) => setAgreeLocation(e.target.checked)}
                      />
                      <span className="agreement-text">
                        Я согласен(на) на обработку геолокационных данных для
                        работы карты и построения маршрутов в приложении
                      </span>
                    </label>

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
            </>
          ) : (
            /* Окно подтверждения email */
            <div className="email-confirmation-message">
              <div className="email-confirmation-icon">📧</div>
              <h3>Подтверждение email</h3>
              <p>
                На адрес <strong>{registeredEmail}</strong> отправлено письмо с
                ссылкой для подтверждения регистрации.
              </p>
              <p className="email-confirmation-note">
                Пожалуйста, перейдите по ссылке в письме, чтобы активировать ваш
                аккаунт. После подтверждения вы сможете войти в приложение.
              </p>
              <p className="email-confirmation-spam">
                Если письмо не пришло через несколько минут, проверьте папку
                "Спам".
              </p>
              <button
                className="email-confirmation-button"
                onClick={handleCloseConfirmation}
              >
                Хорошо, понятно
              </button>
            </div>
          )}
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
