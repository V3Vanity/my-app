import React, { useRef, useState, useEffect } from "react";
import "./TextBlock.css";

export default function TextBlock({ text, showTitle, onNextStep }) {
  const containerRef = useRef(null);
  const [showButton, setShowButton] = useState(false);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;

    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 5) {
      setShowButton(true);
    }
  };

  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.addEventListener("scroll", handleScroll);
      return () => el.removeEventListener("scroll", handleScroll);
    }
  }, []);

  return (
    <div className="text-block-container">
      <div className="text-block-scroll" ref={containerRef}>
        {showTitle && <h2 className="text-title">Маршрут №44</h2>}
        <p className="text-paragraph">{text}</p>
        <div
          className={`continue-button-container ${
            showButton ? "visible" : "hidden"
          }`}
        >
          <button className="continue-button" onClick={onNextStep}>
            Продолжить
          </button>
        </div>
      </div>
    </div>
  );
}
