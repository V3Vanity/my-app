import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import MapCanvas from "../components/MapCanvas";
import CategorySlider from "../components/CategorySlider";
import { allMuseums } from "../components/mapData.js"; // ИСПРАВЛЕННЫЙ ПУТЬ
import "./MuseumsPage.css";

export default function MuseumsPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSlider, setShowSlider] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [selectedMuseum, setSelectedMuseum] = useState(null);
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
    setSelectedMuseum(null);
  };

  const handleNavigateToMuseum = (museum) => {
    setSelectedMuseum(museum);
    setShowSlider(false);
    setShowMap(true);

    setTimeout(() => {
      if (mapRef.current && museum.mapId) {
        mapRef.current.centerOnTemple?.(museum.mapId);
        mapRef.current.buildRouteToTemple?.(museum.mapId);
      }
    }, 300);
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
              mode="temple"
              selectedTemple={selectedMuseum}
              className="museum-map"
            />
          </div>
        )}
      </div>
    </>
  );
}
