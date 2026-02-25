export class GameEngine {
    constructor(getTickInterval, onTick, onRender) {
        Object.defineProperty(this, "getTickInterval", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: getTickInterval
        });
        Object.defineProperty(this, "onTick", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: onTick
        });
        Object.defineProperty(this, "onRender", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: onRender
        });
        Object.defineProperty(this, "rafId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "lastTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "accumulator", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "loop", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (now) => {
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
            }
        });
    }
    start() {
        this.stop();
        this.lastTime = performance.now();
        this.accumulator = 0;
        this.rafId = requestAnimationFrame(this.loop);
    }
    stop() {
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = 0;
        }
    }
}
