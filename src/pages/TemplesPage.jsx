import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import MapCanvas from "../components/MapCanvas";
import TemplesSlider from "../components/TemplesSlider";
import "./TemplesPage.css";

// Данные о храмах с координатами и ID для карты
const templesData = [
  {
    id: "temple1",
    mapId: "TEMPLE_KREMLIN", // Соответствует ID в mapData.js
    name: "Костромской Кремль",
    shortDescription: "Древний кремль, сердце Костромы",
    image: "/images/kostroma-kremlin.jpg",
    address: "ул. Симановского, 26, Кострома",
    description:
      "Костромской кремль — историческое ядро города, древнейшая его часть. Первоначально был деревянным, затем перестроен в камне. На территории кремля находились соборы, колокольня и другие постройки, многие из которых были утрачены в советское время. Сейчас ведутся работы по восстановлению кремлёвского ансамбля.",
    location: { lat: 57.7678, lon: 40.9352 },
  },
  {
    id: "temple2",
    mapId: "TEMPLE_SPAS",
    name: "Церковь Спаса Всемилостивого в Рядах",
    shortDescription: "Храм в сердце торговых рядов",
    image: "/images/spas-church.jpg",
    address: "ул. Красные Ряды, Кострома",
    description:
      "Церковь Спаса Всемилостивого расположена в Красных рядах, в самом центре исторической торговой части Костромы. Построена в конце XVIII века. Является ярким образцом культовой архитектуры эпохи классицизма. Храм действующий, здесь регулярно проводятся богослужения.",
    location: { lat: 57.7673, lon: 40.9262 },
  },
  {
    id: "temple3",
    mapId: "TEMPLE_SMOLENSK",
    name: "Церковь Смоленской иконы Божией Матери",
    shortDescription: "Жемчужина Богоявленского монастыря",
    image: "/images/smolensk-church.jpg",
    address: "ул. Симановского, 26, Кострома",
    description:
      "Церковь Смоленской иконы Божией Матери входит в ансамбль Богоявленского-Анастасииного монастыря. Построена в XIX веке, отличается изящной архитектурой и богатым внутренним убранством. Здесь хранятся почитаемые святыни.",
    location: { lat: 57.767, lon: 40.934 },
  },
  {
    id: "temple4",
    mapId: "TEMPLE_BOGOYAVLEN",
    name: "Собор Богоявления Господня",
    shortDescription: "Главный собор Богоявленского монастыря",
    image: "/images/bogoyavlensky-cathedral.jpg",
    address: "ул. Симановского, 26, Кострома",
    description:
      "Богоявленский собор — главный храм Богоявленского-Анастасииного женского монастыря. Построен в XVI-XVII веках. Это величественное сооружение с богатой историей, уникальными фресками и иконостасом. В соборе покоятся мощи преподобного Никиты Костромского.",
    location: { lat: 57.7672, lon: 40.9345 },
  },
  {
    id: "temple5",
    mapId: "TEMPLE_ILYA",
    name: "Церковь Илии Пророка на Русиной улице",
    shortDescription: "Древний храм в историческом районе",
    image: "/images/ilya-church.jpg",
    address: "ул. Русина, Кострома",
    description:
      "Церковь Илии Пророка — один из древнейших храмов Костромы, расположенный в историческом районе Русина улица. Первое упоминание относится к XVII веку. Храм представляет собой характерный образец посадского храма, сочетающий древнерусские традиции и элементы более поздних стилей.",
    location: { lat: 57.7701, lon: 40.921 },
  },
  {
    id: "temple6",
    mapId: "TEMPLE_VOSKRES",
    name: "Церковь Воскресения Христова на Дебре",
    shortDescription: "Шедевр узорочья XVII века",
    image: "/images/voskres-church.jpg",
    address: "ул. Нижняя Дебря, 37, Кострома",
    description:
      "Церковь Воскресения на Дебре — единственный сохранившийся посадский храм Костромы XVII века. Уникальный памятник архитектуры, богато украшенный изразцами и резьбой по белому камню. Интерьеры храма сохранили древние фрески и иконостас. Это одна из главных архитектурных жемчужин Костромы.",
    location: { lat: 57.7602, lon: 40.9765 },
  },
  {
    id: "temple7",
    mapId: "TEMPLE_ZNAMENIE",
    name: "Церковь иконы Божией Матери Знамение",
    shortDescription: "Уютный храм в центре города",
    image: "/images/znamenie-church.jpg",
    address: "ул. Свердлова, Кострома",
    description:
      "Церковь иконы Божией Матери «Знамение» расположена недалеко от центра Костромы. Построена в XVIII веке. Это небольшой, но очень гармоничный храм, выполненный в стиле барокко с элементами классицизма. Внутри сохранились старинные росписи и иконы.",
    location: { lat: 57.7695, lon: 40.922 },
  },
];

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
        // Центрируем на храме и строим маршрут
        mapRef.current.centerOnTemple(temple.mapId);
        mapRef.current.buildRouteToTemple(temple.mapId);
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
