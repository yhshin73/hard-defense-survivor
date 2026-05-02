export class Player {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.radius = 16
    this.hp = 100
    this.maxHp = 100
    this.speed = 3
    this.atk = 10
    this.atkRange = 150
    this.atkInterval = 1.0
    this.atkTimer = 0

    // multipliers (modified by items)
    this.atkMultiplier = 1
    this.atkSpeedMultiplier = 1
    this.speedMultiplier = 1
    this.damageReduction = 0
    this.pierce = 0
    this.expRange = 60
    this.splitOnKill = false
    this.explosiveShots = 0
    this.multiShot = false

    this.invincibleTimer = 0
    this.dead = false
  }

  get effectiveAtk() { return Math.floor(this.atk * this.atkMultiplier) }
  get effectiveSpeed() { return Math.min(this.speed * this.speedMultiplier, 8) }
  get effectiveAtkInterval() { return Math.max(this.atkInterval / this.atkSpeedMultiplier, 0.2) }

  update(dt, input, canvasW, canvasH) {
    if (this.dead) return
    const { dx, dy } = input.getMovement()
    const spd = this.effectiveSpeed * 60 * dt
    this.x = Math.max(this.radius, Math.min(canvasW - this.radius, this.x + dx * spd))
    this.y = Math.max(this.radius, Math.min(canvasH - this.radius, this.y + dy * spd))

    this.atkTimer -= dt
    if (this.invincibleTimer > 0) this.invincibleTimer -= dt
  }

  tryShoot(enemies) {
    if (this.atkTimer > 0) return []
    const range = this.atkRange
    const inRange = enemies.filter(e => !e.dead && dist(this, e) <= range)
    if (inRange.length === 0) return []

    inRange.sort((a, b) => dist(this, a) - dist(this, b))
    const target = inRange[0]
    this.atkTimer = this.effectiveAtkInterval

    const projectiles = []
    const addProj = (tx, ty) => projectiles.push({ x: this.x, y: this.y, tx, ty })

    addProj(target.x, target.y)

    if (this.multiShot) {
      const angle = Math.atan2(target.y - this.y, target.x - this.x)
      const spread = Math.PI / 6
      addProj(
        this.x + Math.cos(angle + spread) * 200,
        this.y + Math.sin(angle + spread) * 200
      )
      addProj(
        this.x + Math.cos(angle - spread) * 200,
        this.y + Math.sin(angle - spread) * 200
      )
    }

    return projectiles
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
    // direction indicator
    ctx.beginPath()
    ctx.arc(this.x + 8, this.y - 6, 4, 0, Math.PI * 2)
    ctx.fillStyle = '#ffffff'
    ctx.fill()
    ctx.restore()
  }
}

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}
