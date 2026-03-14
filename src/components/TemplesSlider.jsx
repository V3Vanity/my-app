import React, { useState, useRef } from "react";
import "./TemplesSlider.css";
import { allTemples } from "./mapData.js"; // Импортируем все храмы для слайдера

export default function TemplesSlider({
  temples = allTemples,
  onNavigateToTemple,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startX, setStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const currentTemple = temples[currentIndex];

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
      } else if (diffX < 0 && currentIndex < temples.length - 1) {
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
    if (currentIndex < temples.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleVisit = () => {
    if (!currentTemple) return;

    // Два последних храма (по индексу) отправляем в Яндекс Карты
    if (currentIndex === 5 || currentIndex === 6) {
      // Ссылки для двух последних храмов
      const yandexLinks = [
        "https://yandex.ru/maps/-/CPBt64Ib",
        "https://yandex.ru/maps/-/CPBt66k1",
      ];

      // Открываем соответствующую ссылку
      window.open(yandexLinks[currentIndex - 5], "_blank");
    } else {
      // Для остальных храмов (первые 5) строим маршрут на карте
      onNavigateToTemple(currentTemple);
    }
  };
  return (
    <div className="temples-slider-container">
      {/* Индикаторы слайдов */}
      <div className="slider-indicators">
        {temples.map((_, index) => (
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
        <h1 className="temple-title">{currentTemple.name}</h1>

        {/* Подзаголовок с описанием */}
        <p className="temple-subtitle">{currentTemple.shortDescription}</p>

        {/* Фото храма */}
        <div className="temple-image-container">
          <img
            src={currentTemple.image}
            alt={currentTemple.name}
            className="temple-image"
          />
        </div>

        {/* Адрес */}
        <p className="temple-address">{currentTemple.address}</p>

        {/* Кнопка "Хочу посетить" */}
        <button className="visit-button" onClick={handleVisit}>
          Хочу посетить
        </button>

        {/* Заголовок и описание */}
        <p className="temple-description">{currentTemple.description}</p>
      </div>

      {/* Стрелки навигации (для десктопа) */}
      {temples.length > 1 && (
        <>
          <button
            className={`slider-arrow arrow-left ${currentIndex === 0 ? "disabled" : ""}`}
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            ←
          </button>
          <button
            className={`slider-arrow arrow-right ${currentIndex === temples.length - 1 ? "disabled" : ""}`}
            onClick={handleNext}
            disabled={currentIndex === temples.length - 1}
          >
            →
          </button>
        </>
      )}
    </div>
  );
}
