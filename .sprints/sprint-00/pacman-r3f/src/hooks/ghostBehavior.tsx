import { useFrame } from "@react-three/fiber";
import { level1Map } from "../data/level1";
import { type PacmanRef } from "../components/Pacman";
import { useRef, useState } from "react";
import type * as THREE from "three";
import rotateToDirection from "../utils/transformation/orientation";

const nextStep = (
  ghostRef: React.RefObject<THREE.Mesh | null>,
  pacmanRef: React.RefObject<PacmanRef | null>,
  lastPath: React.RefObject<string[]>,
  vehavior: string,
  mazeMap: number[][] = level1Map
) => {
  const lastLastPath = lastPath.current[0];

  if (!pacmanRef) return;
  let position = ghostRef.current?.position;
  if (!position) return;
  let pacmanPosition = pacmanRef.current?.meshRef.current?.position;
  if (!pacmanPosition) return;

  let coords = [position.x, position.z] ;
  let pacmanCoords = vehavior == "hunting" ? [pacmanPosition.x, pacmanPosition.z]: [0, 0];
  if (Math.abs(coords[0] - pacmanCoords[0]) < 1 && Math.abs(coords[1] - pacmanCoords[1]) < 1) {
    console.log("Pacman caught!");
    pacmanRef.current?.takeDamage(1);
  }
  let validPaths = [];
  if (coords[0] > 0 && lastPath.current[0] != "left") {
    validPaths.push("left");
  }
  if (coords[0] < mazeMap[0].length - 1 && lastPath.current[0] != "right") {
    validPaths.push("right");
  }
  if (coords[1] > 0 && lastPath.current[0] != "down") {
    validPaths.push("down");
  }
  if (coords[1] < mazeMap.length - 1 && lastPath.current[0] != "up") {
    validPaths.push("up");
  }
  let paths = [];
  for (let i = 0; i < validPaths.length; i++) {
    let nextCoords = [
      validPaths[i] === "left" || validPaths[i] === "right"
        ? validPaths[i] == "left"
          ? coords[0] - 1
          : coords[0] + 1
        : coords[0],
      validPaths[i] === "up" || validPaths[i] === "down"
        ? validPaths[i] == "up"
          ? coords[1] - 1
          : coords[1] + 1
        : coords[1],
    ];
    paths.push({
      direction: validPaths[i],
      cellType: mazeMap[Math.floor(nextCoords[1])][Math.floor(nextCoords[0])],
      distance: Math.sqrt(
        Math.pow(nextCoords[0] - pacmanCoords[0], 2) +
          Math.pow(nextCoords[1] - pacmanCoords[1], 2)
      ),
    });
  }
  let newPath = paths
    .filter((path) => path.cellType == 0)
    .sort((a, b) => a.distance - b.distance)[0];
  if (newPath) {
    switch (newPath.direction) {
      case "left":
        position.x -= 1;
        lastPath.current = ["right"];
        rotateToDirection(ghostRef, "left");
        break;
      case "right":
        position.x += 1;
        lastPath.current = ["left"];
        rotateToDirection(ghostRef, "right");
        break;
      case "up":
        position.z -= 1;
        lastPath.current = ["down"];
        rotateToDirection(ghostRef, "up");
        break;
      case "down":
        position.z += 1;
        lastPath.current = ["up"];
        rotateToDirection(ghostRef, "down");
        break;
    }
  } else {
    lastPath.current = ["none"];
  }
  if (lastPath.current[0] != lastLastPath) {
    let updatedLevel1Map = [...mazeMap.map((row) => [...row])];
    updatedLevel1Map[Math.floor(coords[1])][Math.floor(coords[0])] = 999;

  }
};

const ghostBehavior = (
  ghostRef: React.RefObject<THREE.Mesh | null>,
  pacmanRef: React.RefObject<PacmanRef | null>,
  mazeMap: number[][] = level1Map
) => {
  let lastPath = useRef<string[]>(["none"]);
  const lastUpdateTime = useRef<number>(0);
  const [vehavior, setBehavior] = useState<string>("fleeing");
  const lastUpdateBehaviorTime = useRef<number>(0);

  useFrame(({ clock }) => {
    const currentTime = clock.getElapsedTime();
    if (currentTime - lastUpdateTime.current >= 0.2) {
      nextStep(ghostRef, pacmanRef, lastPath, vehavior, mazeMap);
      // Actualizar el tiempo de la última ejecución
      lastUpdateTime.current = currentTime;
    }
    if (currentTime - lastUpdateBehaviorTime.current >= Math.random() * 10 + 1) {
      Math.random() < 0.7
        ? setBehavior("hunting"):
          setBehavior("fleeing");
      // Actualizar el tiempo de la última ejecución
      lastUpdateBehaviorTime.current = currentTime;
    }
  });
};

export default ghostBehavior;