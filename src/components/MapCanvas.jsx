import { useRef, useEffect, useState } from "react";
import mapImage from "../assets/map.svg";

const nodes = [
  { id: "A", x: 20, y: 865 },
  { id: "B", x: 190, y: 845 },
  { id: "C", x: 400, y: 810 },
  { id: "D", x: 500, y: 790 },
  { id: "E", x: 520, y: 787 },
  { id: "F", x: 895, y: 730 },
  { id: "G", x: 930, y: 700 },
  { id: "H", x: 979, y: 690 },
  { id: "I", x: 951, y: 560 },
  { id: "J", x: 952, y: 498 },
  { id: "K", x: 933, y: 480 },
  { id: "L", x: 914, y: 367 },
  { id: "M", x: 811, y: 283 },
];

const edges = [
  { from: "A", to: "B" },
  { from: "B", to: "C" },
  { from: "C", to: "D" },
  { from: "D", to: "E" },
  { from: "E", to: "F" },
  { from: "F", to: "G" },
  { from: "G", to: "H" },
  { from: "H", to: "I" },
  { from: "I", to: "J" },
  { from: "J", to: "K" },
  { from: "K", to: "L" },
  { from: "L", to: "M" },
];

export default function MapCanvasBlock() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const bgCanvasRef = useRef(null);

  const zoomRef = useRef(1);
  const targetZoomRef = useRef(1);
  const initZoomRef = useRef(1); // минимальный (не меньше) зум
  const offsetRef = useRef({ x: 0, y: 0 });
  const targetOffsetRef = useRef({ x: 0, y: 0 });

  const draggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });

  const [initialized, setInitialized] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // --- убираем скролл у всей страницы (на время использования карты) ---
  useEffect(() => {
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, []);

  // --- обновляем размер контейнера ---
  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      setCanvasSize({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      });
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // --- загружаем изображение и создаём offscreen background ---
  useEffect(() => {
    const img = new Image();
    img.src = mapImage;
    img.onload = () => {
      imgRef.current = img;

      const bgCanvas = document.createElement("canvas");
      bgCanvas.width = img.width;
      bgCanvas.height = img.height;
      const bgCtx = bgCanvas.getContext("2d");
      bgCtx.fillStyle = "#EBE5CF";
      bgCtx.fillRect(0, 0, img.width, img.height);
      bgCtx.drawImage(img, 0, 0);
      bgCanvasRef.current = bgCanvas;

      setInitialized(true);
    };
  }, []);

  // --- Универсальная функция ограничения смещения ---
  const clampOffset = () => {
    if (!imgRef.current || !containerRef.current) return;

    const cw = containerRef.current.clientWidth;
    const ch = containerRef.current.clientHeight;
    const scaledW = imgRef.current.width * targetZoomRef.current;
    const scaledH = imgRef.current.height * targetZoomRef.current;

    // X: если картинка уже меньше контейнера — центрируем по X
    if (scaledW <= cw) {
      targetOffsetRef.current.x = (cw - scaledW) / 2;
    } else {
      const minX = cw - scaledW; // отрицательное
      const maxX = 0;
      targetOffsetRef.current.x = Math.min(
        maxX,
        Math.max(minX, targetOffsetRef.current.x)
      );
    }

    // Y: если картинка меньше по высоте — прижимаем к нижнему краю
    if (scaledH <= ch) {
      targetOffsetRef.current.y = ch - scaledH; // bottom align
    } else {
      const minY = ch - scaledH; // отрицательное
      const maxY = 0;
      targetOffsetRef.current.y = Math.min(
        maxY,
        Math.max(minY, targetOffsetRef.current.y)
      );
    }
  };

  // --- отрисовка карты ---
  const drawMap = () => {
    const canvas = canvasRef.current;
    const bgCanvas = bgCanvasRef.current;
    if (!canvas || !bgCanvas) return;
    const ctx = canvas.getContext("2d");

    // очистка (поскольку canvas масштабирован по DPR, это в device px)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // рисуем фон (растяненный/смещённый)
    ctx.drawImage(
      bgCanvas,
      0,
      0,
      bgCanvas.width,
      bgCanvas.height,
      offsetRef.current.x,
      offsetRef.current.y,
      bgCanvas.width * zoomRef.current,
      bgCanvas.height * zoomRef.current
    );

    // рисуем дороги/узлы поверх (в пространстве изображения)
    ctx.save();
    ctx.translate(offsetRef.current.x, offsetRef.current.y);
    ctx.scale(zoomRef.current, zoomRef.current);

    // дороги
    ctx.strokeStyle = "rgba(128,128,128,0.5)";
    ctx.lineWidth = 6;
    edges.forEach((edge) => {
      const from = nodes.find((n) => n.id === edge.from);
      const to = nodes.find((n) => n.id === edge.to);
      if (from && to) {
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
      }
    });

    // узлы
    ctx.fillStyle = "gray";
    nodes.forEach((n) => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  };

  // --- основной рендер + Retina корректировка ---
  useEffect(() => {
    if (!initialized || canvasSize.width === 0) return;

    const canvas = canvasRef.current;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(canvasSize.width * ratio);
    canvas.height = Math.round(canvasSize.height * ratio);
    canvas.style.width = `${canvasSize.width}px`;
    canvas.style.height = `${canvasSize.height}px`;

    const ctx = canvas.getContext("2d");
    // привязываем transform к DPR (позволяет рисовать в CSS px далее)
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    // начальная инициализация зума/смещения
    if (zoomRef.current === 1) {
      const img = imgRef.current;
      // ВАЖНО: Используем initZoom = max(...) — чтобы изображение
      // **покрывало** контейнер (не оставляя пустот). Это делает
      // минимальный зум таким, что картинка не станет меньше контейнера.
      const initZoom = Math.min(
        canvasSize.width / img.width,
        canvasSize.height / img.height
      );
      zoomRef.current = initZoom;
      targetZoomRef.current = initZoom;
      initZoomRef.current = initZoom;

      // initial offset: центр по X, bottom-align по Y (как просил)
      targetOffsetRef.current = {
        x: (canvasSize.width - img.width * initZoom) / 2,
        y: canvasSize.height - img.height * initZoom, // bottom align
      };
      offsetRef.current = { ...targetOffsetRef.current };
    }

    let rafId = null;
    const render = () => {
      // сглаживание (интерполяция)
      zoomRef.current += (targetZoomRef.current - zoomRef.current) * 0.3;
      offsetRef.current.x +=
        (targetOffsetRef.current.x - offsetRef.current.x) * 0.3;
      offsetRef.current.y +=
        (targetOffsetRef.current.y - offsetRef.current.y) * 0.3;

      drawMap();
      rafId = requestAnimationFrame(render);
    };
    render();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [initialized, canvasSize]);

  // --- обработчик wheel (масштаб по курсору) ---
  const handleWheel = (e) => {
    e.preventDefault();
    if (!canvasRef.current || !imgRef.current || !containerRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const scaleFactor = e.deltaY < 0 ? 1.08 : 0.92; // чуть более отзывчивый
    let newZoom = targetZoomRef.current * scaleFactor;

    // ограничиваем по диапазону [initZoom, maxZoom]
    const MAX_ZOOM = 3;
    newZoom = Math.max(newZoom, initZoomRef.current);
    newZoom = Math.min(newZoom, MAX_ZOOM);

    // если мы установили newZoom == initZoom (минимум), то
    // центрируем/прижимаем изображение корректно (не "прыгая")
    if (newZoom === initZoomRef.current) {
      targetZoomRef.current = newZoom;
      // bottom-align + center X
      const img = imgRef.current;
      targetOffsetRef.current = {
        x: (containerRef.current.clientWidth - img.width * newZoom) / 2,
        y: containerRef.current.clientHeight - img.height * newZoom,
      };
    } else {
      // масштабирование относительно курсора
      const dx = mouseX - targetOffsetRef.current.x;
      const dy = mouseY - targetOffsetRef.current.y;
      targetOffsetRef.current = {
        x: mouseX - (dx * newZoom) / targetZoomRef.current,
        y: mouseY - (dy * newZoom) / targetZoomRef.current,
      };
      targetZoomRef.current = newZoom;
      clampOffset();
    }
  };

  // --- drag handlers ---
  const onMouseDown = (e) => {
    draggingRef.current = true;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };
  const onMouseMove = (e) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - lastMouseRef.current.x;
    const dy = e.clientY - lastMouseRef.current.y;
    targetOffsetRef.current = {
      x: targetOffsetRef.current.x + dx,
      y: targetOffsetRef.current.y + dy,
    };
    clampOffset();
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };
  const onMouseUp = () => {
    draggingRef.current = false;
  };
  const onMouseLeave = () => {
    draggingRef.current = false;
  };

  // --- (опционально) touch: drag + pinch-to-zoom ---
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let lastDist = null;

    const getDist = (t0, t1) =>
      Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY);

    const handleTouchStart = (ev) => {
      if (ev.touches.length === 1) {
        draggingRef.current = true;
        lastMouseRef.current = {
          x: ev.touches[0].clientX,
          y: ev.touches[0].clientY,
        };
      } else if (ev.touches.length === 2) {
        lastDist = getDist(ev.touches[0], ev.touches[1]);
      }
    };

    const handleTouchMove = (ev) => {
      ev.preventDefault();
      if (ev.touches.length === 1 && draggingRef.current) {
        const dx = ev.touches[0].clientX - lastMouseRef.current.x;
        const dy = ev.touches[0].clientY - lastMouseRef.current.y;
        targetOffsetRef.current = {
          x: targetOffsetRef.current.x + dx,
          y: targetOffsetRef.current.y + dy,
        };
        clampOffset();
        lastMouseRef.current = {
          x: ev.touches[0].clientX,
          y: ev.touches[0].clientY,
        };
      } else if (ev.touches.length === 2) {
        const dist = getDist(ev.touches[0], ev.touches[1]);
        if (lastDist) {
          const scaleFactor = dist / lastDist;
          let newZoom = targetZoomRef.current * scaleFactor;
          const MAX_ZOOM = 3;
          newZoom = Math.max(newZoom, initZoomRef.current);
          newZoom = Math.min(newZoom, MAX_ZOOM);

          // вычислим центр между пальцами в координатах canvas
          const rect = canvasRef.current.getBoundingClientRect();
          const centerX =
            (ev.touches[0].clientX + ev.touches[1].clientX) / 2 - rect.left;
          const centerY =
            (ev.touches[0].clientY + ev.touches[1].clientY) / 2 - rect.top;

          // масштаб относительно центра
          const dx = centerX - targetOffsetRef.current.x;
          const dy = centerY - targetOffsetRef.current.y;
          targetOffsetRef.current = {
            x: centerX - (dx * newZoom) / targetZoomRef.current,
            y: centerY - (dy * newZoom) / targetZoomRef.current,
          };
          targetZoomRef.current = newZoom;
          clampOffset();
        }
        lastDist = dist;
      }
    };

    const handleTouchEnd = () => {
      draggingRef.current = false;
      lastDist = null;
    };

    el.addEventListener("touchstart", handleTouchStart, { passive: false });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd, { passive: false });
    el.addEventListener("touchcancel", handleTouchEnd, { passive: false });

    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
      el.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [initialized, canvasSize]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100vw",
        height: "60vh", // подвинь под нужную тебе высоту
        backgroundColor: "#EBE5CF",
        overflow: "hidden",
        touchAction: "none",
        cursor: "grab",
        display: "flex",
        flexDirection: "column",
      }}
      onWheel={handleWheel}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
    >
      <canvas ref={canvasRef} style={{ display: "block", flexGrow: 1 }} />
    </div>
  );
}
