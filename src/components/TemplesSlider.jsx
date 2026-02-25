import React, { useState, useRef } from "react";
import "./TemplesSlider.css";

export default function TemplesSlider({
  temples,

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
        // Свайп вправо - предыдущий слайд
        setCurrentIndex(currentIndex - 1);
      } else if (diffX < 0 && currentIndex < temples.length - 1) {
        // Свайп влево - следующий слайд
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
    if (currentTemple) {
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

        {/* Подзаголовок к фото с адресом */}
        <p className="temple-address">{currentTemple.address}</p>

        {/* Кнопка "Хочу посетить" */}
        <button className="visit-button" onClick={handleVisit}>
          Хочу посетить
        </button>

        {/* Заголовок и описание */}
        <h2 className="temple-section-title">О храме</h2>
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
