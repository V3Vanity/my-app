import { useRef, useEffect, useState, useCallback } from "react";
import mapImage from "../assets/map.svg";

const nodes = [
  { id: "A", x: 20, y: 865 },
  { id: "B", x: 190, y: 845 },
  { id: "C", x: 400, y: 810 },
  { id: "C1", x: 378, y: 710 },
  { id: "C2", x: 322, y: 710 },
  { id: "C3", x: 292, y: 726 },
  { id: "C4", x: 260, y: 714 },
  { id: "C5", x: 254, y: 732 },
  { id: "C6", x: 219, y: 728 },
  { id: "C7", x: 209, y: 721 },
  { id: "D", x: 500, y: 790 },
  { id: "D1", x: 508, y: 780 },
  { id: "D2", x: 493, y: 673 },
  { id: "D3", x: 493, y: 614 },
  { id: "D4", x: 493, y: 524 },
  { id: "D5", x: 493, y: 485 },
  { id: "D6", x: 492, y: 444 },
  { id: "E", x: 520, y: 787 },
  { id: "F", x: 895, y: 730 },
  { id: "G", x: 930, y: 700 },
  { id: "G1", x: 822, y: 579 },
  { id: "G2", x: 760, y: 495 },
  { id: "G3", x: 746, y: 480 },
  { id: "G4", x: 735, y: 460 },
  { id: "H", x: 979, y: 690 },
  { id: "I", x: 951, y: 560 },
  { id: "J", x: 952, y: 498 },
  { id: "K", x: 933, y: 480 },
  { id: "L", x: 914, y: 367 },
  { id: "M", x: 811, y: 283 },
  { id: "M1", x: 547, y: 468 },
  { id: "N", x: 701, y: 203 },
  { id: "O", x: 690, y: 180 },
  { id: "P", x: 650, y: 168 },
  { id: "P1", x: 530, y: 448 },
  { id: "Q", x: 484, y: 168 },
  { id: "Q1", x: 600, y: 168 },
  { id: "Q2", x: 381, y: 168 },
  { id: "R", x: 316, y: 173 },
  { id: "R1", x: 453, y: 450 },
  { id: "S", x: 305, y: 170 },
  { id: "T", x: 270, y: 280 },
  { id: "U", x: 239, y: 391 },
  { id: "U1", x: 429, y: 470 },
  { id: "V", x: 200, y: 515 },
  { id: "W", x: 161, y: 658 },
  { id: "W1", x: 370, y: 647 },
  { id: "W2", x: 368, y: 522 },
  { id: "W3", x: 458, y: 647 },
  { id: "W4", x: 464, y: 618 },
  { id: "W5", x: 462, y: 522 },
  { id: "X", x: 172, y: 732 },
  { id: "Y1", x: 622, y: 524 },
  { id: "Y2", x: 528, y: 526 },
  { id: "Y3", x: 530, y: 642 },
  { id: "Y4", x: 624, y: 645 },
  { id: "Y5", x: 628, y: 574 },
  { id: "Y6", x: 669, y: 546 },
  { id: "Y7", x: 530, y: 615 },
  // Z
  { id: "Z1", x: 1135, y: 655 },
  { id: "Z2", x: 1120, y: 533 },
  { id: "Z3", x: 1076, y: 275 },
  { id: "Z4", x: 918, y: 138 },
  { id: "Z5", x: 713, y: 4 },
  { id: "Z6", x: 598, y: 6 },
  { id: "Z7", x: 479, y: 4 },
  { id: "Z8", x: 379, y: 2 },
  { id: "Z9", x: 237, y: 6 },
  { id: "Z10", x: 121, y: 231 },
  { id: "Z11", x: 58, y: 356 },
  { id: "Z12", x: 36, y: 515 },
  { id: "Z13", x: 7, y: 692 },
];
const gpsMap = {
  A: [57.769595, 40.912184],
  B: [57.768089, 40.914999],
  C: [57.766208, 40.919132],
  C1: [57.767297, 40.920634],
  C2: [57.767851, 40.919633],
  C3: [57.767952, 40.919193],
  C4: [57.768399, 40.918688],
  C5: [57.768419, 40.918195],
  C6: [57.76874, 40.917814],
  C7: [57.768854, 40.917696],

  D: [57.765228, 40.921097],
  D1: [57.765237, 40.921397],
  D2: [57.766349, 40.923575],
  D3: [57.766759, 40.924375],
  D4: [57.767671, 40.926236],
  D5: [57.767937, 40.926832],
  D6: [57.768238, 40.927577],

  E: [57.765089, 40.921384],

  F: [57.761669, 40.928468],

  G: [57.761529, 40.929775],
  G1: [57.763678, 40.930463],
  G2: [57.765273, 40.930974],
  G3: [57.76557, 40.931057],
  G4: [57.765738, 40.931159],

  H: [57.761156, 40.930741],
  Z1: [57.75997, 40.933746],
  I: [57.762543, 40.932868],
  Z2: [57.761256, 40.935431],
  J: [57.763049, 40.933982],
  K: [57.763386, 40.934029],
  L: [57.764639, 40.936016],
  M: [57.766457, 40.935886],
  N: [57.768309, 40.935747],
  O: [57.768675, 40.935886],
  P: [57.769126, 40.935635],
  Q1: [57.769656, 40.934985],
  Q: [57.770805, 40.93297],
  Q2: [57.771885, 40.931299],
  R: [57.772494, 40.93024],
  S: [57.772657, 40.930036],
  T: [57.772157, 40.927241],
  U: [57.771484, 40.924733],
  V: [57.77082, 40.921706],
  W: [57.769958, 40.918252],
  X: [57.769223, 40.916962],
  Z3: [57.763688, 40.940344],
  Z4: [57.766564, 40.940607],
  Z5: [57.769953, 40.940508],
  Z6: [57.771252, 40.938528],
  Z7: [57.77243, 40.936607],
  Z8: [57.773509, 40.934796],
  Z9: [57.774665, 40.931972],
  Z10: [57.774148, 40.925816],
  Z11: [57.773739, 40.92219],
  Z12: [57.772594, 40.918812],
  Z13: [57.771346, 40.915004],
  // Обрати внимание: Y1..Y7 в твоём списке GPS не были явно указаны —
  // если у тебя есть их GPS, добавь в этот объект (Y1..Y7).
};
const edges = [
  { from: "A", to: "B" },
  { from: "B", to: "C" },
  { from: "C", to: "D" },
  { from: "C", to: "C1" },
  { from: "C1", to: "C2" },
  { from: "C2", to: "C3" },
  { from: "C3", to: "C4" },
  { from: "C4", to: "C5" },
  { from: "C5", to: "C6" },
  { from: "C6", to: "C7" },
  { from: "C7", to: "X" },
  { from: "D", to: "E" },
  { from: "D", to: "D1" },
  { from: "D", to: "D1" },
  { from: "D1", to: "D2" },
  { from: "D2", to: "D3" },
  { from: "D3", to: "D4" },
  { from: "D4", to: "D5" },
  { from: "D5", to: "D6" },
  { from: "D6", to: "Q" },
  { from: "E", to: "F" },
  { from: "E", to: "D1" },
  { from: "F", to: "G" },
  { from: "G", to: "H" },
  { from: "G", to: "G1" },
  { from: "G1", to: "G2" },
  { from: "G1", to: "I" },
  { from: "G2", to: "G3" },
  { from: "G3", to: "G4" },
  { from: "G4", to: "L" },
  { from: "H", to: "I" },
  { from: "I", to: "J" },
  { from: "J", to: "K" },
  { from: "K", to: "L" },
  { from: "L", to: "M" },
  { from: "M", to: "N" },
  { from: "M", to: "M1" },
  { from: "N", to: "O" },
  { from: "O", to: "P" },
  { from: "P", to: "Q1" },
  { from: "P", to: "P1" },
  { from: "Q1", to: "Q" },
  { from: "Q", to: "Q2" },
  { from: "Q2", to: "R" },
  { from: "R", to: "S" },
  { from: "R", to: "R1" },
  { from: "S", to: "T" },
  { from: "T", to: "U" },
  { from: "U", to: "V" },
  { from: "U", to: "U1" },
  { from: "V", to: "W" },
  { from: "V", to: "W2" },
  { from: "W", to: "X" },
  { from: "W", to: "W1" },
  { from: "W1", to: "W2" },
  { from: "W1", to: "W3" },
  { from: "W2", to: "W5" },
  { from: "W3", to: "W4" },
  { from: "W4", to: "W5" },
  { from: "W4", to: "D3" },
  { from: "W5", to: "D4" },
  { from: "X", to: "B" },
  { from: "Y", to: "Y1" },
  { from: "Y1", to: "Y2" },
  { from: "Y2", to: "Y7" },
  { from: "Y7", to: "Y3" },
  { from: "Y7", to: "D3" },
  { from: "Y3", to: "Y4" },
  { from: "Y4", to: "Y5" },
  { from: "Y5", to: "Y6" },
  { from: "Y5", to: "Y1" },
  { from: "Y6", to: "G3" },
  { from: "Y1", to: "G4" },
  { from: "Y2", to: "D4" },
  // Z
  { from: "Z1", to: "H" },
  { from: "Z2", to: "I" },
  { from: "Z3", to: "L" },
  { from: "Z4", to: "M" },
  { from: "Z5", to: "P" },
  { from: "Z6", to: "Q1" },
  { from: "Z7", to: "Q" },
  { from: "Z8", to: "Q2" },
  { from: "Z9", to: "R" },
  { from: "Z10", to: "T" },
  { from: "Z11", to: "U" },
  { from: "Z12", to: "V" },
  { from: "Z13", to: "W" },
  // center
  { from: "M1", to: "P1" },
  { from: "P1", to: "R1" },
  { from: "R1", to: "U1" },
  { from: "D5", to: "M1" },
  { from: "D5", to: "P1" },
  { from: "D5", to: "R1" },
  { from: "D5", to: "U1" },
];
// const userGPS = { lat: 57.765177, lon: 40.921185 };

