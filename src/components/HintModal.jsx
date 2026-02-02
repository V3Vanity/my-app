import React from "react";
import "./HintModal.css";

export default function HintModal({ isOpen, onClose, imageSrc, address }) {
  if (!isOpen) return null;

  return (
    <div className="hint-modal-overlay" onClick={onClose}>
      <div className="hint-modal" onClick={(e) => e.stopPropagation()}>
        {/* Кнопка закрытия */}
        <button className="hint-close-btn" onClick={onClose}>
          ×
        </button>

        {/* Заголовок */}
        <h2 className="hint-title">Подсказка</h2>

        {/* Подзаголовок */}
        <h3 className="hint-subtitle">
          Место которое ты ищешь выглядит вот так:
        </h3>

        {/* Картинка места */}
        <div className="hint-image-container">
          <img src={imageSrc} alt="Подсказка к месту" className="hint-image" />
        </div>

        {/* Адрес */}
        <div className="hint-address">Адрес: {address}</div>
      </div>
    </div>
  );
}
