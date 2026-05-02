export class InputManager {
  constructor() {
    this.keys = {}
    this.joystick = { dx: 0, dy: 0, active: false }
    this._onKeyDown = this._onKeyDown.bind(this)
    this._onKeyUp = this._onKeyUp.bind(this)
    window.addEventListener('keydown', this._onKeyDown)
    window.addEventListener('keyup', this._onKeyUp)
  }

  _onKeyDown(e) { this.keys[e.code] = true }
  _onKeyUp(e) { this.keys[e.code] = false }

  getMovement() {
    if (this.joystick.active) {
      return { dx: this.joystick.dx, dy: this.joystick.dy }
    }
    let dx = 0, dy = 0
    if (this.keys['KeyW'] || this.keys['ArrowUp']) dy -= 1
    if (this.keys['KeyS'] || this.keys['ArrowDown']) dy += 1
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) dx -= 1
    if (this.keys['KeyD'] || this.keys['ArrowRight']) dx += 1
    if (dx !== 0 && dy !== 0) {
      const len = Math.sqrt(2)
      dx /= len; dy /= len
    }
    return { dx, dy }
  }

  isEscPressed() { return !!this.keys['Escape'] }

  setJoystick(dx, dy, active) {
    this.joystick = { dx, dy, active }
  }

  destroy() {
    window.removeEventListener('keydown', this._onKeyDown)
    window.removeEventListener('keyup', this._onKeyUp)
  }
}
