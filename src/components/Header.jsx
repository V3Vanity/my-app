import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import menuImage from "../assets/menu-img.svg";
import "./Header.css";

export default function Header({ menuOpen, setMenuOpen, onMenuItemClick }) {
  const navigate = useNavigate();
  const location = useLocation(); // Получаем текущий путь
  const [activeMainItem, setActiveMainItem] = useState(null);
  const [activeSubItem, setActiveSubItem] = useState(null);
  const [isCulturalOpen, setIsCulturalOpen] = useState(false);

  // Синхронизация активного пункта с текущим маршрутом
  useEffect(() => {
    const path = location.pathname;

    // Определяем активный пункт меню по пути
    if (path === "/quest") {
      setActiveMainItem("quest");
      setActiveSubItem(null);
      setIsCulturalOpen(false);
    } else if (path === "/gastro") {
      setActiveMainItem("gastro");
      setActiveSubItem(null);
      setIsCulturalOpen(false);
    } else if (path === "/about") {
      setActiveMainItem("about");
      setActiveSubItem(null);
      setIsCulturalOpen(false);
    } else if (path === "/reviews") {
      setActiveMainItem("reviews");
      setActiveSubItem(null);
      setIsCulturalOpen(false);
    } else if (path === "/temples") {
      setActiveMainItem("cultural");
      setActiveSubItem("temples");
      setIsCulturalOpen(true);
    } else if (path === "/museums") {
      setActiveMainItem("cultural");
      setActiveSubItem("museums");
      setIsCulturalOpen(true);
    } else if (path === "/art") {
      setActiveMainItem("cultural");
      setActiveSubItem("art");
      setIsCulturalOpen(true);
    } else if (path === "/history") {
      setActiveMainItem("cultural");
      setActiveSubItem("history");
      setIsCulturalOpen(true);
    } else if (path === "/family") {
      setActiveMainItem("cultural");
      setActiveSubItem("family");
      setIsCulturalOpen(true);
    } else {
      // На главной или другой странице
      setActiveMainItem(null);
      setActiveSubItem(null);
      setIsCulturalOpen(false);
    }
  }, [location.pathname]); // Зависимость от пути

  const handleTitleClick = () => {
    navigate("/");
    setMenuOpen(false);
    // Состояния обновятся через useEffect
  };

  const handleMenuItemClick = (page, isMain = true) => {
    console.log("Клик по меню:", page);

    // Логика для открытия подменю "Культурная карта"
    if (page === "cultural" && isMain) {
      setIsCulturalOpen(!isCulturalOpen); // Открыть/закрыть подменю
      if (!isCulturalOpen) {
        setActiveMainItem("cultural");
        setActiveSubItem(null);
      } else {
        setActiveMainItem(null);
        setActiveSubItem(null);
      }
      return; // Не закрываем меню и не навигируем
    }

    // Закрываем меню
    setMenuOpen(false);

    if (onMenuItemClick) {
      onMenuItemClick(page);
    } else {
      // Навигация
      switch (page) {
        case "quest":
          navigate("/quest");
          break;
        case "temples":
          navigate("/temples");
          break;
        case "museums":
          navigate("/museums");
          break;
        case "art":
          navigate("/art");
          break;
        case "history":
          navigate("/history");
          break;
        case "family":
          navigate("/family");
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
        {/* Квест-экскурсия мазайские зайцы */}
        <div
          className={`menu-item ${activeMainItem === "quest" ? "active" : ""}`}
          onClick={() => handleMenuItemClick("quest")}
        >
          Квест-экскурсия мазайские зайцы
        </div>

        {/* Культурная карта (открывает подменю) */}
        <div
          className={`menu-item ${activeMainItem === "cultural" ? "active" : ""}`}
          onClick={() => handleMenuItemClick("cultural", true)}
        >
          Культурная карта
        </div>

        {/* Подменю (отображается, если isCulturalOpen = true) */}
        {isCulturalOpen && (
          <div className="submenu">
            <div
              className={`menu-item ${activeSubItem === "temples" ? "active" : ""}`}
              onClick={() => handleMenuItemClick("temples", false, true)}
            >
              Храмы
            </div>
            <div
              className={`menu-item ${activeSubItem === "museums" ? "active" : ""}`}
              onClick={() => handleMenuItemClick("museums", false, true)}
            >
              Музеи
            </div>
            <div
              className={`menu-item ${activeSubItem === "art" ? "active" : ""}`}
              onClick={() => handleMenuItemClick("art", false, true)}
            >
              Искусство
            </div>
            <div
              className={`menu-item ${activeSubItem === "history" ? "active" : ""}`}
              onClick={() => handleMenuItemClick("history", false, true)}
            >
              История
            </div>
            <div
              className={`menu-item ${activeSubItem === "family" ? "active" : ""}`}
              onClick={() => handleMenuItemClick("family", false, true)}
            >
              Для семьи
            </div>
          </div>
        )}

        {/* Гастро-тур */}
        <div
          className={`menu-item ${isCulturalOpen ? "hidden" : ""} ${activeMainItem === "gastro" ? "active" : ""}`}
          onClick={() => handleMenuItemClick("gastro")}
        >
          Гастро-тур
        </div>

        {/* О нас */}
        <div
          className={`menu-item ${isCulturalOpen ? "hidden" : ""} ${activeMainItem === "about" ? "active" : ""}`}
          onClick={() => handleMenuItemClick("about")}
        >
          О нас
        </div>

        {/* Отзывы */}
        <div
          className={`menu-item ${isCulturalOpen ? "hidden" : ""} ${activeMainItem === "reviews" ? "active" : ""}`}
          onClick={() => handleMenuItemClick("reviews")}
        >
          Отзывы
        </div>
      </div>
    </>
  );
}
