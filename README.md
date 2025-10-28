# Rustic Pac-Man

This project is my thesis for a degree in Engineering in Audiovisual Systems. It features a Pac-Man clone with a rogue-like perspective. The main goals of this project are:

- Decentralized Multiplayer: Implement a 1-4 player experience using WebRTC.
- Procedural Generation: Explore the creation of procedural Pac-Man mazes.
- Web Aplication: Use web technologies in order to make the game highly available.
  
This projects iterates functional prototypes, focusing in the idea of constant improvement. Actually, I'm working in the 3rd one. It's goal is to end being a pacman-like endless arcade, while approaching to future ideas. 

## Architecture
The game is currently divided in 4 main units
1. There's a Three.js based scene, created with React Three Fiber, that runs inside a TypeScript React.js App. It shows the graphical representation of the game.
2. The logic runs in a game loop. It is implemented with pure TypeScript.
3. The global state is implemented using Zustand. The game loop modifies it and the React.js app follows these values.
4. A Python maze generator that creates tilemaps in order to represent the levels. This generator integrates inside the game logic using Pyodide. 

## Maze generation:

Starting from the work of [Saun LeBron](https://shaunlebron.github.io/pacman-mazegen/), I've developed a Python based implementation. It will follow some of the LeBron contrains:

- Simetric levels.
- 1 tile thick paths.
- No sharp turns.
- No dead ends.
- Only I, L, T or + wall shapes alowed, excepting posible variations of the ghost home.
- Non rectangular walls must be 2 tiles thick

In addition/variation of those, I add 2 more:

- The map needs to ve a 4x4 version of the 28x31 tiles maps of the classic Pac-Man design.
- These maps will be formed of of 4 4x1 layers that will be connected by tunnels.

The mazes are currently in a prototype state. The game uses this algorhythm to generate pacman-like arcade games. However, it's fully functional for the full purpose of the project. 
