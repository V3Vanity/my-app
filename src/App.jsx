import React, { useState, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import "./App.css";
import MapCanvas from "./components/MapCanvas.jsx";
import topImage from "./assets/top-image.png";
import QuestPage from "./pages/QuestPage.jsx";
import Header from "./components/Header.jsx";

function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const mapRef = useRef(null);
  const navigate = useNavigate();

  // Обработчик нажатия на меню
  const handleMenuItemClick = (page) => {
    setMenuOpen(false);

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

  return (
    <div className="app-container">
      {/* Шапка + меню */}
      <Header
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        onMenuItemClick={handleMenuItemClick}
      />

      {/* Верхняя картинка */}
      <div className="top-image-container">
        <img src={topImage} alt="Топ" />
      </div>

      {/* Карта */}
      <MapCanvas ref={mapRef} />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/quest" element={<QuestPage />} />
        {/* Можно добавить другие страницы */}
      </Routes>
    </Router>
  );
}
