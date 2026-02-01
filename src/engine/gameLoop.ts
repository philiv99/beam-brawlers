/**
 * Beam Brawlers - Game Loop
 * Fixed timestep game loop with interpolation
 */

export interface GameLoopCallbacks {
  update: (deltaTime: number) => void;
  render: (interpolation: number) => void;
}

export class GameLoop {
  private callbacks: GameLoopCallbacks;
  private isRunning: boolean = false;
  private animationFrameId: number | null = null;
  
  // Timing
  private readonly fixedTimeStep: number; // seconds
  private readonly maxDeltaTime: number = 0.25; // Cap to prevent spiral of death
  private accumulator: number = 0;
  private lastTime: number = 0;
  
  // Performance tracking
  private fps: number = 0;
  private frameCount: number = 0;
  private fpsTimer: number = 0;

  constructor(
    callbacks: GameLoopCallbacks,
    updatesPerSecond: number = 60
  ) {
    this.callbacks = callbacks;
    this.fixedTimeStep = 1 / updatesPerSecond;
    this.tick = this.tick.bind(this);
  }

  /**
   * Start the game loop
   */
  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastTime = performance.now() / 1000;
    this.accumulator = 0;
    this.animationFrameId = requestAnimationFrame(this.tick);
  }

  /**
   * Stop the game loop
   */
  stop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Pause updates (render continues)
   */
  pause(): void {
    // Handled by game state, not loop
  }

  /**
   * Get current FPS
   */
  getFPS(): number {
    return this.fps;
  }

  private tick(currentTimeMs: number): void {
    if (!this.isRunning) return;

    const currentTime = currentTimeMs / 1000;
    let deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Cap delta time to prevent spiral of death
    if (deltaTime > this.maxDeltaTime) {
      deltaTime = this.maxDeltaTime;
    }

    // Update FPS counter
    this.frameCount++;
    this.fpsTimer += deltaTime;
    if (this.fpsTimer >= 1) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.fpsTimer -= 1;
    }

    // Accumulate time
    this.accumulator += deltaTime;

    // Fixed timestep updates
    while (this.accumulator >= this.fixedTimeStep) {
      this.callbacks.update(this.fixedTimeStep);
      this.accumulator -= this.fixedTimeStep;
    }

    // Render with interpolation factor
    const interpolation = this.accumulator / this.fixedTimeStep;
    this.callbacks.render(interpolation);

    // Schedule next frame
    this.animationFrameId = requestAnimationFrame(this.tick);
  }
}
