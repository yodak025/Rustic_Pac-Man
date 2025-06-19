import type * as THREE from "three";

const rotateToDirection = (
  meshRef: React.RefObject<THREE.Mesh | null>,
  direction: string
) => {
  if (!meshRef.current) return;
  
  // Establecer rotación en Y según la dirección
  switch (direction) {
    case "down": // Mirando hacia Z positivo
      meshRef.current.rotation.y = 0;
      break;
    case "up": // Mirando hacia Z negativo
      meshRef.current.rotation.y = Math.PI;
      break;
    case "right": // Mirando hacia X negativo
      meshRef.current.rotation.y = Math.PI / 2;
      break;
    case "left": // Mirando hacia X positivo
      meshRef.current.rotation.y = -Math.PI / 2;
      break;
  }
};

export default rotateToDirection;