export class DropItem {
  constructor(x, y, type) {
    this.x = x
    this.y = y
    this.type = type  // { id, name, icon, color, ... }
    this.radius = 12
    this.dead = false
    this._t = Math.random() * Math.PI * 2  // float phase offset
  }

  update(dt) {
    this._t += dt * 2.5
  }

  draw(ctx) {
    const bobY = Math.sin(this._t) * 3
    ctx.save()
    ctx.beginPath()
    ctx.arc(this.x, this.y + bobY, this.radius, 0, Math.PI * 2)
    ctx.fillStyle = this.type.color
    ctx.fill()
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 1.5
    ctx.stroke()
    ctx.font = '14px serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(this.type.icon, this.x, this.y + bobY)
    ctx.restore()
  }
}
