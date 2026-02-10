/**
 * GameScenePreloader - Preloads Three.js assets and signals when ready
 * 
 * This component is rendered in a hidden Canvas to preload all game assets
 * (geometries, materials, textures) before showing the game scene.
 * Once R3F reports 100% progress, it calls the onLoaded callback.
 */

import { useProgress } from '@react-three/drei';
import { useEffect } from 'react';
import Maze from './meshes/maze/Maze';
import PacmanMesh from './meshes/entities/PacmanMesh';
import BlinkyMesh from './meshes/entities/BlinkyMesh';
import ClydeMesh from './meshes/entities/ClydeMesh';
import PinkyMesh from './meshes/entities/PinkyMesh';
import InkyMesh from './meshes/entities/InkyMesh';

interface GameScenePreloaderProps {
  onLoaded: () => void;
}

export default function GameScenePreloader({ onLoaded }: GameScenePreloaderProps) {
  const { progress } = useProgress();

  useEffect(() => {
    if (progress === 100) {
      console.log('[GameScenePreloader] Assets loaded (100%)');
      // Defer callback to avoid setState during render
      setTimeout(() => {
        onLoaded();
      }, 0);
    }
  }, [progress, onLoaded]);

  // Render entire scene invisibly to trigger R3F loading
  return (
    <group visible={false}>
      <Maze />
      <PacmanMesh />
      <BlinkyMesh />
      <ClydeMesh />
      <PinkyMesh />
      <InkyMesh />
    </group>
  );
}
