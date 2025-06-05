import { Engine } from "./core/engine";
import { createGameLoop } from "./core/loop";
import { useState, useEffect, use } from "react";

function App() {
  let engine = new Engine();
  useEffect(() => {
    let stop = createGameLoop((delta) => {
      engine.tick(delta);
    });
    return () => stop();
  }, []);

  const [gameStarted, setGameStarted] = useState(engine.state.runState);

  return (
    <>{!gameStarted ? <Menu setGameStarted={setGameStarted} /> : <Game />}</>
  );
}

export default App;
