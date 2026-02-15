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
import rest1Inside3 from "../assets/restaurants/restaurant-1/inside3.jpg";
import menu11 from "../assets/restaurants/restaurant-1/menu.svg";
import menu12 from "../assets/restaurants/restaurant-1/menu1.svg";
import menu13 from "../assets/restaurants/restaurant-1/menu2.svg";
import plate11 from "../assets/restaurants/restaurant-1/plate1.jpg";
import plate12 from "../assets/restaurants/restaurant-1/plate2.jpg";

// Ресторан 2
import rest2Outside from "../assets/restaurants/restaurant-2/outside.jpg";
import rest2Inside1 from "../assets/restaurants/restaurant-2/inside1.jpg";
import rest2Inside2 from "../assets/restaurants/restaurant-2/inside2.jpg";
import rest2Inside3 from "../assets/restaurants/restaurant-2/inside3.jpg";

import menu21 from "../assets/restaurants/restaurant-2/menu.svg";
import menu22 from "../assets/restaurants/restaurant-2/menu1.svg";
import menu23 from "../assets/restaurants/restaurant-2/menu2.svg";
import menu24 from "../assets/restaurants/restaurant-2/menu3.svg";
import menu25 from "../assets/restaurants/restaurant-2/menu4.svg";
import menu26 from "../assets/restaurants/restaurant-2/menu5.svg";
import menu27 from "../assets/restaurants/restaurant-2/menu6.svg";
import menu28 from "../assets/restaurants/restaurant-2/menu7.svg";
import menu29 from "../assets/restaurants/restaurant-2/menu8.svg";
import menu210 from "../assets/restaurants/restaurant-2/menu9.svg";
import menu211 from "../assets/restaurants/restaurant-2/menu10.svg";
import menu212 from "../assets/restaurants/restaurant-2/menu11.svg";
import menu213 from "../assets/restaurants/restaurant-2/menu12.svg";
import menu214 from "../assets/restaurants/restaurant-2/menu13.svg";
import menu215 from "../assets/restaurants/restaurant-2/menu14.svg";
import plate21 from "../assets/restaurants/restaurant-2/plate1.jpg";

// Тестовые данные ресторанов с реальными импортами
const RESTAURANTS = [
  {
    id: 1,
    name: "Семейный Ресторан «Сыровар»",
    description:
      "Сыровар — это уникальное место в центре Костромы, объединяющее ресторан, сыроварню и сырную лавку. В ресторане подают блюда с собственным сыром, а в лавке можно приобрести сыры ручной работы.",
    location: { x: 503, y: 370 },
    type: "restaurant",
    logo: "logo1.svg",
    address: "Сыровар просп. Мира, 4, Кострома",
    coordinates: { lat: 57.768, lon: 40.926 },
    photos: [rest1Outside, rest1Inside1, rest1Inside2, rest1Inside3],
    menu: [{ image: menu11 }, { image: menu12 }, { image: menu13 }],
    localDishes: [{ image: plate11 }, { image: plate12 }],
    exclusiveDescription:
      "Попробуйте легендарный «Костромской» сыр — вкус, доведённый до совершенства!  Каждый кусочек хранит традиции старинных рецептов. В ресторане представлена целая серия фирменных коктейлей, названных в честь мозайских зайцев — среди них и знаменитая «Гимназистка», а также другие напитки, вдохновлённые городскими персонажами.",
    averageCheck: 1600,

    mapOid: "186779297895", // Сыровар
    mapLat: "57.768915",
    mapLon: "40.933710",
    mapName: "Сыровар",
  },
  {
    id: 2,
    name: " Ресторан «Славянский»",
    description:
      "В самом центре города, в здании, сохранившем дух прошлых веков, находится ресторан «Славянский» - идеальное место для любителей русской кухни.",
    location: { x: 518, y: 650 },
    type: "restaurant",
    logo: "logo1.svg",
    address: " Славянский ул. Молочная Гора, 1, Кострома ",
    coordinates: { lat: 40.924119, lon: 57.766257 },
    photos: [rest2Outside, rest2Inside1, rest2Inside2, rest2Inside3],
    menu: [
      { image: menu21 },
      { image: menu22 },
      { image: menu23 },
      { image: menu24 },
      { image: menu25 },
      { image: menu26 },
      { image: menu27 },
      { image: menu28 },
      { image: menu29 },
      { image: menu210 },
      { image: menu211 },
      { image: menu212 },
      { image: menu213 },
      { image: menu214 },
      { image: menu215 },
    ],
    localDishes: [{ image: plate21 }],
    exclusiveDescription:
      "В этом блюде вечное лето. Костромские зеленые суточные щи, приготовленные по особому рецепту, бьют рекорды по популярности у туристов. Попробовать их приезжают гости из разных уголков страны. Чем отличают костромские щи от остальных? Попробуйте и узнаете!",
    averageCheck: 1500,

    mapOid: "1117087429",
    mapLat: "57.766257",
    mapLon: "40.924119",
    mapName: "Славянский",
  },
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
