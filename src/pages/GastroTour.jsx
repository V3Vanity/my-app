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
import plate52 from "../assets/restaurants/restaurant-5/plate2.jpg";
import logo5 from "../assets/restaurants/restaurant-5/logo.svg";

// Ресторан 6
import rest6Outside from "../assets/restaurants/restaurant-6/outside.jpg";
import rest6Inside1 from "../assets/restaurants/restaurant-6/inside1.jpg";
import rest6Inside2 from "../assets/restaurants/restaurant-6/inside2.jpg";
import rest6Inside3 from "../assets/restaurants/restaurant-6/inside3.jpg";

import menu61 from "../assets/restaurants/restaurant-6/menu.svg";
import menu62 from "../assets/restaurants/restaurant-6/menu1.svg";
import menu63 from "../assets/restaurants/restaurant-6/menu2.svg";
import menu64 from "../assets/restaurants/restaurant-6/menu3.svg";

import plate61 from "../assets/restaurants/restaurant-6/plate1.jpg";
import logo6 from "../assets/restaurants/restaurant-6/logo.svg";

// Ресторан 7
import rest7Outside from "../assets/restaurants/restaurant-7/outside.jpg";
import rest7Inside1 from "../assets/restaurants/restaurant-7/inside1.jpg";
import rest7Inside2 from "../assets/restaurants/restaurant-7/inside2.jpg";
import rest7Inside3 from "../assets/restaurants/restaurant-7/inside3.jpg";
import menu71 from "../assets/restaurants/restaurant-7/menu.svg";
import menu72 from "../assets/restaurants/restaurant-7/menu1.svg";
import menu73 from "../assets/restaurants/restaurant-7/menu2.svg";
import menu74 from "../assets/restaurants/restaurant-7/menu3.svg";
import menu75 from "../assets/restaurants/restaurant-7/menu4.svg";
import menu76 from "../assets/restaurants/restaurant-7/menu5.svg";
import menu77 from "../assets/restaurants/restaurant-7/menu6.svg";
import menu78 from "../assets/restaurants/restaurant-7/menu7.svg";
import menu79 from "../assets/restaurants/restaurant-7/menu8.svg";
import menu710 from "../assets/restaurants/restaurant-7/menu9.svg";
import menu711 from "../assets/restaurants/restaurant-7/menu10.svg";

import plate71 from "../assets/restaurants/restaurant-7/plate1.jpg";
import logo7 from "../assets/restaurants/restaurant-7/logo.svg";

// Ресторан 8
import rest8Outside from "../assets/restaurants/restaurant-8/outside.jpg";
import rest8Inside1 from "../assets/restaurants/restaurant-8/inside1.jpg";
import rest8Inside2 from "../assets/restaurants/restaurant-8/inside2.jpg";
import rest8Inside3 from "../assets/restaurants/restaurant-8/inside3.jpg";
import menu81 from "../assets/restaurants/restaurant-8/menu.svg";
import plate81 from "../assets/restaurants/restaurant-8/plate1.jpg";
import logo8 from "../assets/restaurants/restaurant-8/logo.svg";

// Ресторан 9
import rest9Outside from "../assets/restaurants/restaurant-9/outside.jpg";
import rest9Inside1 from "../assets/restaurants/restaurant-9/inside1.jpg";
import rest9Inside2 from "../assets/restaurants/restaurant-9/inside2.jpg";
import rest9Inside3 from "../assets/restaurants/restaurant-9/inside3.jpg";
import menu91 from "../assets/restaurants/restaurant-9/menu.svg";
import plate91 from "../assets/restaurants/restaurant-9/plate1.jpg";
import logo9 from "../assets/restaurants/restaurant-9/logo.svg";

