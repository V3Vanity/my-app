import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import MapCanvas from "../components/MapCanvas";
import CategorySlider from "../components/CategorySlider";
import { allHistory } from "../components/mapData.js";
import "./HistoryPage.css";

export default function HistoryPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSlider, setShowSlider] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState(null);
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
    setSelectedHistory(null);
  };

  const handleNavigateToHistory = (historyItem) => {
    console.log("Navigating to history place:", historyItem);
    setSelectedHistory(historyItem);
    setShowSlider(false);
    setShowMap(true);

    // Даём время на монтирование карты
    setTimeout(() => {
      if (mapRef.current && historyItem.mapId) {
        // ИСПОЛЬЗУЕМ МЕТОДЫ ДЛЯ ИСТОРИИ
        mapRef.current.centerOnHistory?.(historyItem.mapId);
        mapRef.current.buildRouteToHistory?.(historyItem.mapId);
      }
    }, 300);
  };

  // Конфигурация для внешних ссылок (Яндекс Карты) для второй точки истории
  const externalLinksConfig = {
    startIndex: 1, // вторая точка (индекс 1)
    links: [
      allHistory[1]?.externalLink || "https://yandex.ru/maps/", // ссылка для второй точки
    ],
  };

  // Проверяем, что allHistory существует и не пустой
  if (!allHistory || allHistory.length === 0) {
    console.warn("allHistory is empty or undefined!");
    return (
      <>
        <Header
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          onMenuItemClick={handleMenuItemClick}
        />
        <div className="history-page-container">
          <div
            style={{ padding: "20px", textAlign: "center", color: "#4a3718" }}
          >
            <h2>Данные об истории загружаются...</h2>
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

      <div className="history-page-container">
        {/* Слайдер с историческими местами */}
        {showSlider && (
          <CategorySlider
            items={allHistory}
            onNavigateToItem={handleNavigateToHistory}
            externalLinksConfig={externalLinksConfig}
          />
        )}

        {/* Карта с маршрутом к выбранному месту */}
        {showMap && selectedHistory && (
          <div className="history-map-wrapper">
            <MapCanvas
              ref={mapRef}
              mode="history" // ВАЖНО: режим "history"
              selectedItem={selectedHistory} // ИЗМЕНЕНО: используем selectedItem вместо selectedTemple
              className="history-map"
            />
          </div>
        )}
      </div>
    </>
  );
}
