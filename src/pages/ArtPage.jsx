// src/pages/ArtPage.jsx
import React, { useState, useRef, useEffect } from "react";
import MapCanvas from "../components/MapCanvas";
import CategorySlider from "../components/CategorySlider";
import { allArt } from "../components/mapData.js";
import "./ArtPage.css";

export default function ArtPage({
  showSlider: externalShowSlider,
  showMap: externalShowMap,
  selectedItem: externalSelectedItem,
  onNavigate,
}) {
  const [internalShowSlider, setInternalShowSlider] = useState(true);
  const [internalShowMap, setInternalShowMap] = useState(false);
  const [internalSelectedArt, setInternalSelectedArt] = useState(null);

  const showSlider =
    externalShowSlider !== undefined ? externalShowSlider : internalShowSlider;
  const showMap =
    externalShowMap !== undefined ? externalShowMap : internalShowMap;
  const selectedArt =
    externalSelectedItem !== undefined
      ? externalSelectedItem
      : internalSelectedArt;

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

  const handleNavigateToArt = (art) => {
    console.log("Navigating to art place:", art);

    if (onNavigate) {
      onNavigate(art);
    } else {
      setInternalSelectedArt(art);
      setInternalShowSlider(false);
      setInternalShowMap(true);
    }

    setTimeout(() => {
      if (mapRef.current && art.mapId) {
        mapRef.current.centerOnArt?.(art.mapId);
        mapRef.current.buildRouteToArt?.(art.mapId);
      }
    }, 300);
  };

  const externalLinksConfig = {
    startIndex: 2,
    links: ["https://yandex.ru/maps/-/CPFZJY8F"],
  };

  if (!allArt || allArt.length === 0) {
    return (
      <div className="art-page-container">
        <div style={{ padding: "20px", textAlign: "center", color: "#4a3718" }}>
          <h2>Данные об искусстве загружаются...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="art-page-container">
      {showSlider && (
        <CategorySlider
          items={allArt}
          onNavigateToItem={handleNavigateToArt}
          externalLinksConfig={externalLinksConfig}
        />
      )}

      {showMap && selectedArt && (
        <div className="art-map-wrapper">
          <MapCanvas
            ref={mapRef}
            mode="art"
            selectedTemple={selectedArt}
            className="art-map"
          />
        </div>
      )}
    </div>
  );
}
