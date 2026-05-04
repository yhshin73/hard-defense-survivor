const DEFAULT_SPEED = 400 // px/sec

export class Projectile {
  constructor(x, y, tx, ty, atk, options = {}) {
    this.x = x
    this.y = y
    const d = Math.hypot(tx - x, ty - y) || 1
    const speed = options.speed || DEFAULT_SPEED
    this.vx = ((tx - x) / d) * speed
    this.vy = ((ty - y) / d) * speed
    this.atk = atk
    this.pierceLeft = options.pierce || 0
    this.explosive = options.explosive || false
    this.fromEnemy = options.fromEnemy || false
    this.damage = options.damage || 0
    this.slow = options.slow || 0
    this.slowDuration = options.slowDuration || 0
    this.chain = options.chain || false
    this.lifesteal = options.lifesteal || 0
    this.weaponType = options.weaponType || 'default'
    this.color = options.color || (options.fromEnemy ? '#ff4400' : '#ffff00')
    this.radius = options.radius || (options.fromEnemy ? 5 : 6)
    this.dead = false
    this.hitEnemies = new Set()
  }

  update(dt, canvasW, canvasH) {
    this.x += this.vx * dt
    this.y += this.vy * dt
    if (this.x < -20 || this.x > canvasW + 20 || this.y < -20 || this.y > canvasH + 20) {
      this.dead = true
    }
  }

  draw(ctx) {
    ctx.save()
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    ctx.fillStyle = this.color
    ctx.fill()
    if (this.explosive) {
      ctx.strokeStyle = '#ff2200'
      ctx.lineWidth = 2
      ctx.stroke()
    }
    ctx.restore()
  }
}

// Orbital weapon projectile — stays attached to owner and rotates
export class OrbitalProjectile {
  constructor(owner, orbitRadius, angleOffset, weapon) {
    this.owner = owner
    this.orbitRadius = orbitRadius
    this.angle = angleOffset
    this.weapon = weapon
    this.orbitSpeed = weapon.orbitSpeed || 2.0
    this.atk = weapon.baseDamage
    this.color = weapon.color || '#ffffff'
    this.radius = weapon.radius || 10
    this.lifesteal = weapon.lifesteal || 0
    this._tickTimer = 0
    this._tickInterval = weapon.cooldown || 0.35
    this.dead = false
  }

  get x() { return this.owner.x + Math.cos(this.angle) * this.orbitRadius }
  get y() { return this.owner.y + Math.sin(this.angle) * this.orbitRadius }

  // Returns list of enemies hit this tick
  update(dt, enemies) {
    this.angle += this.orbitSpeed * dt
    this._tickTimer += dt
    const hits = []
    if (this._tickTimer >= this._tickInterval) {
      this._tickTimer = 0
      for (const e of enemies) {
        if (e.dead) continue
        if (Math.hypot(e.x - this.x, e.y - this.y) < this.radius + e.radius) {
          hits.push(e)
        }
      }
    }
    return hits
  }

  draw(ctx) {
    ctx.save()
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    ctx.fillStyle = this.color
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.restore()
  }
}

export class ExpDrop {
  constructor(x, y, value) {
    this.x = x
    this.y = y
    this.value = value
    this.radius = 6
    this.dead = false
  }

  draw(ctx) {
    ctx.save()
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    ctx.fillStyle = '#00ffaa'
    ctx.fill()
    ctx.strokeStyle = '#00cc88'
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.restore()
  }
}

export function drawExplosion(ctx, x, y, radius) {
  ctx.save()
  const grad = ctx.createRadialGradient(x, y, 0, x, y, radius)
  grad.addColorStop(0, 'rgba(255,200,0,0.8)')
  grad.addColorStop(1, 'rgba(255,50,0,0)')
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fillStyle = grad
  ctx.fill()
  ctx.restore()
}