// Ресторан 10
import rest10Outside from "../assets/restaurants/restaurant-10/outside.jpg";
import rest10Inside1 from "../assets/restaurants/restaurant-10/inside1.jpg";
import rest10Inside2 from "../assets/restaurants/restaurant-10/inside2.jpg";
import rest10Inside3 from "../assets/restaurants/restaurant-10/inside3.jpg";
import menu101 from "../assets/restaurants/restaurant-10/menu.svg";
import menu102 from "../assets/restaurants/restaurant-10/menu1.svg";
import menu103 from "../assets/restaurants/restaurant-10/menu2.svg";
import menu104 from "../assets/restaurants/restaurant-10/menu3.svg";
import menu105 from "../assets/restaurants/restaurant-10/menu4.svg";
import menu106 from "../assets/restaurants/restaurant-10/menu5.svg";
import menu107 from "../assets/restaurants/restaurant-10/menu6.svg";
import menu108 from "../assets/restaurants/restaurant-10/menu7.svg";
import menu109 from "../assets/restaurants/restaurant-10/menu8.svg";
import menu1010 from "../assets/restaurants/restaurant-10/menu9.svg";
import menu1011 from "../assets/restaurants/restaurant-10/menu10.svg";
import menu1012 from "../assets/restaurants/restaurant-10/menu11.svg";
import menu1013 from "../assets/restaurants/restaurant-10/menu12.svg";
import plate101 from "../assets/restaurants/restaurant-10/plate1.jpg";
import plate102 from "../assets/restaurants/restaurant-10/plate2.jpg";
import logo10 from "../assets/restaurants/restaurant-10/logo.svg";

// Ресторан 11
import rest11Outside from "../assets/restaurants/restaurant-11/outside.jpg";
import rest11Inside1 from "../assets/restaurants/restaurant-11/inside1.jpg";
import rest11Inside2 from "../assets/restaurants/restaurant-11/inside2.jpg";
import rest11Inside3 from "../assets/restaurants/restaurant-11/inside3.jpg";
import menu111 from "../assets/restaurants/restaurant-11/menu.svg";
import menu112 from "../assets/restaurants/restaurant-11/menu1.svg";
import menu113 from "../assets/restaurants/restaurant-11/menu2.svg";
import menu114 from "../assets/restaurants/restaurant-11/menu3.svg";
import plate111 from "../assets/restaurants/restaurant-11/plate1.jpg";
import logo11 from "../assets/restaurants/restaurant-11/logo.svg";

// Ресторан 12
import rest12Outside from "../assets/restaurants/restaurant-12/outside.jpg";
import rest12Inside1 from "../assets/restaurants/restaurant-12/inside1.jpg";
import rest12Inside2 from "../assets/restaurants/restaurant-12/inside2.jpg";
import rest12Inside3 from "../assets/restaurants/restaurant-12/inside3.jpg";
import menu121 from "../assets/restaurants/restaurant-12/menu.svg";
import menu122 from "../assets/restaurants/restaurant-12/menu1.svg";
import menu123 from "../assets/restaurants/restaurant-12/menu2.svg";
import menu124 from "../assets/restaurants/restaurant-12/menu3.svg";
import menu125 from "../assets/restaurants/restaurant-12/menu4.svg";
import menu126 from "../assets/restaurants/restaurant-12/menu5.svg";
import menu127 from "../assets/restaurants/restaurant-12/menu6.svg";
import menu128 from "../assets/restaurants/restaurant-12/menu7.svg";
import menu129 from "../assets/restaurants/restaurant-12/menu8.svg";
import menu1210 from "../assets/restaurants/restaurant-12/menu9.svg";
import plate121 from "../assets/restaurants/restaurant-12/plate1.jpg";
import logo12 from "../assets/restaurants/restaurant-12/logo.svg";

// Ресторан 13
import rest13Outside from "../assets/restaurants/restaurant-13/outside.jpg";
import rest13Inside1 from "../assets/restaurants/restaurant-13/inside1.jpg";
import rest13Inside2 from "../assets/restaurants/restaurant-13/inside2.jpg";
import rest13Inside3 from "../assets/restaurants/restaurant-13/inside3.jpg";
import menu131 from "../assets/restaurants/restaurant-13/menu.svg";
import menu132 from "../assets/restaurants/restaurant-13/menu1.svg";
import menu133 from "../assets/restaurants/restaurant-13/menu2.svg";
import menu134 from "../assets/restaurants/restaurant-13/menu3.svg";
import plate131 from "../assets/restaurants/restaurant-13/plate1.jpg";
import logo13 from "../assets/restaurants/restaurant-13/logo.svg";

