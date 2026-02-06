import React, { useState } from "react";
import "./RestaurantDetail.css";

export default function RestaurantDetail({
  restaurant,
  isOpen,
  onClose,
  onCenterMap,
}) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [currentMenuIndex, setCurrentMenuIndex] = useState(0);

  if (!isOpen || !restaurant) return null;

  const handlePrevPhoto = () => {
    setCurrentPhotoIndex((prev) =>
      prev === 0 ? restaurant.photos.length - 1 : prev - 1,
    );
  };

  const handleNextPhoto = () => {
    setCurrentPhotoIndex((prev) =>
      prev === restaurant.photos.length - 1 ? 0 : prev + 1,
    );
  };

  const handlePrevMenu = () => {
    setCurrentMenuIndex((prev) =>
      prev === 0 ? restaurant.menu.length - 1 : prev - 1,
    );
  };

  const handleNextMenu = () => {
    setCurrentMenuIndex((prev) =>
      prev === restaurant.menu.length - 1 ? 0 : prev + 1,
    );
  };

  return (
    <div className="restaurant-detail">
      {/* Кнопка закрытия */}
      <button className="restaurant-close-btn" onClick={onClose}>
        ×
      </button>

      {/* Кнопка центрирования на карте */}
      <button className="restaurant-center-btn" onClick={onCenterMap}>
        🗺️
      </button>

      {/* Слайдер с фото ресторана */}
      <div className="restaurant-photos-slider">
        <button className="slider-nav-btn prev" onClick={handlePrevPhoto}>
          ‹
        </button>

        <div className="restaurant-photo-container">
          <div className="photo-placeholder">
            <span className="photo-label">Фото {currentPhotoIndex + 1}</span>
          </div>
          <div className="photo-counter">
            {currentPhotoIndex + 1} / {restaurant.photos.length}
          </div>
        </div>

        <button className="slider-nav-btn next" onClick={handleNextPhoto}>
          ›
        </button>
      </div>

      {/* Название и описание */}
      <h2 className="restaurant-name">{restaurant.name}</h2>
      <p className="restaurant-description">{restaurant.description}</p>

      {/* Слайдер с меню */}
      <div className="menu-section">
        <h3 className="section-title">Меню</h3>
        <div className="menu-slider">
          <button className="slider-nav-btn prev" onClick={handlePrevMenu}>
            ‹
          </button>

          <div className="menu-item-container">
            <div className="menu-item-placeholder">
              <span className="menu-item-label">
                {restaurant.menu[currentMenuIndex].name}
              </span>
            </div>
            <div className="menu-item-info">
              <h4>{restaurant.menu[currentMenuIndex].name}</h4>
              <p className="menu-item-price">
                {restaurant.menu[currentMenuIndex].price} ₽
              </p>
            </div>
          </div>

          <button className="slider-nav-btn next" onClick={handleNextMenu}>
            ›
          </button>
        </div>

        {/* Прогресс-бар для меню */}
        <div className="menu-progress">
          <div
            className="menu-progress-bar"
            style={{
              width: `${((currentMenuIndex + 1) / restaurant.menu.length) * 100}%`,
            }}
          />
          <div className="menu-counter">
            {currentMenuIndex + 1} / {restaurant.menu.length}
          </div>
        </div>
      </div>

      {/* Сделано в Костроме */}
      <div className="local-dishes-section">
        <h3 className="section-title">Сделано в Костроме</h3>
        <div className="local-dishes-grid">
          {restaurant.localDishes.map((dish, index) => (
            <div key={index} className="local-dish-item">
              <div className="local-dish-placeholder">
                <span className="local-dish-label">{dish.name}</span>
              </div>
              <p className="local-dish-name">{dish.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Карта и адрес */}
      <div className="map-section">
        <h3 className="section-title">Местоположение</h3>
        <div className="yandex-map-preview">
          <div className="map-placeholder">
            <p>Карта заведения</p>
            <small>Адрес: {restaurant.address}</small>
          </div>
        </div>
        <p className="restaurant-address">
          <strong>Адрес:</strong> {restaurant.address}
        </p>
      </div>
    </div>
  );
}
