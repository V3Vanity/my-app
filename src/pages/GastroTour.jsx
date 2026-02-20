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
import logo1 from "../assets/restaurants/restaurant-1/logo.svg";

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
import logo2 from "../assets/restaurants/restaurant-2/logo.svg";

// Ресторан 3
import rest3Outside from "../assets/restaurants/restaurant-3/outside.jpg";
import rest3Inside1 from "../assets/restaurants/restaurant-3/inside1.jpg";
import rest3Inside2 from "../assets/restaurants/restaurant-3/inside2.jpg";
import rest3Inside3 from "../assets/restaurants/restaurant-3/inside3.jpg";

import menu31 from "../assets/restaurants/restaurant-3/menu.svg";
import menu32 from "../assets/restaurants/restaurant-3/menu1.svg";

import plate31 from "../assets/restaurants/restaurant-3/plate1.jpg";
import logo3 from "../assets/restaurants/restaurant-3/logo.svg";

// Ресторан 4
import rest4Outside from "../assets/restaurants/restaurant-4/outside.jpg";
import rest4Inside1 from "../assets/restaurants/restaurant-4/inside1.jpg";
import rest4Inside2 from "../assets/restaurants/restaurant-4/inside2.jpg";
import rest4Inside3 from "../assets/restaurants/restaurant-4/inside3.jpg";

import menu41 from "../assets/restaurants/restaurant-4/menu.svg";
import menu42 from "../assets/restaurants/restaurant-4/menu1.svg";
import menu43 from "../assets/restaurants/restaurant-4/menu2.svg";

import plate41 from "../assets/restaurants/restaurant-4/plate1.jpg";
import logo4 from "../assets/restaurants/restaurant-4/logo.svg";

// Ресторан 5
import rest5Outside from "../assets/restaurants/restaurant-5/outside.jpg";
import rest5Inside1 from "../assets/restaurants/restaurant-5/inside1.jpg";
import rest5Inside2 from "../assets/restaurants/restaurant-5/inside2.jpg";
import rest5Inside3 from "../assets/restaurants/restaurant-5/inside3.jpg";

import menu51 from "../assets/restaurants/restaurant-5/menu.svg";
import menu52 from "../assets/restaurants/restaurant-5/menu1.svg";
import menu53 from "../assets/restaurants/restaurant-5/menu2.svg";

import plate51 from "../assets/restaurants/restaurant-5/plate1.jpg";
import logo5 from "../assets/restaurants/restaurant-5/logo.svg";

// Тестовые данные ресторанов с реальными импортами
const RESTAURANTS = [
  {
    id: 1,
    name: "Семейный Ресторан «Сыровар»",
    description:
      "Сыровар — это уникальное место в центре Костромы, объединяющее ресторан, сыроварню и сырную лавку. В ресторане подают блюда с собственным сыром, а в лавке можно приобрести сыры ручной работы.",
    location: { x: 503, y: 370 },
    type: "restaurant",
    logo: logo1,
    address: "Сыровар просп. Мира, 4, Кострома",
    coordinates: { lat: 57.768, lon: 40.926 },
    photos: [rest1Outside, rest1Inside1, rest1Inside2, rest1Inside3],
    menu: [{ image: menu11 }, { image: menu12 }, { image: menu13 }],
    localDishes: [{ image: plate11 }, { image: plate12 }],
    exclusiveDescription:
      "Попробуйте легендарный «Костромской» сыр — вкус, доведённый до совершенства! Каждый кусочек хранит традиции старинных рецептов. В ресторане представлена целая серия фирменных коктейлей, названных в честь мозайских зайцев — среди них и знаменитая «Гимназистка», а также другие напитки, вдохновлённые городскими персонажами.",
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
    logo: logo2,
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
  {
    id: 3,
    name: "Ресторан «Старая пристань»",
    description:
      "Ресторан Старая Пристань — не просто ресторан, а кусочек истории на берегу Волги! Находясь в живописном месте, ресторан предлагает Вам не только насладиться созерцанием красивой  природы, но и испытать истинное наслаждение от классических блюд русской кухни.",
    location: { x: 535, y: 1000 },
    type: "restaurant",
    logo: logo3,
    address: "Старая пристань ул. 1 Мая, 9, Кострома",
    coordinates: { lat: 40.919656, lon: 57.764284 },
    photos: [rest3Outside, rest3Inside1, rest3Inside2, rest3Inside3],
    menu: [{ image: menu31 }, { image: menu32 }],
    localDishes: [{ image: plate31 }],
    exclusiveDescription:
      "Бифштекс из лосятины — редкое и изысканное блюдо,  насыщенный вкус дикого мяса и авторская подача делают его настоящей гастрономической изюминкой Костромы.",
    averageCheck: 3000,

    mapOid: "1136530337",
    mapLat: "57.764284",
    mapLon: "40.919656",
    mapName: "Старая пристань",
  },
  {
    id: 4,
    name: "кафе «доброблин»",
    description:
      "Ресторан Старая Пристань — не просто ресторан, а кусочек истории на берегу Волги! Находясь в живописном месте, ресторан предлагает Вам не только насладиться созерцанием красивой  природы, но и испытать истинное наслаждение от классических блюд русской кухни.",
    location: { x: 399, y: 618 },
    type: "restaurant",
    logo: logo4,
    address: "Старая пристань ул. 1 Мая, 9, Кострома",
    coordinates: { lat: 40.922285, lon: 57.767996 },
    photos: [rest4Outside, rest4Inside1, rest4Inside2, rest4Inside3],
    menu: [{ image: menu41 }, { image: menu42 }, { image: menu43 }],
    localDishes: [{ image: plate41 }],
    exclusiveDescription:
      "Блин «Снегурочка» — сладкий символ кафе «Доброблин». Тонкий, румяный блин подаётся с шариком нежного мороженого и тёплой карамелью — простое, но по-настоящему волшебное угощение.",
    averageCheck: 200,

    mapOid: "4366692710",
    mapLat: "57.767996",
    mapLon: "40.922285",
    mapName: "ДоброБлин",
  },
  {
    id: 5,
    name: "Ресторан «гроза»",
    description:
      "Ресторан Гроза славится своим изысканным меню русской современной кухни. Кухня в Грозе - это сочетание старинных традиций и современных модных тенденций. В ресторане «Гроза» бренд-шеф Антон Рубцов превращает традиционные костромские рецепты в настоящее гастрономическое искусство.",
    location: { x: 505, y: 330 },
    type: "restaurant",
    logo: logo5,
    address: "Гроза просп. Мира, 4Б ",
    coordinates: { lat: 40.930185, lon: 57.769174 },
    photos: [rest5Outside, rest5Inside1, rest5Inside2, rest5Inside3],
    menu: [{ image: menu51 }, { image: menu52 }, { image: menu53 }],
    localDishes: [{ image: plate51 }],
    exclusiveDescription:
      "«Гусь Кологривский» — гордость ресторана «Гроза», отражающая дух костромских традиций и северного характера. А так же именно здесь, в Костроме, родилась Снегурочка — и в ресторане «Гроза» она обрела своё сладкое воплощение: нежное, изящное и по-сказочному волшебное.",
    averageCheck: 2500,

    mapOid: "11286674593",
    mapLat: "57.769174",
    mapLon: "40.930185",
    mapName: "ДоброБлин",
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
