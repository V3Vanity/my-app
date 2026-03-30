// src/api/client.js
const FUNCTION_URL = import.meta.env.VITE_YANDEX_FUNCTION_URL;

export const apiClient = {
  async request(action, options = {}) {
    try {
      console.log(`📤 API Request: ${action}`, options);

      const url = FUNCTION_URL;

      if (!url) {
        throw new Error("VITE_YANDEX_FUNCTION_URL not configured in .env");
      }

      // Подготавливаем тело запроса
      let bodyData = {};
      if (options.body) {
        try {
          bodyData = JSON.parse(options.body);
        } catch (e) {
          console.error("Failed to parse body:", e);
          bodyData = {};
        }
      }

      // Добавляем action в тело запроса
      bodyData.action = action;

      console.log(`📦 Request body for ${action}:`, bodyData);

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        method: options.method || "POST",
        body: JSON.stringify(bodyData),
      });

      const data = await response.json();
      console.log(`📥 Response for ${action}:`, data);

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            `HTTP ${response.status}: ${response.statusText}`,
        );
      }

      return data;
    } catch (error) {
      console.error(`❌ API Error (${action}):`, error);
      throw error;
    }
  },

  async signup(email, password, name) {
    if (!email || !password || !name) {
      throw new Error("Email, password and name are required for signup");
    }
    console.log("📝 Signup called with:", { email, name });
    return this.request("signup", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
  },

  async login(email, password) {
    if (!email || !password) {
      throw new Error("Email and password are required for login");
    }
    console.log("🔐 Login called with:", { email });
    return this.request("login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  async activate(key, token) {
    if (!key || !token) {
      throw new Error("Key and token are required for activation");
    }
    return this.request("activate", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ key }),
    });
  },

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
