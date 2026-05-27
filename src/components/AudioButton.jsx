// components/AudioButton.jsx
import React, { useRef, useState, useEffect } from "react";
import audioIcon from "../assets/audio.svg";
import "./AudioButton.css";

const AudioButton = ({ audioSrc, disabled = false }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Останавливаем аудио при размонтировании - ИСПРАВЛЕНО
  useEffect(() => {
    const audioElement = audioRef.current; // Копируем ref в переменную внутри эффекта

    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
    };
  }, []); // Пустой массив зависимостей - эффект выполнится один раз

  const handlePlayPause = () => {
    if (!audioRef.current || disabled) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  if (!audioSrc) return null;

  return (
    <>
      <audio
        ref={audioRef}
        src={audioSrc}
        onEnded={handleEnded}
        preload="auto"
      />
      <button
        className={`audio-button ${isPlaying ? "playing" : ""}`}
        onClick={handlePlayPause}
        disabled={disabled}
        aria-label="Озвучка"
      >
        <img src={audioIcon} alt="Озвучка" />
      </button>
    </>
  );
};

export default AudioButton;
