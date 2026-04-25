import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import "/src/components/MapCanvas.css";

import mapImage from "../assets/map.svg";
import rabbitIcon from "../assets/grabbit.svg";
import rabbitOne from "../assets/rabbitOne.svg";
import rabbitTwo from "../assets/rabbitTwo.svg";
import rabbitThree from "../assets/rabbitThree.svg";
import rabbitFour from "../assets/rabbitFour.svg";
import rabbitFive from "../assets/rabbitFive.svg";
import rabbitSix from "../assets/rabbitSix.svg";
import rabbitSeven from "../assets/rabbitSeven.svg";
import rabbitEight from "../assets/rabbitEight.svg";
import rabbitNine from "../assets/rabbitNine.svg";
import rabbitTen from "../assets/rabbitTen.svg";
import rabbitEleven from "../assets/rabbitEleven.svg";
import rabbitTwelve from "../assets/rabbitTwelve.svg";
import rabbitThirteen from "../assets/rabbitThirteen.svg";
import rabbitFourteen from "../assets/rabbitFourteen.svg";
import templeIcon from "../assets/temple-icon.svg";
import museumIcon from "../assets/museum-icon.svg";

import ProgressModal from "./ProgressModal.jsx";

import {
  nodes,
  questPoints,
  edges,
  gpsMap,
  templePoints,
  museumPoints,
  artPoints,
  historyPoints,
  familyPoints,
} from "./mapData.js";

const DEBUG_USER = false;
const debugUserGPS = { lat: 57.7723, lon: 40.9349 };

// ========== НАСТРОЙКИ ДЛЯ КАЛИБРОВКИ (УДАЛЁННОЙ) ==========
// Включи калибровочный режим:
const CALIBRATION_MODE = true; // ← ВКЛЮЧИ ЭТО (true) для калибровки

// КАЛИБРОВОЧНАЯ ТОЧКА - измени под свои данные!
// Ты знаешь реальные GPS координаты места и где оно должно быть на карте (в пикселях)
const CALIBRATION_POINT = {
  // Реальные GPS координаты места (например, памятник, фонтан, здание)
  realGPS: { lat: 57.7685, lon: 40.9269 }, // ← ИЗМЕНИ НА РЕАЛЬНЫЕ КООРДИНАТЫ

  // Где эта точка должна быть на карте (пиксели)
  // Открой карту, найди это место, посмотри примерные координаты
  expectedPixel: { x: 500, y: 600 }, // ← ИЗМЕНИ НА ПИКСЕЛИ НА КАРТЕ

  // Включить отображение калибровочной точки на карте
  showOnMap: true,
};

// Коррекция GPS (будет автоматически вычислена на основе калибровки)
let CALCULATED_CORRECTION = { lat: 0, lon: 0 };

// Кэш для изображений
const imageCache = new Map();

