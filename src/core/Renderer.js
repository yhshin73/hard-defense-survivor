export class Renderer {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.width = 800
    this.height = 600
    this._resize()
    window.addEventListener('resize', this._resize.bind(this))
  }

  _resize() {
    const vw = window.innerWidth
    const vh = window.innerHeight
    const scale = Math.min(vw / this.width, vh / this.height)
    this.canvas.width = this.width
    this.canvas.height = this.height
    this.canvas.style.width = `${this.width * scale}px`
    this.canvas.style.height = `${this.height * scale}px`
    this.canvas.style.position = 'absolute'
    this.canvas.style.left = `${(vw - this.width * scale) / 2}px`
    this.canvas.style.top = `${(vh - this.height * scale) / 2}px`
  }

  clear() {
    this.ctx.fillStyle = '#1a1a2e'
    this.ctx.fillRect(0, 0, this.width, this.height)
  }

  destroy() {
    window.removeEventListener('resize', this._resize.bind(this))
  }
}
