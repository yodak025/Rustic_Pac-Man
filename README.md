# Chomp Crawler

This project is the final thesis for a degree in Audiovisual Systems and Multimedia Engineering. It presents a 3D web-based video game that modernizes the classic arcade mechanics of Pac-Man by introducing characteristic elements of the rogue-like genre.

The main goals of the project are:

- **Procedural Generation**: Create highly replayable, interconnected maze dungeons avoiding dead-ends and ensuring navigability.
- **Robust Architecture**: Implement a custom **Entity Component System (ECS)** to handle game logic cleanly and efficiently.
- **Web Availability**: Leverage modern web technologies (React, Next.js, WebGL) to provide a highly available, installation-free experience.

## Tech Stack & Architecture

The game is built upon a decoupled architecture dividing logic, state, and presentation:

1. **ECS Game Engine (TypeScript)**: The core simulation runs on a custom, strict Entity-Component-System logic loop operating on flat data structures (Cold State) to ensure performance.
2. **Procedural Generation (Python & WebAssembly)**: A complex maze generation algorithm written in Python, compiled to WebAssembly, and executed client-side via **Pyodide**.
3. **Global State (Zustand)**: A reactive Hot State store that receives frame-by-frame snapshots from the ECS to communicate data to the UI layer without prop-drilling or over-rendering.
4. **3D Presentation (React Three Fiber & WebGL)**: The graphical representation of the game world. It leverages heavily on **Instanced Meshes** to render thousands of dynamic elements (walls, floors, collectables, enemies) in a single draw call.
5. **UI & App Orchestration (React, Next.js & Tailwind CSS)**: Handles the Single Page Application flow, routing, Heads-Up Display (HUD), menus, and styling via utility classes.

## Maze Generation

The procedural generation takes inspiration from [Shaun LeBron's Pac-Man Maze Generation](https://shaunlebron.github.io/pacman-mazegen/) and expands it to create massive, multi-room dungeons. The process is divided into two layers:

- **Micro Layer (Python)**: Generates individual rooms as valid Pac-Man-style tilemaps (cyclic, no dead ends, specific wall shapes).
- **Macro Layer (Python)**: Organizes multiple rooms into horizontal and vertical layers, connecting them via shared lateral tunnels determined by a **Minimum Spanning Tree (Kruskal's algorithm)** to ensure full maze connectivity while avoiding excessive loops.

## Getting Started

This project is built using Next.js. To run it locally on your machine, you will need to have [Node.js](https://nodejs.org/) installed.

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Build the project for production:**

   ```bash
   npm run build
   ```

3. **Start the production server:**

   ```bash
   npm start
   ```

4. **Play the game:**
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the landing page and start the game.

