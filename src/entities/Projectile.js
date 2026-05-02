const SPEED = 400 // px/sec

export class Projectile {
  constructor(x, y, tx, ty, atk, pierce = 0, explosive = false, fromEnemy = false, damage = 0) {
    this.x = x
    this.y = y
    const d = Math.hypot(tx - x, ty - y) || 1
    this.vx = ((tx - x) / d) * SPEED
    this.vy = ((ty - y) / d) * SPEED
    this.atk = atk
    this.pierceLeft = pierce
    this.explosive = explosive
    this.fromEnemy = fromEnemy
    this.damage = damage // for enemy projectiles
    this.dead = false
    this.radius = fromEnemy ? 5 : 6
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
    ctx.fillStyle = this.fromEnemy ? '#ff4400' : (this.explosive ? '#ff8800' : '#ffff00')
    ctx.fill()
    if (this.explosive) {
      ctx.strokeStyle = '#ff4400'
      ctx.lineWidth = 2
      ctx.stroke()
    }
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
