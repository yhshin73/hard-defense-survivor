export class Player {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.radius = 16
    this.hp = 100
    this.maxHp = 100
    this.speed = 3
    this.damageReduction = 0
    this.expRange = 60
    this.invincibleTimer = 0
    this.dead = false
    // slow status (applied by ice_spear)
    this.slowTimer = 0
    this.slowFactor = 1
  }

  get effectiveSpeed() { return Math.min(this.speed * (this.slowTimer > 0 ? this.slowFactor : 1), 8) }

  update(dt, input, canvasW, canvasH) {
    if (this.dead) return
    if (this.slowTimer > 0) this.slowTimer -= dt

    const { dx, dy } = input.getMovement()
    const spd = this.effectiveSpeed * 60 * dt
    this.x = Math.max(this.radius, Math.min(canvasW - this.radius, this.x + dx * spd))
    this.y = Math.max(this.radius, Math.min(canvasH - this.radius, this.y + dy * spd))

    if (this.invincibleTimer > 0) this.invincibleTimer -= dt
  }

  takeDamage(dmg) {
    if (this.invincibleTimer > 0 || this.dead) return
    const actual = Math.max(1, Math.floor(dmg * (1 - this.damageReduction)))
    this.hp -= actual
    this.invincibleTimer = 0.5
    if (this.hp <= 0) { this.hp = 0; this.dead = true }
  }

  draw(ctx) {
    const flash = this.invincibleTimer > 0 && Math.floor(this.invincibleTimer * 10) % 2 === 0
    ctx.save()
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    ctx.fillStyle = flash ? '#ffffff' : '#00ccff'
    ctx.fill()
    ctx.strokeStyle = '#0088cc'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(this.x + 8, this.y - 6, 4, 0, Math.PI * 2)
    ctx.fillStyle = '#ffffff'
    ctx.fill()
    ctx.restore()
  }
}
