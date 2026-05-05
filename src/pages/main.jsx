// src/pages/main.jsx
import React, { useState } from "react";
import { useNavigate, Routes, Route } from "react-router-dom";
import "/src/pages/main.css";
import topImage from "../assets/top-image.png";
import questImage from "../assets/quest-img.png";
import QuestPage from "./QuestPage.jsx";
import MuseumsPage from "./MuseumsPage.jsx";
import TemplesPage from "./TemplesPage.jsx";
import GastroTour from "./GastroTour.jsx";
import ArtPage from "./ArtPage.jsx";
import FamilyPage from "./FamilyPage.jsx";
import HistoryPage from "./HistoryPage.jsx";
import ReviewsPage from "./ReviewsPage.jsx";
import AboutPage from "./AboutPage.jsx";
import Header from "../components/Header.jsx";

// Главная страница
function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleMenuItemClick = (page) => {
    setMenuOpen(false);

    let path = "";
    switch (page) {
      case "quest":
        path = "/app/quest";
        break;
      case "temples":
        path = "/app/temples";
        break;
      case "museums":
        path = "/app/museums";
        break;
      case "art":
        path = "/app/art";
        break;
      case "history":
        path = "/app/history";
        break;
      case "family":
        path = "/app/family";
        break;
      case "gastro":
        path = "/app/gastro";
        break;
      case "about":
        path = "/app/about";
        break;
      case "reviews":
        path = "/app/reviews";
        break;
      default:
        path = "/app";
        break;
    }

    navigate(path);
  };

  return (
    <div className="app-container">
      <Header
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        onMenuItemClick={handleMenuItemClick}
      />
      <div className="top-image-container">
        <img src={topImage} alt="Топ" />
      </div>
      <div className="quest-image-container">
        <img src={questImage} alt="Квест" />
      </div>
    </div>
  );
}

//  PageWrapper
const PageWrapper = ({ children, onBack, showBackButton, onQuestBack }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleMenuItemClick = (page) => {
    setMenuOpen(false);

    let path = "";
    switch (page) {
      case "quest":
        path = "/app/quest";
        break;
      case "temples":
        path = "/app/temples";
        break;
      case "museums":
        path = "/app/museums";
        break;
      case "art":
        path = "/app/art";
        break;
      case "history":
        path = "/app/history";
        break;
      case "family":
        path = "/app/family";
        break;
      case "gastro":
        path = "/app/gastro";
        break;
      case "about":
        path = "/app/about";
        break;
      case "reviews":
        path = "/app/reviews";
        break;
      default:
        path = "/app";
        break;
    }

    navigate(path);
  };

  // Функция для обработки возврата
  const handleGoBack = () => {
    if (onBack) {
      onBack(); // Используем переданную функцию
    } else {
      navigate(-1); // Стандартное поведение
    }
  };

  return (
    <>
      <Header
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        onMenuItemClick={handleMenuItemClick}
        onBack={showBackButton ? handleGoBack : undefined}
        onQuestBack={onQuestBack}
        showBackButton={showBackButton}
      />
      {children}
    </>
  );
};

