import React, { useRef, useState, useEffect, useCallback, memo } from "react";
import "/src/components/TextBlock.css";
import HintModal from "../components/HintModal.jsx";
import AudioButton from "../components/AudioButton.jsx";
import promptIcon from "../assets/prompt.svg"; // ← добавить импорт иконки

const TextBlock = memo(
  ({
    text,
    showTitle,
    onNextStep,
    children,
    hintImage,
    hintAddress,
    stepNumber,
    audioSrc,
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
            {/* Кнопка аудио - слева */}
            {audioSrc && stepNumber !== 32 && (
              <AudioButton audioSrc={audioSrc} />
            )}

            {/* Кнопка Подсказки сверху справа - с иконкой вместо "?" */}
            {hintImage && hintAddress && stepNumber !== 32 && (
              <button className="hint-button" onClick={handleHintClick}>
                <img src={promptIcon} alt="Подсказка" />
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