export default function MapCanvasBlock() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const bgCanvasRef = useRef(null);

  const zoomRef = useRef(1);
  const targetZoomRef = useRef(1);
  const initZoomRef = useRef(1);
  const offsetRef = useRef({ x: 0, y: 0 });
  const targetOffsetRef = useRef({ x: 0, y: 0 });

  const draggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });

  const [initialized, setInitialized] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [userGPS, setUserGPS] = useState({ lat: 57.765177, lon: 40.921185 });

  const affineRef = useRef(null);

  // --- Получение реального GPS пользователя ---
  useEffect(() => {
    if (!navigator.geolocation) return;

    const handleSuccess = (pos) => {
      const { latitude, longitude } = pos.coords;
      setUserGPS({ lat: latitude, lon: longitude });
    };

    const handleError = (err) => {
      console.warn("Ошибка получения GPS:", err);
    };

    const watcherId = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 5000,
      }
    );

    return () => navigator.geolocation.clearWatch(watcherId);
  }, []);

  // --- Блокировка скролла страницы ---
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

  // --- Resize контейнера ---
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

  // --- Solve linear system ---
  const solveLinearSystem = useCallback((A, b) => {
    const ATA = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];
    const ATb = [0, 0, 0];

    for (let i = 0; i < A.length; i++) {
      const ai = A[i];
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) ATA[r][c] += ai[r] * ai[c];
        ATb[r] += ai[r] * b[i];
      }
    }

    const M = [
      [ATA[0][0], ATA[0][1], ATA[0][2], ATb[0]],
      [ATA[1][0], ATA[1][1], ATA[1][2], ATb[1]],
      [ATA[2][0], ATA[2][1], ATA[2][2], ATb[2]],
    ];

    for (let i = 0; i < 3; i++) {
      let maxRow = i;
      for (let k = i + 1; k < 3; k++) {
        if (Math.abs(M[k][i]) > Math.abs(M[maxRow][i])) maxRow = k;
      }
      if (maxRow !== i) [M[i], M[maxRow]] = [M[maxRow], M[i]];
      if (Math.abs(M[i][i]) < 1e-12) continue;
      for (let k = i + 1; k < 3; k++) {
        const c = M[k][i] / M[i][i];
        for (let j = i; j < 4; j++) M[k][j] -= c * M[i][j];
      }
    }

    const x = [0, 0, 0];
    for (let i = 2; i >= 0; i--) {
      let s = M[i][3];
      for (let j = i + 1; j < 3; j++) s -= M[i][j] * x[j];
      x[i] = Math.abs(M[i][i]) < 1e-12 ? 0 : s / M[i][i];
    }
    return x;
  }, []);

  // --- Compute affine transform ---
  const computeAffineFromNodes = useCallback(() => {
    const A = [];
    const bx = [];
    const by = [];
    nodes.forEach((n) => {
      const gps = gpsMap[n.id];
      if (!gps) return;
      const [lat, lon] = gps;
      A.push([lon, lat, 1]);
      bx.push(n.x);
      by.push(n.y);
    });

    if (A.length < 3) return;

    const coeffX = solveLinearSystem(A, bx);
    const coeffY = solveLinearSystem(A, by);

    affineRef.current = { ax: coeffX, ay: coeffY };
  }, [solveLinearSystem]);

  // --- Load map image ---
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

      computeAffineFromNodes();
      setInitialized(true);
    };
  }, [computeAffineFromNodes]);

  const gpsToPixel = useCallback(
    (lat, lon) => {
      if (!affineRef.current) return null;
      const [ax, bx, cx] = affineRef.current.ax;
      const [ay, bys, cy] = affineRef.current.ay;
      return { x: ax * lon + bx * lat + cx, y: ay * lon + bys * lat + cy };
    },
    [affineRef]
  );

  const drawMap = useCallback(() => {
    const canvas = canvasRef.current;
    const bgCanvas = bgCanvasRef.current;
    if (!canvas || !bgCanvas) return;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

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

    ctx.save();
    ctx.translate(offsetRef.current.x, offsetRef.current.y);
    ctx.scale(zoomRef.current, zoomRef.current);

    ctx.strokeStyle = "rgba(255,0,0,0.37)";
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

    nodes.forEach((n) => {
      ctx.fillStyle = "gray";
      ctx.beginPath();
      ctx.arc(n.x, n.y, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "blue";
      ctx.beginPath();
      ctx.arc(n.x, n.y, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "black";
      ctx.font = "16px sans-serif";
      ctx.textBaseline = "middle";
      ctx.fillText(n.id, n.x + 8, n.y);
    });

    // --- draw user with real GPS ---
    const up = gpsToPixel(userGPS.lat, userGPS.lon);
    if (up) {
      ctx.fillStyle = "red";
      ctx.beginPath();
      ctx.arc(up.x, up.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,0,0,0.3)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(up.x, up.y, 12, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }, [gpsToPixel, userGPS]);
  const clampOffset = useCallback(() => {
    if (!imgRef.current || !containerRef.current) return;

    const cw = containerRef.current.clientWidth;
    const ch = containerRef.current.clientHeight;
    const scaledW = imgRef.current.width * targetZoomRef.current;
    const scaledH = imgRef.current.height * targetZoomRef.current;

    targetOffsetRef.current.x =
      scaledW <= cw
        ? (cw - scaledW) / 2
        : Math.min(0, Math.max(cw - scaledW, targetOffsetRef.current.x));
    targetOffsetRef.current.y =
      scaledH <= ch
        ? ch - scaledH
        : Math.min(0, Math.max(ch - scaledH, targetOffsetRef.current.y));
  }, []);

  // --- main render ---
  useEffect(() => {
    if (!initialized || canvasSize.width === 0) return;
    const canvas = canvasRef.current;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(canvasSize.width * ratio);
    canvas.height = Math.round(canvasSize.height * ratio);
    canvas.style.width = `${canvasSize.width}px`;
    canvas.style.height = `${canvasSize.height}px`;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    // init zoom
    if (zoomRef.current === 1) {
      const img = imgRef.current;
      const initZoom = Math.min(
        canvasSize.width / img.width,
        canvasSize.height / img.height
      );
      zoomRef.current = targetZoomRef.current = initZoomRef.current = initZoom;
      targetOffsetRef.current = offsetRef.current = {
        x: (canvasSize.width - img.width * initZoom) / 2,
        y: canvasSize.height - img.height * initZoom,
      };
    }

    let rafId = null;
    const lerp = (start, end, factor) => start + (end - start) * factor;
    const render = () => {
      zoomRef.current = lerp(zoomRef.current, targetZoomRef.current, 0.2);
      offsetRef.current.x = lerp(
        offsetRef.current.x,
        targetOffsetRef.current.x,
        0.2
      );
      offsetRef.current.y = lerp(
        offsetRef.current.y,
        targetOffsetRef.current.y,
        0.2
      );
      drawMap();
      rafId = requestAnimationFrame(render);
    };
    render();

    return () => cancelAnimationFrame(rafId);
  }, [initialized, canvasSize, drawMap]);

  // --- wheel zoom ---
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleWheel = (e) => {
      e.preventDefault();
      if (!canvasRef.current || !imgRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const scaleFactor = e.deltaY < 0 ? 1.08 : 0.92;
      let newZoom = targetZoomRef.current * scaleFactor;
      const MAX_ZOOM = 3;
      newZoom = Math.max(newZoom, initZoomRef.current);
      newZoom = Math.min(newZoom, MAX_ZOOM);

      const dx = mouseX - targetOffsetRef.current.x;
      const dy = mouseY - targetOffsetRef.current.y;
      targetOffsetRef.current = {
        x: mouseX - (dx * newZoom) / targetZoomRef.current,
        y: mouseY - (dy * newZoom) / targetZoomRef.current,
      };
      targetZoomRef.current = newZoom;
      clampOffset();
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [clampOffset]);

  // --- mouse drag ---
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
  const onMouseUp = () => (draggingRef.current = false);
  const onMouseLeave = () => (draggingRef.current = false);

  // --- touch drag + pinch ---
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

          const rect = canvasRef.current.getBoundingClientRect();
          const centerX =
            (ev.touches[0].clientX + ev.touches[1].clientX) / 2 - rect.left;
          const centerY =
            (ev.touches[0].clientY + ev.touches[1].clientY) / 2 - rect.top;

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
    el.addEventListener("touchend", handleTouchEnd);
    el.addEventListener("touchcancel", handleTouchEnd);

    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
      el.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [clampOffset]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100vw",
        height: "60vh",
        backgroundColor: "#EBE5CF",
        overflow: "hidden",
        touchAction: "none",
        cursor: draggingRef.current ? "grabbing" : "grab",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
    >
      <canvas ref={canvasRef} style={{ display: "block", flexGrow: 1 }} />
    </div>
  );
}
