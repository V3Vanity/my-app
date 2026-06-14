import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useMemo,
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
const debugUserGPS = { lat: 57.771139, lon: 40.934234 };

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
  const lastGPSUpdateRef = useRef(0);
  const imagesLoadedRef = useRef(false);
  const restaurantsLoadedRef = useRef(false);
  const rabbitIconsLoadedRef = useRef(false);

  const [routeNodes, setRouteNodes] = useState(null);
  const [currentMapMode, setCurrentMapMode] = useState(null);

  const affineRef = useRef(null);

  const restaurantsKey = useMemo(
    () => JSON.stringify(restaurants?.map((r) => r.id) || []),
    [restaurants],
  );

  // --- Получение реального GPS пользователя ---
  useEffect(() => {
    if (DEBUG_USER) {
      setUserGPS(debugUserGPS);
      return;
    }

    if (!navigator.geolocation) return;

    const handleSuccess = (pos) => {
      const now = Date.now();
      if (now - lastGPSUpdateRef.current < 2000) return;
      lastGPSUpdateRef.current = now;

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

  const gpsToPixel = useCallback((lat, lon) => {
    if (!affineRef.current) return null;
    const [ax, bx, cx] = affineRef.current.ax;
    const [ay, by, cy] = affineRef.current.ay;
    return { x: ax * lon + bx * lat + cx, y: ay * lon + by * lat + cy };
  }, []);

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
      ...nodes.filter((n) => n.id.startsWith("E")).map((n) => n.id),
    ];

    const avoidNodes = [
      "M1",
      "Q1",
      "Q2",
      "P1",
      "R1",
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
      if (!temple) return;

      if (!userGPS) return;

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
      if (!museum) return;

      if (!userGPS) return;

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
      if (!art) return;

      if (!userGPS) return;

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
      if (!history) return;

      if (!userGPS) return;

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
      if (!family) return;

      if (!userGPS) return;

      const userPx = gpsToPixel(userGPS.lat, userGPS.lon);
      if (!userPx) return;

      const nearestNodeToUser = findNearestNode(userPx);
      const nearestNodeToFamily = findNearestNode({
        x: family.x,
        y: family.y,
      });

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

    let nearestNode = findNearestNode(userPx);
    if (!nearestNode) return;

    const path = buildRouteDijkstra(nearestNode.id, "START");
    if (!path) return;

    const routeWithUser = [
      { id: "USER", x: userPx.x, y: userPx.y },
      ...path
        .map((id) => {
          const node = nodes.find((n) => n.id === id);
          return node ? { id: node.id, x: node.x, y: node.y } : null;
        })
        .filter(Boolean),
    ];

    routeWithUser.push({
      id: "START",
      x: startQP.x,
      y: startQP.y,
    });

    setRouteNodes(routeWithUser);
    lastRouteNodeRef.current = nearestNode.id;
    lastRebuildTimeRef.current = Date.now();

    const dx = userPx.x - startQP.x;
    const dy = userPx.y - startQP.y;
    if (Math.sqrt(dx * dx + dy * dy) < 25) {
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

  // --- Обновление маршрута при движении пользователя ---
  useEffect(() => {
    if (mode !== "step2") return;
    if (currentMapMode && currentMapMode !== "step2") return;
    if (!userGPS) return;

    const now = Date.now();
    if (now - lastRebuildTimeRef.current < 5000) return;

    const userPx = gpsToPixel(userGPS.lat, userGPS.lon);
    if (!userPx) return;

    const nearestNode = findNearestNode(userPx);
    if (!nearestNode) return;

    if (nearestNode.id !== lastRouteNodeRef.current) {
      rebuildRouteFromUser();
    }

    const startQP = questPoints[0];
    if (!startQP) return;

    const dx = userPx.x - startQP.x;
    const dy = userPx.y - startQP.y;
    if (Math.sqrt(dx * dx + dy * dy) < 25) {
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

      const route = path
        .map((id) => {
          const node = nodes.find((n) => n.id === id);
          return node ? { id: node.id, x: node.x, y: node.y } : null;
        })
        .filter(Boolean);

      route.unshift({ id: startQP.id, x: startQP.x, y: startQP.y });
      route.push({ id: targetQP.id, x: targetQP.x, y: targetQP.y });

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

    if (mode !== currentMapMode) {
      setCurrentMapMode(mode);
      setPageMode(
        mode === "step2" || mode?.startsWith("step") ? "quest" : mode,
      );
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

  // --- Эффекты центрирования (только строим маршрут, без зума) ---
  useEffect(() => {
    if (mode !== "temple" || !selectedTemple || !initialized) return;
    const temple = templePoints.find((t) => t.id === selectedTemple.mapId);
    if (!temple) return;
    const timer = setTimeout(() => {
      buildRouteToTemple(selectedTemple.mapId);
    }, 100);
    return () => clearTimeout(timer);
  }, [mode, selectedTemple, initialized, buildRouteToTemple]);

  useEffect(() => {
    if (mode !== "museum" || !selectedTemple || !initialized) return;
    const museum = museumPoints.find((m) => m.id === selectedTemple.mapId);
    if (!museum) return;
    const timer = setTimeout(() => {
      buildRouteToMuseum(selectedTemple.mapId);
    }, 100);
    return () => clearTimeout(timer);
  }, [mode, selectedTemple, initialized, buildRouteToMuseum]);

  useEffect(() => {
    if (mode !== "art" || !selectedTemple || !initialized) return;
    const art = artPoints.find((a) => a.id === selectedTemple.mapId);
    if (!art) return;
    const timer = setTimeout(() => {
      buildRouteToArt(selectedTemple.mapId);
    }, 100);
    return () => clearTimeout(timer);
  }, [mode, selectedTemple, initialized, buildRouteToArt]);

  useEffect(() => {
    if (mode !== "history" || !selectedTemple || !initialized) return;
    const history = historyPoints.find((h) => h.id === selectedTemple.mapId);
    if (!history) return;
    const timer = setTimeout(() => {
      buildRouteToHistory(selectedTemple.mapId);
    }, 100);
    return () => clearTimeout(timer);
  }, [mode, selectedTemple, initialized, buildRouteToHistory]);

  useEffect(() => {
    if (mode !== "family" || !selectedTemple || !initialized) return;
    const family = familyPoints.find((f) => f.id === selectedTemple.mapId);
    if (!family) return;
    const timer = setTimeout(() => {
      buildRouteToFamily(selectedTemple.mapId);
    }, 100);
    return () => clearTimeout(timer);
  }, [mode, selectedTemple, initialized, buildRouteToFamily]);

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

    // --- Маршрут ---
    if (routeNodes && routeNodes.length > 1) {
      const isSpecialMode = [
        "temple",
        "museum",
        "art",
        "history",
        "family",
      ].includes(mode);
      ctx.strokeStyle = isSpecialMode ? "#FFD700" : "#ffffff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 4;

      routeNodes.forEach((n, i) => {
        if (!n) return;
        let x = n.x;
        let y = n.y;
        if (n.id === "USER") {
          // центр
        } else if (n.id === "START" || n.id?.startsWith("QP")) {
          y = n.y - 20;
        } else if (
          n.isTemple ||
          n.isMuseum ||
          n.isArt ||
          n.isHistory ||
          n.isFamily
        ) {
          y = n.y - 22.5;
        }
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      ctx.stroke();
      ctx.shadowColor = "transparent";
    }

    // --- Квестовые точки ---
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
      if (maxOrder > 0)
        pointsToDraw = questPoints.filter((qp) => qp.order <= maxOrder);
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

    // --- Рестораны ---
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
        }
      });
    }

    // --- Храмы ---
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
        } else {
          ctx.fillStyle = "#FFD700";
          ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
          ctx.shadowBlur = 4;
          ctx.beginPath();
          ctx.arc(
            temple.x,
            temple.y - iconSize / 2,
            iconSize / 2,
            0,
            Math.PI * 2,
          );
          ctx.fill();
          ctx.shadowColor = "transparent";
          ctx.fillStyle = "white";
          ctx.font = "bold 20px 'Advent Pro', sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("Х", temple.x, temple.y - iconSize / 2);
        }
        if (zoomRef.current > 1.5) {
          ctx.fillStyle = "white";
          ctx.font = "bold 12px 'Advent Pro', sans-serif";
          ctx.textAlign = "center";
          ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
          ctx.shadowBlur = 4;
          ctx.fillText(temple.name, temple.x, temple.y - iconSize - 5);
          ctx.shadowColor = "transparent";
        }
      });
    }

    // --- Музеи ---
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
        } else {
          ctx.fillStyle = "#4CAF50";
          ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
          ctx.shadowBlur = 4;
          ctx.beginPath();
          ctx.arc(
            museum.x,
            museum.y - iconSize / 2,
            iconSize / 2,
            0,
            Math.PI * 2,
          );
          ctx.fill();
          ctx.shadowColor = "transparent";
          ctx.fillStyle = "white";
          ctx.font = "bold 20px 'Advent Pro', sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("М", museum.x, museum.y - iconSize / 2);
        }
        if (zoomRef.current > 1.5) {
          ctx.fillStyle = "white";
          ctx.font = "bold 12px 'Advent Pro', sans-serif";
          ctx.textAlign = "center";
          ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
          ctx.shadowBlur = 4;
          ctx.fillText(museum.name, museum.x, museum.y - iconSize - 5);
          ctx.shadowColor = "transparent";
        }
      });
    }

    // --- Искусство ---
    if (mode === "art" && artPoints && artPoints.length > 0) {
      const iconSize = 45;
      const icon = artIconsRef.current.default;
      artPoints.forEach((art) => {
        if (icon) {
          ctx.drawImage(
            icon,
            art.x - iconSize / 2,
            art.y - iconSize,
            iconSize,
            iconSize,
          );
        } else {
          ctx.fillStyle = "#FF69B4";
          ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
          ctx.shadowBlur = 4;
          ctx.beginPath();
          ctx.arc(art.x, art.y - iconSize / 2, iconSize / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowColor = "transparent";
          ctx.fillStyle = "white";
          ctx.font = "bold 20px 'Advent Pro', sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("И", art.x, art.y - iconSize / 2);
        }
        if (zoomRef.current > 1.5) {
          ctx.fillStyle = "white";
          ctx.font = "bold 12px 'Advent Pro', sans-serif";
          ctx.textAlign = "center";
          ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
          ctx.shadowBlur = 4;
          ctx.fillText(art.name, art.x, art.y - iconSize - 5);
          ctx.shadowColor = "transparent";
        }
      });
    }

    // --- История ---
    if (mode === "history" && historyPoints && historyPoints.length > 0) {
      const iconSize = 45;
      const icon = historyIconsRef.current.default;
      historyPoints.forEach((history) => {
        if (icon) {
          ctx.drawImage(
            icon,
            history.x - iconSize / 2,
            history.y - iconSize,
            iconSize,
            iconSize,
          );
        } else {
          ctx.fillStyle = "#8B4513";
          ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
          ctx.shadowBlur = 4;
          ctx.beginPath();
          ctx.arc(
            history.x,
            history.y - iconSize / 2,
            iconSize / 2,
            0,
            Math.PI * 2,
          );
          ctx.fill();
          ctx.shadowColor = "transparent";
          ctx.fillStyle = "white";
          ctx.font = "bold 20px 'Advent Pro', sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("Ис", history.x, history.y - iconSize / 2);
        }
        if (zoomRef.current > 1.5) {
          ctx.fillStyle = "white";
          ctx.font = "bold 12px 'Advent Pro', sans-serif";
          ctx.textAlign = "center";
          ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
          ctx.shadowBlur = 4;
          ctx.fillText(history.name, history.x, history.y - iconSize - 5);
          ctx.shadowColor = "transparent";
        }
      });
    }

    // --- Семья ---
    if (mode === "family" && familyPoints && familyPoints.length > 0) {
      const iconSize = 45;
      const icon = familyIconsRef.current.default;
      familyPoints.forEach((family) => {
        if (icon) {
          ctx.drawImage(
            icon,
            family.x - iconSize / 2,
            family.y - iconSize,
            iconSize,
            iconSize,
          );
        } else {
          ctx.fillStyle = "#FFA500";
          ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
          ctx.shadowBlur = 4;
          ctx.beginPath();
          ctx.arc(
            family.x,
            family.y - iconSize / 2,
            iconSize / 2,
            0,
            Math.PI * 2,
          );
          ctx.fill();
          ctx.shadowColor = "transparent";
          ctx.fillStyle = "white";
          ctx.font = "bold 20px 'Advent Pro', sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("С", family.x, family.y - iconSize / 2);
        }
        if (zoomRef.current > 1.5) {
          ctx.fillStyle = "white";
          ctx.font = "bold 12px 'Advent Pro', sans-serif";
          ctx.textAlign = "center";
          ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
          ctx.shadowBlur = 4;
          ctx.fillText(family.name, family.x, family.y - iconSize - 5);
          ctx.shadowColor = "transparent";
        }
      });
    }

    // --- Пользователь ---
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
  }, [
    pageMode,
    gpsToPixel,
    userGPS,
    routeNodes,
    mode,
    restaurants,
    getQuestPointIcon,
  ]);

  // ========== ЗАГРУЗКА ИЗОБРАЖЕНИЙ (ПАРАЛЛЕЛЬНАЯ) ==========
  useEffect(() => {
    if (imagesLoadedRef.current) return;

    let isMounted = true;
    let loadedCount = 0;
    const totalImages = 3 + (restaurants?.length || 0);

    const updateProgress = () => {
      loadedCount++;
      if (isMounted) {
        setLoadingProgress(
          Math.floor((loadedCount / Math.max(totalImages, 1)) * 100),
        );
      }
    };

    const loadImage = (src) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          updateProgress();
          resolve(img);
        };
        img.onerror = () => {
          updateProgress();
          resolve(null);
        };
        img.src = src;
        if ("decode" in img) {
          img
            .decode()
            .then(() => resolve(img))
            .catch(() => resolve(img));
        }
      });
    };

    Promise.all([
      loadImage(mapImage),
      loadImage(templeIcon),
      loadImage(museumIcon),
      ...(restaurants?.length > 0 && !restaurantsLoadedRef.current
        ? restaurants.map((r) =>
            r.logo
              ? loadImage(r.logo).then((img) => {
                  if (img && isMounted) restaurantIconsRef.current[r.id] = img;
                })
              : Promise.resolve(),
          )
        : []),
    ]).then(([mapImg, templeImg, museumImg]) => {
      if (!isMounted || imagesLoadedRef.current) return;

      imgRef.current = mapImg;
      const bgCanvas = document.createElement("canvas");
      bgCanvas.width = mapImg.width;
      bgCanvas.height = mapImg.height;
      const bgCtx = bgCanvas.getContext("2d");
      bgCtx.drawImage(mapImg, 0, 0);
      bgCanvasRef.current = bgCanvas;

      computeAffineFromNodes();

      if (templeImg) templeIconsRef.current.default = templeImg;
      if (museumImg) {
        museumIconsRef.current.default = museumImg;
        artIconsRef.current.default = museumImg;
        historyIconsRef.current.default = museumImg;
        familyIconsRef.current.default = museumImg;
      }

      if (restaurants?.length > 0) restaurantsLoadedRef.current = true;

      setInitialized(true);
      imagesLoadedRef.current = true;

      setTimeout(() => {
        if (isMounted) setIsLoading(false);
      }, 200);
    });

    return () => {
      isMounted = false;
    };
  }, [computeAffineFromNodes, restaurants]);

  // --- Обновление иконок ресторанов ---
  useEffect(() => {
    if (!imagesLoadedRef.current || !restaurants?.length) return;

    const loadImage = (src) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
      });
    };

    restaurants.forEach(async (restaurant) => {
      if (restaurant.logo && !restaurantIconsRef.current[restaurant.id]) {
        const img = await loadImage(restaurant.logo);
        if (img) restaurantIconsRef.current[restaurant.id] = img;
      }
    });
  }, [restaurantsKey, restaurants]);

  // --- Загрузка иконок зайцев ---
  useEffect(() => {
    if (!initialized || rabbitIconsLoadedRef.current) return;

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
        await new Promise((resolve) => {
          img.onload = () => {
            rabbitIconsRef.current[key] = img;
            resolve();
          };
          img.onerror = () => resolve();
        });
      }
      rabbitIconsLoadedRef.current = true;
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

      if (canvasRef.current && bgCanvasRef.current && imgRef.current) drawMap();
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
      newZoom = Math.max(newZoom, initZoomRef.current);
      newZoom = Math.min(newZoom, 3);

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

  // --- обработка кликов (без принудительного зума) ---
  const handleCanvasClick = (e) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const mapX = (clickX - offsetRef.current.x) / zoomRef.current;
    const mapY = (clickY - offsetRef.current.y) / zoomRef.current;
    const hitRadius = 20 / Math.max(0.5, zoomRef.current);

    const findClosest = (points) => {
      let closest = null;
      let closestDist = Infinity;
      points.forEach((p) => {
        const px = p.x || p.location?.x;
        const py = p.y || p.location?.y;
        const dx = mapX - px;
        const dy = mapY - py;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < hitRadius && dist < closestDist) {
          closestDist = dist;
          closest = p;
        }
      });
      return closest;
    };

    if (mode === "gastro" && restaurants.length) {
      const closest = findClosest(
        restaurants.map((r) => ({ ...r, x: r.location.x, y: r.location.y })),
      );
      if (closest) {
        onMarkerClick(closest.id);
        return;
      }
    }
    if (mode === "temple" && templePoints.length) {
      const closest = findClosest(templePoints);
      if (closest) {
        buildRouteToTemple(closest.id);
      }
      return;
    }
    if (mode === "museum" && museumPoints && museumPoints.length) {
      const closest = findClosest(museumPoints);
      if (closest) {
        buildRouteToMuseum(closest.id);
      }
      return;
    }
    if (mode === "art" && artPoints && artPoints.length) {
      const closest = findClosest(artPoints);
      if (closest) {
        buildRouteToArt(closest.id);
      }
      return;
    }
    if (mode === "history" && historyPoints && historyPoints.length) {
      const closest = findClosest(historyPoints);
      if (closest) {
        buildRouteToHistory(closest.id);
      }
      return;
    }
    if (mode === "family" && familyPoints && familyPoints.length) {
      const closest = findClosest(familyPoints);
      if (closest) {
        buildRouteToFamily(closest.id);
      }
      return;
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
          newZoom = Math.max(newZoom, initZoomRef.current);
          newZoom = Math.min(newZoom, 3);
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

  useImperativeHandle(ref, () => {
    const handleStep2 = () => {
      if (userGPS) {
        rebuildRouteFromUser();
        const px = gpsToPixel(userGPS.lat, userGPS.lon);
        if (px) {
          centerOnPixel(px, 2.2);
          setFollowUser(true);
        }
      }
    };

    return {
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
          case "step2":
            handleStep2();
            break;
          case "step4":
            buildRouteBetweenPoints(1, 2);
            centerOnQuestPoints(1, 2, 1.8);
            break;
          case "step6":
            buildRouteBetweenPoints(2, 3);
            centerOnQuestPoints(2, 3, 1.8);
            break;
          case "step8":
            buildRouteBetweenPoints(3, 4);
            centerOnQuestPoints(3, 4, 1.8);
            break;
          case "step10":
            buildRouteBetweenPoints(4, 5);
            centerOnQuestPoints(4, 5, 1.8);
            break;
          case "step12":
            buildRouteBetweenPoints(5, 6);
            centerOnQuestPoints(5, 6, 1.8);
            break;
          case "step14":
            buildRouteBetweenPoints(6, 7);
            centerOnQuestPoints(6, 7, 1.8);
            break;
          case "step16":
            buildRouteBetweenPoints(7, 8);
            centerOnQuestPoints(7, 8, 1.8);
            break;
          case "step18":
            buildRouteBetweenPoints(8, 9);
            centerOnQuestPoints(8, 9, 1.8);
            break;
          case "step20":
            buildRouteBetweenPoints(9, 10);
            centerOnQuestPoints(9, 10, 1.8);
            break;
          case "step22":
            buildRouteBetweenPoints(10, 11);
            centerOnQuestPoints(10, 11, 1.8);
            break;
          case "step24":
            buildRouteBetweenPoints(11, 12);
            centerOnQuestPoints(11, 12, 1.8);
            break;
          case "step26":
            buildRouteBetweenPoints(12, 13);
            centerOnQuestPoints(12, 13, 1.8);
            break;
          case "step28":
            buildRouteBetweenPoints(13, 14);
            centerOnQuestPoints(13, 14, 1.8);
            break;
          case "step30": {
            setRouteNodes([]);
            const lastPoint = questPoints.find((qp) => qp.order === 14);
            if (lastPoint)
              centerOnPixel({ x: lastPoint.x, y: lastPoint.y }, 2.0);
            break;
          }
          default:
            break;
        }
        setTimeout(() => {
          setIsLoading(false);
          setIsModeChanging(false);
        }, 400);
      },
      buildRouteToStart: () => handleBuildRoute(),
      howProgress: () => setShowProgressModal(true),
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
      buildRouteFromEleventhToTwelfthPoint: () =>
        buildRouteBetweenPoints(11, 12),
      buildRouteFromTwelfthToThirteenthPoint: () =>
        buildRouteBetweenPoints(12, 13),
      buildRouteFromThirteenthToFourteenthPoint: () =>
        buildRouteBetweenPoints(13, 14),
      buildRouteToTemple: (templeId) => buildRouteToTemple(templeId),
      centerOnTemple: (templeId) => {
        const t = templePoints.find((x) => x.id === templeId);
        if (t) centerOnPixel({ x: t.x, y: t.y }, 2.0);
      },
      buildRouteToMuseum: (museumId) => buildRouteToMuseum(museumId),
      centerOnMuseum: (museumId) => {
        const m = museumPoints.find((x) => x.id === museumId);
        if (m) centerOnPixel({ x: m.x, y: m.y }, 2.0);
      },
      buildRouteToArt: (artId) => buildRouteToArt(artId),
      centerOnArt: (artId) => {
        const a = artPoints.find((x) => x.id === artId);
        if (a) centerOnPixel({ x: a.x, y: a.y }, 2.0);
      },
      buildRouteToHistory: (historyId) => buildRouteToHistory(historyId),
      centerOnHistory: (historyId) => {
        const h = historyPoints.find((x) => x.id === historyId);
        if (h) centerOnPixel({ x: h.x, y: h.y }, 2.0);
      },
      buildRouteToFamily: (familyId) => buildRouteToFamily(familyId),
      centerOnFamily: (familyId) => {
        const f = familyPoints.find((x) => x.id === familyId);
        if (f) centerOnPixel({ x: f.x, y: f.y }, 2.0);
      },
      redraw: () => drawMap(),
    };
  });

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
      if (!startQP) return;
      const dx = userPx.x - startQP.x;
      const dy = userPx.y - startQP.y;
      if (Math.sqrt(dx * dx + dy * dy) < 25) onQuestPointReached?.(2);
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

          {mode !== "step30" ? (
            <div className="map-continue-container">
              <button
                className="map-continue-button"
                onClick={() => {
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
                  const stepNumber = stepMap[mode];
                  if (stepNumber) onQuestPointReached?.(stepNumber);
                }}
              >
                Продолжить
              </button>
            </div>
          ) : (
            <div className="map-continue-container">
              <button
                className="map-continue-button"
                onClick={() => onQuestPointReached?.(30)}
              >
                Забрать награду
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
});
