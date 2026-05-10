// src/components/Header.jsx - ИСПРАВЛЕННАЯ ВЕРСИЯ

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import menuImage from "../assets/menu-img.svg";
import arrowImage from "../assets/arrow-img.svg";
import "./Header.css";

export default function Header({
  menuOpen,
  setMenuOpen,
  onMenuItemClick,
  onBack,
  showBackButton = false,
  onQuestBack,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeMainItem, setActiveMainItem] = useState(null);
  const [activeSubItem, setActiveSubItem] = useState(null);
  const [isCulturalOpen, setIsCulturalOpen] = useState(false);

  const isHomePage = location.pathname === "/" || location.pathname === "/app";
  const isQuestPage =
    location.pathname === "/quest" || location.pathname === "/app/quest";

  // Функция возврата
  const handleGoBack = () => {
    if (isQuestPage && onQuestBack) {
      onQuestBack();
      setMenuOpen(false);
      return;
    }
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
    setMenuOpen(false);
  };

  // Синхронизация активного пункта с текущим маршрутом (с префиксом /app)
  useEffect(() => {
    const path = location.pathname;

    // Убираем /app из пути для сравнения
    const cleanPath = path.replace("/app", "") || "/";

    if (cleanPath === "/quest") {
      setActiveMainItem("quest");
      setActiveSubItem(null);
      setIsCulturalOpen(false);
    } else if (cleanPath === "/gastro") {
      setActiveMainItem("gastro");
      setActiveSubItem(null);
      setIsCulturalOpen(false);
    } else if (cleanPath === "/about") {
      setActiveMainItem("about");
      setActiveSubItem(null);
      setIsCulturalOpen(false);
    } else if (cleanPath === "/reviews") {
      setActiveMainItem("reviews");
      setActiveSubItem(null);
      setIsCulturalOpen(false);
    } else if (cleanPath === "/temples") {
      setActiveMainItem("cultural");
      setIsCulturalOpen(true);
      setActiveSubItem("temples");
    } else if (cleanPath === "/museums") {
      setActiveMainItem("cultural");
      setIsCulturalOpen(true);
      setActiveSubItem("museums");
    } else if (cleanPath === "/art") {
      setActiveMainItem("cultural");
      setIsCulturalOpen(true);
      setActiveSubItem("art");
    } else if (cleanPath === "/history") {
      setActiveMainItem("cultural");
      setIsCulturalOpen(true);
      setActiveSubItem("history");
    } else if (cleanPath === "/family") {
      setActiveMainItem("cultural");
      setIsCulturalOpen(true);
      setActiveSubItem("family");
    } else if (cleanPath === "/") {
      setActiveMainItem(null);
      setActiveSubItem(null);
      setIsCulturalOpen(false);
    }
  }, [location.pathname]);

  // Обработка клика по пункту меню
  const handleMenuItemClick = (page, isMain = true) => {
    // Обработка раскрытия/закрытия подменю "Культурная карта"
    if (page === "cultural" && isMain) {
      setIsCulturalOpen(!isCulturalOpen);
      return;
    }

    // Закрываем меню
    setMenuOpen(false);

    // Определяем путь для навигации (все пути идут через /app)
    let targetPath = "";
    switch (page) {
      case "quest":
        targetPath = "/app/quest";
        break;
      case "temples":
        targetPath = "/app/temples";
        break;
      case "museums":
        targetPath = "/app/museums";
        break;
      case "art":
        targetPath = "/app/art";
        break;
      case "history":
        targetPath = "/app/history";
        break;
      case "family":
        targetPath = "/app/family";
        break;
      case "gastro":
        targetPath = "/app/gastro";
        break;
      case "about":
        targetPath = "/app/about";
        break;
      case "reviews":
        targetPath = "/app/reviews";
        break;
      default:
        targetPath = "/app";
        break;
    }

    // Проверяем, находимся ли уже на этой странице
    const currentPath = location.pathname;
    if (currentPath === targetPath) {
      // Если уже на этой странице - возвращаемся на главную
      navigate("/app");
      return;
    }

    // Если передан колбэк от родителя - используем его
    if (onMenuItemClick) {
      onMenuItemClick(page);
    } else {
      navigate(targetPath);
    }
  };

  // Определяем, показывать ли кнопку "назад"
  const shouldShowBackButton = !isHomePage || showBackButton;

  return (
    <>
      <header className={`app-header ${menuOpen ? "open" : ""}`}>
        {shouldShowBackButton ? (
          <button className="back-arrow-button" onClick={handleGoBack}>
            <img src={arrowImage} alt="Меню" />
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
