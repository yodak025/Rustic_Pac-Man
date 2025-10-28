import {useGameStatusStore} from "@state/store";
import Modal from "@/ui/common/Modal";
import MenuButtonGroup from "@/ui/common/MenuButtonGroup";

const InGameMenu = () => {
  const game = useGameStatusStore((state) => state);

  return (
    <Modal isOpen={true} title="PAUSE" className="w-3xl h-2/7">
      <MenuButtonGroup
        onContinue={game.setPlayingStatus}
        onRestart={game.reStart}
        onMainMenu={game.reboot}
        continueLabel="RESUME GAME"
        restartLabel="RESTART LEVEL"
        mainMenuLabel="MAIN MENU"
      />
    </Modal>
  );
};

export default InGameMenu