export class TileMap {
  private readonly data: readonly number[][]

  private constructor(data: number[][]) {
    // clone profundo para seguridad
    this.data = data.map(row => [...row])
  }

  static fromArray(arr: number[][]) {
    return new TileMap(arr)
  }

  get(x: number, y: number): number {
    return this.data[y]?.[x] ?? NaN
  }
 
  set(x: number, y: number, value: number): TileMap {
    const newData = this.data.map((row, ry) =>
      ry === y
        ? row.map((cell, rx) => (rx === x ? value : cell))
        : [...row]
    )
    return new TileMap(newData)
  }

  forEachTile(callback: Function): void {
    this.data.forEach((row, y) => {
      row.forEach((value, x) => {
        callback(value, x, y)
      })
    }
)}
  getRandomEmptyTileCoords(): { x: number, y: number } {
    const [h, w] = [this.data.length, this.data[0].length];
    let [x, y] = [Math.floor(Math.random() * w), Math.floor(Math.random() * h)]; 
    this.set(x, y, -1); 
    return { x, y };
  }

  // iteradores, búsqueda de vecinos, etc.
}