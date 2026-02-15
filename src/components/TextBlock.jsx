import React, { useRef, useState, useEffect, useCallback, memo } from "react";
import "./TextBlock.css";
import HintModal from "../components/HintModal.jsx";

const TextBlock = memo(
  ({
    text,
    showTitle,
    onNextStep,
    showBackButton,
    onBack,
    children,
    hintImage,
    hintAddress,
  }) => {
    const containerRef = useRef(null);
    const [showButton, setShowButton] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [isAtBottom, setIsAtBottom] = useState(false);

    // Используем useCallback для мемоизации функции
    const handleScroll = useCallback(() => {
      const el = containerRef.current;
      if (!el) return;

      const bottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 5;

      if (bottom && !isAtBottom) {
        setShowButton(true);
        setIsAtBottom(true);
      } else if (!bottom && isAtBottom) {
        setShowButton(false);
        setIsAtBottom(false);
      }
    }, [isAtBottom]);

    // Оптимизированный эффект с passive: true для улучшения производительности скролла
    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;

      el.addEventListener("scroll", handleScroll, { passive: true });

      // Проверяем при монтировании, есть ли уже контент
      setTimeout(() => {
        if (el.scrollHeight <= el.clientHeight + 5) {
          setShowButton(true);
          setIsAtBottom(true);
        }
      }, 100);

      return () => el.removeEventListener("scroll", handleScroll);
    }, [handleScroll]);

    // Оптимизированный обработчик для кнопки подсказки
    const handleHintClick = useCallback(() => {
      setShowHint(true);
    }, []);

    const handleHintClose = useCallback(() => {
      setShowHint(false);
    }, []);

    // Оптимизированный обработчик для продолжения
    const handleContinueClick = useCallback(() => {
      onNextStep();
    }, [onNextStep]);

    // Оптимизированный обработчик для кнопки назад
    const handleBackClick = useCallback(() => {
      onBack();
    }, [onBack]);

    return (
      <>
        <div className="text-block-container">
          <div className="text-block-scroll" ref={containerRef}>
            {/* Кнопка Назад сверху слева */}
            {showBackButton && (
              <button
                className="back-button"
                onClick={handleBackClick}
                aria-label="Назад"
                title="Назад"
              >
                ←
              </button>
            )}

            {/* Кнопка Подсказки сверху справа */}
            {hintImage && hintAddress && (
              <button
                className="hint-button"
                onClick={handleHintClick}
                aria-label="Подсказка"
                title="Подсказка"
              >
                ?
              </button>
            )}

            {showTitle && <h2 className="text-title">Маршрут №44</h2>}

            {/* Оптимизированное отображение контента */}
            {children ? (
              children
            ) : (
              <div className="text-content">
                {text.split("\n").map((paragraph, index) => (
                  <p key={index} className="text-paragraph">
                    {paragraph}
                  </p>
                ))}
              </div>
            )}

            {/* Кнопка Продолжить с плавным появлением */}
            <div
              className={`continue-button-container ${showButton ? "visible" : "hidden"}`}
              style={{
                transition: "opacity 0.2s ease, transform 0.2s ease",
                opacity: showButton ? 1 : 0,
                transform: showButton ? "translateY(0)" : "translateY(10px)",
                pointerEvents: showButton ? "auto" : "none",
              }}
            >
              <button
                className="continue-button"
                onClick={handleContinueClick}
                aria-label="Продолжить"
              >
                Продолжить
              </button>
            </div>
          </div>
        </div>

        {/* Модальное окно с подсказкой - ленивая загрузка изображения */}
        {showHint && (
          <HintModal
            isOpen={showHint}
            onClose={handleHintClose}
            imageSrc={hintImage}
            address={hintAddress}
          />
        )}
      </>
    );
  },
);

// Добавляем displayName для отладки
TextBlock.displayName = "TextBlock";

export default TextBlock;
