// src/api/client.js
const FUNCTION_URL = import.meta.env.VITE_YANDEX_FUNCTION_URL;

export const apiClient = {
  async request(action, options = {}) {
    try {
      // Используем один URL для всех запросов
      const url = FUNCTION_URL;

      // Подготавливаем тело запроса
      let bodyData = {};
      if (options.body) {
        bodyData = JSON.parse(options.body);
      }

      // Добавляем action в тело запроса (ЭТО КЛЮЧЕВОЙ МОМЕНТ!)
      bodyData.action = action;

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        method: options.method || "POST",
        body: JSON.stringify(bodyData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Произошла ошибка");
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  async signup(email, password, name) {
    return this.request("signup", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
  },

  async login(email, password) {
    return this.request("login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  async activate(key, token) {
    return this.request("activate", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ key }),
    });
  },

  // Проверка статуса подписки
  async checkSubscription() {
    const token = localStorage.getItem("auth_token");
    if (!token) throw new Error("Не авторизован");

    return this.request("checkSubscription", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
