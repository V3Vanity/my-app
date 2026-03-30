// src/pages/MuseumsPage.jsx
import React, { useState, useRef, useEffect } from "react";
import MapCanvas from "../components/MapCanvas";
import CategorySlider from "../components/CategorySlider";
import { allMuseums } from "../components/mapData.js";
import "./MuseumsPage.css";

export default function MuseumsPage({
  showSlider: externalShowSlider,
  showMap: externalShowMap,
  selectedItem: externalSelectedItem,
  onNavigate,
}) {
  const [internalShowSlider, setInternalShowSlider] = useState(true);
  const [internalShowMap, setInternalShowMap] = useState(false);
  const [internalSelectedMuseum, setInternalSelectedMuseum] = useState(null);

  const showSlider =
    externalShowSlider !== undefined ? externalShowSlider : internalShowSlider;
  const showMap =
    externalShowMap !== undefined ? externalShowMap : internalShowMap;
  const selectedMuseum =
    externalSelectedItem !== undefined
      ? externalSelectedItem
      : internalSelectedMuseum;

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

  const handleNavigateToMuseum = (museum) => {
    console.log("Navigating to museum:", museum);

    if (onNavigate) {
      onNavigate(museum);
    } else {
      setInternalSelectedMuseum(museum);
      setInternalShowSlider(false);
      setInternalShowMap(true);
    }

    setTimeout(() => {
      if (mapRef.current && museum.mapId) {
        mapRef.current.centerOnMuseum?.(museum.mapId);
        mapRef.current.buildRouteToMuseum?.(museum.mapId);
      }
    }, 300);
  };

  if (!allMuseums || allMuseums.length === 0) {
    return (
      <div className="museums-page-container">
        <div style={{ padding: "20px", textAlign: "center", color: "#4a3718" }}>
          <h2>Данные о музеях загружаются...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="museums-page-container">
      {showSlider && (
        <CategorySlider
          items={allMuseums}
          onNavigateToItem={handleNavigateToMuseum}
        />
      )}

      {showMap && selectedMuseum && (
        <div className="museum-map-wrapper">
          <MapCanvas
            ref={mapRef}
            mode="museum"
            selectedTemple={selectedMuseum}
            className="museum-map"
          />
        </div>
      )}
    </div>
  );
}
