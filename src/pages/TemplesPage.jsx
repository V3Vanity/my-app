import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import MapCanvas from "../components/MapCanvas";
import CategorySlider from "../components/CategorySlider"; // новый универсальный слайдер
import { allTemples } from "../components/mapData.js"; // ИСПРАВЛЕННЫЙ ПУТЬ
import "./TemplesPage.css";

export default function TemplesPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSlider, setShowSlider] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [selectedTemple, setSelectedTemple] = useState(null);
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
    setSelectedTemple(null);
  };

  const handleNavigateToTemple = (temple) => {
    setSelectedTemple(temple);
    setShowSlider(false);
    setShowMap(true);

    // Даём время на монтирование карты
    setTimeout(() => {
      if (mapRef.current && temple.mapId) {
        mapRef.current.centerOnTemple(temple.mapId);
        mapRef.current.buildRouteToTemple(temple.mapId);
      }
    }, 300);
  };

  // Конфигурация для внешних ссылок (Яндекс Карты)
  const externalLinksConfig = {
    startIndex: 5, // последние два храма (индексы 5 и 6)
    links: [
      "https://yandex.ru/maps/-/CPBt64Ib",
      "https://yandex.ru/maps/-/CPBt66k1",
    ],
  };

  return (
    <>
      <Header
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        onMenuItemClick={handleMenuItemClick}
        onBack={showMap ? handleBackFromMap : undefined}
        showBackButton={showMap}
      />

      <div className="temples-page-container">
        {/* Слайдер с храмами */}
        {showSlider && (
          <CategorySlider
            items={allTemples}
            onNavigateToItem={handleNavigateToTemple}
            externalLinksConfig={externalLinksConfig}
          />
        )}

        {/* Карта с маршрутом к выбранному храму */}
        {showMap && selectedTemple && (
          <div className="temple-map-wrapper">
            <MapCanvas
              ref={mapRef}
              mode="temple"
              selectedTemple={selectedTemple}
              className="temple-map"
            />
          </div>
        )}
      </div>
    </>
  );
}
