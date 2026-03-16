import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import MapCanvas from "../components/MapCanvas";
import CategorySlider from "../components/CategorySlider";
import { allMuseums } from "../components/mapData.js";
import "./MuseumsPage.css";

export default function MuseumsPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSlider, setShowSlider] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [selectedMuseum, setSelectedMuseum] = useState(null);
  const mapRef = useRef(null);

  // Отладка: проверяем, что данные загружены
  console.log("MuseumsPage rendered, allMuseums:", allMuseums);
  console.log("Museums count:", allMuseums?.length);

  // Блокировка скролла body при открытом слайдере
  useEffect(() => {
    console.log("showSlider changed:", showSlider);
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
    console.log("handleBackFromMap called");
    setShowMap(false);
    setShowSlider(true);
    setSelectedMuseum(null);
  };

  const handleNavigateToMuseum = (museum) => {
    console.log("handleNavigateToMuseum called with:", museum);
    setSelectedMuseum(museum);
    setShowSlider(false);
    setShowMap(true);

    // Даём время на монтирование карты
    setTimeout(() => {
      if (mapRef.current && museum.mapId) {
        console.log("Calling map methods for museum:", museum.mapId);
        // ИСПРАВЛЕНО: используем методы для музеев
        mapRef.current.centerOnMuseum?.(museum.mapId);
        mapRef.current.buildRouteToMuseum?.(museum.mapId);
      }
    }, 300);
  };

  // Проверяем, что allMuseums существует и не пустой
  if (!allMuseums || allMuseums.length === 0) {
    console.warn("allMuseums is empty or undefined!");
    return (
      <>
        <Header
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          onMenuItemClick={handleMenuItemClick}
        />
        <div className="museums-page-container">
          <div
            style={{ padding: "20px", textAlign: "center", color: "#4a3718" }}
          >
            <h2>Данные о музеях загружаются...</h2>
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

      <div className="museums-page-container">
        {/* Слайдер с музеями */}
        {showSlider && (
          <CategorySlider
            items={allMuseums}
            onNavigateToItem={handleNavigateToMuseum}
          />
        )}

        {/* Карта с маршрутом к выбранному музею */}
        {showMap && selectedMuseum && (
          <div className="museum-map-wrapper">
            <MapCanvas
              ref={mapRef}
              mode="museum" // ИСПРАВЛЕНО: меняем режим с "temple" на "museum"
              selectedTemple={selectedMuseum} // этот пропс пока оставляем для обратной совместимости
              className="museum-map"
            />
          </div>
        )}
      </div>
    </>
  );
}
