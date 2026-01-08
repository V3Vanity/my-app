import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MapCanvas from "../components/MapCanvas.jsx";
import Header from "../components/Header.jsx";
import topImage from "../assets/marshrut44.png";

export default function QuestPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const mapRef = useRef(null);
  const navigate = useNavigate();

  // Функция навигации для Header
  const navigateTo = (page) => {
    switch (page) {
      case "quest":
        navigate("/quest");
        break;
      case "temples":
        navigate("/temples");
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
        break;
    }
  };

  // При монтировании страницы включаем режим квеста
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.startQuest(); // переключаем MapCanvas в режим квеста
    }
  }, []);

  const handleStartJourney = () => {
    // Запускаем построение маршрута к START
    if (mapRef.current) {
      mapRef.current.buildRouteToStart();
    }
  };

  return (
    <div className="app-container">
      {/* Шапка */}
      <Header
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        navigateTo={navigateTo}
      />

      {/* Картинка сверху */}
      <div className="top-image-container">
        <img src={topImage} alt="Топ" />
      </div>

      {/* Кнопка */}
      <div style={{ padding: "16px", textAlign: "center" }}>
        <button
          onClick={handleStartJourney}
          style={{
            padding: "12px 24px",
            backgroundColor: "#862518",
            color: "#d9cfb8",
            fontSize: "16px",
            fontWeight: "bold",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Начать путешествие
        </button>
      </div>

      {/* Карта */}
      <MapCanvas ref={mapRef} className="map-container-quest" />
    </div>
  );
}
