import React from "react";
import { useNavigate } from "react-router-dom";
import menuImage from "../assets/menu-img.png";
import "./Header.css";

export default function Header({ menuOpen, setMenuOpen, onMenuItemClick }) {
  const navigate = useNavigate();

  // Клик по заголовку — возвращаемся на главную страницу
  const handleTitleClick = () => {
    navigate("/");
    // Можно при желании закрыть меню
    setMenuOpen(false);
  };

  return (
    <>
      {/* Шапка */}
      <header className={`app-header ${menuOpen ? "open" : ""}`}>
        <div
          className="page-title"
          style={{ cursor: "pointer" }}
          onClick={handleTitleClick}
        >
          Главная
        </div>
        <button className="menu-button" onClick={() => setMenuOpen((v) => !v)}>
          <img src={menuImage} alt="Меню" />
        </button>
      </header>

      {/* Меню */}
      <div className={`app-menu ${menuOpen ? "open" : ""}`}>
        <div
          className="menu-item primary"
          onClick={() => onMenuItemClick("quest")}
        >
          Квест-экскурсия мазайские зайцы
        </div>
        <div className="menu-item" onClick={() => onMenuItemClick("temples")}>
          Квест-экскурсия по храмам и музеям
        </div>
        <div className="menu-item" onClick={() => onMenuItemClick("gastro")}>
          Гастро-тур
        </div>
        <div className="menu-item" onClick={() => onMenuItemClick("about")}>
          О нас
        </div>
        <div className="menu-item" onClick={() => onMenuItemClick("reviews")}>
          Отзывы
        </div>
      </div>
    </>
  );
}
