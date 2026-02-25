import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import MapCanvas from "../components/MapCanvas";
import TemplesSlider from "../components/TemplesSlider";
import "./TemplesPage.css";

// Данные о храмах
const templesData = [
  {
    id: "temple1",
    name: "Ипатьевский монастырь",
    shortDescription: "Колыбель династии Романовых",
    image: "/images/ipatiev-monastery.jpg",
    address: "ул. Просвещения, 1, Кострома",
    description:
      "Свято-Троицкий Ипатьевский монастырь — один из древнейших монастырей России, основанный около 1330 года. Здесь был призван на царство Михаил Романов, что положило конец Смутному времени. Монастырь является уникальным архитектурным ансамблем, включающим Троицкий собор с знаменитыми фресками, звонницу и палаты Романовых.",
    location: { lat: 57.7723, lon: 40.9349 }, // Координаты для навигации
  },
  {
    id: "temple2",
    name: "Богоявленский собор",
    shortDescription: "Жемчужина костромского зодчества",
    image: "/images/bogoiavlen Cathedral.jpg",
    address: "ул. Симановского, 26, Кострома",
    description:
      "Богоявленский собор — главный храм Костромского кремля, построенный в XVI веке. Собор славится своим уникальным иконостасом и фресками. Здесь хранится чудотворная Феодоровская икона Божией Матери, одна из самых почитаемых святынь России.",
    location: { lat: 57.7678, lon: 40.9352 },
  },
  {
    id: "temple3",
    name: "Церковь Воскресения на Дебре",
    shortDescription: "Шедевр узорочья XVII века",
    image: "/images/resurrection-church.jpg",
    address: "ул. Нижняя Дебря, 37, Кострома",
    description:
      "Церковь Воскресения на Дебре — единственный сохранившийся посадский храм Костромы XVII века. Уникальный памятник архитектуры, богато украшенный изразцами и резьбой по белому камню. Интерьеры храма сохранили древние фрески и иконостас.",
    location: { lat: 57.7602, lon: 40.9765 },
  },
];

export default function TemplesPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSlider, setShowSlider] = useState(true); // Слайдер открыт по умолчанию
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
      if (mapRef.current && temple.location) {
        // Здесь можно добавить метод для центрирования карты на храме
        // и построения маршрута
        console.log("Построить маршрут к:", temple.name);
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
        showBackButton={showMap} // Добавим пропс в Header для показа стрелки
      />

      <div className="temples-page-container">
        {/* Слайдер с храмами */}
        {showSlider && (
          <TemplesSlider
            temples={templesData}
            onClose={() => navigate("/")}
            onNavigateToTemple={handleNavigateToTemple}
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
