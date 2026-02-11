import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MapCanvas from "../components/MapCanvas.jsx";
import RestaurantDetail from "../components/RestaurantDetail.jsx";
import Header from "../components/Header.jsx";
import "./GastroTour.css";

// ИМПОРТЫ ИЗОБРАЖЕНИЙ ДЛЯ РЕСТОРАНОВ
// Ресторан 1
import rest1Outside from "../assets/restaurants/restaurant-1/outside.jpg";
import rest1Inside1 from "../assets/restaurants/restaurant-1/inside1.jpg";
import rest1Inside2 from "../assets/restaurants/restaurant-1/inside2.jpg";
import menu11 from "../assets/restaurants/restaurant-1/menu.svg";
import menu12 from "../assets/restaurants/restaurant-1/menu1.svg";
import menu13 from "../assets/restaurants/restaurant-1/menu2.svg";
import plate11 from "../assets/restaurants/restaurant-1/plate1.jpg";
import plate12 from "../assets/restaurants/restaurant-1/plate2.jpg";

// // Ресторан 2
// import cafeOutside from "../assets/restaurants/restaurant-2/outside.jpg";
// import cafeInside1 from "../assets/restaurants/restaurant-2/inside1.jpg";
// import cafeInside2 from "../assets/restaurants/restaurant-2/inside2.jpg";
// import menu21 from "../assets/restaurants/restaurant-2/menu1.jpg";
// import menu22 from "../assets/restaurants/restaurant-2/menu2.jpg";
// import menu23 from "../assets/restaurants/restaurant-2/menu3.jpg";
// import plate21 from "../assets/restaurants/restaurant-2/plate1.jpg";
// import plate22 from "../assets/restaurants/restaurant-2/plate2.jpg";

// Ресторан 3
// import pubOutside from "../assets/restaurants/restaurant-3/outside.jpg";
// import pubInside1 from "../assets/restaurants/restaurant-3/inside1.jpg";
// import pubInside2 from "../assets/restaurants/restaurant-3/inside2.jpg";
// import fishChipsImg from "../assets/restaurants/restaurant-3/menu1.jpg";
// import burgerImg from "../assets/restaurants/restaurant-3/menu2.jpg";
// import beerImg from "../assets/restaurants/restaurant-3/menu3.jpg";
// import kvasImg from "../assets/restaurants/restaurant-3/plate1.jpg";
// import picklesImg from "../assets/restaurants/restaurant-3/plate2.jpg";

