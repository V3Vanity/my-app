// src/components/RequisitesModal.jsx
import React from "react";
import "./RequisitesModal.css";

export const RequisitesModal = ({ onClose }) => {
  return (
    <div className="requisites-modal-overlay" onClick={onClose}>
      <div className="requisites-modal" onClick={(e) => e.stopPropagation()}>
        <button className="requisites-modal-close" onClick={onClose}>
          ×
        </button>

        <div className="requisites-content">
          <h2>Реквизиты для оплаты</h2>

          <div className="requisites-section">
            <h3>Информация о продавце</h3>
            <div className="requisites-row">
              <span className="requisites-label">ФИО:</span>
              <span className="requisites-value">Коробко Юлия Евгеньевна</span>
            </div>
            <div className="requisites-row">
              <span className="requisites-label">Статус:</span>
              <span className="requisites-value">Самозанятая</span>
            </div>
            <div className="requisites-row">
              <span className="requisites-label">ИНН:</span>
              <span className="requisites-value">440120991310</span>
            </div>
            {/* <div className="requisites-row">
              <span className="requisites-label">ОГРНИП:</span>
              <span className="requisites-value">3240000000012345</span>
            </div> */}
          </div>

          <div className="requisites-section">
            <h3>Контактная информация</h3>
            <div className="requisites-row">
              <span className="requisites-label">Телефон:</span>
              <span className="requisites-value">+7 (999) 123-45-67</span>
            </div>
            <div className="requisites-row">
              <span className="requisites-label">Email:</span>
              <span className="requisites-value">korobkoulia05@mail.ru</span>
            </div>
            <div className="requisites-row">
              <span className="requisites-label">Почтовый адрес:</span>
              <span className="requisites-value">
                г. Кострома, ул. Красная маевка, д. 44
              </span>
            </div>
          </div>

          <div className="requisites-section">
            <h3>Банковские реквизиты</h3>
            <div className="requisites-row">
              <span className="requisites-label">Банк:</span>
              <span className="requisites-value">АО «Тинькофф Банк»</span>
            </div>
            <div className="requisites-row">
              <span className="requisites-label">БИК:</span>
              <span className="requisites-value">044525974</span>
            </div>
            <div className="requisites-row">
              <span className="requisites-label">Корр. счет:</span>
              <span className="requisites-value">30101810145250000974</span>
            </div>
            <div className="requisites-row">
              <span className="requisites-label">Номер счета:</span>
              <span className="requisites-value">40817810900001234567</span>
            </div>
          </div>

          <div className="requisites-note">
            <p>
              ℹ️ Данные реквизиты предоставлены в соответствии с требованиями
              платежной системы ЮMoney.
            </p>
            <p>
              По всем вопросам, связанным с оплатой, вы можете обратиться по
              указанным контактам.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
