// src/pages/FamilyPage.jsx - упрощенная версия
import React, { useState, useRef, useEffect } from "react";
import MapCanvas from "../components/MapCanvas";
import CategorySlider from "../components/CategorySlider";
import { allFamily } from "../components/mapData.js";
import "./FamilyPage.css";

export default function FamilyPage({
  showSlider: externalShowSlider,
  showMap: externalShowMap,
  selectedItem: externalSelectedItem,
  onNavigate,
}) {
  const [internalShowSlider, setInternalShowSlider] = useState(true);
  const [internalShowMap, setInternalShowMap] = useState(false);
  const [internalSelectedFamily, setInternalSelectedFamily] = useState(null);

  const showSlider =
    externalShowSlider !== undefined ? externalShowSlider : internalShowSlider;
  const showMap =
    externalShowMap !== undefined ? externalShowMap : internalShowMap;
  const selectedFamily =
    externalSelectedItem !== undefined
      ? externalSelectedItem
      : internalSelectedFamily;

  const mapRef = useRef(null);

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

  // УДАЛЯЕМ handleBackFromMap - она не нужна здесь
  // Кнопка возврата управляется через PageWrapper

  const handleNavigateToFamily = (familyItem) => {
    console.log("Navigating to family place:", familyItem);

    if (onNavigate) {
      onNavigate(familyItem);
    } else {
      setInternalSelectedFamily(familyItem);
      setInternalShowSlider(false);
      setInternalShowMap(true);
    }

    setTimeout(() => {
      if (mapRef.current && familyItem.mapId) {
        mapRef.current.centerOnMuseum?.(familyItem.mapId);
        mapRef.current.buildRouteToMuseum?.(familyItem.mapId);
      }
    }, 300);
  };

  const externalLinksConfig = {
    startIndex: 2,
    links: [
      allFamily[2]?.externalLink || "https://yandex.ru/maps/",
      allFamily[3]?.externalLink || "https://yandex.ru/maps/",
      allFamily[4]?.externalLink || "https://yandex.ru/maps/",
      allFamily[5]?.externalLink || "https://yandex.ru/maps/",
    ],
  };

  if (!allFamily || allFamily.length === 0) {
    return (
      <div className="family-page-container">
        <div style={{ padding: "20px", textAlign: "center", color: "#4a3718" }}>
          <h2>Данные о семейных местах загружаются...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="family-page-container">
      {showSlider && (
        <CategorySlider
          items={allFamily}
          onNavigateToItem={handleNavigateToFamily}
          externalLinksConfig={externalLinksConfig}
        />
      )}

      {showMap && selectedFamily && (
        <div className="family-map-wrapper">
          <MapCanvas
            ref={mapRef}
            mode="family"
            selectedTemple={selectedFamily}
            className="family-map"
          />
        </div>
      )}
    </div>
  );
}