export default forwardRef(function MapCanvasBlock(
  {
    className = "",
    onQuestPointReached,
    mode,
    foundQuestPoints = [],
    restaurants = [],
    onMarkerClick = () => {},
    selectedTemple = null,
  },
  ref,
) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const bgCanvasRef = useRef(null);

  const rabbitIconsRef = useRef({});
  const restaurantIconsRef = useRef({});
  const templeIconsRef = useRef({});
  const museumIconsRef = useRef({});
  const artIconsRef = useRef({});
  const historyIconsRef = useRef({});
  const familyIconsRef = useRef({});

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
  const [calibrationOffset, setCalibrationOffset] = useState({
    lat: 0,
    lon: 0,
  });

  const [followUser, setFollowUser] = useState(false);
  const [followMode, setFollowMode] = useState("user");
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [pageMode, setPageMode] = useState("home");
  const [isLoading, setIsLoading] = useState(true);
  const [isModeChanging, setIsModeChanging] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const progressModalJustClosed = useRef(false);
  const lastInteractionRef = useRef(0);
  const lastRouteNodeRef = useRef(null);
  const lastRebuildTimeRef = useRef(0);
  const lastGpsUpdateRef = useRef(0);
  const gpsIntervalIdRef = useRef(null);

  const [routeNodes, setRouteNodes] = useState(null);
  const [currentMapMode, setCurrentMapMode] = useState(null);

  const affineRef = useRef(null);

  // Функция для вычисления калибровочной коррекции
  const calculateCalibrationCorrection = useCallback(() => {
    if (!CALIBRATION_MODE || !affineRef.current) {
      return { lat: 0, lon: 0 };
    }

    // Получаем пиксель, куда текущий affine преобразует реальные GPS калибровочной точки
    const { realGPS, expectedPixel } = CALIBRATION_POINT;

    const currentPixel = gpsToPixel(realGPS.lat, realGPS.lon);
    if (!currentPixel) return { lat: 0, lon: 0 };

    // Вычисляем разницу в пикселях
    const pixelDeltaX = expectedPixel.x - currentPixel.x;
    const pixelDeltaY = expectedPixel.y - currentPixel.y;

    // Примерное преобразование пикселей в градусы (грубая оценка)
    // 1 градус ≈ 111 км, 1 пиксель ≈ сколько градусов зависит от зума
    // Для калибровки используем примерное значение
    const pixelToDegree = 0.0000015; // ~10 метров на пиксель при стандартном зуме

    const latCorrection = pixelDeltaY * pixelToDegree;
    const lonCorrection = pixelDeltaX * pixelToDegree;

    console.log("=== КАЛИБРОВКА ===");
    console.log("Реальный GPS:", realGPS);
    console.log("Текущий пиксель:", currentPixel);
    console.log("Ожидаемый пиксель:", expectedPixel);
    console.log("Смещение (пиксели):", { x: pixelDeltaX, y: pixelDeltaY });
    console.log("Коррекция (градусы):", {
      lat: latCorrection,
      lon: lonCorrection,
    });

    return { lat: latCorrection, lon: lonCorrection };
  }, [gpsToPixel]);

  // Функция загрузки с кэшем
  const loadImageWithCache = useCallback((src) => {
    return new Promise((resolve) => {
      if (imageCache.has(src)) {
        resolve(imageCache.get(src));
        return;
      }

      const img = new Image();
      img.src = src;
      img.onload = () => {
        imageCache.set(src, img);
        resolve(img);
      };
      img.onerror = () => {
        imageCache.set(src, null);
        resolve(null);
      };
      if ("decode" in img) {
        img.decode().catch(() => {});
      }
    });
  }, []);

  // Применение коррекции GPS (автоматическая из калибровки)
  const getCorrectedGPS = useCallback(
    (lat, lon) => {
      if (CALIBRATION_MODE) {
        // Используем автоматически вычисленную коррекцию
        return {
          lat: lat + calibrationOffset.lat,
          lon: lon + calibrationOffset.lon,
        };
      }
      return { lat, lon };
    },
    [calibrationOffset],
  );

  // --- Получение реального GPS пользователя ---
  useEffect(() => {
    if (DEBUG_USER) {
      setUserGPS(debugUserGPS);
      return;
    }

    if (!navigator.geolocation) {
      console.warn("Геолокация не поддерживается");
      // В режиме калибровки можно использовать калибровочную точку как имитацию
      if (CALIBRATION_MODE) {
        console.log("Калибровочный режим: используем тестовую точку");
        const corrected = getCorrectedGPS(
          CALIBRATION_POINT.realGPS.lat,
          CALIBRATION_POINT.realGPS.lon,
        );
        setUserGPS({ lat: corrected.lat, lon: corrected.lon });
      }
      return;
    }

    const updatePosition = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const corrected = getCorrectedGPS(latitude, longitude);
          setUserGPS({ lat: corrected.lat, lon: corrected.lon });
          lastGpsUpdateRef.current = Date.now();
        },
        (err) => {
          console.warn("Ошибка получения GPS:", err.message);
          // В режиме калибровки используем калибровочную точку
          if (CALIBRATION_MODE) {
            const corrected = getCorrectedGPS(
              CALIBRATION_POINT.realGPS.lat,
              CALIBRATION_POINT.realGPS.lon,
            );
            setUserGPS({ lat: corrected.lat, lon: corrected.lon });
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000,
        },
      );
    };

    updatePosition();

    const intervalId = setInterval(() => {
      const now = Date.now();
      if (now - lastGpsUpdateRef.current >= 5000) {
        updatePosition();
      }
    }, 3000);

    gpsIntervalIdRef.current = intervalId;
    const intervalIdToClean = intervalId;

    return () => {
      clearInterval(intervalIdToClean);
      gpsIntervalIdRef.current = null;
    };
  }, [getCorrectedGPS]);

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

  // --- Resize контейнера с debounce ---
  useEffect(() => {
    let timeoutId;
    const updateSize = () => {
      if (!containerRef.current) return;
      setCanvasSize({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
        devicePixelRatio: window.devicePixelRatio,
      });
    };

    const debouncedUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateSize, 150);
    };

    updateSize();
    window.addEventListener("resize", debouncedUpdate);
    return () => {
      window.removeEventListener("resize", debouncedUpdate);
      clearTimeout(timeoutId);
    };
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

    console.log("Affine transform calculated:", affineRef.current);

    // После вычисления affine, обновляем калибровочную коррекцию
    if (CALIBRATION_MODE) {
      const correction = calculateCalibrationCorrection();
      setCalibrationOffset(correction);
      CALCULATED_CORRECTION = correction;
      console.log("Автоматическая коррекция применена:", correction);
    }
  }, [solveLinearSystem, calculateCalibrationCorrection]);

  const gpsToPixel = useCallback(
    (lat, lon) => {
      if (!affineRef.current) return null;
      const [ax, bx, cx] = affineRef.current.ax;
      const [ay, by, cy] = affineRef.current.ay;
      return { x: ax * lon + bx * lat + cx, y: ay * lon + by * lat + cy };
    },
    [affineRef],
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

  // --- Функция для вычисления расстояния между узлами с приоритетами ---
  const calculateDistance = useCallback((node1Id, node2Id) => {
    const node1 = nodes.find((n) => n.id === node1Id);
    const node2 = nodes.find((n) => n.id === node2Id);

    if (!node1 || !node2) return Infinity;

    const dx = node1.x - node2.x;
    const dy = node1.y - node2.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    const priorityNodes = [
      ...nodes.filter((n) => n.id.startsWith("Q")).map((n) => n.id),
      ...nodes.filter((n) => n.id.startsWith("W")).map((n) => n.id),
      ...nodes.filter((n) => n.id.startsWith("D")).map((n) => n.id),
      ...nodes.filter((n) => n.id.startsWith("Y")).map((n) => n.id),
      ...nodes.filter((n) => n.id.startsWith("U")).map((n) => n.id),
    ];

    const avoidNodes = [
      "M1",
      "Q1",
      "Q2",
      "P1",
      "R1",
      "U1",
      "Z1",
      "Z2",
      "Z3",
      "Z4",
      "Z5",
      "Z6",
      "Z7",
      "Z8",
      "Z9",
      "Z10",
      "Z11",
      "Z12",
      "Z13",
    ];

    const isNode1Priority = priorityNodes.includes(node1Id);
    const isNode2Priority = priorityNodes.includes(node2Id);
    const isNode1Avoid = avoidNodes.includes(node1Id);
    const isNode2Avoid = avoidNodes.includes(node2Id);

    if (isNode1Priority && isNode2Priority) {
      distance = distance * 0.3;
    } else if (isNode1Priority || isNode2Priority) {
      distance = distance * 0.6;
    }

    if (isNode1Avoid && isNode2Avoid) {
      distance = distance * 3;
    } else if (isNode1Avoid || isNode2Avoid) {
      distance = distance * 1.8;
    }

    const sameGroup =
      (node1Id.startsWith("Q") && node2Id.startsWith("Q")) ||
      (node1Id.startsWith("W") && node2Id.startsWith("W")) ||
      (node1Id.startsWith("D") && node2Id.startsWith("D")) ||
      (node1Id.startsWith("Y") && node2Id.startsWith("Y"));

    if (sameGroup) {
      distance = distance * 0.8;
    }

    return distance;
  }, []);

  // --- построение маршрута по графу с весами (Дейкстра) ---
  const buildRouteDijkstra = useCallback(
    (startId, endId) => {
      const graph = {};

      edges.forEach(({ from, to }) => {
        const distance = calculateDistance(from, to);
        if (!graph[from]) graph[from] = [];
        if (!graph[to]) graph[to] = [];
        graph[from].push({ node: to, weight: distance });
        graph[to].push({ node: from, weight: distance });
      });

      const distances = {};
      const previous = {};
      const unvisited = new Set();

      nodes.forEach((node) => {
        distances[node.id] = Infinity;
        previous[node.id] = null;
        unvisited.add(node.id);
      });

      distances[startId] = 0;

      while (unvisited.size > 0) {
        let current = null;
        let minDistance = Infinity;

        for (const nodeId of unvisited) {
          if (distances[nodeId] < minDistance) {
            minDistance = distances[nodeId];
            current = nodeId;
          }
        }

        if (current === null || current === endId) break;
        if (distances[current] === Infinity) break;

        unvisited.delete(current);

        for (const neighbor of graph[current] || []) {
          if (!unvisited.has(neighbor.node)) continue;
          const newDistance = distances[current] + neighbor.weight;
          if (newDistance < distances[neighbor.node]) {
            distances[neighbor.node] = newDistance;
            previous[neighbor.node] = current;
          }
        }
      }

      if (distances[endId] === Infinity) return null;

      const path = [];
      let cur = endId;
      while (cur) {
        path.unshift(cur);
        cur = previous[cur];
      }
      return path;
    },
    [calculateDistance],
  );

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
    [clampOffset],
  );

  // --- построение маршрута к храму ---
  const buildRouteToTemple = useCallback(
    (templeId) => {
      const temple = templePoints.find((t) => t.id === templeId);
      if (!temple || !userGPS) return;

      const userPx = gpsToPixel(userGPS.lat, userGPS.lon);
      if (!userPx) return;

      const nearestNodeToUser = findNearestNode(userPx);
      const nearestNodeToTemple = findNearestNode({ x: temple.x, y: temple.y });

      if (!nearestNodeToUser || !nearestNodeToTemple) return;

      const path = buildRouteDijkstra(
        nearestNodeToUser.id,
        nearestNodeToTemple.id,
      );
      if (!path) return;

      const route = [
        { id: "USER", x: userPx.x, y: userPx.y },
        ...path
          .map((id) => {
            const node = nodes.find((n) => n.id === id);
            return node ? { id: node.id, x: node.x, y: node.y } : null;
          })
          .filter(Boolean),
        { id: temple.id, x: temple.x, y: temple.y, isTemple: true },
      ];

      setRouteNodes(route);
    },
    [userGPS, gpsToPixel, findNearestNode, buildRouteDijkstra],
  );

  // --- построение маршрута к музею ---
  const buildRouteToMuseum = useCallback(
    (museumId) => {
      const museum = museumPoints.find((m) => m.id === museumId);
      if (!museum || !userGPS) return;

      const userPx = gpsToPixel(userGPS.lat, userGPS.lon);
      if (!userPx) return;

      const nearestNodeToUser = findNearestNode(userPx);
      const nearestNodeToMuseum = findNearestNode({ x: museum.x, y: museum.y });

      if (!nearestNodeToUser || !nearestNodeToMuseum) return;

      const path = buildRouteDijkstra(
        nearestNodeToUser.id,
        nearestNodeToMuseum.id,
      );
      if (!path) return;

      const route = [
        { id: "USER", x: userPx.x, y: userPx.y },
        ...path
          .map((id) => {
            const node = nodes.find((n) => n.id === id);
            return node ? { id: node.id, x: node.x, y: node.y } : null;
          })
          .filter(Boolean),
        { id: museum.id, x: museum.x, y: museum.y, isMuseum: true },
      ];

      setRouteNodes(route);
    },
    [userGPS, gpsToPixel, findNearestNode, buildRouteDijkstra],
  );

  // --- построение маршрута к искусству ---
  const buildRouteToArt = useCallback(
    (artId) => {
      const art = artPoints.find((a) => a.id === artId);
      if (!art || !userGPS) return;

      const userPx = gpsToPixel(userGPS.lat, userGPS.lon);
      if (!userPx) return;

      const nearestNodeToUser = findNearestNode(userPx);
      const nearestNodeToArt = findNearestNode({ x: art.x, y: art.y });

      if (!nearestNodeToUser || !nearestNodeToArt) return;

      const path = buildRouteDijkstra(
        nearestNodeToUser.id,
        nearestNodeToArt.id,
      );
      if (!path) return;

      const route = [
        { id: "USER", x: userPx.x, y: userPx.y },
        ...path
          .map((id) => {
            const node = nodes.find((n) => n.id === id);
            return node ? { id: node.id, x: node.x, y: node.y } : null;
          })
          .filter(Boolean),
        { id: art.id, x: art.x, y: art.y, isArt: true },
      ];

      setRouteNodes(route);
    },
    [userGPS, gpsToPixel, findNearestNode, buildRouteDijkstra],
  );

  // --- построение маршрута к истории ---
  const buildRouteToHistory = useCallback(
    (historyId) => {
      const history = historyPoints.find((h) => h.id === historyId);
      if (!history || !userGPS) return;

      const userPx = gpsToPixel(userGPS.lat, userGPS.lon);
      if (!userPx) return;

      const nearestNodeToUser = findNearestNode(userPx);
      const nearestNodeToHistory = findNearestNode({
        x: history.x,
        y: history.y,
      });

      if (!nearestNodeToUser || !nearestNodeToHistory) return;

      const path = buildRouteDijkstra(
        nearestNodeToUser.id,
        nearestNodeToHistory.id,
      );
      if (!path) return;

      const route = [
        { id: "USER", x: userPx.x, y: userPx.y },
        ...path
          .map((id) => {
            const node = nodes.find((n) => n.id === id);
            return node ? { id: node.id, x: node.x, y: node.y } : null;
          })
          .filter(Boolean),
        { id: history.id, x: history.x, y: history.y, isHistory: true },
      ];

      setRouteNodes(route);
    },
    [userGPS, gpsToPixel, findNearestNode, buildRouteDijkstra],
  );

  // --- построение маршрута к семейным местам ---
  const buildRouteToFamily = useCallback(
    (familyId) => {
      const family = familyPoints.find((f) => f.id === familyId);
      if (!family || !userGPS) return;

      const userPx = gpsToPixel(userGPS.lat, userGPS.lon);
      if (!userPx) return;

      const nearestNodeToUser = findNearestNode(userPx);
      const nearestNodeToFamily = findNearestNode({ x: family.x, y: family.y });

      if (!nearestNodeToUser || !nearestNodeToFamily) return;

      const path = buildRouteDijkstra(
        nearestNodeToUser.id,
        nearestNodeToFamily.id,
      );
      if (!path) return;

      const route = [
        { id: "USER", x: userPx.x, y: userPx.y },
        ...path
          .map((id) => {
            const node = nodes.find((n) => n.id === id);
            return node ? { id: node.id, x: node.x, y: node.y } : null;
          })
          .filter(Boolean),
        { id: family.id, x: family.x, y: family.y, isFamily: true },
      ];

      setRouteNodes(route);
    },
    [userGPS, gpsToPixel, findNearestNode, buildRouteDijkstra],
  );

  // --- построение маршрута из GPS пользователя для квеста ---
  const rebuildRouteFromUser = useCallback(() => {
    if (mode !== "step2") return;
    if (!userGPS) return;

    const userPx = gpsToPixel(userGPS.lat, userGPS.lon);
    if (!userPx || !imgRef.current) return;

    const startQP = questPoints.find((qp) => qp.order === 1);
    if (!startQP) return;

    const nearestNode = findNearestNode(userPx);
    const path = buildRouteDijkstra(nearestNode.id, "START");
    if (!path) return;

    const iconSize = 40;
    const iconCenterOffset = iconSize / 2;

    const routeWithUser = [
      { id: "USER", ...userPx },
      ...path
        .map((id) => {
          const node = nodes.find((n) => n.id === id);
          return node
            ? { id: node.id, x: node.x, y: node.y - iconCenterOffset }
            : null;
        })
        .filter(Boolean),
    ];

    routeWithUser.push({
      id: "START",
      x: startQP.x,
      y: startQP.y - iconCenterOffset,
    });

    setRouteNodes(routeWithUser);
    lastRouteNodeRef.current = nearestNode.id;
    lastRebuildTimeRef.current = Date.now();

    const dx = userPx.x - startQP.x;
    const dy = userPx.y - startQP.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 25 && mode === "step2") {
      onQuestPointReached?.(2);
    }
  }, [
    userGPS,
    gpsToPixel,
    findNearestNode,
    buildRouteDijkstra,
    onQuestPointReached,
    mode,
  ]);

  // Объединенная функция построения маршрутов для квеста
  const buildRouteBetweenPoints = useCallback(
    (startOrder, targetOrder) => {
      const startQP = questPoints.find((qp) => qp.order === startOrder);
      const targetQP = questPoints.find((qp) => qp.order === targetOrder);
      if (!startQP || !targetQP) return;

      const nearestNodeToStart = findNearestNode({
        x: startQP.x,
        y: startQP.y,
      });
      const nearestNodeToTarget = findNearestNode({
        x: targetQP.x,
        y: targetQP.y,
      });
      if (!nearestNodeToStart || !nearestNodeToTarget) return;

      const path = buildRouteDijkstra(
        nearestNodeToStart.id,
        nearestNodeToTarget.id,
      );
      if (!path) return;

      const iconSize = 40;
      const iconCenterOffset = iconSize / 2;

      const route = path
        .map((id) => {
          const node = nodes.find((n) => n.id === id);
          return node
            ? { id: node.id, x: node.x, y: node.y - iconCenterOffset }
            : null;
        })
        .filter(Boolean);

      route.unshift({
        id: startQP.id,
        x: startQP.x,
        y: startQP.y - iconCenterOffset,
      });
      route.push({
        id: targetQP.id,
        x: targetQP.x,
        y: targetQP.y - iconCenterOffset,
      });

      setRouteNodes(route);
    },
    [buildRouteDijkstra, findNearestNode],
  );

  // --- Обработка изменения режима ---
  useEffect(() => {
    if (!initialized || !affineRef.current) return;
    if (!mode) return;

    if (progressModalJustClosed.current) {
      progressModalJustClosed.current = false;
      return;
    }

    if (mode === "step2" && userGPS) {
      rebuildRouteFromUser();
    }

    const timer = setTimeout(() => {
      setIsLoading(false);
      setIsModeChanging(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [mode, initialized, userGPS, rebuildRouteFromUser]);

  // --- Эффекты для центрирования на выбранных объектах ---
  useEffect(() => {
    if (mode === "temple" && selectedTemple && initialized) {
      const temple = templePoints.find((t) => t.id === selectedTemple.mapId);
      if (temple) {
        centerOnPixel({ x: temple.x, y: temple.y }, 2.0);
        setTimeout(() => buildRouteToTemple(selectedTemple.mapId), 100);
      }
    }
  }, [mode, selectedTemple, initialized, centerOnPixel, buildRouteToTemple]);

  useEffect(() => {
    if (mode === "museum" && selectedTemple && initialized) {
      const museum = museumPoints.find((m) => m.id === selectedTemple.mapId);
      if (museum) {
        centerOnPixel({ x: museum.x, y: museum.y }, 2.0);
        setTimeout(() => buildRouteToMuseum(selectedTemple.mapId), 100);
      }
    }
  }, [mode, selectedTemple, initialized, centerOnPixel, buildRouteToMuseum]);

  useEffect(() => {
    if (mode === "art" && selectedTemple && initialized) {
      const art = artPoints.find((a) => a.id === selectedTemple.mapId);
      if (art) {
        centerOnPixel({ x: art.x, y: art.y }, 2.0);
        setTimeout(() => buildRouteToArt(selectedTemple.mapId), 100);
      }
    }
  }, [mode, selectedTemple, initialized, centerOnPixel, buildRouteToArt]);

  useEffect(() => {
    if (mode === "history" && selectedTemple && initialized) {
      const history = historyPoints.find((h) => h.id === selectedTemple.mapId);
      if (history) {
        centerOnPixel({ x: history.x, y: history.y }, 2.0);
        setTimeout(() => buildRouteToHistory(selectedTemple.mapId), 100);
      }
    }
  }, [mode, selectedTemple, initialized, centerOnPixel, buildRouteToHistory]);

  useEffect(() => {
    if (mode === "family" && selectedTemple && initialized) {
      const family = familyPoints.find((f) => f.id === selectedTemple.mapId);
      if (family) {
        centerOnPixel({ x: family.x, y: family.y }, 2.0);
        setTimeout(() => buildRouteToFamily(selectedTemple.mapId), 100);
      }
    }
  }, [mode, selectedTemple, initialized, centerOnPixel, buildRouteToFamily]);

  // ========== ФУНКЦИЯ ВЫБОРА ИКОНКИ ЗАЙЦА ==========
  const getQuestPointIcon = useCallback(
    (order) => {
      if (mode === "step2") {
        return rabbitIconsRef.current["rabbitIcon"] || null;
      }

      const stepMap = {
        step4: { icons: ["rabbitOne", "rabbitIcon"] },
        step6: { icons: ["rabbitOne", "rabbitTwo", "rabbitIcon"] },
        step8: {
          icons: ["rabbitOne", "rabbitTwo", "rabbitThree", "rabbitIcon"],
        },
        step10: {
          icons: [
            "rabbitOne",
            "rabbitTwo",
            "rabbitThree",
            "rabbitFour",
            "rabbitIcon",
          ],
        },
        step12: {
          icons: [
            "rabbitOne",
            "rabbitTwo",
            "rabbitThree",
            "rabbitFour",
            "rabbitFive",
            "rabbitIcon",
          ],
        },
        step14: {
          icons: [
            "rabbitOne",
            "rabbitTwo",
            "rabbitThree",
            "rabbitFour",
            "rabbitFive",
            "rabbitSix",
            "rabbitIcon",
          ],
        },
        step16: {
          icons: [
            "rabbitOne",
            "rabbitTwo",
            "rabbitThree",
            "rabbitFour",
            "rabbitFive",
            "rabbitSix",
            "rabbitSeven",
            "rabbitIcon",
          ],
        },
        step18: {
          icons: [
            "rabbitOne",
            "rabbitTwo",
            "rabbitThree",
            "rabbitFour",
            "rabbitFive",
            "rabbitSix",
            "rabbitSeven",
            "rabbitEight",
            "rabbitIcon",
          ],
        },
        step20: {
          icons: [
            "rabbitOne",
            "rabbitTwo",
            "rabbitThree",
            "rabbitFour",
            "rabbitFive",
            "rabbitSix",
            "rabbitSeven",
            "rabbitEight",
            "rabbitNine",
            "rabbitIcon",
          ],
        },
        step22: {
          icons: [
            "rabbitOne",
            "rabbitTwo",
            "rabbitThree",
            "rabbitFour",
            "rabbitFive",
            "rabbitSix",
            "rabbitSeven",
            "rabbitEight",
            "rabbitNine",
            "rabbitTen",
            "rabbitIcon",
          ],
        },
        step24: {
          icons: [
            "rabbitOne",
            "rabbitTwo",
            "rabbitThree",
            "rabbitFour",
            "rabbitFive",
            "rabbitSix",
            "rabbitSeven",
            "rabbitEight",
            "rabbitNine",
            "rabbitTen",
            "rabbitEleven",
            "rabbitIcon",
          ],
        },
        step26: {
          icons: [
            "rabbitOne",
            "rabbitTwo",
            "rabbitThree",
            "rabbitFour",
            "rabbitFive",
            "rabbitSix",
            "rabbitSeven",
            "rabbitEight",
            "rabbitNine",
            "rabbitTen",
            "rabbitEleven",
            "rabbitTwelve",
            "rabbitIcon",
          ],
        },
        step28: {
          icons: [
            "rabbitOne",
            "rabbitTwo",
            "rabbitThree",
            "rabbitFour",
            "rabbitFive",
            "rabbitSix",
            "rabbitSeven",
            "rabbitEight",
            "rabbitNine",
            "rabbitTen",
            "rabbitEleven",
            "rabbitTwelve",
            "rabbitThirteen",
            "rabbitIcon",
          ],
        },
        step30: {
          icons: [
            "rabbitOne",
            "rabbitTwo",
            "rabbitThree",
            "rabbitFour",
            "rabbitFive",
            "rabbitSix",
            "rabbitSeven",
            "rabbitEight",
            "rabbitNine",
            "rabbitTen",
            "rabbitEleven",
            "rabbitTwelve",
            "rabbitThirteen",
            "rabbitFourteen",
          ],
        },
      };

      const stepConfig = stepMap[mode];
      if (stepConfig) {
        const iconIndex = order - 1;
        if (iconIndex >= 0 && iconIndex < stepConfig.icons.length) {
          return rabbitIconsRef.current[stepConfig.icons[iconIndex]] || null;
        }
        return null;
      }

      const iconKey = foundQuestPoints.includes(order)
        ? "rabbitIcon"
        : "rabbitOne";
      return rabbitIconsRef.current[iconKey] || null;
    },
    [foundQuestPoints, mode],
  );

  // ========== ФУНКЦИЯ ОТРИСОВКИ ==========
  const drawMap = useCallback(() => {
    const canvas = canvasRef.current;
    const bgCanvas = bgCanvasRef.current;

    if (!canvas || !bgCanvas || !imgRef.current) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

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
      bgCanvas.height * zoomRef.current,
    );

    ctx.save();
    ctx.translate(offsetRef.current.x, offsetRef.current.y);
    ctx.scale(zoomRef.current, zoomRef.current);

    const SHOW_DEBUG_NODES = false;

    if (SHOW_DEBUG_NODES) {
      nodes.forEach((node) => {
        ctx.fillStyle = "#00FF00";
        ctx.beginPath();
        ctx.arc(node.x, node.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "black";
        ctx.font = "bold 10px 'Advent Pro', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(node.id, node.x, node.y - 10);
      });

      ctx.strokeStyle = "rgba(0, 255, 0, 0.3)";
      ctx.lineWidth = 2;
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

    // Отрисовка маршрута
    if (routeNodes && routeNodes.length > 1) {
      if (
        mode === "temple" ||
        mode === "museum" ||
        mode === "art" ||
        mode === "history" ||
        mode === "family"
      ) {
        ctx.strokeStyle = "#FFD700";
        ctx.lineWidth = 2;
      } else {
        ctx.strokeStyle = "#ffffffaa";
        ctx.lineWidth = 2;
      }

      ctx.beginPath();
      routeNodes.forEach((n, i) => {
        if (!n) return;
        if (i === 0) ctx.moveTo(n.x, n.y);
        else ctx.lineTo(n.x, n.y);
      });
      ctx.stroke();
    }

    // Отрисовка квестовых точек
    if (
      pageMode === "quest" &&
      rabbitIconsRef.current["rabbitIcon"] &&
      rabbitIconsRef.current["rabbitOne"]
    ) {
      const iconSize = 40;
      const showUpTo = {
        step2: 1,
        step4: 2,
        step6: 3,
        step8: 4,
        step10: 5,
        step12: 6,
        step14: 7,
        step16: 8,
        step18: 9,
        step20: 10,
        step22: 11,
        step24: 12,
        step26: 13,
        step28: 14,
        step30: 14,
      };
      const maxOrder = showUpTo[mode] || 0;
      let pointsToDraw =
        maxOrder > 0
          ? questPoints.filter((qp) => qp.order <= maxOrder)
          : questPoints;

      pointsToDraw.forEach((qp) => {
        const icon = getQuestPointIcon(qp.order);
        if (!icon) return;
        ctx.drawImage(
          icon,
          qp.x - iconSize / 2,
          qp.y - iconSize,
          iconSize,
          iconSize,
        );
      });
    }

    // Отрисовка ресторанов
    if (mode === "gastro" && restaurants && restaurants.length > 0) {
      const iconWidth = 45;
      const iconHeight = 52;
      restaurants.forEach((restaurant) => {
        const icon = restaurantIconsRef.current[restaurant.id];
        if (icon) {
          ctx.drawImage(
            icon,
            restaurant.location.x - iconWidth / 2,
            restaurant.location.y - iconHeight / 2,
            iconWidth,
            iconHeight,
          );
        } else {
          ctx.fillStyle = "#b89d6f";
          ctx.beginPath();
          ctx.arc(
            restaurant.location.x,
            restaurant.location.y - iconHeight / 2,
            8,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }
      });
    }

    // Отрисовка храмов
    if (mode === "temple" && templePoints.length > 0) {
      const iconSize = 45;
      const icon = templeIconsRef.current.default;
      templePoints.forEach((temple) => {
        if (icon) {
          ctx.drawImage(
            icon,
            temple.x - iconSize / 2,
            temple.y - iconSize,
            iconSize,
            iconSize,
          );
          if (zoomRef.current > 1.5) {
            ctx.fillStyle = "white";
            ctx.font = "bold 12px 'Advent Pro', sans-serif";
            ctx.textAlign = "center";
            ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
            ctx.shadowBlur = 4;
            ctx.fillText(temple.name, temple.x, temple.y - iconSize - 5);
            ctx.shadowColor = "transparent";
          }
        }
      });
    }

    // Отрисовка музеев
    if (mode === "museum" && museumPoints && museumPoints.length > 0) {
      const iconSize = 45;
      const icon = museumIconsRef.current.default;
      museumPoints.forEach((museum) => {
        if (icon) {
          ctx.drawImage(
            icon,
            museum.x - iconSize / 2,
            museum.y - iconSize,
            iconSize,
            iconSize,
          );
          if (zoomRef.current > 1.5) {
            ctx.fillStyle = "white";
            ctx.font = "bold 12px 'Advent Pro', sans-serif";
            ctx.textAlign = "center";
            ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
            ctx.shadowBlur = 4;
            ctx.fillText(museum.name, museum.x, museum.y - iconSize - 5);
            ctx.shadowColor = "transparent";
          }
        }
      });
    }

    // Отрисовка искусства
    if (mode === "art" && artPoints && artPoints.length > 0) {
      const iconSize = 45;
      const icon = museumIconsRef.current.default;
      artPoints.forEach((art) => {
        if (icon) {
          ctx.drawImage(
            icon,
            art.x - iconSize / 2,
            art.y - iconSize,
            iconSize,
            iconSize,
          );
          if (zoomRef.current > 1.5) {
            ctx.fillStyle = "white";
            ctx.font = "bold 12px 'Advent Pro', sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(art.name, art.x, art.y - iconSize - 5);
          }
        }
      });
    }

    // Отрисовка истории
    if (mode === "history" && historyPoints && historyPoints.length > 0) {
      const iconSize = 45;
      const icon = museumIconsRef.current.default;
      historyPoints.forEach((history) => {
        if (icon) {
          ctx.drawImage(
            icon,
            history.x - iconSize / 2,
            history.y - iconSize,
            iconSize,
            iconSize,
          );
          if (zoomRef.current > 1.5) {
            ctx.fillStyle = "white";
            ctx.font = "bold 12px 'Advent Pro', sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(history.name, history.x, history.y - iconSize - 5);
          }
        }
      });
    }

    // Отрисовка семейных мест
    if (mode === "family" && familyPoints && familyPoints.length > 0) {
      const iconSize = 45;
      const icon = museumIconsRef.current.default;
      familyPoints.forEach((family) => {
        if (icon) {
          ctx.drawImage(
            icon,
            family.x - iconSize / 2,
            family.y - iconSize,
            iconSize,
            iconSize,
          );
          if (zoomRef.current > 1.5) {
            ctx.fillStyle = "white";
            ctx.font = "bold 12px 'Advent Pro', sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(family.name, family.x, family.y - iconSize - 5);
          }
        }
      });
    }

    // Отрисовка калибровочной точки (если включено)
    if (CALIBRATION_MODE && CALIBRATION_POINT.showOnMap && affineRef.current) {
      const calibPixel = gpsToPixel(
        CALIBRATION_POINT.realGPS.lat,
        CALIBRATION_POINT.realGPS.lon,
      );
      if (calibPixel) {
        // Рисуем крест
        ctx.strokeStyle = "#00FF00";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(calibPixel.x - 15, calibPixel.y);
        ctx.lineTo(calibPixel.x + 15, calibPixel.y);
        ctx.moveTo(calibPixel.x, calibPixel.y - 15);
        ctx.lineTo(calibPixel.x, calibPixel.y + 15);
        ctx.stroke();

        // Рисуем круг
        ctx.beginPath();
        ctx.arc(calibPixel.x, calibPixel.y, 12, 0, Math.PI * 2);
        ctx.stroke();

        // Подпись
        ctx.fillStyle = "#00FF00";
        ctx.font = "bold 14px 'Advent Pro', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("КАЛИБРОВКА", calibPixel.x, calibPixel.y - 18);

        // Ожидаемая позиция (крестик)
        ctx.strokeStyle = "#FF00FF";
        ctx.beginPath();
        ctx.moveTo(
          CALIBRATION_POINT.expectedPixel.x - 10,
          CALIBRATION_POINT.expectedPixel.y,
        );
        ctx.lineTo(
          CALIBRATION_POINT.expectedPixel.x + 10,
          CALIBRATION_POINT.expectedPixel.y,
        );
        ctx.moveTo(
          CALIBRATION_POINT.expectedPixel.x,
          CALIBRATION_POINT.expectedPixel.y - 10,
        );
        ctx.lineTo(
          CALIBRATION_POINT.expectedPixel.x,
          CALIBRATION_POINT.expectedPixel.y + 10,
        );
        ctx.stroke();

        ctx.fillStyle = "#FF00FF";
        ctx.fillText(
          "ДОЛЖНО БЫТЬ ЗДЕСЬ",
          CALIBRATION_POINT.expectedPixel.x,
          CALIBRATION_POINT.expectedPixel.y - 12,
        );
      }
    }

    // Отрисовка пользователя
    if (userGPS) {
      const up = gpsToPixel(userGPS.lat, userGPS.lon);
      if (up) {
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(up.x, up.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(up.x, up.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(255,0,0,0.3)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(up.x, up.y, 16, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    ctx.restore();
  }, [
    pageMode,
    gpsToPixel,
    userGPS,
    routeNodes,
    mode,
    restaurants,
    getQuestPointIcon,
  ]);

  // ========== ЗАГРУЗКА ИЗОБРАЖЕНИЙ (с кэшем) ==========
  useEffect(() => {
    let isMounted = true;
    let loadedCount = 0;
    const totalImages = 1 + (restaurants?.length || 0) + 5;

    const updateProgress = () => {
      loadedCount++;
      if (isMounted) {
        setLoadingProgress(Math.floor((loadedCount / totalImages) * 100));
      }
    };

    loadImageWithCache(mapImage).then((img) => {
      if (!isMounted || !img) return;
      imgRef.current = img;

      const bgCanvas = document.createElement("canvas");
      bgCanvas.width = img.width;
      bgCanvas.height = img.height;
      const bgCtx = bgCanvas.getContext("2d");
      bgCtx.drawImage(img, 0, 0);
      bgCanvasRef.current = bgCanvas;

      computeAffineFromNodes();
      setInitialized(true);
      setTimeout(() => setIsLoading(false), 200);

      loadImageWithCache(templeIcon).then((img) => {
        if (img && isMounted) templeIconsRef.current.default = img;
      });

      loadImageWithCache(museumIcon).then((img) => {
        if (img && isMounted) {
          museumIconsRef.current.default = img;
          artIconsRef.current.default = img;
          historyIconsRef.current.default = img;
          familyIconsRef.current.default = img;
        }
      });

      if (restaurants && restaurants.length > 0) {
        restaurants.forEach((restaurant) => {
          if (restaurant.logo) {
            loadImageWithCache(restaurant.logo).then((img) => {
              if (img && isMounted)
                restaurantIconsRef.current[restaurant.id] = img;
            });
          } else {
            updateProgress();
          }
        });
      }
    });

    return () => {
      isMounted = false;
    };
  }, [computeAffineFromNodes, restaurants, loadImageWithCache]);

  // --- Загрузка иконок зайцев (с кэшем) ---
  useEffect(() => {
    if (!initialized) return;

    const rabbitImages = [
      { key: "rabbitIcon", src: rabbitIcon },
      { key: "rabbitOne", src: rabbitOne },
      { key: "rabbitTwo", src: rabbitTwo },
      { key: "rabbitThree", src: rabbitThree },
      { key: "rabbitFour", src: rabbitFour },
      { key: "rabbitFive", src: rabbitFive },
      { key: "rabbitSix", src: rabbitSix },
      { key: "rabbitSeven", src: rabbitSeven },
      { key: "rabbitEight", src: rabbitEight },
      { key: "rabbitNine", src: rabbitNine },
      { key: "rabbitTen", src: rabbitTen },
      { key: "rabbitEleven", src: rabbitEleven },
      { key: "rabbitTwelve", src: rabbitTwelve },
      { key: "rabbitThirteen", src: rabbitThirteen },
      { key: "rabbitFourteen", src: rabbitFourteen },
    ];

    rabbitImages.forEach(({ key, src }) => {
      loadImageWithCache(src).then((img) => {
        if (img) rabbitIconsRef.current[key] = img;
      });
    });
  }, [initialized, loadImageWithCache]);

  // --- main render ---
  useEffect(() => {
    if (!initialized || canvasSize.width === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(canvasSize.width * ratio);
    canvas.height = Math.round(canvasSize.height * ratio);
    canvas.style.width = `${canvasSize.width}px`;
    canvas.style.height = `${canvasSize.height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    if (zoomRef.current === 1 && imgRef.current) {
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
    let frameCount = 0;

    const lerp = (start, end, factor) => start + (end - start) * factor;
    const render = () => {
      frameCount++;
      if (frameCount < 3) {
        rafId = requestAnimationFrame(render);
        return;
      }

      zoomRef.current = lerp(zoomRef.current, targetZoomRef.current, 0.2);
      offsetRef.current.x = lerp(
        offsetRef.current.x,
        targetOffsetRef.current.x,
        0.2,
      );
      offsetRef.current.y = lerp(
        offsetRef.current.y,
        targetOffsetRef.current.y,
        0.2,
      );

      if (canvasRef.current && bgCanvasRef.current && imgRef.current) {
        drawMap();
      }

      rafId = requestAnimationFrame(render);
    };

    render();
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [initialized, canvasSize, drawMap]);

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

  // --- обработка кликов ---
  const handleCanvasClick = (e) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const mapX = (clickX - offsetRef.current.x) / zoomRef.current;
    const mapY = (clickY - offsetRef.current.y) / zoomRef.current;
    const hitRadius = 20 / Math.max(0.5, zoomRef.current);

    if (mode === "gastro" && restaurants.length) {
      let closestRestaurant = null;
      let closestDistance = Infinity;
      restaurants.forEach((restaurant) => {
        const dx = mapX - restaurant.location.x;
        const dy = mapY - restaurant.location.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < hitRadius && distance < closestDistance) {
          closestDistance = distance;
          closestRestaurant = restaurant;
        }
      });
      if (closestRestaurant) {
        onMarkerClick(closestRestaurant.id);
        return;
      }
    }

    if (mode === "temple" && templePoints.length) {
      let closestTemple = null;
      let closestDistance = Infinity;
      templePoints.forEach((temple) => {
        const dx = mapX - temple.x;
        const dy = mapY - temple.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < hitRadius && distance < closestDistance) {
          closestDistance = distance;
          closestTemple = temple;
        }
      });
      if (closestTemple) {
        centerOnPixel({ x: closestTemple.x, y: closestTemple.y }, 2.0);
        setTimeout(() => buildRouteToTemple(closestTemple.id), 100);
      }
    }

    if (mode === "museum" && museumPoints && museumPoints.length) {
      let closestMuseum = null;
      let closestDistance = Infinity;
      museumPoints.forEach((museum) => {
        const dx = mapX - museum.x;
        const dy = mapY - museum.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < hitRadius && distance < closestDistance) {
          closestDistance = distance;
          closestMuseum = museum;
        }
      });
      if (closestMuseum) {
        centerOnPixel({ x: closestMuseum.x, y: closestMuseum.y }, 2.0);
        setTimeout(() => buildRouteToMuseum(closestMuseum.id), 100);
      }
    }

    if (mode === "art" && artPoints && artPoints.length) {
      let closestArt = null;
      let closestDistance = Infinity;
      artPoints.forEach((art) => {
        const dx = mapX - art.x;
        const dy = mapY - art.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < hitRadius && distance < closestDistance) {
          closestDistance = distance;
          closestArt = art;
        }
      });
      if (closestArt) {
        centerOnPixel({ x: closestArt.x, y: closestArt.y }, 2.0);
        setTimeout(() => buildRouteToArt(closestArt.id), 100);
      }
    }

    if (mode === "history" && historyPoints && historyPoints.length) {
      let closestHistory = null;
      let closestDistance = Infinity;
      historyPoints.forEach((history) => {
        const dx = mapX - history.x;
        const dy = mapY - history.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < hitRadius && distance < closestDistance) {
          closestDistance = distance;
          closestHistory = history;
        }
      });
      if (closestHistory) {
        centerOnPixel({ x: closestHistory.x, y: closestHistory.y }, 2.0);
        setTimeout(() => buildRouteToHistory(closestHistory.id), 100);
      }
    }

    if (mode === "family" && familyPoints && familyPoints.length) {
      let closestFamily = null;
      let closestDistance = Infinity;
      familyPoints.forEach((family) => {
        const dx = mapX - family.x;
        const dy = mapY - family.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < hitRadius && distance < closestDistance) {
          closestDistance = distance;
          closestFamily = family;
        }
      });
      if (closestFamily) {
        centerOnPixel({ x: closestFamily.x, y: closestFamily.y }, 2.0);
        setTimeout(() => buildRouteToFamily(closestFamily.id), 100);
      }
    }
  };

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

  // Эффект для автоматического показа прогресса
  useEffect(() => {
    if (mode && mode.startsWith("step") && mode !== "step2") {
      const timer = setTimeout(() => setShowProgressModal(true), 800);
      return () => clearTimeout(timer);
    }
  }, [mode]);

  const handleCloseProgressModal = useCallback(() => {
    progressModalJustClosed.current = true;
    setShowProgressModal(false);
    setTimeout(() => {
      progressModalJustClosed.current = false;
    }, 500);
  }, []);

  useImperativeHandle(ref, () => ({
    startQuest: (newMode) => {
      setCurrentMapMode(newMode);
      setPageMode("quest");
      if (newMode !== currentMapMode) {
        setIsModeChanging(true);
        setIsLoading(true);
      }
      setRouteNodes(null);
      lastRouteNodeRef.current = null;
      lastRebuildTimeRef.current = 0;

      switch (newMode) {
        case "step2": {
          if (userGPS) {
            rebuildRouteFromUser();
            const px = gpsToPixel(userGPS.lat, userGPS.lon);
            if (px) {
              centerOnPixel(px, 2.2);
              setFollowUser(true);
            }
          }
          break;
        }
        case "step4": {
          buildRouteBetweenPoints(1, 2);
          centerOnQuestPoints(1, 2, 1.8);
          break;
        }
        case "step6": {
          buildRouteBetweenPoints(2, 3);
          centerOnQuestPoints(2, 3, 1.8);
          break;
        }
        case "step8": {
          buildRouteBetweenPoints(3, 4);
          centerOnQuestPoints(3, 4, 1.8);
          break;
        }
        case "step10": {
          buildRouteBetweenPoints(4, 5);
          centerOnQuestPoints(4, 5, 1.8);
          break;
        }
        case "step12": {
          buildRouteBetweenPoints(5, 6);
          centerOnQuestPoints(5, 6, 1.8);
          break;
        }
        case "step14": {
          buildRouteBetweenPoints(6, 7);
          centerOnQuestPoints(6, 7, 1.8);
          break;
        }
        case "step16": {
          buildRouteBetweenPoints(7, 8);
          centerOnQuestPoints(7, 8, 1.8);
          break;
        }
        case "step18": {
          buildRouteBetweenPoints(8, 9);
          centerOnQuestPoints(8, 9, 1.8);
          break;
        }
        case "step20": {
          buildRouteBetweenPoints(9, 10);
          centerOnQuestPoints(9, 10, 1.8);
          break;
        }
        case "step22": {
          buildRouteBetweenPoints(10, 11);
          centerOnQuestPoints(10, 11, 1.8);
          break;
        }
        case "step24": {
          buildRouteBetweenPoints(11, 12);
          centerOnQuestPoints(11, 12, 1.8);
          break;
        }
        case "step26": {
          buildRouteBetweenPoints(12, 13);
          centerOnQuestPoints(12, 13, 1.8);
          break;
        }
        case "step28": {
          buildRouteBetweenPoints(13, 14);
          centerOnQuestPoints(13, 14, 1.8);
          break;
        }
        case "step30": {
          setRouteNodes([]);
          const lastPoint = questPoints.find((qp) => qp.order === 14);
          if (lastPoint) centerOnPixel({ x: lastPoint.x, y: lastPoint.y }, 2.0);
          break;
        }
        default: {
          console.warn(`Режим ${newMode} не обработан`);
          break;
        }
      }
      setTimeout(() => {
        setIsLoading(false);
        setIsModeChanging(false);
      }, 400);
    },
    buildRouteToStart: () => {
      handleBuildRoute();
    },
    howProgress: () => {
      setShowProgressModal(true);
    },
    buildRouteFromStartToSecondPoint: () => buildRouteBetweenPoints(1, 2),
    buildRouteFromSecondToThirdPoint: () => buildRouteBetweenPoints(2, 3),
    buildRouteFromThirdToFourthPoint: () => buildRouteBetweenPoints(3, 4),
    buildRouteFromFourthToFifthPoint: () => buildRouteBetweenPoints(4, 5),
    buildRouteFromFifthToSixthPoint: () => buildRouteBetweenPoints(5, 6),
    buildRouteFromSixthToSeventhPoint: () => buildRouteBetweenPoints(6, 7),
    buildRouteFromSeventhToEighthPoint: () => buildRouteBetweenPoints(7, 8),
    buildRouteFromEighthToNinthPoint: () => buildRouteBetweenPoints(8, 9),
    buildRouteFromNinthToTenthPoint: () => buildRouteBetweenPoints(9, 10),
    buildRouteFromTenthToEleventhPoint: () => buildRouteBetweenPoints(10, 11),
    buildRouteFromEleventhToTwelfthPoint: () => buildRouteBetweenPoints(11, 12),
    buildRouteFromTwelfthToThirteenthPoint: () =>
      buildRouteBetweenPoints(12, 13),
    buildRouteFromThirteenthToFourteenthPoint: () =>
      buildRouteBetweenPoints(13, 14),
    buildRouteToTemple: (templeId) => {
      buildRouteToTemple(templeId);
    },
    centerOnTemple: (templeId) => {
      const temple = templePoints.find((t) => t.id === templeId);
      if (temple) centerOnPixel({ x: temple.x, y: temple.y }, 2.0);
    },
    buildRouteToMuseum: (museumId) => {
      buildRouteToMuseum(museumId);
    },
    centerOnMuseum: (museumId) => {
      const museum = museumPoints.find((m) => m.id === museumId);
      if (museum) centerOnPixel({ x: museum.x, y: museum.y }, 2.0);
    },
    buildRouteToArt: (artId) => {
      buildRouteToArt(artId);
    },
    centerOnArt: (artId) => {
      const art = artPoints.find((a) => a.id === artId);
      if (art) centerOnPixel({ x: art.x, y: art.y }, 2.0);
    },
    buildRouteToHistory: (historyId) => {
      buildRouteToHistory(historyId);
    },
    centerOnHistory: (historyId) => {
      const history = historyPoints.find((h) => h.id === historyId);
      if (history) centerOnPixel({ x: history.x, y: history.y }, 2.0);
    },
    buildRouteToFamily: (familyId) => {
      buildRouteToFamily(familyId);
    },
    centerOnFamily: (familyId) => {
      const family = familyPoints.find((f) => f.id === familyId);
      if (family) centerOnPixel({ x: family.x, y: family.y }, 2.0);
    },
    redraw: () => {
      drawMap();
    },
  }));

  const handleBuildRoute = useCallback(() => {
    if (pageMode !== "quest") return;
    rebuildRouteFromUser();
    if (!userGPS) return;
    const px = gpsToPixel(userGPS.lat, userGPS.lon);
    if (!px) return;
    setFollowUser(true);
    centerOnPixel(px, 2.2);
  }, [pageMode, rebuildRouteFromUser, userGPS, gpsToPixel, centerOnPixel]);

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
    const userPx = gpsToPixel(userGPS.lat, userGPS.lon);
    if (!userPx) return;
    if (mode === "step2") {
      const startQP = questPoints[0];
      const dx = userPx.x - startQP.x;
      const dy = userPx.y - startQP.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 25) onQuestPointReached?.(2);
    }
  }, [userGPS, gpsToPixel, onQuestPointReached, mode]);

  const centerOnQuestPoints = useCallback(
    (startOrder, targetOrder, zoom = 1.8) => {
      const startQP = questPoints.find((qp) => qp.order === startOrder);
      const targetQP = questPoints.find((qp) => qp.order === targetOrder);
      if (startQP && targetQP) {
        const centerX = (startQP.x + targetQP.x) / 2;
        const centerY = (startQP.y + targetQP.y) / 2;
        centerOnPixel({ x: centerX, y: centerY }, zoom);
      }
    },
    [centerOnPixel],
  );

  const getStepNumberFromMode = (mode) => {
    const stepMap = {
      step2: 2,
      step4: 4,
      step6: 6,
      step8: 8,
      step10: 10,
      step12: 12,
      step14: 14,
      step16: 16,
      step18: 18,
      step20: 20,
      step22: 22,
      step24: 24,
      step26: 26,
      step28: 28,
      step30: 30,
    };
    return stepMap[mode] || 0;
  };

  return (
    <div
      ref={containerRef}
      className={`map-container ${className} ${mode === "quest" ? "map-container-quest" : ""} ${draggingRef.current ? "dragging" : ""}`}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
    >
      <canvas
        ref={canvasRef}
        className="map-canvas"
        onClick={handleCanvasClick}
        style={{
          opacity: isLoading ? 0.5 : 1,
          transition: "opacity 0.3s ease",
        }}
      />

      {isLoading && (
        <div className="map-loading-overlay">
          <div className="map-loading-spinner"></div>
          <div className="map-loading-text">
            {loadingProgress > 0
              ? `Загружаем карту... ${loadingProgress}%`
              : "Загружаем карту..."}
          </div>
        </div>
      )}

      <ProgressModal
        isOpen={showProgressModal}
        onClose={handleCloseProgressModal}
        currentStep={getStepNumberFromMode(mode)}
      />

      {mode && mode.startsWith("step") && !isLoading && !isModeChanging && (
        <>
          <button
            className="map-follow-btn"
            onClick={() => {
              if (!routeNodes || routeNodes.length === 0 || !userGPS) return;
              if (followMode === "user") {
                const lastNodeId = routeNodes[routeNodes.length - 1].id;
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

          {mode !== "step2" && (
            <div className="map-continue-container">
              <button
                className="map-continue-button"
                onClick={() => {
                  const stepMap = {
                    step4: 4,
                    step6: 6,
                    step8: 8,
                    step10: 10,
                    step12: 12,
                    step14: 14,
                    step16: 16,
                    step18: 18,
                    step20: 20,
                    step22: 22,
                    step24: 24,
                    step26: 26,
                    step28: 28,
                    step30: 30,
                  };
                  const stepNumber = stepMap[mode];
                  if (stepNumber) onQuestPointReached?.(stepNumber);
                }}
              >
                Продолжить
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
});
