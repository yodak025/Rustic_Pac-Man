import {useGameStatusStore} from "@state/store";
import Modal from "@/ui/common/Modal";
import MenuButtonGroup from "@/ui/common/MenuButtonGroup";

const InGameMenu = () => {
  const game = useGameStatusStore((state) => state);

  return (
    <Modal isOpen={true} title="PAUSA">
      <MenuButtonGroup
        onContinue={game.setPlayingStatus}
        onRestart={game.reStart}
        onMainMenu={game.reboot}
        continueLabel="SEGUIR JUGANDO"
        restartLabel="REINICIAR PARTIDA"
        mainMenuLabel="MENÚ PRINCIPAL"
      />
    </Modal>
  );
};

export default InGameMenu