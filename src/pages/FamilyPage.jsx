import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import MapCanvas from "../components/MapCanvas";
import CategorySlider from "../components/CategorySlider";
import { allFamily } from "../components/mapData.js";
import "./FamilyPage.css";

export default function FamilyPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSlider, setShowSlider] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState(null);
  const mapRef = useRef(null);

  // Блокировка скролла body при открытом слайдере
  useEffect(() => {
    if (showSlider) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showSlider]);

  const handleMenuItemClick = (page) => {
    setMenuOpen(false);
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
  };

  const handleBackFromMap = () => {
    setShowMap(false);
    setShowSlider(true);
    setSelectedFamily(null);
  };

  const handleNavigateToFamily = (familyItem) => {
    console.log("Navigating to family place:", familyItem);
    setSelectedFamily(familyItem);
    setShowSlider(false);
    setShowMap(true);

    // Даём время на монтирование карты
    setTimeout(() => {
      if (mapRef.current && familyItem.mapId) {
        // Используем методы для музеев (пока нет отдельного режима для семьи)
        mapRef.current.centerOnMuseum?.(familyItem.mapId);
        mapRef.current.buildRouteToMuseum?.(familyItem.mapId);
      }
    }, 300);
  };

  // Конфигурация для внешних ссылок
  const externalLinksConfig = {
    startIndex: 2,
    links: [
      allFamily[2]?.externalLink || "https://yandex.ru/maps/",
      allFamily[3]?.externalLink || "https://yandex.ru/maps/",
      allFamily[4]?.externalLink || "https://yandex.ru/maps/",
      allFamily[5]?.externalLink || "https://yandex.ru/maps/",
    ],
  };

  // Проверяем, что allFamily существует и не пустой
  if (!allFamily || allFamily.length === 0) {
    console.warn("allFamily is empty or undefined!");
    return (
      <>
        <Header
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          onMenuItemClick={handleMenuItemClick}
        />
        <div className="family-page-container">
          <div
            style={{ padding: "20px", textAlign: "center", color: "#4a3718" }}
          >
            <h2>Данные о семейных местах загружаются...</h2>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        onMenuItemClick={handleMenuItemClick}
        onBack={showMap ? handleBackFromMap : undefined}
        showBackButton={showMap}
      />

      <div className="family-page-container">
        {/* Слайдер с семейными местами */}
        {showSlider && (
          <CategorySlider
            items={allFamily}
            onNavigateToItem={handleNavigateToFamily}
            externalLinksConfig={externalLinksConfig}
          />
        )}

        {/* Карта с маршрутом к выбранному месту */}
        {showMap && selectedFamily && (
          <div className="family-map-wrapper">
            <MapCanvas
              ref={mapRef}
              mode="family"
              selectedTemple={selectedFamily}
              className="family-map"
            />
          </div>
        )}
      </div>
    </>
  );
}
