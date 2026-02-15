import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  Suspense,
} from "react";
import "./ProgressModal.css";

// Оптимизированный импорт иконок - используем динамический импорт для ленивой загрузки
const rabbitIconsMap = {
  1: () => import("../assets/rabbit-icon-1.svg"),
  2: () => import("../assets/rabbit-icon-2.svg"),
  3: () => import("../assets/rabbit-icon-3.svg"),
  4: () => import("../assets/rabbit-icon-4.svg"),
  5: () => import("../assets/rabbit-icon-5.svg"),
  6: () => import("../assets/rabbit-icon-6.svg"),
  7: () => import("../assets/rabbit-icon-7.svg"),
  8: () => import("../assets/rabbit-icon-8.svg"),
  9: () => import("../assets/rabbit-icon-9.svg"),
  10: () => import("../assets/rabbit-icon-10.svg"),
  11: () => import("../assets/rabbit-icon-11.svg"),
  12: () => import("../assets/rabbit-icon-12.svg"),
  13: () => import("../assets/rabbit-icon-13.svg"),
  14: () => import("../assets/rabbit-icon-14.svg"),
};

// Компонент для отдельной иконки с ленивой загрузкой
const RabbitIcon = React.memo(({ index, isFound }) => {
  const [iconSrc, setIconSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isFound && !iconSrc) {
      let isMounted = true;
      setIsLoading(true);

      // Загружаем иконку только когда она нужна
      rabbitIconsMap[index + 1]()
        .then((module) => {
          if (isMounted) {
            setIconSrc(module.default);
            setIsLoading(false);
          }
        })
        .catch((error) => {
          console.error(`Ошибка загрузки иконки ${index + 1}:`, error);
          if (isMounted) {
            setIsLoading(false);
          }
        });

      return () => {
        isMounted = false;
      };
    }
  }, [isFound, index, iconSrc]);

  if (!isFound) {
    return <span className="progress-number not-found">{index + 1}</span>;
  }

  return (
    <>
      {isLoading ? (
        <div className="progress-icon-placeholder">
          <div className="progress-icon-loading" />
        </div>
      ) : (
        <img
          src={iconSrc}
          alt={`Заяц ${index + 1}`}
          className="progress-icon"
          loading="lazy"
          decoding="async"
          width="25"
          height="25"
        />
      )}
      <span className="progress-number found">{index + 1}</span>
    </>
  );
});

RabbitIcon.displayName = "RabbitIcon";

export default function ProgressModal({ isOpen, onClose, currentStep }) {
  const [isVisible, setIsVisible] = useState(false);
  const [preloadedIcons, setPreloadedIcons] = useState(new Set());

  // Мемоизируем вычисления
  const foundRabbits = useMemo(
    () => Math.max(0, Math.floor((currentStep - 1) / 2)),
    [currentStep],
  );

  const visibleIconsCount = useMemo(
    () => Math.min(foundRabbits, 14),
    [foundRabbits],
  );

  const allRabbitsFound = useMemo(
    () => visibleIconsCount === 14,
    [visibleIconsCount],
  );

  // Управление видимостью с анимацией
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  // Предзагрузка только следующих 2-3 иконок для плавности
  useEffect(() => {
    if (isVisible && visibleIconsCount < 14) {
      const nextIconsToPreload = [];

      // Загружаем следующие 3 иконки
      for (
        let i = visibleIconsCount;
        i < Math.min(visibleIconsCount + 3, 14);
        i++
      ) {
        if (!preloadedIcons.has(i)) {
          nextIconsToPreload.push(i);
        }
      }

      nextIconsToPreload.forEach((iconIndex) => {
        rabbitIconsMap[iconIndex + 1]()
          .then(() => {
            setPreloadedIcons((prev) => new Set([...prev, iconIndex]));
          })
          .catch(() => {});
      });
    }
  }, [isVisible, visibleIconsCount, preloadedIcons]);

  // Мемоизируем массив индексов
  const rabbitIndices = useMemo(
    () => Array.from({ length: 14 }, (_, i) => i),
    [],
  );

  // Оптимизированный обработчик закрытия
  const handleOverlayClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  const handleModalClick = useCallback((e) => {
    e.stopPropagation();
  }, []);

  if (!isOpen && !isVisible) return null;

  return (
    <div
      className={`progress-modal-overlay ${isVisible ? "visible" : ""}`}
      onClick={handleOverlayClick}
      style={{
        opacity: isVisible ? 1 : 0,
        transition: "opacity 0.2s ease",
        pointerEvents: isVisible ? "auto" : "none",
      }}
    >
      <div
        className="progress-modal"
        onClick={handleModalClick}
        role="dialog"
        aria-labelledby="progress-title"
        style={{
          transform: isVisible ? "scale(1)" : "scale(0.9)",
          transition: "transform 0.2s ease",
          willChange: "transform",
        }}
      >
        <h2
          id="progress-title"
          className={`progress-title ${allRabbitsFound ? "all-found" : ""}`}
        >
          {allRabbitsFound ? (
            <>
              Поздравляем!
              <br />
              Все мазайские зайцы собраны
            </>
          ) : (
            "Собери все тайны мазайских зайцев, и получи подарок!"
          )}
        </h2>

        <div className="progress-grid">
          {rabbitIndices.map((index) => {
            const isFound = index < visibleIconsCount;
            const isLastFound =
              index === visibleIconsCount - 1 && visibleIconsCount > 0;

            return (
              <div
                key={`rabbit-${index + 1}`}
                className={`
                  progress-circle 
                  ${isFound ? "found" : "not-found"}
                  ${isLastFound ? "last-found" : ""}
                `}
                aria-label={
                  isFound
                    ? `Заяц ${index + 1} найден`
                    : `Заяц ${index + 1} еще не найден`
                }
              >
                <RabbitIcon
                  index={index}
                  isFound={isFound}
                  isLastFound={isLastFound}
                />
              </div>
            );
          })}
        </div>

        <div className="progress-text" role="status">
          Найдено зайцев:{" "}
          <span className="progress-count">{visibleIconsCount}</span> из 14
        </div>
      </div>
    </div>
  );
}
