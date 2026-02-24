import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import "./App.css";
import topImage from "./assets/top-image.png";
import QuestPage from "./pages/QuestPage.jsx";
import GastroTour from "./pages/GastroTour.jsx";
import TemplesPage from "./pages/TemplesPage.jsx";
import MuseumsPage from "./pages/MuseumsPage.jsx";
import ArtPage from "./pages/ArtPage.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";
import FamilyPage from "./pages/FamilyPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import ReviewsPage from "./pages/ReviewsPage.jsx";
import Header from "./components/Header.jsx";
import questImage from "./assets/App-img.png";

function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
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
      <div className="quest-image-container">
        <img src={questImage} alt="Квест" />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/quest" element={<QuestPage />} />
        <Route path="/temples" element={<TemplesPage />} />
        <Route path="/museums" element={<MuseumsPage />} />
        <Route path="/art" element={<ArtPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/family" element={<FamilyPage />} />
        <Route path="/gastro" element={<GastroTour />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/reviews" element={<ReviewsPage />} />
      </Routes>
    </Router>
  );
}
