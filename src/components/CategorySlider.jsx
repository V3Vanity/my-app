import React, { useState, useRef } from "react";
import "./CategorySlider.css"; // переименуем CSS позже

export default function CategorySlider({
  items = [], // массив элементов для отображения
  onNavigateToItem, // колбэк для навигации к элементу на карте
  externalLinksConfig = {
    // конфигурация для внешних ссылок (Яндекс Карты и т.д.)
    startIndex: 5, // с какого индекса использовать внешние ссылки
    links: [], // массив внешних ссылок
  },
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startX, setStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const currentItem = items[currentIndex];

  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
  };

  const handleTouchEnd = (e) => {
    if (!isDragging) return;

    const endX = e.changedTouches[0].clientX;
    const diffX = endX - startX;

    if (Math.abs(diffX) > 50) {
      if (diffX > 0 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      } else if (diffX < 0 && currentIndex < items.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    }

    setIsDragging(false);
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleVisit = () => {
    if (!currentItem) return;

    // Проверяем, нужно ли использовать внешнюю ссылку
    const useExternalLink =
      externalLinksConfig.startIndex !== undefined &&
      currentIndex >= externalLinksConfig.startIndex &&
      externalLinksConfig.links[currentIndex - externalLinksConfig.startIndex];

    if (useExternalLink) {
      window.open(
        externalLinksConfig.links[
          currentIndex - externalLinksConfig.startIndex
        ],
        "_blank",
      );
    } else {
      onNavigateToItem(currentItem);
    }
  };

  return (
    <div className="category-slider-container">
      {/* Индикаторы слайдов */}
      <div className="slider-indicators">
        {items.map((_, index) => (
          <div
            key={index}
            className={`indicator ${index === currentIndex ? "active" : ""}`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>

      {/* Основной слайдер */}
      <div
        ref={containerRef}
        className="slider-content"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Заголовок */}
        <h1 className="item-title">{currentItem.name}</h1>

        {/* Подзаголовок с описанием */}
        <p className="item-subtitle">{currentItem.shortDescription}</p>

        {/* Фото */}
        <div className="item-image-container">
          <img
            src={currentItem.image}
            alt={currentItem.name}
            className="item-image"
          />
        </div>

        {/* Адрес */}
        <p className="item-address">{currentItem.address}</p>

        {/* Кнопка "Хочу посетить" */}
        <button className="visit-button" onClick={handleVisit}>
          Хочу посетить
        </button>

        {/* Заголовок и описание */}
        <p className="item-description">{currentItem.description}</p>
      </div>

      {/* Стрелки навигации (для десктопа) */}
      {items.length > 1 && (
        <>
          <button
            className={`slider-arrow arrow-left ${currentIndex === 0 ? "disabled" : ""}`}
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            ←
          </button>
          <button
            className={`slider-arrow arrow-right ${currentIndex === items.length - 1 ? "disabled" : ""}`}
            onClick={handleNext}
            disabled={currentIndex === items.length - 1}
          >
            →
          </button>
        </>
      )}
    </div>
  );
}
