import { useRef, useState, useEffect } from "react";
import mapImage from "../assets/map.svg";

export default function MapPointPicker() {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [points, setPoints] = useState([]);

  // Загружаем изображение карты
  useEffect(() => {
    const img = new Image();
    img.src = mapImage;
    img.onload = () => {
      imgRef.current = img;
      draw(); // первый рендер
    };
    window.addEventListener("resize", draw); // перерисовываем при ресайзе
    return () => window.removeEventListener("resize", draw);
  }, []);

  // Функция отрисовки карты + точек
  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!canvas || !imgRef.current) return;

    const img = imgRef.current;
    const ratio = window.devicePixelRatio || 1;

    // Вычисляем масштаб, чтобы карта помещалась в контейнер и сохраняла пропорции
    const scale = Math.min(
      canvas.clientWidth / img.width,
      canvas.clientHeight / img.height
    );
    const offsetX = (canvas.clientWidth - img.width * scale) / 2;
    const offsetY = (canvas.clientHeight - img.height * scale) / 2;

    canvas.width = canvas.clientWidth * ratio;
    canvas.height = canvas.clientHeight * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    // Очистка и отрисовка карты
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(
      img,
      0,
      0,
      img.width,
      img.height,
      offsetX,
      offsetY,
      img.width * scale,
      img.height * scale
    );

    // Рисуем точки
    ctx.fillStyle = "red";
    points.forEach((p) => {
      ctx.beginPath();
      ctx.arc(offsetX + p.x * scale, offsetY + p.y * scale, 5, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  // Обработка клика по карте
  const handleClick = (e) => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const rect = canvas.getBoundingClientRect();
    const scale = Math.min(
      canvas.clientWidth / img.width,
      canvas.clientHeight / img.height
    );
    const offsetX = (canvas.clientWidth - img.width * scale) / 2;
    const offsetY = (canvas.clientHeight - img.height * scale) / 2;

    // Преобразуем координаты клика в координаты относительно оригинального изображения
    const x = (e.clientX - rect.left - offsetX) / scale;
    const y = (e.clientY - rect.top - offsetY) / scale;

    const newPoint = { id: points.length, x, y };
    const newPoints = [...points, newPoint];
    setPoints(newPoints);
    draw();

    console.log("Current points:", newPoints);
  };

  // Удаление последней точки
  const handleUndo = () => {
    const newPoints = points.slice(0, -1);
    setPoints(newPoints);
    draw();
    console.log("Current points:", newPoints);
  };

  return (
    <div style={{ width: "100%", height: "80vh", position: "relative" }}>
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", cursor: "crosshair" }}
        onClick={handleClick}
      />
      <button
        onClick={handleUndo}
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          padding: "8px 12px",
          background: "#fff",
          border: "1px solid #ccc",
          cursor: "pointer",
        }}
      >
        Undo
      </button>
    </div>
  );
}
