export class GameLoop {
  constructor(update, render) {
    this.update = update
    this.render = render
    this.rafId = null
    this.lastTime = 0
    this.running = false
  }

  start() {
    this.running = true
    this.lastTime = performance.now()
    this.rafId = requestAnimationFrame(this._tick.bind(this))
  }

  stop() {
    this.running = false
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  _tick(timestamp) {
    if (!this.running) return
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05) // cap at 50ms
    this.lastTime = timestamp
    this.update(dt)
    this.render()
    this.rafId = requestAnimationFrame(this._tick.bind(this))
  }
}
