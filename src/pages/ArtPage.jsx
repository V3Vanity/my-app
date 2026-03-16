import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import MapCanvas from "../components/MapCanvas";
import CategorySlider from "../components/CategorySlider";
import { allArt } from "../components/mapData.js";
import "./ArtPage.css";

export default function ArtPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSlider, setShowSlider] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [selectedArt, setSelectedArt] = useState(null);
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
    setSelectedArt(null);
  };

  const handleNavigateToArt = (art) => {
    console.log("Navigating to art place:", art);
    setSelectedArt(art);
    setShowSlider(false);
    setShowMap(true);

    // Даём время на монтирование карты
    setTimeout(() => {
      if (mapRef.current && art.mapId) {
        mapRef.current.centerOnArt?.(art.mapId);
        mapRef.current.buildRouteToArt?.(art.mapId);
      }
    }, 300);
  };

  // Конфигурация для внешних ссылок
  const externalLinksConfig = {
    startIndex: 2,
    links: ["https://yandex.ru/maps/-/CPFZJY8F"],
  };

  if (!allArt || allArt.length === 0) {
    console.warn("allArt is empty or undefined!");
    return (
      <>
        <Header
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          onMenuItemClick={handleMenuItemClick}
        />
        <div className="art-page-container">
          <div
            style={{ padding: "20px", textAlign: "center", color: "#4a3718" }}
          >
            <h2>Данные об искусстве загружаются...</h2>
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

      <div className="art-page-container">
        {/* Слайдер с искусством */}
        {showSlider && (
          <CategorySlider
            items={allArt}
            onNavigateToItem={handleNavigateToArt}
            externalLinksConfig={externalLinksConfig} // Добавляем конфигурацию внешних ссылок
          />
        )}

        {/* Карта с маршрутом к выбранному месту */}
        {showMap && selectedArt && (
          <div className="art-map-wrapper">
            <MapCanvas
              ref={mapRef}
              mode="art"
              selectedTemple={selectedArt}
              className="art-map"
            />
          </div>
        )}
      </div>
    </>
  );
}
