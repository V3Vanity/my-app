import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import "./MapCanvas.css";

import mapImage from "../assets/map.svg";
import rabbitIcon from "../assets/grabbit.svg";
import rabbitOne from "../assets/rabbitOne.svg";
import rabbitTwo from "../assets/rabbitTwo.svg";

import { nodes, questPoints, edges, gpsMap } from "./mapData.js";
const DEBUG_USER = true; // test GPS
const debugUserGPS = { lat: 57.7723, lon: 40.9349 }; // точно на START  lat: 57.7723, lon: 40.9355 };

export default forwardRef(function MapCanvasBlock(
  { className = "", onBack, onQuestPointReached, mode, foundQuestPoints = [] },
  ref
) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const bgCanvasRef = useRef(null);
  const rabbitIconRef = useRef(null);
  const rabbitOneIconRef = useRef(null);
  const rabbitTwoIconRef = useRef(null);

  const zoomRef = useRef(1);
  const targetZoomRef = useRef(1);
  const initZoomRef = useRef(1);
  const offsetRef = useRef({ x: 0, y: 0 });
  const targetOffsetRef = useRef({ x: 0, y: 0 });

  const draggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });

  const [initialized, setInitialized] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [userGPS, setUserGPS] = useState(DEBUG_USER ? debugUserGPS : null);

  const [followUser, setFollowUser] = useState(false);
  const [followMode, setFollowMode] = useState("user"); // "user" или "end"

  // режим страницы: "home" | "quest"
  const [pageMode, setPageMode] = useState("home");

  const lastInteractionRef = useRef(0);
  // тестовая позиция (например, около D5)

  const lastRouteNodeRef = useRef(null);
  const lastRebuildTimeRef = useRef(0);

  const [routeNodes, setRouteNodes] = useState(null);

  const affineRef = useRef(null);

  // --- Получение реального GPS пользователя ---
  useEffect(() => {
    if (DEBUG_USER) {
      setUserGPS(debugUserGPS);
      return;
    }

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

  const gpsToPixel = useCallback(
    (lat, lon) => {
      if (!affineRef.current) return null;
      const [ax, bx, cx] = affineRef.current.ax;
      const [ay, by, cy] = affineRef.current.ay;
      return { x: ax * lon + bx * lat + cx, y: ay * lon + by * lat + cy };
    },
    [affineRef]
  );

  // --- поиск ближайшего узла ---
  const findNearestNode = useCallback((pointPx) => {
    let minDist = Infinity;
    let nearest = null;

    nodes.forEach((n) => {
      const dx = n.x - pointPx.x;
      const dy = n.y - pointPx.y;
      const d = dx * dx + dy * dy;
      if (d < minDist) {
        minDist = d;
        nearest = n;
      }
    });

    return nearest;
  }, []);

  // --- построение маршрута по графу ---
  const buildRoute = useCallback((startId, endId) => {
    const graph = {};
    edges.forEach(({ from, to }) => {
      if (!graph[from]) graph[from] = [];
      if (!graph[to]) graph[to] = [];
      graph[from].push(to);
      graph[to].push(from);
    });

    const queue = [startId];
    const visited = new Set([startId]);
    const prev = {};

    while (queue.length) {
      const cur = queue.shift();
      if (cur === endId) break;

      for (const next of graph[cur] || []) {
        if (!visited.has(next)) {
          visited.add(next);
          prev[next] = cur;
          queue.push(next);
        }
      }
    }

    if (!visited.has(endId)) return null;

    const path = [];
    let cur = endId;
    while (cur) {
      path.push(cur);
      cur = prev[cur];
    }

    return path.reverse();
  }, []);

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

  const centerOnPixel = useCallback(
    (px, zoom = targetZoomRef.current) => {
      if (!containerRef.current) return;

      const cw = containerRef.current.clientWidth;
      const ch = containerRef.current.clientHeight;

      targetZoomRef.current = zoom;
      targetOffsetRef.current = {
        x: cw / 2 - px.x * zoom,
        y: ch / 2 - px.y * zoom,
      };

      clampOffset();
    },
    [clampOffset]
  );

  // --- построение маршрута из GPS пользователя ---
  const rebuildRouteFromUser = useCallback(() => {
    if (!userGPS) return;

    const userPx = gpsToPixel(userGPS.lat, userGPS.lon);
    if (!userPx || !imgRef.current) return;

    const endNode = nodes.find((n) => n.id === "START");
    if (!endNode) return;

    let nearestNode = findNearestNode(userPx);
    const path = buildRoute(nearestNode.id, endNode.id);
    if (!path) return;

    const routeWithUser = [
      { id: "USER", ...userPx },
      ...path.map((id) => nodes.find((n) => n.id === id)).filter(Boolean),
    ];

    setRouteNodes(routeWithUser);
    lastRouteNodeRef.current = nearestNode.id;
    lastRebuildTimeRef.current = Date.now();

    // --- ПРОВЕРКА ДОСТИЖЕНИЯ КВЕСТ-ТОЧКИ ---
    const startQP = questPoints[0]; // старт квеста
    const dx = userPx.x - startQP.x;
    const dy = userPx.y - startQP.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const REACH_RADIUS = 25;
    if (dist < REACH_RADIUS) {
      if (mode === "step2") {
        onQuestPointReached?.(2);
      }
    }
  }, [
    userGPS,
    gpsToPixel,
    findNearestNode,
    buildRoute,
    onQuestPointReached,
    mode,
  ]);

  // ---  Обновление маршрута при движении пользователя (только для step2) ---
  useEffect(() => {
    if (mode !== "step2") return;
    if (!userGPS) return;

    const now = Date.now();
    if (now - lastRebuildTimeRef.current < 3000) return;

    const userPx = gpsToPixel(userGPS.lat, userGPS.lon);
    if (!userPx) return;

    const nearestNode = findNearestNode(userPx);
    if (!nearestNode) return;

    // всегда перестраиваем маршрут на step2
    rebuildRouteFromUser();

    const startQP = questPoints[0]; // старт квеста
    const dx = userPx.x - startQP.x;
    const dy = userPx.y - startQP.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const REACH_RADIUS = 0;
    if (dist < REACH_RADIUS) {
      onQuestPointReached?.(2);
    }
  }, [
    userGPS,
    gpsToPixel,
    findNearestNode,
    rebuildRouteFromUser,
    onQuestPointReached,
    mode,
  ]);

  const buildRouteFromStartToSecondPoint = useCallback(() => {
    const startQP = questPoints.find((qp) => qp.order === 1);
    const targetQP = questPoints.find((qp) => qp.order === 2);
    if (!startQP || !targetQP) return;

    // ближайший узел к старту
    const nearestNodeToStart = findNearestNode({ x: startQP.x, y: startQP.y });
    // ближайший узел к второй точке
    const nearestNodeToTarget = findNearestNode({
      x: targetQP.x,
      y: targetQP.y,
    });

    if (!nearestNodeToStart || !nearestNodeToTarget) return;

    const path = buildRoute(nearestNodeToStart.id, nearestNodeToTarget.id);
    if (!path) return;

    const route = path
      .map((id) => nodes.find((n) => n.id === id))
      .filter(Boolean);

    // добавляем к маршруту саму стартовую точку и вторую точку
    route.unshift({ id: "QP_START", x: startQP.x, y: startQP.y });
    route.push({ id: "QP_2", x: targetQP.x, y: targetQP.y });

    setRouteNodes(route);
  }, [buildRoute, findNearestNode]);

  const buildRouteFromSecondToThirdPoint = useCallback(() => {
    const startQP = questPoints.find((qp) => qp.order === 2);
    const targetQP = questPoints.find((qp) => qp.order === 3);
    if (!startQP || !targetQP) return;

    const nearestNodeToStart = findNearestNode({ x: startQP.x, y: startQP.y });
    const nearestNodeToTarget = findNearestNode({
      x: targetQP.x,
      y: targetQP.y,
    });
    if (!nearestNodeToStart || !nearestNodeToTarget) return;

    const path = buildRoute(nearestNodeToStart.id, nearestNodeToTarget.id);
    if (!path) return;

    const route = path
      .map((id) => nodes.find((n) => n.id === id))
      .filter(Boolean);

    route.unshift({ id: `QP_${startQP.order}`, x: startQP.x, y: startQP.y });
    route.push({ id: `QP_${targetQP.order}`, x: targetQP.x, y: targetQP.y });

    setRouteNodes(route);
  }, [buildRoute, findNearestNode]);

  // --- построение маршрута в зависимости от шага ---
  useEffect(() => {
    // Проверка, если компоненты не инициализированы
    if (!initialized || !affineRef.current) return;

    console.log(`Current Step: ${mode}`);

    // Функция для построения маршрутов
    const buildRoute = () => {
      switch (mode) {
        case "step2": // маршрут от пользователя до стартовой точки
          if (userGPS) {
            rebuildRouteFromUser(); // Проверка для наличия GPS данных
          } else {
            console.warn("User GPS not available for step2");
          }
          break;

        case "step4": // маршрут от стартовой точки до второй квест-точки
          buildRouteFromStartToSecondPoint();
          break;

        case "step6": // маршрут от второй до третьей квест-точки
          buildRouteFromSecondToThirdPoint();
          break;

        default:
          console.warn("Unknown mode:", mode);
          break;
      }
    };

    // Строим маршрут в зависимости от текущего шага
    buildRoute();
  }, [
    initialized, // Инициализация компонента
    userGPS, // Отслеживаем данные GPS пользователя для шага 2
    mode, // Шаг (mode), для которого строим маршрут
    rebuildRouteFromUser, // Функция для маршрута от пользователя
    buildRouteFromStartToSecondPoint, // Функция для маршрута от стартовой точки
    buildRouteFromSecondToThirdPoint, // Функция для маршрута от второй точки
  ]);

  // --- Load map image ---
  useEffect(() => {
    const img = new Image();
    img.src = mapImage;
    img.onload = () => {
      imgRef.current = img;

      const rabbit = new Image();
      rabbit.src = rabbitIcon;
      rabbit.onload = () => {
        rabbitIconRef.current = rabbit;
      };

      const start = new Image();
      start.src = rabbitOne;
      start.onload = () => {
        rabbitOneIconRef.current = start;
      };

      const rabbitTwoImg = new Image();
      rabbitTwoImg.src = rabbitTwo; // импортировать rabbitTwo
      rabbitTwoImg.onload = () => {
        rabbitTwoIconRef.current = rabbitTwoImg;
      };

      const bgCanvas = document.createElement("canvas");
      bgCanvas.width = img.width;
      bgCanvas.height = img.height;
      const bgCtx = bgCanvas.getContext("2d");
      bgCtx.fillStyle = "#b89d6f17";
      bgCtx.fillRect(0, 0, img.width, img.height);
      bgCtx.drawImage(img, 0, 0);
      bgCanvasRef.current = bgCanvas;

      computeAffineFromNodes(); // вычисляем аффинное преобразование
      setInitialized(true); // ставим флаг загрузки
    };
  }, [computeAffineFromNodes, userGPS, rebuildRouteFromUser]);

  // --- обработчик кнопки ---
  const handleBuildRoute = useCallback(() => {
    if (pageMode !== "quest") return;
    rebuildRouteFromUser();

    if (!userGPS) return;
    const px = gpsToPixel(userGPS.lat, userGPS.lon);
    if (!px) return;

    setFollowUser(true);
    centerOnPixel(px, 2.2);
  }, [pageMode, rebuildRouteFromUser, userGPS, gpsToPixel, centerOnPixel]);

  const getQuestPointIcon = useCallback(
    (order) => {
      if (mode === "step2") {
        if (order === 1) return rabbitIconRef.current; // только старт
        return null; // все остальные точки скрыты
      }
      if (mode === "step4") {
        if (order === 1) return rabbitOneIconRef.current; // новая иконка для старта
        if (order === 2) return rabbitIconRef.current; // старая иконка для второй точки
        return null; // все остальные точки не отображаем
      }
      if (mode === "step6") {
        if (order === 1) return rabbitOneIconRef.current;
        if (order === 2) return rabbitTwoIconRef.current;
        if (order === 3) return rabbitIconRef.current;
        return null;
      }
      return foundQuestPoints.includes(order)
        ? rabbitIconRef.current
        : rabbitOneIconRef.current;
    },
    [foundQuestPoints, mode]
  );

  const drawMap = useCallback(() => {
    const canvas = canvasRef.current;
    const bgCanvas = bgCanvasRef.current;
    if (!canvas || !bgCanvas) return;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // --- background ---
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

    if (pageMode === "quest") {
      ctx.strokeStyle = "#b89d6f12";
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
    }

    // --- draw route on top ---
    if (pageMode === "quest" && routeNodes && routeNodes.length > 1) {
      ctx.strokeStyle = "#ffffffaa";
      ctx.lineWidth = 2;
      ctx.beginPath();
      routeNodes.forEach((n, i) => {
        if (!n) return;
        if (i === 0) ctx.moveTo(n.x, n.y);
        else ctx.lineTo(n.x, n.y);
      });
      ctx.stroke();
    }

    // --- draw quest points ---
    if (
      pageMode === "quest" &&
      rabbitIconRef.current &&
      rabbitOneIconRef.current
    ) {
      const iconSize = 40;

      let pointsToDraw = questPoints;

      // step2: рисуем только стартовую точку
      if (mode === "step2") {
        pointsToDraw = questPoints.filter((qp) => qp.order === 1);
      }

      pointsToDraw.forEach((qp) => {
        const icon = getQuestPointIcon(qp.order);
        if (!icon) return;

        ctx.drawImage(
          icon,
          qp.x - iconSize / 2,
          qp.y - iconSize,
          iconSize,
          iconSize
        );
      });
    }

    // // --- draw nodes ---
    // nodes.forEach((n) => {
    //   ctx.fillStyle = "gray";
    //   ctx.beginPath();
    //   ctx.arc(n.x, n.y, 3, 0, Math.PI * 2);
    //   ctx.fill();

    //   ctx.fillStyle = "blue";
    //   ctx.beginPath();
    //   ctx.arc(n.x, n.y, 4, 0, Math.PI * 2);
    //   ctx.fill();

    //   ctx.fillStyle = "black";
    //   ctx.font = "16px sans-serif";
    //   ctx.textBaseline = "middle";
    //   ctx.fillText(n.id, n.x + 8, n.y);
    // });

    // --- draw user ---
    if (userGPS) {
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
    }

    ctx.restore();
  }, [pageMode, gpsToPixel, userGPS, routeNodes, getQuestPointIcon, mode]);

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
      const initZoom =
        Math.min(canvasSize.width / img.width, canvasSize.height / img.height) *
        1.8;
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

  useEffect(() => {
    if (!followUser || !userGPS) return;

    const now = Date.now();
    if (now - lastInteractionRef.current < 3000) return;

    const px = gpsToPixel(userGPS.lat, userGPS.lon);
    if (!px) return;

    centerOnPixel(px);
  }, [userGPS, followUser, gpsToPixel, centerOnPixel]);

  useEffect(() => {
    if (!userGPS) return;
    if (!routeNodes) return;

    const now = Date.now();
    if (now - lastRebuildTimeRef.current < 3000) return;

    // --- вычисляем позицию пользователя ---
    const userPx = gpsToPixel(userGPS.lat, userGPS.lon);
    if (!userPx) return;

    // --- находим ближайший узел маршрута ---
    const nearestNode = findNearestNode(userPx);
    if (!nearestNode) return;

    if (mode !== "step4" && nearestNode.id !== lastRouteNodeRef.current) {
      rebuildRouteFromUser();
    }

    // --- проверка приближения к стартовой точке квеста ---
    const startQP = questPoints[0]; // старт квеста
    const dx = userPx.x - startQP.x;
    const dy = userPx.y - startQP.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const REACH_RADIUS = 0; // радиус достижения, подбирается под карту
    if (dist < REACH_RADIUS && mode !== "step4") {
      onQuestPointReached?.(2);
    }
  }, [
    userGPS,
    routeNodes,
    gpsToPixel,
    findNearestNode,
    rebuildRouteFromUser,
    onQuestPointReached,
    mode,
  ]);

  // --- wheel zoom ---
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleWheel = (e) => {
      lastInteractionRef.current = Date.now();
      setFollowUser(false);

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
    lastRouteNodeRef.current = null;
    lastInteractionRef.current = Date.now();
    setFollowUser(false);

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
      lastInteractionRef.current = Date.now();
      setFollowUser(false);

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

  useImperativeHandle(ref, () => ({
    startQuest: (mode) => {
      setPageMode("quest");

      if (mode === "step6") {
        // вызываем метод маршрута для 6 шага
        buildRouteFromSecondToThirdPoint();

        // центрируем карту между второй и третьей точкой
        const startQP = questPoints.find((qp) => qp.order === 2);
        const targetQP = questPoints.find((qp) => qp.order === 3);
        if (startQP && targetQP) {
          const centerX = (startQP.x + targetQP.x) / 2;
          const centerY = (startQP.y + targetQP.y) / 2;
          centerOnPixel({ x: centerX, y: centerY }, 1.8);
        }
      } else {
        // Для остальных шагов
        buildRouteFromStartToSecondPoint();

        const startQP = questPoints.find((qp) => qp.order === 1);
        const targetQP = questPoints.find((qp) => qp.order === 2);
        if (startQP && targetQP) {
          const centerX = (startQP.x + targetQP.x) / 2;
          const centerY = (startQP.y + targetQP.y) / 2;
          centerOnPixel({ x: centerX, y: centerY }, 1.8);
        }
      }
    },

    buildRouteToStart: () => {
      handleBuildRoute();
    },

    buildRouteFromStartToSecondPoint: () => {
      buildRouteFromStartToSecondPoint();
    },

    buildRouteFromSecondToThirdPoint: () => {
      buildRouteFromSecondToThirdPoint();
    },
  }));

  return (
    <div
      ref={containerRef}
      className={`map-container ${className} ${
        draggingRef.current ? "dragging" : ""
      }`}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
    >
      <button className="back-step-button" onClick={onBack}>
        ←
      </button>

      <button
        className="map-follow-btn"
        onClick={() => {
          if (!routeNodes || routeNodes.length === 0 || !userGPS) return;

          if (followMode === "user") {
            const lastNodeId = routeNodes[routeNodes.length - 1];
            const node = nodes.find((n) => n.id === lastNodeId);
            if (!node) return;
            setFollowUser(false);
            centerOnPixel({ x: node.x, y: node.y }, 2.2);
            setFollowMode("end");
          } else {
            const px = gpsToPixel(userGPS.lat, userGPS.lon);
            if (!px) return;
            setFollowUser(true);
            centerOnPixel(px, 2.2);
            setFollowMode("user");
          }
        }}
      >
        {followMode === "user" ? "🚶" : "🏁"}
      </button>

      <canvas ref={canvasRef} className="map-canvas" />

      {mode !== "step2" && (
        <div className="map-continue-container">
          <button
            className="map-continue-button"
            onClick={() => {
              // Определяем, на какой шаг передаем номер
              if (mode === "step4") onQuestPointReached?.(4);
              else if (mode === "step6") onQuestPointReached?.(6);
              // Можно добавить другие шаги по аналогии
            }}
          >
            Продолжить
          </button>
        </div>
      )}
    </div>
  );
});
