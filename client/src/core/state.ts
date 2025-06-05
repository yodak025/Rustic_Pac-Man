
type runState = "idle" | "running" | "paused" | "gameOver" | "winner";

interface IState {
  runState: runState;
  score: number;
  lives: number;
}

export class State implements IState {
  public runState: runState;
  public score: number;
  constructor(public lives: number = 3) {
    this.runState = "idle";
    this.score = 0;
  }
  pause() {
    this.runState = "paused";
  }
  play() {
    this.runState = "running";
  }
  gameOver() {
    this.runState = "gameOver";
  }
  winner() {
    this.runState = "winner";
  }
  incrementScore(amount: number) {
    this.score += amount;
  }
  takeDamage() {
    if (this.lives > 0) {
      this.lives -= 1;
    }
    if (this.lives <= 0) {
      this.gameOver();
    }
  }

}
