// src/components/Header.jsx - ИСПРАВЛЕННАЯ ВЕРСИЯ

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import menuImage from "../assets/menu-img.svg";
import "./Header.css";

export default function Header({
  menuOpen,
  setMenuOpen,
  onMenuItemClick,
  onBack,
  showBackButton = false,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeMainItem, setActiveMainItem] = useState(null);
  const [activeSubItem, setActiveSubItem] = useState(null);
  const [isCulturalOpen, setIsCulturalOpen] = useState(false);

  const isHomePage = location.pathname === "/" || location.pathname === "/app";

  // Функция возврата
  const handleGoBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
    setMenuOpen(false);
  };

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
    } else if (
      ["/temples", "/museums", "/art", "/history", "/family"].includes(path)
    ) {
      setActiveMainItem("cultural");
      setIsCulturalOpen(true);

      if (path === "/temples") setActiveSubItem("temples");
      else if (path === "/museums") setActiveSubItem("museums");
      else if (path === "/art") setActiveSubItem("art");
      else if (path === "/history") setActiveSubItem("history");
      else if (path === "/family") setActiveSubItem("family");
    } else {
      setActiveMainItem(null);
      setActiveSubItem(null);
      setIsCulturalOpen(false);
    }
  }, [location.pathname]);

  // Обработка клика по пункту меню - ИСПРАВЛЕНАЯ ВЕРСИЯ
  const handleMenuItemClick = (page, isMain = true) => {
    // Обработка раскрытия/закрытия подменю "Культурная карта"
    if (page === "cultural" && isMain) {
      setIsCulturalOpen(!isCulturalOpen);
      return;
    }

    // Закрываем меню
    setMenuOpen(false);

    // Определяем путь для навигации
    let targetPath = "";
    switch (page) {
      case "quest":
        targetPath = "/quest";
        break;
      case "temples":
        targetPath = "/temples";
        break;
      case "museums":
        targetPath = "/museums";
        break;
      case "art":
        targetPath = "/art";
        break;
      case "history":
        targetPath = "/history";
        break;
      case "family":
        targetPath = "/family";
        break;
      case "gastro":
        targetPath = "/gastro";
        break;
      case "about":
        targetPath = "/about";
        break;
      case "reviews":
        targetPath = "/reviews";
        break;
      default:
        targetPath = "/";
        break;
    }

    // Если передан колбэк от родителя - используем его
    if (onMenuItemClick) {
      onMenuItemClick(page);
    } else {
      // Иначе используем navigate
      navigate(targetPath);
    }
  };

  return (
    <>
      <header className={`app-header ${menuOpen ? "open" : ""}`}>
        {!isHomePage || showBackButton ? (
          <button className="back-arrow-button" onClick={handleGoBack}>
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
