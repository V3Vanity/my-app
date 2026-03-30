// src/pages/TemplesPage.jsx
import React, { useState, useRef, useEffect } from "react";
import MapCanvas from "../components/MapCanvas";
import CategorySlider from "../components/CategorySlider";
import { allTemples } from "../components/mapData.js";
import "./TemplesPage.css";

export default function TemplesPage({
  showSlider: externalShowSlider,
  showMap: externalShowMap,
  selectedItem: externalSelectedItem,
  onNavigate,
}) {
  const [internalShowSlider, setInternalShowSlider] = useState(true);
  const [internalShowMap, setInternalShowMap] = useState(false);
  const [internalSelectedTemple, setInternalSelectedTemple] = useState(null);

  const showSlider =
    externalShowSlider !== undefined ? externalShowSlider : internalShowSlider;
  const showMap =
    externalShowMap !== undefined ? externalShowMap : internalShowMap;
  const selectedTemple =
    externalSelectedItem !== undefined
      ? externalSelectedItem
      : internalSelectedTemple;

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

  const handleNavigateToTemple = (temple) => {
    console.log("Navigating to temple:", temple);

    if (onNavigate) {
      onNavigate(temple);
    } else {
      setInternalSelectedTemple(temple);
      setInternalShowSlider(false);
      setInternalShowMap(true);
    }

    setTimeout(() => {
      if (mapRef.current && temple.mapId) {
        mapRef.current.centerOnTemple?.(temple.mapId);
        mapRef.current.buildRouteToTemple?.(temple.mapId);
      }
    }, 300);
  };

  const externalLinksConfig = {
    startIndex: 5,
    links: [
      "https://yandex.ru/maps/-/CPBt64Ib",
      "https://yandex.ru/maps/-/CPBt66k1",
    ],
  };

  if (!allTemples || allTemples.length === 0) {
    return (
      <div className="temples-page-container">
        <div style={{ padding: "20px", textAlign: "center", color: "#4a3718" }}>
          <h2>Данные о храмах загружаются...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="temples-page-container">
      {showSlider && (
        <CategorySlider
          items={allTemples}
          onNavigateToItem={handleNavigateToTemple}
          externalLinksConfig={externalLinksConfig}
        />
      )}

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
  );
}
