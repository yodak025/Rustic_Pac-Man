# Rustic Pac-Man

This project is my thesis for a degree in Engineering in Audiovisual Systems. It features a Pac-Man clone with a rogue-like perspective. The main goals of this project are:

- Decentralized Multiplayer: Implement a 1-4 player experience using WebRTC.
- Procedural Generation: Explore the creation of procedural Pac-Man mazes.

## Maze generation:

Starting from the work of [Saun LeBron](https://shaunlebron.github.io/pacman-mazegen/), Im currently developing a maze generator. It will follow the LeBron contrains:

- 1 tile thick paths.
- No sharp turns.
- No dead ends.
- Only I, L, T or + wall shapes alowed, excepting posible variations of the ghost home.
- non rectangular walls must be 2 tiles thick

In addition/variation of those, I add 2 more:

- The map needs to ve a 4x4 version of the 28x31 tiles maps of the classic Pac-Man design.
- These maps will be formed of of 4 4x1 layers that will be connected by tunnels.
