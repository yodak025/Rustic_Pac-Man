'use client'

import { useRef, useEffect, useMemo } from 'react';
import {
  InstancedMesh,
  Object3D,
  MeshStandardMaterial,
  IcosahedronGeometry,
  OctahedronGeometry,
  TetrahedronGeometry,
  ConeGeometry,
  CylinderGeometry,
  DodecahedronGeometry,
} from 'three';
import { CollectableKind } from '@custom-types/gameComponents';
import type { PositionKey } from '@custom-types/componentTypes';
import { keyToPosition } from '@custom-types/componentTypes';

export interface InstancedMedallionsProps {
  /** Live map of positionKey → CollectableKind, updated each frame from GameWorld */
  medallions: Map<PositionKey, CollectableKind>
}

// ── Mock visual config (placeholder geometries + colors) ─────────────────────
// Each medallion kind gets a distinct shape and color so they are easy to tell
// apart during development. Replace with final assets in a later pass.
const MEDALLION_Y = 0.5; // height above the floor plane

interface MedallionVisual {
  color: string;
  makeGeometry: () => InstanceType<typeof IcosahedronGeometry
    | typeof OctahedronGeometry
    | typeof TetrahedronGeometry
    | typeof ConeGeometry
    | typeof CylinderGeometry
    | typeof DodecahedronGeometry>;
}

const VISUALS: Partial<Record<CollectableKind, MedallionVisual>> = {
  [CollectableKind.MEDALLION_STEALTH]: {
    color: '#888888',
    makeGeometry: () => new OctahedronGeometry(0.25),
  },
  [CollectableKind.MEDALLION_VISION]: {
    color: '#ffdd00',
    makeGeometry: () => new TetrahedronGeometry(0.28),
  },
  [CollectableKind.MEDALLION_SHOUT]: {
    color: '#ff8800',
    makeGeometry: () => new ConeGeometry(0.2, 0.45, 6),
  },
  [CollectableKind.MEDALLION_SPEED]: {
    color: '#4488ff',
    makeGeometry: () => new CylinderGeometry(0.12, 0.2, 0.4, 8),
  },
  [CollectableKind.MEDALLION_ESSENCE]: {
    color: '#44ff88',
    makeGeometry: () => new DodecahedronGeometry(0.22),
  },
};

const MEDALLION_KINDS = Object.keys(VISUALS) as CollectableKind[];
const MAX_INSTANCES = 64; // generous buffer; there are only 5 per level

/**
 * Renders one InstancedMesh per medallion kind.
 * When a medallion is collected it disappears from the map and the mesh
 * count drops to 0, hiding it automatically.
 */
function MedallionGroup({
  kind,
  positions,
}: {
  kind: CollectableKind;
  positions: Array<{ x: number; y: number }>;
}) {
  const visual = VISUALS[kind]!;
  const meshRef = useRef<InstancedMesh>(null);
  const tempObject = useMemo(() => new Object3D(), []);
  const geometry = useMemo(() => visual.makeGeometry(), [visual]);
  const material = useMemo(
    () => new MeshStandardMaterial({ color: visual.color, roughness: 0.4, metalness: 0.5 }),
    [visual.color],
  );

  useEffect(() => {
    if (!meshRef.current) return;
    meshRef.current.count = positions.length;
    positions.forEach((pos, i) => {
      tempObject.position.set(pos.x, MEDALLION_Y, pos.y);
      tempObject.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObject.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [positions, tempObject]);

  if (positions.length === 0) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, MAX_INSTANCES]}
      frustumCulled={false}
    />
  );
}

/**
 * Top-level component: splits the medallions map by kind and renders each group.
 */
export default function InstancedMedallions({ medallions }: InstancedMedallionsProps) {
  // Build a position list per kind from the flat map
  const byKind = useMemo(() => {
    const acc: Partial<Record<CollectableKind, Array<{ x: number; y: number }>>> = {};
    for (const kind of MEDALLION_KINDS) {
      acc[kind] = [];
    }
    for (const [key, kind] of medallions) {
      if (MEDALLION_KINDS.includes(kind)) {
        const { x, y } = keyToPosition(key);
        acc[kind]!.push({ x, y });
      }
    }
    return acc;
  }, [medallions]);

  return (
    <>
      {MEDALLION_KINDS.map((kind) => (
        <MedallionGroup key={kind} kind={kind} positions={byKind[kind] ?? []} />
      ))}
    </>
  );
}
