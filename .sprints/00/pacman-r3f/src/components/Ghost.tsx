import ghostBehavior from "../hooks/ghostBehavior";
import { useRef } from "react";
import type * as THREE from "three";
import { Model as BlueGhost } from "../assets/Blue_Ghost" ;
import { Model as RedGhost } from "../assets/Red_Ghost" ;
import { Model as PinkGhost } from "../assets/Pink_Ghost" ;
import { Model as OrangeGhost } from "../assets/Orange_Ghost" ;
import { level1Map } from "../data/level1";
import {type PacmanRef } from "./Pacman";

type GhostProps = {
  position: [number, number, number];
  pacmanRef: React.RefObject<PacmanRef | null>;
  type: string;
  // type: "red" | "blue" | "pink" | "orange";
  mazeMap?: number[][];
};


export default function Ghost({ position, pacmanRef, type = "red", mazeMap = level1Map}: GhostProps) {
  const ghostRef = useRef<THREE.Mesh>(null);
  ghostBehavior(ghostRef, pacmanRef, mazeMap );
  if (type !== "red" && type !== "blue" && type !== "pink" && type !== "orange") throw new Error("Invalid ghost type");

 
      return (
        <group ref={ghostRef} position={position} scale={0.5}>
          {type === "red" && <RedGhost />}
          {type === "blue" && <BlueGhost />}
          {type === "pink" && <PinkGhost />}
          {type === "orange" && <OrangeGhost />}
        </group>
      ); 
   
  

  
 
}
