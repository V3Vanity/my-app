import React from "react";
import "./ProgressModal.css";

// Импортируем иконки зайцев
import rabbit1 from "../assets/rabbit-icon-1.svg";
import rabbit2 from "../assets/rabbit-icon-2.svg";
import rabbit3 from "../assets/rabbit-icon-3.svg";
import rabbit4 from "../assets/rabbit-icon-4.svg";
import rabbit5 from "../assets/rabbit-icon-5.svg";
import rabbit6 from "../assets/rabbit-icon-6.svg";
import rabbit7 from "../assets/rabbit-icon-7.svg";
import rabbit8 from "../assets/rabbit-icon-8.svg";
import rabbit9 from "../assets/rabbit-icon-9.svg";
import rabbit10 from "../assets/rabbit-icon-10.svg";
import rabbit11 from "../assets/rabbit-icon-11.svg";
import rabbit12 from "../assets/rabbit-icon-12.svg";
import rabbit13 from "../assets/rabbit-icon-13.svg";
import rabbit14 from "../assets/rabbit-icon-14.svg";

export default function ProgressModal({ isOpen, onClose, currentStep }) {
  if (!isOpen) return null;

  // Массив иконок зайцев
  const rabbitIcons = [
    rabbit1,
    rabbit2,
    rabbit3,
    rabbit4,
    rabbit5,
    rabbit6,
    rabbit7,
    rabbit8,
    rabbit9,
    rabbit10,
    rabbit11,
    rabbit12,
    rabbit13,
    rabbit14,
  ];

  const foundRabbits = Math.max(0, Math.floor((currentStep - 1) / 2));

  // Ограничиваем максимальное количество найденных зайцев
  const visibleIconsCount = Math.min(foundRabbits, rabbitIcons.length);

  // Проверяем, все ли зайцы собраны
  const allRabbitsFound = visibleIconsCount === rabbitIcons.length;

  return (
    <div className="progress-modal-overlay" onClick={onClose}>
      <div
        className="progress-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="progress-title"
      >
        {/* Заголовок - меняется при сборе всех зайцев */}
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

        {/* Сетка иконок - 2 строки по 7 */}
        <div className="progress-grid">
          {rabbitIcons.map((icon, index) => {
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
                {isFound ? (
                  <>
                    <img
                      src={icon}
                      alt={`Заяц ${index + 1}`}
                      className="progress-icon"
                      loading="lazy"
                    />
                    <span className="progress-number found">{index + 1}</span>
                  </>
                ) : (
                  <span className="progress-number not-found">{index + 1}</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Текст прогресса */}
        <div className="progress-text" role="status">
          Найдено зайцев:{" "}
          <span className="progress-count">{visibleIconsCount}</span> из 14
        </div>
      </div>
    </div>
  );
}
