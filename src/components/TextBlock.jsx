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
    stepNumber, // Добавляем stepNumber
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

    // Определяем, нужно ли показывать кнопку "Продолжить"
    const shouldShowContinueButton = stepNumber !== 32 && showButton;

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

            {/* Кнопка Подсказки сверху справа - не показываем на шаге 32 */}
            {hintImage && hintAddress && stepNumber !== 32 && (
              <button className="hint-button" onClick={handleHintClick}>
                ?
              </button>
            )}

            {showTitle && (
              <h2 className="text-title">
                Маршрут <span className="text-title-number">№</span>44
              </h2>
            )}

            {/* Сохраняем оригинальную логику рендера */}
            {children ? children : <p className="text-paragraph">{text}</p>}

            {/* Кнопка Продолжить - не показываем на шаге 32 */}
            {stepNumber !== 32 && (
              <div
                className={`continue-button-container ${
                  shouldShowContinueButton ? "visible" : "hidden"
                }`}
              >
                <button className="continue-button" onClick={handleNextClick}>
                  Продолжить
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Модальное окно с подсказкой - не показываем на шаге 32 */}
        {stepNumber !== 32 && (
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

TextBlock.displayName = "TextBlock";

export default TextBlock;
