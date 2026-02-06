import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MapCanvas from "../components/MapCanvas.jsx";
import RestaurantDetail from "../components/RestaurantDetail.jsx";
import Header from "../components/Header.jsx";
import "./GastroTour.css";

// Тестовые данные ресторанов
const RESTAURANTS = [
  {
    id: 1,
    name: "Ресторан 'Старая пристань'",
    description: "Русская кухня с видом на Волгу",
    location: { x: 500, y: 300 },
    type: "restaurant",
    logo: "logo1.svg",
    address: "ул. Советская, 5",
    coordinates: { lat: 57.768, lon: 40.926 },
    photos: ["rest1-outside.jpg", "rest1-inside1.jpg", "rest1-inside2.jpg"],
    menu: [
      { name: "Борщ", price: 350, image: "borsch.jpg" },
      { name: "Пельмени", price: 450, image: "pelmeni.jpg" },
      { name: "Блины", price: 250, image: "blini.jpg" },
    ],
    localDishes: [
      { name: "Костромской сыр", image: "cheese.jpg" },
      { name: "Уха по-костромски", image: "uha.jpg" },
    ],
  },
  {
    id: 2,
    name: "Кафе 'Уют'",
    description: "Кофе и десерты в центре города",
    location: { x: 650, y: 400 },
    type: "cafe",
    logo: "logo2.svg",
    address: "пр-т Мира, 12",
    coordinates: { lat: 57.766, lon: 40.928 },
    photos: ["cafe-outside.jpg", "cafe-inside1.jpg", "cafe-inside2.jpg"],
    menu: [
      { name: "Капучино", price: 200, image: "cappuccino.jpg" },
      { name: "Торт 'Наполеон'", price: 350, image: "tort.jpg" },
      { name: "Чай с травами", price: 150, image: "tea.jpg" },
    ],
    localDishes: [{ name: "Костромской мёд", image: "honey.jpg" }],
  },
  {
    id: 3,
    name: "Паб 'У камина'",
    description: "Английская кухня и крафтовое пиво",
    location: { x: 350, y: 450 },
    type: "pub",
    logo: "logo3.svg",
    address: "ул. Чайковского, 8",
    coordinates: { lat: 57.77, lon: 40.924 },
    photos: ["pub-outside.jpg", "pub-inside1.jpg", "pub-inside2.jpg"],
    menu: [
      { name: "Фиш энд чипс", price: 550, image: "fish-chips.jpg" },
      { name: "Бургер", price: 450, image: "burger.jpg" },
      { name: "Крафтовое пиво", price: 300, image: "beer.jpg" },
    ],
    localDishes: [
      { name: "Костромской квас", image: "kvas.jpg" },
      { name: "Домашние соленья", image: "pickles.jpg" },
    ],
  },
];

export default function GastroTour() {
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mapMode] = useState("gastro");
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
        // Пока заглушка
        alert("Страница 'Квест-экскурсия по храмам и музеям' в разработке");
        break;
      case "gastro":
        // Уже на странице гастротура, ничего не делаем
        break;
      case "about":
        // Пока заглушка
        alert("Страница 'О нас' в разработке");
        break;
      case "reviews":
        // Пока заглушка
        alert("Страница 'Отзывы' в разработке");
        break;
      default:
        break;
    }
  };

  return (
    <div className="gastro-tour-container">
      {/* Используем существующий Header компонент */}
      <Header
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        onMenuItemClick={handleMenuItemClick}
      />

      {/* Карта с маркерами ресторанов */}
      <div className="gastro-map-container">
        <MapCanvas
          ref={mapRef}
          mode={mapMode}
          restaurants={RESTAURANTS}
          onMarkerClick={handleMarkerClick}
          className="gastro-map"
        />
      </div>

      {/* Детальная информация о ресторане */}
      <RestaurantDetail
        restaurant={selectedRestaurant}
        isOpen={!!selectedRestaurant}
        onClose={() => setSelectedRestaurant(null)}
        onCenterMap={() => centerOnRestaurant(selectedRestaurant)}
      />
    </div>
  );
}
