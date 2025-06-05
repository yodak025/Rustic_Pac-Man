import { KeyboardControls, useKeyboardControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from "react";
import * as THREE from "three";
import { Raycaster, Vector3 } from "three";
import { type PacDotsRef } from "./PacDots";

interface PacmanProps {
  position: [number, number, number];
  radius: number;
  color: string;
  sphereResolution: number;
  pacDotsRef: React.RefObject<PacDotsRef | null>;
  initialLives?: number;
  onPacmanIsDead: () => void; // Callback para cuando Pacman muere
}
export interface PacmanRef {
  lives: number;
  takeDamage: (newLives: number) => void;
  meshRef: React.RefObject<THREE.Mesh | null>;
}

const PacmanUncontrolled = forwardRef<PacmanRef, PacmanProps>(
  ({position, radius, color, sphereResolution, pacDotsRef, initialLives=3, onPacmanIsDead}, ref) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [_, getKeys] = useKeyboardControls();
  const [collisionObjects, setCollisionObjects] = useState<THREE.Object3D[]>([]);
  const { scene } = useThree();
  const raycaster = new Raycaster();
  const direction = new Vector3();
  const [lives, setLives] = useState(initialLives);
  const [isInvulnerable, setIsInvulnerable] = useState(false);

  useImperativeHandle(ref, () => ({
    lives : lives,
    takeDamage: () => {
      if (isInvulnerable  || lives<=0) return; // No se puede dañar si es invulnerable
      setLives(lives - 1);
      setIsInvulnerable(true);
      setTimeout(() => setIsInvulnerable(false), 3000); // Invulnerabilidad temporal de 3 segundos
    },
    meshRef: meshRef as React.RefObject<THREE.Mesh | null>,
  }));
  
  // Efecto para recoger todos los objetos de colisión (paredes del laberinto)
  useEffect(() => {

    const objects: THREE.Object3D[] = [];
    
    // Recogemos los bloques del laberinto (walls) para detectar colisiones
    scene.traverse((object) => {
      // Filtramos los objetos que son paredes del laberinto 
      // (asumimos que son los mesh con material de color azul o el color del muro)
      if (
        object instanceof THREE.Mesh && 
        object.material instanceof THREE.MeshStandardMaterial && 
        object !== (meshRef as React.RefObject<THREE.Mesh>).current
      ) {
        objects.push(object);
      }
    });
    
    setCollisionObjects(objects);
  }, [scene]);
  
  // Función para comprobar si hay colisión en una dirección determinada
  const checkCollision = (dirVector: Vector3, distance: number): boolean => {
    if (!(meshRef as React.RefObject<THREE.Mesh>).current) return false;
    
    // Configuramos el raycaster desde la posición actual en la dirección especificada
    raycaster.set((meshRef as React.RefObject<THREE.Mesh>).current.position, dirVector.normalize());
    
    // Comprobamos intersecciones con objetos de colisión
    const intersects = raycaster.intersectObjects(collisionObjects);
    
    // Si hay alguna intersección cercana (considerando el radio), hay colisión
    return intersects.length > 0 && intersects[0].distance < distance + radius;
  };

  const checkPacDotCollision = (newPosition: [number, number, number]) => {
      if (!pacDotsRef?.current) return;
      
      const x = Math.floor(newPosition[0]);
      const z = Math.floor(newPosition[2]);
      
      // Verificar colisión con tolerancia
      const tolerance = 0.3;
      const pacmanX = newPosition[0];
      const pacmanZ = newPosition[2];
      
      if (Math.abs(pacmanX - (x + 0.5)) < tolerance && 
          Math.abs(pacmanZ - (z + 0.5)) < tolerance) {
        pacDotsRef.current.consumePacDot(x, z);
      }
    };

  useFrame(() => {

    if (lives <= 0) {
      onPacmanIsDead(); // Llamar al callback cuando Pacman muere
    }
    const keys = getKeys();
    let speed = 0.1;
    if (keys["dash"]) {
      speed = 4; // Aumentar la velocidad al presionar espacio
    }

    if ((meshRef as React.RefObject<THREE.Mesh>).current?.position) {
      const currentPosition = (meshRef as React.RefObject<THREE.Mesh>).current.position;
      // Movimiento hacia adelante (Z negativo)
      if (keys["moveForward"]) {
        direction.set(0, 0, -1);
        if (!checkCollision(direction, speed)) {
          currentPosition.z -= speed;
        }
      }
      
      // Movimiento hacia atrás (Z positivo)
      if (keys["moveBackward"]) {
        direction.set(0, 0, 1);
        if (!checkCollision(direction, speed)) {
          currentPosition.z += speed;
        }
      }
      
      // Movimiento hacia la izquierda (X negativo)
      if (keys["moveLeft"]) {
        direction.set(-1, 0, 0);
        if (!checkCollision(direction, speed)) {
          currentPosition.x -= speed;
        }
      }
      
      // Movimiento hacia la derecha (X positivo)
      if (keys["moveRight"]) {
        direction.set(1, 0, 0);
        if (!checkCollision(direction, speed)) {
          currentPosition.x += speed;
        }
      }
      checkPacDotCollision([currentPosition.x, currentPosition.y, currentPosition.z]);
    }
  });
  
  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry
        args={[radius, sphereResolution, sphereResolution]}
      />
      <meshStandardMaterial color={color} />
    </mesh>
  );
});
PacmanUncontrolled.displayName = 'PacmanUncontrolled';


const Pacman = forwardRef<PacmanRef, PacmanProps>((props, ref) => {
  return (
    <KeyboardControls
      map={[
        { name: "moveForward", keys: ["ArrowUp", "w"] },
        { name: "moveBackward", keys: ["ArrowDown", "s"] },
        { name: "moveLeft", keys: ["ArrowLeft", "a"] },
        { name: "moveRight", keys: ["ArrowRight", "d"] },
        { name: "dash", keys: ["Space"] },
      ]}
    >
      <PacmanUncontrolled {...props} ref={ref} />
    </KeyboardControls>
  );
});

Pacman.displayName = 'Pacman';

export default Pacman;