// Основной компонент
export default function MainApp() {
  // Состояние для TemplesPage
  const [templesState, setTemplesState] = useState({
    showSlider: true,
    showMap: false,
    selectedItem: null,
  });

  const handleTemplesBackFromMap = () => {
    setTemplesState({
      showSlider: true,
      showMap: false,
      selectedItem: null,
    });
  };

  const handleTemplesNavigate = (item) => {
    setTemplesState({
      showSlider: false,
      showMap: true,
      selectedItem: item,
    });
  };

  // Состояние для MuseumsPage
  const [museumsState, setMuseumsState] = useState({
    showSlider: true,
    showMap: false,
    selectedItem: null,
  });

  const handleMuseumsBackFromMap = () => {
    setMuseumsState({
      showSlider: true,
      showMap: false,
      selectedItem: null,
    });
  };

  const handleMuseumsNavigate = (item) => {
    setMuseumsState({
      showSlider: false,
      showMap: true,
      selectedItem: item,
    });
  };

  // Состояние для ArtPage
  const [artState, setArtState] = useState({
    showSlider: true,
    showMap: false,
    selectedItem: null,
  });

  const handleArtBackFromMap = () => {
    setArtState({
      showSlider: true,
      showMap: false,
      selectedItem: null,
    });
  };

  const handleArtNavigate = (item) => {
    setArtState({
      showSlider: false,
      showMap: true,
      selectedItem: item,
    });
  };

  // Состояние для HistoryPage
  const [historyState, setHistoryState] = useState({
    showSlider: true,
    showMap: false,
    selectedItem: null,
  });

  const handleHistoryBackFromMap = () => {
    setHistoryState({
      showSlider: true,
      showMap: false,
      selectedItem: null,
    });
  };

  const handleHistoryNavigate = (item) => {
    setHistoryState({
      showSlider: false,
      showMap: true,
      selectedItem: item,
    });
  };

  // Состояние для FamilyPage (уже есть)
  const [familyState, setFamilyState] = useState({
    showSlider: true,
    showMap: false,
    selectedItem: null,
  });

  const handleFamilyBackFromMap = () => {
    setFamilyState({
      showSlider: true,
      showMap: false,
      selectedItem: null,
    });
  };

  const handleFamilyNavigate = (item) => {
    setFamilyState({
      showSlider: false,
      showMap: true,
      selectedItem: item,
    });
  };

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="quest"
        element={
          <PageWrapper
            onQuestBack={() => {
              const event = new CustomEvent("questBack");
              window.dispatchEvent(event);
            }}
            showBackButton={true}
          >
            <QuestPage />
          </PageWrapper>
        }
      />

      <Route
        path="temples"
        element={
          <PageWrapper
            onBack={templesState.showMap ? handleTemplesBackFromMap : undefined}
            showBackButton={templesState.showMap}
          >
            <TemplesPage
              showSlider={templesState.showSlider}
              showMap={templesState.showMap}
              selectedItem={templesState.selectedItem}
              onNavigate={handleTemplesNavigate}
            />
          </PageWrapper>
        }
      />

      <Route
        path="museums"
        element={
          <PageWrapper
            onBack={museumsState.showMap ? handleMuseumsBackFromMap : undefined}
            showBackButton={museumsState.showMap}
          >
            <MuseumsPage
              showSlider={museumsState.showSlider}
              showMap={museumsState.showMap}
              selectedItem={museumsState.selectedItem}
              onNavigate={handleMuseumsNavigate}
            />
          </PageWrapper>
        }
      />

      <Route
        path="art"
        element={
          <PageWrapper
            onBack={artState.showMap ? handleArtBackFromMap : undefined}
            showBackButton={artState.showMap}
          >
            <ArtPage
              showSlider={artState.showSlider}
              showMap={artState.showMap}
              selectedItem={artState.selectedItem}
              onNavigate={handleArtNavigate}
            />
          </PageWrapper>
        }
      />

      <Route
        path="history"
        element={
          <PageWrapper
            onBack={historyState.showMap ? handleHistoryBackFromMap : undefined}
            showBackButton={historyState.showMap}
          >
            <HistoryPage
              showSlider={historyState.showSlider}
              showMap={historyState.showMap}
              selectedItem={historyState.selectedItem}
              onNavigate={handleHistoryNavigate}
            />
          </PageWrapper>
        }
      />

      <Route
        path="family"
        element={
          <PageWrapper
            onBack={familyState.showMap ? handleFamilyBackFromMap : undefined}
            showBackButton={familyState.showMap}
          >
            <FamilyPage
              showSlider={familyState.showSlider}
              showMap={familyState.showMap}
              selectedItem={familyState.selectedItem}
              onNavigate={handleFamilyNavigate}
            />
          </PageWrapper>
        }
      />

      <Route
        path="gastro"
        element={
          <PageWrapper>
            <GastroTour />
          </PageWrapper>
        }
      />
      <Route
        path="about"
        element={
          <PageWrapper>
            <AboutPage />
          </PageWrapper>
        }
      />
      <Route
        path="reviews"
        element={
          <PageWrapper>
            <ReviewsPage />
          </PageWrapper>
        }
      />
    </Routes>
  );
}
