import useGameStatusStore from "@state/useGameStatusStore";
import gameStatusValue from "@/types/gameStatusValue";
import { useFrame, type RootState } from "@react-three/fiber";



//-- hook para ejecutar una funcion cada frame del juego
//-- se ejecuta solo si el juego esta en estado de PLAYING
const useGameFrame = (eachFrame: (state: RootState, delta:number) => void) => {
  const gameStatus = useGameStatusStore((state) => state.status);
  useFrame((state, delta) => {
    if (gameStatus === gameStatusValue.PLAYING) {
      eachFrame(state, delta);
    }
  });
};

export default useGameFrame;