// Тестовые данные ресторанов с реальными импортами
const RESTAURANTS = [
  {
    id: 1,
    name: "Семейный Ресторан «Сыровар»",
    description:
      "Сыровар — это уникальное место в центре Костромы, объединяющее ресторан, сыроварню и сырную лавку. В ресторане подают блюда с собственным сыром, а в лавке можно приобрести сыры ручной работы.",
    location: { x: 500, y: 300 },
    type: "restaurant",
    logo: "logo1.svg",
    address: "Сыровар просп. Мира, 4, Кострома",
    coordinates: { lat: 57.768, lon: 40.926 },
    photos: [rest1Outside, rest1Inside1, rest1Inside2],
    menu: [
      { image: menu11, price: 350 },
      { image: menu12, price: 450 },
      { image: menu13, price: 250 },
    ],
    localDishes: [{ image: plate11 }, { image: plate12 }],
    averageCheck: 1600,

    mapOid: "186779297895", // Сыровар
    mapLat: "57.768915",
    mapLon: "40.933710",
    mapName: "Сыровар",
  },
  // {
  //   id: 2,
  //   name: "Кафе 'Уют'",
  //   description: "Кофе и десерты в центре города",
  //   location: { x: 650, y: 400 },
  //   type: "cafe",
  //   logo: "logo2.svg",
  //   address: "пр-т Мира, 12",
  //   coordinates: { lat: 57.766, lon: 40.928 },
  //   photos: [cafeOutside, cafeInside1, cafeInside2],
  //   menu: [
  //     {
  //       name: "Капучино",
  //       price: 200,
  //       image: cappuccinoImg,
  //       description: "Классический капучино с плотной молочной пеной",
  //     },
  //     {
  //       name: "Торт 'Наполеон'",
  //       price: 350,
  //       image: tortImg,
  //       description: "Домашний торт с заварным кремом и хрустящими коржами",
  //     },
  //     {
  //       name: "Чай с травами",
  //       price: 150,
  //       image: teaImg,
  //       description: "Ароматный сбор из костромских трав",
  //     },
  //   ],
  //   localDishes: [
  //     {
  //       name: "Костромской мёд",
  //       image: honeyImg,
  //       description: "Натуральный мед с пасек Костромской области",
  //     },
  //   ],
  // },
  // {
  //   id: 3,
  //   name: "Паб 'У камина'",
  //   description: "Английская кухня и крафтовое пиво",
  //   location: { x: 350, y: 450 },
  //   type: "pub",
  //   logo: "logo3.svg",
  //   address: "ул. Чайковского, 8",
  //   coordinates: { lat: 57.77, lon: 40.924 },
  //   photos: [pubOutside, pubInside1, pubInside2],
  //   menu: [
  //     {
  //       name: "Фиш энд чипс",
  //       price: 550,
  //       image: fishChipsImg,
  //       description: "Треска в хрустящем пивном кляре с картофелем фри",
  //     },
  //     {
  //       name: "Бургер",
  //       price: 450,
  //       image: burgerImg,
  //       description: "Говяжья котлета, сыр чеддер, карамелизованный лук",
  //     },
  //     {
  //       name: "Крафтовое пиво",
  //       price: 300,
  //       image: beerImg,
  //       description: "Домашнее пиво по английским рецептам",
  //     },
  //   ],
  //   localDishes: [
  //     {
  //       name: "Костромской квас",
  //       image: kvasImg,
  //       description: "Живой квас двойного брожения",
  //     },
  //     {
  //       name: "Домашние соленья",
  //       image: picklesImg,
  //       description: "Квашеная капуста, соленые огурцы и помидоры",
  //     },
  //   ],
  // },
];

export default function GastroTour() {
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const mapRef = useRef(null);
  const navigate = useNavigate();

  // Функция для обработки клика по маркеру
  const handleMarkerClick = (restaurantId) => {
    const restaurant = RESTAURANTS.find((r) => r.id === restaurantId);
    if (restaurant) {
      setSelectedRestaurant(restaurant);
    }
  };

  // Функция для центрирования карты на ресторане
  const centerOnRestaurant = (restaurant) => {
    if (mapRef.current && restaurant) {
      mapRef.current.centerOnPixel(
        { x: restaurant.location.x, y: restaurant.location.y },
        2.0,
      );
    }
  };

  // Обработчик для меню (переход между страницами)
  const handleMenuItemClick = (page) => {
    setMenuOpen(false);

    switch (page) {
      case "quest":
        navigate("/quest");
        break;
      case "temples":
        alert("Страница 'Квест-экскурсия по храмам и музеям' в разработке");
        break;
      case "gastro":
        break;
      case "about":
        alert("Страница 'О нас' в разработке");
        break;
      case "reviews":
        alert("Страница 'Отзывы' в разработке");
        break;
      default:
        break;
    }
  };

  return (
    <div className="gastro-tour-container">
      <Header
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        onMenuItemClick={handleMenuItemClick}
      />

      <div className="gastro-map-container">
        <div className="gastro-map">
          <MapCanvas
            ref={mapRef}
            mode="gastro"
            restaurants={RESTAURANTS}
            onMarkerClick={handleMarkerClick}
          />
        </div>
      </div>

      <RestaurantDetail
        restaurant={selectedRestaurant}
        isOpen={!!selectedRestaurant}
        onClose={() => setSelectedRestaurant(null)}
        onCenterMap={() => centerOnRestaurant(selectedRestaurant)}
      />
    </div>
  );
}
