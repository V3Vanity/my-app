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

    // Оптимизируем обработчик скролла
    const handleScroll = useCallback(() => {
      const el = containerRef.current;
      if (!el) return;

      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 5) {
        setShowButton(true);
      }
    }, []);

    // Оптимизируем эффект с passive: true для лучшей производительности скролла
    useEffect(() => {
      const el = containerRef.current;
      if (el) {
        el.addEventListener("scroll", handleScroll, { passive: true });

        // Проверяем при монтировании, если контент не скроллится
        if (el.scrollHeight <= el.clientHeight + 5) {
          setShowButton(true);
        }

        return () => el.removeEventListener("scroll", handleScroll);
      }
    }, [handleScroll]);

    // Мемоизируем обработчики
    const handleBackClick = useCallback(() => {
      onBack?.();
    }, [onBack]);

    const handleNextClick = useCallback(() => {
      onNextStep?.();
    }, [onNextStep]);

    const handleHintClick = useCallback(() => {
      setShowHint(true);
    }, []);

    const handleHintClose = useCallback(() => {
      setShowHint(false);
    }, []);

    return (
      <>
        <div className="text-block-container">
          <div className="text-block-scroll" ref={containerRef}>
            {/* Кнопка Назад сверху слева */}
            {showBackButton && (
              <button className="back-button" onClick={handleBackClick}>
                ←
              </button>
            )}

            {/* Кнопка Подсказки сверху справа */}
            {hintImage && hintAddress && (
              <button className="hint-button" onClick={handleHintClick}>
                ?
              </button>
            )}

            {showTitle && <h2 className="text-title">Маршрут №44</h2>}

            {/* Сохраняем оригинальную логику рендера */}
            {children ? children : <p className="text-paragraph">{text}</p>}

            {/* Кнопка Продолжить */}
            <div
              className={`continue-button-container ${
                showButton ? "visible" : "hidden"
              }`}
            >
              <button className="continue-button" onClick={handleNextClick}>
                Продолжить
              </button>
            </div>
          </div>
        </div>

        {/* Модальное окно с подсказкой */}
        <HintModal
          isOpen={showHint}
          onClose={handleHintClose}
          imageSrc={hintImage}
          address={hintAddress}
        />
      </>
    );
  },
);

TextBlock.displayName = "TextBlock";

export default TextBlock;
