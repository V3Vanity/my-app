import React, { useState, useRef, useEffect } from "react";
import "/src/components/CategorySlider.css";

export default function CategorySlider({
  items = [],
  onNavigateToItem,
  externalLinksConfig = {
    startIndex: 5,
    links: [],
  },
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [slideDirection, setSlideDirection] = useState(null);

  // Для свайпов
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const containerRef = useRef(null);

  const currentItem = items[currentIndex];

  // Минимальное расстояние для свайпа
  const minSwipeDistance = 50;

  // Сбрасываем анимацию после завершения
  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setSlideDirection(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  const onTouchStart = (e) => {
    if (isAnimating) return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    if (isAnimating || !touchStart) return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (isAnimating || !touchStart || !touchEnd) {
      setTouchStart(null);
      setTouchEnd(null);
      return;
    }

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentIndex < items.length - 1) {
      // Свайп влево - следующий слайд
      setSlideDirection("left");
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
      }, 150);
    } else if (isRightSwipe && currentIndex > 0) {
      // Свайп вправо - предыдущий слайд
      setSlideDirection("right");
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex(currentIndex - 1);
      }, 150);
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  const handlePrev = () => {
    if (currentIndex > 0 && !isAnimating) {
      setSlideDirection("right");
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex(currentIndex - 1);
      }, 150);
    }
  };

  const handleNext = () => {
    if (currentIndex < items.length - 1 && !isAnimating) {
      setSlideDirection("left");
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
      }, 150);
    }
  };

  const handleIndicatorClick = (index) => {
    if (index === currentIndex || isAnimating) return;

    const direction = index > currentIndex ? "left" : "right";
    setSlideDirection(direction);
    setIsAnimating(true);

    setTimeout(() => {
      setCurrentIndex(index);
    }, 150);
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

  // Определяем класс для анимации
  const getAnimationClass = () => {
    if (!isAnimating) return "";
    return slideDirection === "left" ? "slide-out-left" : "slide-out-right";
  };

  return (
    <div className="category-slider-container">
      {/* Индикаторы слайдов */}
      <div className="slider-indicators">
        {items.map((_, index) => (
          <div
            key={index}
            className={`indicator ${index === currentIndex ? "active" : ""}`}
            onClick={() => handleIndicatorClick(index)}
          />
        ))}
      </div>

      {/* Основной слайдер */}
      <div
        ref={containerRef}
        className={`slider-content ${getAnimationClass()}`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Заголовок */}
        <h1 className="item-title">{currentItem?.name}</h1>

        {/* Подзаголовок с описанием */}
        <p className="item-subtitle">{currentItem?.shortDescription}</p>

        {/* Фото */}
        <div className="item-image-container">
          <img
            src={currentItem?.image}
            alt={currentItem?.name}
            className="item-image"
          />
        </div>

        {/* Адрес */}
        <p className="item-address" style={{ whiteSpace: "pre-line" }}>
          {currentItem?.address}
        </p>
        {/* Кнопка "Хочу посетить" */}
        <button className="visit-button" onClick={handleVisit}>
          Хочу посетить
        </button>

        {/* Заголовок и описание */}
        <p className="item-description">{currentItem?.description}</p>
      </div>

      {/* Стрелки навигации (для десктопа) */}
      {items.length > 1 && (
        <>
          <button
            className={`slider-arrow arrow-left ${currentIndex === 0 ? "disabled" : ""}`}
            onClick={handlePrev}
            disabled={currentIndex === 0 || isAnimating}
          >
            ←
          </button>
          <button
            className={`slider-arrow arrow-right ${currentIndex === items.length - 1 ? "disabled" : ""}`}
            onClick={handleNext}
            disabled={currentIndex === items.length - 1 || isAnimating}
          >
            →
          </button>
        </>
      )}
    </div>
  );
}
