import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import menuImage from "../assets/menu-img.svg";
import "./Header.css";

export default function Header({
  menuOpen,
  setMenuOpen,
  onMenuItemClick,
  onBack,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeMainItem, setActiveMainItem] = useState(null);
  const [activeSubItem, setActiveSubItem] = useState(null);
  const [isCulturalOpen, setIsCulturalOpen] = useState(false);

  // Определяем, находимся ли мы на странице квеста
  const isQuestPage = location.pathname === "/quest";

  // Синхронизация активного пункта с текущим маршрутом
  useEffect(() => {
    const path = location.pathname;

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
      setActiveMainItem(null);
      setActiveSubItem(null);
      setIsCulturalOpen(false);
    }
  }, [location.pathname]);

  const handleBackClick = () => {
    if (isQuestPage && onBack) {
      onBack(); // Вызываем переданную функцию навигации в квесте
    } else {
      navigate("/"); // На других страницах просто на главную
    }
    setMenuOpen(false);
  };

  const handleMenuItemClick = (page, isMain = true) => {
    console.log("Клик по меню:", page);

    if (page === "cultural" && isMain) {
      setIsCulturalOpen(!isCulturalOpen);
      if (!isCulturalOpen) {
        setActiveMainItem("cultural");
        setActiveSubItem(null);
      } else {
        setActiveMainItem(null);
        setActiveSubItem(null);
      }
      return;
    }

    setMenuOpen(false);

    if (onMenuItemClick) {
      onMenuItemClick(page);
    } else {
      switch (page) {
        case "quest":
          // Если мы уже на странице квеста - переходим на главную
          if (isQuestPage) {
            navigate("/");
          } else {
            navigate("/quest");
          }
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
        {/* Стрелка назад - только на странице квеста */}
        {isQuestPage ? (
          <button className="back-arrow-button" onClick={handleBackClick}>
            ←
          </button>
        ) : (
          <div className="header-placeholder" />
        )}

        <button className="menu-button" onClick={() => setMenuOpen((v) => !v)}>
          <img src={menuImage} alt="Меню" />
        </button>
      </header>

      <div className={`app-menu ${menuOpen ? "open" : ""}`}>
        <div
          className={`menu-item ${activeMainItem === "quest" ? "active" : ""}`}
          onClick={() => handleMenuItemClick("quest")}
        >
          Квест-экскурсия мазайские зайцы
        </div>

        <div
          className={`menu-item ${activeMainItem === "cultural" ? "active" : ""}`}
          onClick={() => handleMenuItemClick("cultural", true)}
        >
          Культурная карта
        </div>

        {isCulturalOpen && (
          <div className="submenu">
            <div
              className={`menu-item ${activeSubItem === "temples" ? "active" : ""}`}
              onClick={() => handleMenuItemClick("temples", false)}
            >
              Храмы
            </div>
            <div
              className={`menu-item ${activeSubItem === "museums" ? "active" : ""}`}
              onClick={() => handleMenuItemClick("museums", false)}
            >
              Музеи
            </div>
            <div
              className={`menu-item ${activeSubItem === "art" ? "active" : ""}`}
              onClick={() => handleMenuItemClick("art", false)}
            >
              Искусство
            </div>
            <div
              className={`menu-item ${activeSubItem === "history" ? "active" : ""}`}
              onClick={() => handleMenuItemClick("history", false)}
            >
              История
            </div>
            <div
              className={`menu-item ${activeSubItem === "family" ? "active" : ""}`}
              onClick={() => handleMenuItemClick("family", false)}
            >
              Для семьи
            </div>
          </div>
        )}

        <div
          className={`menu-item ${isCulturalOpen ? "hidden" : ""} ${activeMainItem === "gastro" ? "active" : ""}`}
          onClick={() => handleMenuItemClick("gastro")}
        >
          Гастро-тур
        </div>

        <div
          className={`menu-item ${isCulturalOpen ? "hidden" : ""} ${activeMainItem === "about" ? "active" : ""}`}
          onClick={() => handleMenuItemClick("about")}
        >
          О нас
        </div>

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
