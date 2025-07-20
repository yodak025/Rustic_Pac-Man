export type EntityId = string;
export type Ghost = "inky" | "pinky" | "blinky" | "clyde";

export type Direction = "up" | "down" | "left" | "right" | "none";
export type Position = {
  x: number;
  y: number;
}

export type Speed = number;

export type ComponentMap = {
  position?: Position;
  speed?: Speed;
  direction?: Direction;
};

export type EntityState = {
  id: EntityId;
  type: "pacman" | Ghost | "pellet";
  components: ComponentMap;
  // otros componentes...
};