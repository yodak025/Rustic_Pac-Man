// infrastructure/loop.ts
export function createGameLoop(update: (delta: number) => void) {
  let running = true;
  let lastTime = performance.now();
  
  function loop() {
    if (!running) return;
    
    const now = performance.now();
    const delta = now - lastTime;
    lastTime = now;
    
    update(delta);
    requestAnimationFrame(loop);
  }
  
  loop();
  return () => { running = false; };
}