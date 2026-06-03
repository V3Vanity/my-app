// src/pages/ReviewsPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import "./ReviewsPage.css";

const API_URL = "http://v3vanity.beget.tech/backend/api";

// Список городов России
const russianCities = [
  "Москва",
  "Санкт-Петербург",
  "Новосибирск",
  "Екатеринбург",
  "Казань",
  "Нижний Новгород",
  "Челябинск",
  "Самара",
  "Омск",
  "Ростов-на-Дону",
  "Уфа",
  "Красноярск",
  "Пермь",
  "Воронеж",
  "Волгоград",
  "Краснодар",
  "Саратов",
  "Тюмень",
  "Тольятти",
  "Ижевск",
  "Барнаул",
  "Ульяновск",
  "Иркутск",
  "Хабаровск",
  "Ярославль",
  "Владивосток",
  "Махачкала",
  "Томск",
  "Оренбург",
  "Кемерово",
  "Новокузнецк",
  "Рязань",
  "Астрахань",
  "Набережные Челны",
  "Пенза",
  "Липецк",
  "Киров",
  "Тула",
  "Чебоксары",
  "Калининград",
  "Курск",
  "Улан-Удэ",
  "Ставрополь",
  "Севастополь",
  "Магнитогорск",
  "Сочи",
  "Белгород",
  "Нижний Тагил",
  "Владимир",
  "Архангельск",
  "Кострома",
  "Смоленск",
  "Тамбов",
  "Брянск",
  "Петрозаводск",
  "Грозный",
  "Йошкар-Ола",
  "Саранск",
  "Вологда",
  "Курган",
  "Симферополь",
  "Мурманск",
  "Нальчик",
  "Орёл",
  "Подольск",
  "Стерлитамак",
  "Псков",
  "Балашиха",
  "Новороссийск",
  "Рыбинск",
  "Южно-Сахалинск",
  "Сыктывкар",
  "Бийск",
  "Благовещенск",
  "Шахты",
  "Ангарск",
  "Королёв",
  "Мытищи",
  "Великий Новгород",
  "Химки",
  "Люберцы",
  "Красногорск",
  "Видное",
  "Дзержинск",
  "Ногинск",
  "Сергиев Посад",
  "Одинцово",
  "Жуковский",
  "Пушкино",
  "Раменское",
  "Коломна",
  "Электросталь",
  "Щёлково",
  "Серпухов",
  "Орехово-Зуево",
  "Воскресенск",
  "Клин",
  "Чехов",
  "Дмитров",
  "Павловский Посад",
  "Ступино",
  "Шатура",
].sort();

// Константы для кеширования
const CACHE_KEY = "reviews_cache";
const CACHE_TIME_KEY = "reviews_cache_time";
const CACHE_TTL = 5 * 60 * 1000;

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Данные формы
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    text: "",
  });

  // Для поиска города
  const [citySearch, setCitySearch] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  // Фильтруем города
  const filteredCities = russianCities.filter((city) =>
    city.toLowerCase().includes(citySearch.toLowerCase()),
  );

  // Загрузка отзывов с кешированием
  const loadReviews = useCallback(async (forceRefresh = false) => {
    setLoading(true);

    if (!forceRefresh) {
      const cachedReviews = localStorage.getItem(CACHE_KEY);
      const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
      const now = Date.now();

      if (
        cachedReviews &&
        cachedTime &&
        now - parseInt(cachedTime) < CACHE_TTL
      ) {
        setReviews(JSON.parse(cachedReviews));
        setLoading(false);
        return;
      }
    }

    try {
      const response = await fetch(`${API_URL}/reviews/get.php`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ошибка загрузки отзывов");
      }

      if (data) {
        setReviews(data);
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        localStorage.setItem(CACHE_TIME_KEY, String(Date.now()));
      }
    } catch (error) {
      console.error("Ошибка загрузки отзывов:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Загрузка при монтировании
  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCitySelect = (city) => {
    setFormData((prev) => ({ ...prev, city }));
    setCitySearch(city);
    setShowCityDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Пожалуйста, введите ваше имя");
      return;
    }
    if (!formData.city.trim()) {
      alert("Пожалуйста, выберите город");
      return;
    }
    if (!formData.text.trim()) {
      alert("Пожалуйста, напишите отзыв");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/reviews/create.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          city: formData.city.trim(),
          text: formData.text.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ошибка отправки отзыва");
      }

      setFormData({ name: "", city: "", text: "" });
      setCitySearch("");

      await loadReviews(true);

      alert("Спасибо за ваш отзыв!");
    } catch (error) {
      console.error("Ошибка отправки отзыва:", error);
      alert("Произошла ошибка. Попробуйте позже.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="reviews-page-container">
      <div className="reviews-header">
        <h1>Отзывы</h1>
        <p>Поделитесь впечатлениями о нашем гиде</p>
      </div>

      {/* Форма отправки отзыва */}
      <div className="review-form-container">
        <h3>Оставить отзыв</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="name"
              placeholder="Ваше имя *"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group city-group">
            <input
              type="text"
              placeholder="Ваш город *"
              value={citySearch}
              onChange={(e) => {
                setCitySearch(e.target.value);
                setShowCityDropdown(true);
              }}
              onFocus={() => setShowCityDropdown(true)}
              className="form-input"
            />
            {showCityDropdown && citySearch && (
              <div className="city-dropdown">
                {filteredCities.length > 0 ? (
                  filteredCities.slice(0, 10).map((city) => (
                    <div
                      key={city}
                      className="city-option"
                      onClick={() => handleCitySelect(city)}
                    >
                      {city}
                    </div>
                  ))
                ) : (
                  <div className="city-option no-result">Ничего не найдено</div>
                )}
              </div>
            )}
          </div>

          <div className="form-group">
            <textarea
              name="text"
              placeholder="Ваш отзыв *"
              value={formData.text}
              onChange={handleChange}
              rows="4"
              className="form-textarea"
            />
          </div>

          <button
            type="submit"
            className="submit-review-btn"
            disabled={submitting}
          >
            {submitting ? "Отправка..." : "Оставить отзыв"}
          </button>
        </form>
      </div>

      {/* Список отзывов */}
      <div className="reviews-list">
        <h3>Отзывы наших гостей</h3>

        {loading ? (
          <div className="reviews-loading">
            <div className="loading-spinner"></div>
            <p>Загрузка отзывов...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="reviews-empty">
            <p>Пока нет отзывов. Будьте первым!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <div className="review-avatar">
                  <span>{review.name?.[0] || "?"}</span>
                </div>
                <div className="review-info">
                  <h4 className="review-name">{review.name}</h4>
                  <span className="review-city">{review.city}</span>
                </div>
                <div className="review-date">
                  {formatDate(review.created_at)}
                </div>
              </div>
              <div className="review-content">
                <p>{review.text}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