// Тестовые данные ресторанов с реальными импортами
const RESTAURANTS = [
  {
    id: 1,
    name: "Семейный Ресторан «Сыровар»",
    description:
      "Сыровар — это уникальное место в центре Костромы, объединяющее ресторан, сыроварню и сырную лавку. В ресторане подают блюда с собственным сыром, а в лавке можно приобрести сыры ручной работы.",
    location: { x: 503, y: 340 },
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
    location: { x: 518, y: 630 },
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
    location: { x: 535, y: 980 },
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
    location: { x: 399, y: 588 },
    type: "restaurant",
    logo: logo4,
    address: "ДоброБлин ул. Мучные Ряды, 1, Кострома ",
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
    location: { x: 505, y: 300 },
    type: "restaurant",
    logo: logo5,
    address: "Гроза просп. Мира, 4Б ",
    coordinates: { lat: 40.930185, lon: 57.769174 },
    photos: [rest5Outside, rest5Inside1, rest5Inside2, rest5Inside3],
    menu: [{ image: menu51 }, { image: menu52 }, { image: menu53 }],
    localDishes: [{ image: plate51 }, { image: plate52 }],
    exclusiveDescription:
      "«Гусь Кологривский» — гордость ресторана «Гроза», отражающая дух костромских традиций и северного характера. А так же именно здесь, в Костроме, родилась Снегурочка — и в ресторане «Гроза» она обрела своё сладкое воплощение: нежное, изящное и по-сказочному волшебное.",
    averageCheck: 2500,

    mapOid: "11286674593",
    mapLat: "57.769174",
    mapLon: "40.930185",
    mapName: "ДоброБлин",
  },
  {
    id: 6,
    name: "Гастро-диско-бар «Дебри»",
    description:
      "Гастро Диско Бар «Дебри» — современное молодёжное пространство с вкусной и разнообразной кухней. По выходным здесь проходят зажигательные дискотеки, где царит атмосфера музыки, общения и весёлого отдыха.",
    location: { x: 1020, y: 609 },
    type: "restaurant",
    logo: logo6,
    address: "Адрес ресторана 6, Кострома",
    coordinates: { lat: 57.760899, lon: 40.931871 },
    photos: [rest6Outside, rest6Inside1, rest6Inside2, rest6Inside3],
    menu: [
      { image: menu61 },
      { image: menu62 },
      { image: menu63 },
      { image: menu64 },
    ],
    localDishes: [{ image: plate61 }],
    exclusiveDescription:
      "Волжский судак с пюре — блюдо, в котором соединились простота и изысканность костромской кухни. Нежное филе свежего судака подаётся с воздушным картофельным пюре, создавая гармонию вкусов и напоминая о спокойствии волжских берегов.",
    averageCheck: 1500,
    mapOid: "212612151259",
    mapLat: "57.760899",
    mapLon: "40.931871",
    mapName: "Дебри",
  },

  {
    id: 7,
    name: "бар «ДОРОГАЯ, БУДУ ПОЗДНО»",
    description:
      "«Дорогая, буду поздно» — бар, где готовят с душой и по-настоящему вкусно: лучшие стейки, правильные коктейли, отличная еда и атмосфера, в которую хочется возвращаться снова и снова.",
    location: { x: 850, y: 562 },
    type: "restaurant",
    logo: logo7,
    address: "ул. Нижняя Дебря, 2, Кострома",
    coordinates: { lat: 57.763396, lon: 40.930712 },
    photos: [rest7Outside, rest7Inside1, rest7Inside2, rest7Inside3],
    menu: [
      { image: menu71 },
      { image: menu72 },
      { image: menu73 },
      { image: menu74 },
      { image: menu75 },
      { image: menu76 },
      { image: menu77 },
      { image: menu78 },
      { image: menu79 },
      { image: menu710 },
      { image: menu711 },
    ],
    localDishes: [{ image: plate71 }],
    exclusiveDescription:
      "Фирменный дегустационный сет из шести настоек! В этом наборе вы сможете насладиться такими вкусами, как: Хреновуха, Облепиха, Чернослив, Байкал, Брусника с Чили, Черная смородина Каждая настойка идеально дополнена тостами с закусками, чтобы вы могли насладиться гармонией вкусов.",
    averageCheck: 1100,
    mapOid: "1344764673",
    mapLat: "57.763396",
    mapLon: "40.930712",
    mapName: "Дорогая, буду поздно",
  },

  {
    id: 8,
    name: "«чебуречная»",
    description:
      "Чебуречная — место, где царит вкус настоящего СССР: сочные, хрустящие чебуреки с мясом, ароматный кофе со сгущёнкой и та самая атмосфера, по которой скучаешь с первого глотка.",
    location: { x: 566, y: 555 },
    type: "restaurant",
    logo: logo8,
    address: "ул. Красные Ряды, 1, корп. Д, Кострома",
    coordinates: { lat: 57.766232, lon: 40.926216 },
    photos: [rest8Outside, rest8Inside1, rest8Inside2, rest8Inside3],
    menu: [{ image: menu81 }],
    localDishes: [{ image: plate81 }],
    exclusiveDescription:
      "Чебурек с мясом — хрустящий, сочный и настоящий, как в СССР. К нему — горячий кофе со сгущёнкой в гранёном стакане, такой же сладкий и ностальгический. Простое удовольствие, которое возвращает в прошлое.",
    averageCheck: 170,
    mapOid: "1003726839&",
    mapLat: "57.766232",
    mapLon: "40.926216",
    mapName: "Название для карты 8",
  },

  {
    id: 9,
    name: "«гусь-бургер»",
    description:
      "«Гусь-бургер» — это место, где традиции встречаются с уличной едой. Здесь готовят: сочные бургеры,шаурму,пельмени и блины с гусём, а также продают домашние паштеты и гусиный жир в баночках — для тех, кто хочет унести частичку этого вкуса с собой. — всё с душой, сытно и по-костромски оригинально.",
    location: { x: 490, y: 560 },
    type: "restaurant",
    logo: logo9,
    address: "ул. Красные Ряды, 1, корп. Д, Кострома",
    coordinates: { lat: 57.767763, lon: 40.924053 },
    photos: [rest9Outside, rest9Inside1, rest9Inside2, rest9Inside3],
    menu: [{ image: menu91 }],
    localDishes: [{ image: plate91 }],
    exclusiveDescription:
      "«Гусь-бургер» — легендарный фаст-фуд, который стоит попробовать каждому. Сочный, ароматный и щедро наполненный вкусом, — настоящая находка для тех, кто любит что-то необычное, но по-домашнему вкусное.",
    averageCheck: 600,
    mapOid: "165709108342",
    mapLat: "57.767763",
    mapLon: "40.924053",
    mapName: "ГусьБургер",
  },

  {
    id: 10,
    name: "Гриль-бар паб «КРАН, ДИВАН» ",
    description:
      "Гриль-бар паб «КРАН, ДИВАН» — место, где приятно остановиться и отдохнуть. Мягкие диваны, аромат гриля и вкусные сытные блюда создают тёплую, непринуждённую атмосферу. Здесь хочется задержаться на вечер с друзьями, насладиться любимыми напитками и просто забыть о суете — всё сделано так, чтобы отдых был лёгким и комфортным.",
    location: { x: 775, y: 440 },
    type: "restaurant",
    logo: logo10,
    address: "Советская ул., 2",
    coordinates: { lat: 57.765398, lon: 40.931727 },
    photos: [rest10Outside, rest10Inside1, rest10Inside2, rest10Inside3],
    menu: [
      { image: menu101 },
      { image: menu102 },
      { image: menu103 },
      { image: menu104 },
      { image: menu105 },
      { image: menu106 },
      { image: menu107 },
      { image: menu108 },
      { image: menu109 },
      { image: menu1010 },
      { image: menu1011 },
      { image: menu1012 },
      { image: menu1013 },
    ],
    localDishes: [{ image: plate101 }, { image: plate102 }],
    exclusiveDescription:
      "Хрустящие драники с томлёной уткой сочетают нежность тёплого мяса с бархатным муссом из костромских лисичек, создавая неповторимый вкус. Коктейль «Белая берёзка» необычное сочетание березового сока и бузины удивит вас своим вкусом. А в качестве сладкого акцента — костромской вафельный штрудель-хрустящая вафельная основа и начинка из яблок с рябиной — знакомый вкус, наполненный теплом.",
    averageCheck: 650,
    mapOid: "143906213578",
    mapLat: "57.765398",
    mapLon: "40.931727",
    mapName: "Кран, Диван",
  },

  {
    id: 11,
    name: "бар «Beer & Grill»",
    description:
      "Beer & Grill — уютное место в центре Костромы, где каждый гость становится другом.Коллекция более 200 сортов пенного со всего света и 18 видов на кране — любители редких вкусов точно найдут своё! Добавим приятную и качественную еду, приготовленную в печи-гриль, выдержим в душевных историях и повышенном настроении.⠀Приправим все это приятными ценами, и получим отличное заведение для отдыха с друзьями!",
    location: { x: 785, y: 390 },
    type: "restaurant",
    logo: logo11,
    address: "Советская ул., 9, Кострома ",
    coordinates: { lat: 57.765946, lon: 40.93057 },
    photos: [rest11Outside, rest11Inside1, rest11Inside2, rest11Inside3],
    menu: [
      { image: menu111 },
      { image: menu112 },
      { image: menu113 },
      { image: menu114 },
    ],
    localDishes: [{ image: plate111 }],
    exclusiveDescription:
      "В заведении собрана настоящая пивная палитра: десятки сортов из местных костромских пивоварен, каждый со своим характером и ароматом. Простое, вкусное и душевное место, где приятно проводить время.",
    averageCheck: 1000,
    mapOid: "73190447429",
    mapLat: "57.765946",
    mapLon: "40.930570",
    mapName: "Beer&Grill",
  },

  {
    id: 12,
    name: "Ресторан «Villa Delice» ",
    description:
      "Первый и единственный ресторан русско-французской кухни в Костроме! Французская техника в сочетании с любимыми русскими продуктами создаёт изысканные и яркие блюда. Интерьер радует глаз: светлые пространства, элегантные детали и уютная атмосфера делают каждую трапезу особенной. Здесь приятно и вкусно проводить время, будь то ужин вдвоём или встреча с друзьями",
    location: { x: 1040, y: 245 },
    type: "restaurant",
    logo: logo12,
    address: "Советская ул., 9, Кострома",
    coordinates: { lat: 57.763919, lon: 40.940225 },
    photos: [rest12Outside, rest12Inside1, rest12Inside2, rest12Inside3],
    menu: [
      { image: menu121 },
      { image: menu122 },
      { image: menu123 },
      { image: menu124 },
      { image: menu125 },
      { image: menu126 },
      { image: menu127 },
      { image: menu128 },
      { image: menu129 },
      { image: menu1210 },
    ],
    localDishes: [{ image: plate121 }],
    exclusiveDescription:
      "Блюдо, в котором всё на своих местах! Мягкое, томлёное мясо Костромского кролика с запечёнными шампиньонами и картофелем. Немного пряностей, немного зелени — и уже не важно, какой сегодня день недели!",
    averageCheck: 1900,
    mapOid: "128609760134",
    mapLat: "57.763919",
    mapLon: "40.940225",
    mapName: "Villa Delice",
  },

  {
    id: 13,
    name: "Пельменная«Всплыли!Снимай»",
    description:
      "Пельменная «Всплыли! Снимай» радует разнообразием: пельмени, вареники и хинкали готовят с сочными начинками и нежным тестом, которое тает во рту. Вкусная еда, уютная атмосфера и игровая для детей делают заведение приятным местом для перекуса всей семьёй.",
    location: { x: 495, y: 20 },
    type: "restaurant",
    logo: logo13,
    address: "Сенная ул., 22/22",
    coordinates: { lat: 57.772176, lon: 40.936518 },
    photos: [rest13Outside, rest13Inside1, rest13Inside2, rest13Inside3],
    menu: [
      { image: menu131 },
      { image: menu132 },
      { image: menu133 },
      { image: menu134 },
    ],
    localDishes: [{ image: plate131 }],
    exclusiveDescription:
      "Вареники «Кострома сырная» — это тонкое, нежное тесто, скрывающее внутри щедрую порцию тягучей сырной начинки. Используются мягкие, ароматные костромские сыры, благодаря которым вареники получаются особенно сливочными и насыщенными — такими, к которым хочется возвращаться снова и снова.",
    averageCheck: 350,
    mapOid: "231300172227",
    mapLat: "57.772176",
    mapLon: "40.936518",
    mapName: "Всплыли!Снимай",
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
