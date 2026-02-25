export class GameEngine {
  private rafId = 0;

  private lastTime = 0;

  private accumulator = 0;

  constructor(
    private readonly getTickInterval: () => number,
    private readonly onTick: () => void,
    private readonly onRender: () => void,
  ) {}

  start(): void {
    this.stop();
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.rafId = requestAnimationFrame(this.loop);
  }

  stop(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
  }

  private loop = (now: number): void => {
    const delta = now - this.lastTime;
    this.lastTime = now;
    this.accumulator += delta;

    const tickInterval = this.getTickInterval();
    while (this.accumulator >= tickInterval) {
      this.onTick();
      this.accumulator -= tickInterval;
    }

    this.onRender();
    this.rafId = requestAnimationFrame(this.loop);
  };
}
