import Game from './Game'
import Menu from './Menu'
import { useState } from 'react'

function App() {
  const [gameStarted, setGameStarted] = useState(false)
  return (
    <>
      {!gameStarted ? (
        <Menu  setGameStarted={setGameStarted} />
      ) : (
        <Game />
      )}
    </>
  )
}

export default App
