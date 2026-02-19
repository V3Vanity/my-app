import React from "react";
import { useNavigate } from "react-router-dom";
import menuImage from "../assets/menu-img.svg";
import "./Header.css";

export default function Header({ menuOpen, setMenuOpen, onMenuItemClick }) {
  const navigate = useNavigate();

  const handleTitleClick = () => {
    navigate("/");
    setMenuOpen(false);
  };

  const handleMenuItemClick = (page) => {
    console.log("Клик по меню:", page);
    setMenuOpen(false);

    if (onMenuItemClick) {
      onMenuItemClick(page);
    } else {
      // Фолбэк навигация если onMenuItemClick не передан
      switch (page) {
        case "quest":
          navigate("/quest");
          break;
        case "temples":
          navigate("/temples");
          break;
        case "gastro":
          navigate("/gastro");
          break;
        case "about":
          navigate("/about");
          break;
        case "reviews":
          navigate("/reviews");
          break;
        default:
          navigate("/");
          break;
      }
    }
  };

  return (
    <>
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

      <div className={`app-menu ${menuOpen ? "open" : ""}`}>
        <div className="menu-item" onClick={() => handleMenuItemClick("quest")}>
          Квест-экскурсия мазайские зайцы
        </div>
        <div
          className="menu-item"
          onClick={() => handleMenuItemClick("temples")}
        >
          Квест-экскурсия по храмам и музеям
        </div>
        <div
          className="menu-item"
          onClick={() => handleMenuItemClick("gastro")}
        >
          Гастро-тур
        </div>
        <div className="menu-item" onClick={() => handleMenuItemClick("about")}>
          О нас
        </div>
        <div
          className="menu-item"
          onClick={() => handleMenuItemClick("reviews")}
        >
          Отзывы
        </div>
      </div>
    </>
  );
}
