// src/components/RewardChoice.jsx
import React, { useState } from "react";
import "./RewardChoice.css";

// Импортируем ваши изображения купонов
import couponImage1 from "../assets/couponImage-1.png";
import couponImage2 from "../assets/couponImage-2.png";

const RewardChoice = ({ onRewardSelected, selectedRewardId }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [tempSelectedId, setTempSelectedId] = useState(null);

  const rewards = [
    {
      id: 1,
      title: "Сырная лавка «Сыр-вино»",
      discount: "Скидка 5%",
      couponImage: couponImage1,
    },
    {
      id: 2,
      title: "Пельменная «Всплыли! Снимай!»",
      discount: "Скидка 7%",
      couponImage: couponImage2,
    },
  ];

  const handleSelect = (id) => {
    setTempSelectedId(id);
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    setShowConfirm(false);
    // Уведомляем родительский компонент о выборе
    if (onRewardSelected) {
      const selectedReward = rewards.find((r) => r.id === tempSelectedId);
      onRewardSelected(selectedReward);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setTempSelectedId(null);
  };

  // Если награда уже выбрана, показываем купон
  if (selectedRewardId) {
    const selectedReward = rewards.find((r) => r.id === selectedRewardId);
    if (!selectedReward) return null;

    return (
      <div className="reward-coupon-container">
        <div className="coupon-card">
          <img
            src={selectedReward.couponImage}
            alt="Купон"
            className="coupon-image"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="reward-choice-container">
      <h2 className="reward-choice-title">Выберите награду</h2>
      <p className="reward-choice-subtitle">
        За успешное прохождение квеста вы можете получить одну из наград
      </p>

      <div className="rewards-grid">
        {rewards.map((reward) => (
          <div key={reward.id} className="reward-card">
            <h3 className="reward-card-title">{reward.title}</h3>
            <p className="reward-card-discount">{reward.discount}</p>
            <button
              className="reward-select-button"
              onClick={() => handleSelect(reward.id)}
            >
              Выбрать
            </button>
          </div>
        ))}
      </div>

      {/* Модальное окно подтверждения */}
      {showConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-modal">
            <h3>Подтверждение выбора</h3>
            <p>
              Вы выбрали:
              <br />
              <strong>
                {rewards.find((r) => r.id === tempSelectedId)?.title}
              </strong>
            </p>
            <p>{rewards.find((r) => r.id === tempSelectedId)?.discount}</p>
            <p className="confirm-warning">
              Внимание! После подтверждения вы не сможете изменить свой выбор.
            </p>
            <div className="confirm-buttons">
              <button className="confirm-cancel" onClick={handleCancel}>
                Отмена
              </button>
              <button className="confirm-ok" onClick={handleConfirm}>
                Подтвердить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RewardChoice;
