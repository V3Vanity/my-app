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
import ProgressModal from "./ProgressModal.jsx";

import { nodes, questPoints, edges, gpsMap, templePoints } from "./mapData.js";
const DEBUG_USER = true;
const debugUserGPS = { lat: 57.7723, lon: 40.9349 };

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

  const [routeNodes, setRouteNodes] = useState(null);
  const [currentMapMode, setCurrentMapMode] = useState(null);

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
      },
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
      timeoutId = setTimeout(updateSize, 100);
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
  }, [solveLinearSystem]);

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

    // Базовое расстояние
    let distance = Math.sqrt(dx * dx + dy * dy);

    // Приоритетные группы узлов
    const priorityNodes = [
      // Все узлы, начинающиеся с Q, W, D, Y
      ...nodes.filter((n) => n.id.startsWith("Q")).map((n) => n.id),
      ...nodes.filter((n) => n.id.startsWith("W")).map((n) => n.id),
      ...nodes.filter((n) => n.id.startsWith("D")).map((n) => n.id),
      ...nodes.filter((n) => n.id.startsWith("Y")).map((n) => n.id),
      ...nodes.filter((n) => n.id.startsWith("U")).map((n) => n.id),
    ];

    // Узлы, которые хотим избегать (можно добавить позже)
    const avoidNodes = [
      "M1",
      "Q1",
      "Q2",
      "P1",
      "R1",
      "U1", // обходные узлы
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
      "Z13", // окраины
    ];

    // Проверяем принадлежность узлов к приоритетным группам
    const isNode1Priority = priorityNodes.includes(node1Id);
    const isNode2Priority = priorityNodes.includes(node2Id);
    const isNode1Avoid = avoidNodes.includes(node1Id);
    const isNode2Avoid = avoidNodes.includes(node2Id);

    // Приоритетные пути (оба узла из Q, W, D, Y)
    if (isNode1Priority && isNode2Priority) {
      // Уменьшаем вес на 70% - делаем очень привлекательными
      distance = distance * 0.3;
      console.log(
        `Priority path: ${node1Id} → ${node2Id} = ${distance.toFixed(2)}`,
      );
    }
    // Пути, ведущие к приоритетным узлам
    else if (isNode1Priority || isNode2Priority) {
      // Умеренное уменьшение веса на 40%
      distance = distance * 0.6;
    }

    // Штрафы для нежелательных узлов
    if (isNode1Avoid && isNode2Avoid) {
      // Оба узла нежелательные - большой штраф
      distance = distance * 3;
    } else if (isNode1Avoid || isNode2Avoid) {
      // Один узел нежелательный - средний штраф
      distance = distance * 1.8;
    }

    // Дополнительный бонус для связок внутри одной группы
    const sameGroup =
      (node1Id.startsWith("Q") && node2Id.startsWith("Q")) ||
      (node1Id.startsWith("W") && node2Id.startsWith("W")) ||
      (node1Id.startsWith("D") && node2Id.startsWith("D")) ||
      (node1Id.startsWith("Y") && node2Id.startsWith("Y"));

    if (sameGroup) {
      // Дополнительный бонус за перемещение внутри одной группы
      distance = distance * 0.8;
    }

    return distance;
  }, []);

  // --- построение маршрута по графу с весами (Дейкстра) ---
  const buildRouteDijkstra = useCallback(
    (startId, endId) => {
      console.log(`Building weighted route from ${startId} to ${endId}`);

      // Создаем граф с весами
      const graph = {};

      // Для каждого ребра добавляем вес = расстояние между узлами
      edges.forEach(({ from, to }) => {
        const distance = calculateDistance(from, to);

        if (!graph[from]) graph[from] = [];
        if (!graph[to]) graph[to] = [];

        graph[from].push({ node: to, weight: distance });
        graph[to].push({ node: from, weight: distance });
      });

      // Дейкстра
      const distances = {};
      const previous = {};
      const unvisited = new Set();

      // Инициализация
      nodes.forEach((node) => {
        distances[node.id] = Infinity;
        previous[node.id] = null;
        unvisited.add(node.id);
      });

      distances[startId] = 0;

      while (unvisited.size > 0) {
        // Находим узел с минимальным расстоянием среди непосещённых
        let current = null;
        let minDistance = Infinity;

        for (const nodeId of unvisited) {
          if (distances[nodeId] < minDistance) {
            minDistance = distances[nodeId];
            current = nodeId;
          }
        }

        if (current === null || current === endId) break;
        if (distances[current] === Infinity) break; // Нет пути

        unvisited.delete(current);

        // Обновляем расстояния до соседей
        for (const neighbor of graph[current] || []) {
          if (!unvisited.has(neighbor.node)) continue;

          const newDistance = distances[current] + neighbor.weight;
          if (newDistance < distances[neighbor.node]) {
            distances[neighbor.node] = newDistance;
            previous[neighbor.node] = current;
          }
        }
      }

      // Восстанавливаем путь
      if (distances[endId] === Infinity) {
        console.warn("No path found");
        return null;
      }

      const path = [];
      let cur = endId;
      while (cur) {
        path.unshift(cur);
        cur = previous[cur];
      }

      console.log("Path found with total distance:", distances[endId]);
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

  // --- построение маршрута к храму (используем Дейкстру) ---
  const buildRouteToTemple = useCallback(
    (templeId) => {
      console.log("buildRouteToTemple called with:", templeId);

      const temple = templePoints.find((t) => t.id === templeId);
      if (!temple) {
        console.warn("Temple not found:", templeId);
        return;
      }

      if (!userGPS) {
        console.warn("User GPS not available");
        return;
      }

      const userPx = gpsToPixel(userGPS.lat, userGPS.lon);
      if (!userPx) {
        console.warn("Could not convert user GPS to pixel");
        return;
      }

      const nearestNodeToUser = findNearestNode(userPx);
      const nearestNodeToTemple = findNearestNode({ x: temple.x, y: temple.y });

      if (!nearestNodeToUser || !nearestNodeToTemple) {
        console.warn("Could not find nearest nodes");
        return;
      }

      // Используем Дейкстру вместо BFS
      const path = buildRouteDijkstra(
        nearestNodeToUser.id,
        nearestNodeToTemple.id,
      );
      if (!path) {
        console.warn("Could not build route between nodes");
        return;
      }

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

      console.log("Final route:", route);
      setRouteNodes(route);
    },
    [userGPS, gpsToPixel, findNearestNode, buildRouteDijkstra],
  );

  // --- построение маршрута из GPS пользователя для квеста (используем Дейкстру) ---
  const rebuildRouteFromUser = useCallback(() => {
    if (mode !== "step2") {
      return;
    }

    if (!userGPS) return;

    const userPx = gpsToPixel(userGPS.lat, userGPS.lon);
    if (!userPx || !imgRef.current) return;

    const startQP = questPoints.find((qp) => qp.order === 1);
    if (!startQP) return;

    let nearestNode = findNearestNode(userPx);
    // Используем Дейкстру вместо BFS
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
            ? {
                id: node.id,
                x: node.x,
                y: node.y - iconCenterOffset,
              }
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
    buildRouteDijkstra,
    onQuestPointReached,
    mode,
  ]);

  // --- Обновление маршрута при движении пользователя ---
  useEffect(() => {
    if (mode !== "step2") return;
    if (currentMapMode && currentMapMode !== "step2") return;
    if (!userGPS) return;

    const now = Date.now();
    if (now - lastRebuildTimeRef.current < 3000) return;

    const userPx = gpsToPixel(userGPS.lat, userGPS.lon);
    if (!userPx) return;

    const nearestNode = findNearestNode(userPx);
    if (!nearestNode) return;

    rebuildRouteFromUser();

    const startQP = questPoints[0];
    const dx = userPx.x - startQP.x;
    const dy = userPx.y - startQP.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const REACH_RADIUS = 25;
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
    currentMapMode,
  ]);

  // Объединенная функция построения маршрутов для квеста (используем Дейкстру)
  const buildRouteBetweenPoints = useCallback(
    (startOrder, targetOrder) => {
      const startQP = questPoints.find((qp) => qp.order === startOrder);
      const targetQP = questPoints.find((qp) => qp.order === targetOrder);

      if (!startQP || !targetQP) {
        return;
      }

      const nearestNodeToStart = findNearestNode({
        x: startQP.x,
        y: startQP.y,
      });
      const nearestNodeToTarget = findNearestNode({
        x: targetQP.x,
        y: targetQP.y,
      });

      if (!nearestNodeToStart || !nearestNodeToTarget) {
        return;
      }

      // Используем Дейкстру вместо BFS
      const path = buildRouteDijkstra(
        nearestNodeToStart.id,
        nearestNodeToTarget.id,
      );

      if (!path) {
        return;
      }

      const iconSize = 40;
      const iconCenterOffset = iconSize / 2;

      const route = path
        .map((id) => {
          const node = nodes.find((n) => n.id === id);
          return node
            ? {
                id: node.id,
                x: node.x,
                y: node.y - iconCenterOffset,
              }
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

  // --- Обработка изменения режима из пропсов ---
  useEffect(() => {
    if (!initialized || !affineRef.current) return;
    if (!mode) return;

    if (progressModalJustClosed.current) {
      progressModalJustClosed.current = false;
      return;
    }

    console.log(`Mode changed via props: ${mode}`);

    if (mode !== currentMapMode) {
      setIsModeChanging(true);
      setIsLoading(true);
    }

    if (mode === "step2" && userGPS) {
      rebuildRouteFromUser();
    }

    const timer = setTimeout(() => {
      setIsLoading(false);
      setIsModeChanging(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [mode, initialized, userGPS, rebuildRouteFromUser, currentMapMode]);

  // --- Эффект для центрирования на выбранном храме ---
  useEffect(() => {
    if (mode === "temple" && selectedTemple && initialized) {
      const temple = templePoints.find((t) => t.id === selectedTemple.mapId);
      if (temple) {
        centerOnPixel({ x: temple.x, y: temple.y }, 2.0);
        setTimeout(() => {
          buildRouteToTemple(selectedTemple.mapId);
        }, 100);
      }
    }
  }, [mode, selectedTemple, initialized, centerOnPixel, buildRouteToTemple]);

  // ========== ФУНКЦИЯ ВЫБОРА ИКОНКИ ЗАЙЦА ==========
  const getQuestPointIcon = useCallback(
    (order) => {
      if (mode === "step2") {
        return rabbitIconsRef.current["rabbitIcon"] || null;
      }

      const stepMap = {
        step4: { target: 2, icons: ["rabbitOne", "rabbitIcon"] },
        step6: { target: 3, icons: ["rabbitOne", "rabbitTwo", "rabbitIcon"] },
        step8: {
          target: 4,
          icons: ["rabbitOne", "rabbitTwo", "rabbitThree", "rabbitIcon"],
        },
        step10: {
          target: 5,
          icons: [
            "rabbitOne",
            "rabbitTwo",
            "rabbitThree",
            "rabbitFour",
            "rabbitIcon",
          ],
        },
        step12: {
          target: 6,
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
          target: 7,
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
          target: 8,
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
          target: 9,
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
          target: 10,
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
          target: 11,
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
          target: 12,
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
          target: 13,
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
          target: 14,
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
          target: 14,
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

    if (!canvas || !bgCanvas || !imgRef.current) {
      return;
    }

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

    // --- ОТЛАДКА: отрисовка всех узлов графа (временная) ---
    const SHOW_DEBUG_NODES = true; // false / true
    if (SHOW_DEBUG_NODES) {
      nodes.forEach((node) => {
        // Рисуем точку узла
        ctx.fillStyle = "#00FF00";
        ctx.beginPath();
        ctx.arc(node.x, node.y, 5, 0, Math.PI * 2);
        ctx.fill();

        // Добавляем ID узла для идентификации
        ctx.fillStyle = "black";
        ctx.font = "bold 10px 'Advent Pro', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(node.id, node.x, node.y - 10);

        // Рисуем координаты для особо важных узлов
        if (
          node.id === "START" ||
          node.id === "L" ||
          node.id === "D4" ||
          node.id === "U1"
        ) {
          ctx.fillStyle = "blue";
          ctx.font = "8px 'Advent Pro', sans-serif";
          ctx.fillText(`(${node.x},${node.y})`, node.x, node.y - 20);
        }
      });
    }

    // --- ОТЛАДКА: отрисовка всех соединений (рёбер графа) ---
    if (SHOW_DEBUG_NODES) {
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

    // --- draw route on top ---
    if (routeNodes && routeNodes.length > 1) {
      if (mode === "temple") {
        ctx.strokeStyle = "#FFD700";
        ctx.lineWidth = 4;
      } else {
        ctx.strokeStyle = "#ffffffaa";
        ctx.lineWidth = 2;
      }

      ctx.beginPath();

      routeNodes.forEach((n, i) => {
        if (!n) return;

        // Используем координаты из routeNodes
        let x = n.x;
        let y = n.y;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();

      // --- ОТЛАДКА: показываем точки маршрута ---
      if (SHOW_DEBUG_NODES) {
        routeNodes.forEach((n, i) => {
          if (!n) return;
          ctx.fillStyle = i === 0 ? "#FF0000" : "#FF00FF";
          ctx.beginPath();
          ctx.arc(n.x, n.y, 4, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    }

    // --- Отрисовка квестовых точек ---
    if (
      pageMode === "quest" &&
      rabbitIconsRef.current["rabbitIcon"] &&
      rabbitIconsRef.current["rabbitOne"]
    ) {
      const iconSize = 40;

      let pointsToDraw = questPoints;

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
      if (maxOrder > 0) {
        pointsToDraw = questPoints.filter((qp) => qp.order <= maxOrder);
      }

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

        // --- ОТЛАДКА: показываем центр иконки и порядок ---
        if (SHOW_DEBUG_NODES) {
          ctx.fillStyle = "yellow";
          ctx.beginPath();
          ctx.arc(qp.x, qp.y - iconSize / 2, 3, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "black";
          ctx.font = "bold 12px 'Advent Pro', sans-serif";
          ctx.fillText(`#${qp.order}`, qp.x + 20, qp.y - iconSize);
        }
      });
    }

    // --- Отрисовка ресторанов ---
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

        // --- ОТЛАДКА: показываем координаты ресторанов ---
        if (SHOW_DEBUG_NODES) {
          ctx.fillStyle = "orange";
          ctx.beginPath();
          ctx.arc(
            restaurant.location.x,
            restaurant.location.y,
            3,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }
      });
    }

    // --- ОТРИСОВКА ХРАМОВ ---
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

          // --- ОТЛАДКА: показываем центр иконки храма и attachTo ---
          if (SHOW_DEBUG_NODES) {
            ctx.fillStyle = "purple";
            ctx.beginPath();
            ctx.arc(temple.x, temple.y - iconSize / 2, 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "white";
            ctx.font = "10px 'Advent Pro', sans-serif";
            ctx.fillText(
              `attached to: ${temple.attachTo}`,
              temple.x,
              temple.y - iconSize - 20,
            );
          }
        } else {
          ctx.fillStyle = "#FFD700";
          ctx.beginPath();
          ctx.arc(temple.x, temple.y - iconSize / 2, 8, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }

    // --- Отрисовка пользователя ---
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

        // --- ОТЛАДКА: показываем координаты пользователя ---
        if (SHOW_DEBUG_NODES) {
          ctx.fillStyle = "white";
          ctx.font = "10px 'Advent Pro', sans-serif";
          ctx.fillText(
            `GPS: ${userGPS.lat.toFixed(4)}, ${userGPS.lon.toFixed(4)}`,
            up.x,
            up.y - 20,
          );
        }
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

  // ========== ЗАГРУЗКА ИЗОБРАЖЕНИЙ ==========
  useEffect(() => {
    let isMounted = true;
    let loadedCount = 0;
    const totalImages = 1 + (restaurants?.length || 0) + 1;

    const updateProgress = () => {
      loadedCount++;
      if (isMounted) {
        setLoadingProgress(Math.floor((loadedCount / totalImages) * 100));
      }
    };

    const loadImage = (src) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          updateProgress();
          resolve(img);
        };
        img.onerror = () => {
          updateProgress();
          resolve(null);
        };
        if ("decode" in img) {
          img
            .decode()
            .then(() => resolve(img))
            .catch(() => resolve(img));
        }
      });
    };

    loadImage(mapImage).then((img) => {
      if (!isMounted) return;
      imgRef.current = img;

      const bgCanvas = document.createElement("canvas");
      bgCanvas.width = img.width;
      bgCanvas.height = img.height;
      const bgCtx = bgCanvas.getContext("2d");
      bgCtx.drawImage(img, 0, 0);
      bgCanvasRef.current = bgCanvas;

      computeAffineFromNodes();

      setInitialized(true);
      setTimeout(() => {
        setIsLoading(false);
      }, 200);

      loadImage(templeIcon).then((img) => {
        if (img && isMounted) {
          templeIconsRef.current.default = img;
        }
      });

      if (restaurants && restaurants.length > 0) {
        Promise.all(
          restaurants.map((restaurant) => {
            if (restaurant.logo) {
              return loadImage(restaurant.logo).then((img) => {
                if (img && isMounted) {
                  restaurantIconsRef.current[restaurant.id] = img;
                }
              });
            }
            updateProgress();
            return Promise.resolve();
          }),
        );
      }
    });

    return () => {
      isMounted = false;
    };
  }, [computeAffineFromNodes, restaurants]);

  // --- Загрузка иконок зайцев ---
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

    const loadRabbitIcons = async () => {
      for (const { key, src } of rabbitImages) {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          rabbitIconsRef.current[key] = img;
        };
      }
    };

    loadRabbitIcons();
  }, [initialized]);

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
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
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
        console.log(`Clicked on temple: ${closestTemple.name}`);
        centerOnPixel({ x: closestTemple.x, y: closestTemple.y }, 2.0);
        setTimeout(() => {
          buildRouteToTemple(closestTemple.id);
        }, 100);
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
      const timer = setTimeout(() => {
        setShowProgressModal(true);
      }, 800);

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
          if (lastPoint) {
            centerOnPixel({ x: lastPoint.x, y: lastPoint.y }, 2.0);
          }
          break;
        }
        default:
          console.warn(`Режим ${newMode} не обработан`);
          break;
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
      if (temple) {
        centerOnPixel({ x: temple.x, y: temple.y }, 2.0);
      }
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
      const REACH_RADIUS = 25;

      if (dist < REACH_RADIUS) {
        onQuestPointReached?.(2);
      }
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
      className={`map-container ${className} ${
        mode === "quest" ? "map-container-quest" : ""
      } ${draggingRef.current ? "dragging" : ""}`}
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
