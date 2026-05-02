import { Enemy } from './Enemy.js'

export class BossEnemy extends Enemy {
  constructor(stats, x, y) {
    super(stats, x, y)
    this.chargeTimer = 5.0
    this.chargeActive = false
    this.chargeDx = 0
    this.chargeDy = 0
    this.chargeSpeed = 0
  }

  update(dt, player, enemies, canvasW, canvasH) {
    if (this.dead) return
    if (this.hitTimer > 0) this.hitTimer -= dt
    if (this.flashTimer > 0) this.flashTimer -= dt
    if (this.attackTimer > 0) this.attackTimer -= dt

    this.chargeTimer -= dt

    if (this.chargeTimer <= 0 && !this.chargeActive) {
      // start charge
      const dx = player.x - this.x
      const dy = player.y - this.y
      const d = Math.hypot(dx, dy) || 1
      this.chargeDx = dx / d
      this.chargeDy = dy / d
      this.chargeSpeed = this.speed * 5
      this.chargeActive = true
      this.chargeTimer = 0.6
    }

    if (this.chargeActive) {
      const spd = this.chargeSpeed * 60 * dt
      this.x = clamp(this.x + this.chargeDx * spd, this.radius, canvasW - this.radius)
      this.y = clamp(this.y + this.chargeDy * spd, this.radius, canvasH - this.radius)
      if (this.chargeTimer <= 0) {
        this.chargeActive = false
        this.chargeTimer = 5.0
      }
    } else {
      this._moveChase(this.speed * 60 * dt, player, canvasW, canvasH)
    }

    // melee
    const d = Math.hypot(player.x - this.x, player.y - this.y)
    if (d < this.radius + player.radius + 2 && this.attackTimer <= 0) {
      player.takeDamage(this.damage)
      this.attackTimer = 1.5
    }
  }
}

export class MageEnemy extends Enemy {
  constructor(stats, x, y) {
    super(stats, x, y)
    this.ranged = true
    this.preferredDist = 200
    this.projectileCooldown = 2.0
    this.projectileTimer = this.projectileCooldown
  }

  update(dt, player, enemies, canvasW, canvasH) {
    super.update(dt, player, enemies, canvasW, canvasH)
    if (this.dead) return
    this.projectileTimer -= dt
  }

  tryShoot(player) {
    if (this.dead || this.projectileTimer > 0) return null
    const d = Math.hypot(player.x - this.x, player.y - this.y)
    if (d > 300) return null
    this.projectileTimer = this.projectileCooldown
    return { x: this.x, y: this.y, tx: player.x, ty: player.y, fromEnemy: true, damage: this.damage }
  }
}

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)) }
