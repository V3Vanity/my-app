import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/client";
import Header from "../components/Header";
import "./ReviewsPage.css";

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
  "Комсомольск-на-Амуре",
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
  "Прокопьевск",
  "Нижневартовск",
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

export default function ReviewsPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Форма
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    text: "",
  });

  // Список городов для поиска
  const [citySearch, setCitySearch] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  // Фильтрованный список городов
  const filteredCities = russianCities.filter((city) =>
    city.toLowerCase().includes(citySearch.toLowerCase()),
  );

  // Загрузка отзывов
  const loadReviews = async () => {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setReviews(data);
    } catch (error) {
      console.error("Ошибка загрузки отзывов:", error);
    } finally {
      setLoading(false);
    }
  };

  // Загрузка при монтировании
  useEffect(() => {
    loadReviews();
  }, []);

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
      // 1. Отправляем отзыв
      const { error: insertError } = await supabase.from("reviews").insert([
        {
          name: formData.name.trim(),
          city: formData.city.trim(),
          text: formData.text.trim(),
          created_at: new Date().toISOString(),
        },
      ]);

      if (insertError) throw insertError;

      // 2. Очищаем форму
      setFormData({ name: "", city: "", text: "" });
      setCitySearch("");

      // 3. Загружаем свежие отзывы (один раз)
      await loadReviews();

      alert("Спасибо за ваш отзыв!");
    } catch (error) {
      console.error("Ошибка отправки отзыва:", error);
      alert("Произошла ошибка. Попробуйте позже.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMenuItemClick = (page) => {
    setMenuOpen(false);
    const pages = {
      quest: "/app/quest",
      temples: "/app/temples",
      museums: "/app/museums",
      art: "/app/art",
      history: "/app/history",
      family: "/app/family",
      gastro: "/app/gastro",
      about: "/app/about",
      reviews: "/app/reviews",
    };
    navigate(pages[page] || "/app");
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
    <>
      <Header
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        onMenuItemClick={handleMenuItemClick}
      />
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
                    <div className="city-option no-result">
                      Ничего не найдено
                    </div>
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
    </>
  );
}
