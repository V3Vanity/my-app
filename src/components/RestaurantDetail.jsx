import React, { useState, useEffect } from "react";
import "./RestaurantDetail.css";

export default function RestaurantDetail({ restaurant, isOpen, onClose }) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [currentMenuIndex, setCurrentMenuIndex] = useState(0);
  const [isPhotoFullscreen, setIsPhotoFullscreen] = useState(false);
  const [isMenuFullscreen, setIsMenuFullscreen] = useState(false);

  // Состояния для свайпа фото
  const [photoTouchStart, setPhotoTouchStart] = useState(null);
  const [photoTouchEnd, setPhotoTouchEnd] = useState(null);

  // Состояния для свайпа меню
  const [menuTouchStart, setMenuTouchStart] = useState(null);
  const [menuTouchEnd, setMenuTouchEnd] = useState(null);

  // ДОБАВЛЕНО: состояния для свайпа в полноэкранном режиме
  const [fullscreenPhotoTouchStart, setFullscreenPhotoTouchStart] =
    useState(null);
  const [fullscreenPhotoTouchEnd, setFullscreenPhotoTouchEnd] = useState(null);

  const [fullscreenMenuTouchStart, setFullscreenMenuTouchStart] =
    useState(null);
  const [fullscreenMenuTouchEnd, setFullscreenMenuTouchEnd] = useState(null);

  const minSwipeDistance = 50;

  // ИСПРАВЛЕНО: сбрасываем индексы при смене ресторана
  useEffect(() => {
    if (restaurant) {
      setCurrentPhotoIndex(0);
      setCurrentMenuIndex(0);
    }
  }, [restaurant]);

  if (!isOpen || !restaurant) return null;

  // Обработчики свайпа для фото
  const onPhotoTouchStart = (e) => {
    setPhotoTouchEnd(null);
    setPhotoTouchStart(e.targetTouches[0].clientX);
  };

  const onPhotoTouchMove = (e) => {
    setPhotoTouchEnd(e.targetTouches[0].clientX);
  };

  const onPhotoTouchEnd = () => {
    if (!photoTouchStart || !photoTouchEnd) return;

    const distance = photoTouchStart - photoTouchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNextPhoto({ stopPropagation: () => {} });
    }

    if (isRightSwipe) {
      handlePrevPhoto({ stopPropagation: () => {} });
    }
  };

  // Обработчики свайпа для меню
  const onMenuTouchStart = (e) => {
    setMenuTouchEnd(null);
    setMenuTouchStart(e.targetTouches[0].clientX);
  };

  const onMenuTouchMove = (e) => {
    setMenuTouchEnd(e.targetTouches[0].clientX);
  };

  const onMenuTouchEnd = () => {
    if (!menuTouchStart || !menuTouchEnd) return;

    const distance = menuTouchStart - menuTouchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNextMenu({ stopPropagation: () => {} });
    }

    if (isRightSwipe) {
      handlePrevMenu({ stopPropagation: () => {} });
    }
  };

  // ДОБАВЛЕНО: обработчики свайпа для полноэкранного фото
  const onFullscreenPhotoTouchStart = (e) => {
    setFullscreenPhotoTouchEnd(null);
    setFullscreenPhotoTouchStart(e.targetTouches[0].clientX);
  };

  const onFullscreenPhotoTouchMove = (e) => {
    setFullscreenPhotoTouchEnd(e.targetTouches[0].clientX);
  };

  const onFullscreenPhotoTouchEnd = () => {
    if (!fullscreenPhotoTouchStart || !fullscreenPhotoTouchEnd) return;

    const distance = fullscreenPhotoTouchStart - fullscreenPhotoTouchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNextPhoto({ stopPropagation: () => {} });
    }

    if (isRightSwipe) {
      handlePrevPhoto({ stopPropagation: () => {} });
    }
  };

  // ДОБАВЛЕНО: обработчики свайпа для полноэкранного меню
  const onFullscreenMenuTouchStart = (e) => {
    setFullscreenMenuTouchEnd(null);
    setFullscreenMenuTouchStart(e.targetTouches[0].clientX);
  };

  const onFullscreenMenuTouchMove = (e) => {
    setFullscreenMenuTouchEnd(e.targetTouches[0].clientX);
  };

  const onFullscreenMenuTouchEnd = () => {
    if (!fullscreenMenuTouchStart || !fullscreenMenuTouchEnd) return;

    const distance = fullscreenMenuTouchStart - fullscreenMenuTouchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNextMenu({ stopPropagation: () => {} });
    }

    if (isRightSwipe) {
      handlePrevMenu({ stopPropagation: () => {} });
    }
  };

  const handlePrevPhoto = (e) => {
    e.stopPropagation();
    setCurrentPhotoIndex((prev) =>
      prev === 0 ? restaurant.photos.length - 1 : prev - 1,
    );
  };

  const handleNextPhoto = (e) => {
    e.stopPropagation();
    setCurrentPhotoIndex((prev) =>
      prev === restaurant.photos.length - 1 ? 0 : prev + 1,
    );
  };

  const handlePrevMenu = (e) => {
    e.stopPropagation();
    setCurrentMenuIndex((prev) =>
      prev === 0 ? restaurant.menu.length - 1 : prev - 1,
    );
  };

  const handleNextMenu = (e) => {
    e.stopPropagation();
    setCurrentMenuIndex((prev) =>
      prev === restaurant.menu.length - 1 ? 0 : prev + 1,
    );
  };

  const handlePhotoClick = () => {
    setIsPhotoFullscreen(true);
  };

  const handleClosePhotoFullscreen = () => {
    setIsPhotoFullscreen(false);
  };

  const handleMenuClick = () => {
    setIsMenuFullscreen(true);
  };

  const handleCloseMenuFullscreen = () => {
    setIsMenuFullscreen(false);
  };

  return (
    <>
      <div className="restaurant-detail">
        {/* Кнопка закрытия */}
        <button className="restaurant-close-btn" onClick={onClose}>
          ×
        </button>

        {/* Слайдер с фото ресторана */}
        <div className="restaurant-photos-slider">
          <div
            className="restaurant-photo-container"
            onClick={handlePhotoClick}
            onTouchStart={onPhotoTouchStart}
            onTouchMove={onPhotoTouchMove}
            onTouchEnd={onPhotoTouchEnd}
          >
            {restaurant.photos && restaurant.photos.length > 0 ? (
              <img
                src={restaurant.photos[currentPhotoIndex]}
                alt={`${restaurant.name} фото ${currentPhotoIndex + 1}`}
                className="restaurant-photo"
              />
            ) : (
              <div className="photo-placeholder">
                <span className="photo-label">
                  Фото {currentPhotoIndex + 1}
                </span>
              </div>
            )}
            <div className="photo-counter">
              {currentPhotoIndex + 1} / {restaurant.photos.length}
            </div>
          </div>

          <button className="slider-nav-btn prev" onClick={handlePrevPhoto}>
            <span>‹</span>
          </button>

          <button className="slider-nav-btn next" onClick={handleNextPhoto}>
            <span>›</span>
          </button>
        </div>

        {/* Название и описание */}
        <h2 className="restaurant-name">{restaurant.name}</h2>
        <p className="restaurant-description">{restaurant.description}</p>

        {/* Слайдер с меню */}
        <div className="menu-section">
          <h3 className="section-title">Меню</h3>
          <div className="menu-slider">
            <div
              className="menu-item-container-fullwidth"
              onClick={handleMenuClick}
              style={{ cursor: "pointer" }}
              onTouchStart={onMenuTouchStart}
              onTouchMove={onMenuTouchMove}
              onTouchEnd={onMenuTouchEnd}
            >
              {restaurant.menu && restaurant.menu.length > 0 ? (
                <img
                  src={restaurant.menu[currentMenuIndex].image}
                  alt={`Блюдо ${currentMenuIndex + 1}`}
                  className="menu-item-image-fullwidth"
                />
              ) : (
                <div className="menu-item-placeholder-fullwidth">
                  <span className="menu-item-label">Блюдо</span>
                </div>
              )}
            </div>

            <button className="slider-nav-btn prev" onClick={handlePrevMenu}>
              <span>‹</span>
            </button>

            <button className="slider-nav-btn next" onClick={handleNextMenu}>
              <span>›</span>
            </button>
          </div>

          {/* СРЕДНИЙ ЧЕК */}
          <div className="average-check-container">
            <span className="average-check-label">Средний чек от</span>
            <span className="average-check-value">
              {restaurant.averageCheck || 0} ₽
            </span>
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

        <div className="exclusive-dishes-section">
          <h3 className="section-title">Сделано в Костроме</h3>

          <div className="exclusive-dishes-grid">
            {restaurant.localDishes.map((dish, index) => (
              <div key={index} className="exclusive-dish-item">
                {dish.image ? (
                  <div className="exclusive-dish-image-container">
                    <img
                      src={dish.image}
                      alt={`Блюдо ${index + 1}`}
                      className="exclusive-dish-image"
                    />
                  </div>
                ) : (
                  <div className="exclusive-dish-placeholder">
                    <span className="exclusive-dish-label">Блюдо</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ОБЩИЙ ТЕКСТ, РАЗНЫЙ ДЛЯ КАЖДОГО РЕСТОРАНА */}
          {restaurant.exclusiveDescription && (
            <div className="exclusive-dishes-description">
              <p>{restaurant.exclusiveDescription}</p>
            </div>
          )}
        </div>

        {/* Карта и адрес */}
        <div className="map-section">
          {/* Яндекс Карта - динамическая для каждого ресторана */}
          <div className="yandex-map-container">
            <div
              style={{
                position: "relative",
                overflow: "hidden",
                width: "100%",
                height: "200px",
                borderRadius: "16px",
              }}
            >
              {/* Ссылки для каждого ресторана */}
              <a
                href={`https://yandex.ru/maps/org/${restaurant.mapName || "restaurant"}/${restaurant.mapOid}/?utm_medium=mapframe&utm_source=maps`}
                style={{
                  color: "#eee",
                  fontSize: "12px",
                  position: "absolute",
                  top: "0px",
                  zIndex: 1,
                }}
                target="_blank"
                rel="noopener noreferrer"
              >
                {restaurant.name}
              </a>

              <a
                href="https://yandex.ru/maps/7/kostroma/category/restaurant/184106394/?utm_medium=mapframe&utm_source=maps"
                style={{
                  color: "#eee",
                  fontSize: "12px",
                  position: "absolute",
                  top: "14px",
                  zIndex: 1,
                }}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ресторан в Костроме
              </a>

              {/* Динамический iframe */}
              <iframe
                src={`https://yandex.ru/map-widget/v1/?ll=${restaurant.mapLon || "40.933710"}%2C${restaurant.mapLat || "57.768915"}&mode=search&oid=${restaurant.mapOid}&ol=biz&sctx=ZAAAAAgBEAAaKAoSCedtbHakdkRAET8BFCNL4kxAEhIJDJQUWABT1j8RKSUEq%2Brluz8iBgABAgMEBSgKOABAnIQGSABqAnJ1nQHNzMw9oAEAqAEAvQHSISTrwgEG59Cn57cFggIf0KHRi9GA0L7QstCw0YAg0LrQvtGB0YLRgNC%2B0LzQsIoCAJICATeaAgxkZXNrdG9wLW1hcHM%3D&sll=${restaurant.mapLon || "40.929590"}%2C${restaurant.mapLat || "57.768915"}&sspn=0.021801%2C0.006811&text=${encodeURIComponent(restaurant.name)}&utm_source=share&z=16`}
                width="100%"
                height="200"
                frameBorder="0"
                allowFullScreen={true}
                style={{
                  position: "relative",
                  border: "2px solid rgba(255, 233, 231, 0.15)",
                  borderRadius: "16px",
                }}
                title={`Яндекс Карта - ${restaurant.name}`}
              />
            </div>
          </div>

          {/* Адрес ресторана под картой */}
          <p className="restaurant-address">{restaurant.address}</p>
        </div>
      </div>

      {/* Fullscreen модалка для фото - ИЗМЕНЕНО: добавлены свайпы */}
      {isPhotoFullscreen && (
        <div className="fullscreen-modal" onClick={handleClosePhotoFullscreen}>
          <div
            className="fullscreen-content"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={onFullscreenPhotoTouchStart}
            onTouchMove={onFullscreenPhotoTouchMove}
            onTouchEnd={onFullscreenPhotoTouchEnd}
          >
            <button
              className="fullscreen-close-btn"
              onClick={handleClosePhotoFullscreen}
            >
              <span>×</span>
            </button>

            <div className="fullscreen-image-container">
              <img
                src={restaurant.photos[currentPhotoIndex]}
                alt={`${restaurant.name} фото ${currentPhotoIndex + 1}`}
                className="fullscreen-image"
              />
            </div>

            <div className="fullscreen-counter">
              {currentPhotoIndex + 1} / {restaurant.photos.length}
            </div>

            <button
              className="fullscreen-nav-btn prev"
              onClick={handlePrevPhoto}
            >
              <span>‹</span>
            </button>

            <button
              className="fullscreen-nav-btn next"
              onClick={handleNextPhoto}
            >
              <span>›</span>
            </button>
          </div>
        </div>
      )}

      {/* Fullscreen модалка для меню - ИЗМЕНЕНО: добавлены свайпы */}
      {isMenuFullscreen && (
        <div className="fullscreen-modal" onClick={handleCloseMenuFullscreen}>
          <div
            className="fullscreen-content"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={onFullscreenMenuTouchStart}
            onTouchMove={onFullscreenMenuTouchMove}
            onTouchEnd={onFullscreenMenuTouchEnd}
          >
            <button
              className="fullscreen-close-btn"
              onClick={handleCloseMenuFullscreen}
            >
              <span>×</span>
            </button>

            <div className="fullscreen-menu-container">
              <img
                src={restaurant.menu[currentMenuIndex].image}
                alt={`Блюдо ${currentMenuIndex + 1}`}
                className="fullscreen-menu-image-fullwidth"
              />
            </div>

            <div className="fullscreen-counter">
              {currentMenuIndex + 1} / {restaurant.menu.length}
            </div>

            <button
              className="fullscreen-nav-btn prev"
              onClick={handlePrevMenu}
            >
              <span>‹</span>
            </button>

            <button
              className="fullscreen-nav-btn next"
              onClick={handleNextMenu}
            >
              <span>›</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
