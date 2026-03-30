// src/pages/HistoryPage.jsx
import React, { useState, useRef, useEffect } from "react";
import MapCanvas from "../components/MapCanvas";
import CategorySlider from "../components/CategorySlider";
import { allHistory } from "../components/mapData.js";
import "./HistoryPage.css";

export default function HistoryPage({
  showSlider: externalShowSlider,
  showMap: externalShowMap,
  selectedItem: externalSelectedItem,
  onNavigate,
}) {
  const [internalShowSlider, setInternalShowSlider] = useState(true);
  const [internalShowMap, setInternalShowMap] = useState(false);
  const [internalSelectedHistory, setInternalSelectedHistory] = useState(null);

  const showSlider =
    externalShowSlider !== undefined ? externalShowSlider : internalShowSlider;
  const showMap =
    externalShowMap !== undefined ? externalShowMap : internalShowMap;
  const selectedHistory =
    externalSelectedItem !== undefined
      ? externalSelectedItem
      : internalSelectedHistory;

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

  const handleNavigateToHistory = (historyItem) => {
    console.log("Navigating to history place:", historyItem);

    if (onNavigate) {
      onNavigate(historyItem);
    } else {
      setInternalSelectedHistory(historyItem);
      setInternalShowSlider(false);
      setInternalShowMap(true);
    }

    setTimeout(() => {
      if (mapRef.current && historyItem.mapId) {
        mapRef.current.centerOnHistory?.(historyItem.mapId);
        mapRef.current.buildRouteToHistory?.(historyItem.mapId);
      }
    }, 300);
  };

  const externalLinksConfig = {
    startIndex: 1,
    links: [allHistory[1]?.externalLink || "https://yandex.ru/maps/"],
  };

  if (!allHistory || allHistory.length === 0) {
    return (
      <div className="history-page-container">
        <div style={{ padding: "20px", textAlign: "center", color: "#4a3718" }}>
          <h2>Данные об истории загружаются...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="history-page-container">
      {showSlider && (
        <CategorySlider
          items={allHistory}
          onNavigateToItem={handleNavigateToHistory}
          externalLinksConfig={externalLinksConfig}
        />
      )}

      {showMap && selectedHistory && (
        <div className="history-map-wrapper">
          <MapCanvas
            ref={mapRef}
            mode="history"
            selectedItem={selectedHistory}
            className="history-map"
          />
        </div>
      )}
    </div>
  );
}
