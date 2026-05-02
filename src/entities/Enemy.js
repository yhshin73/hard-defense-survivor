export class Enemy {
  constructor(stats, x, y) {
    Object.assign(this, stats)
    this.x = x
    this.y = y
    this.maxHp = stats.hp
    this.hitTimer = 0
    this.flashTimer = 0
    this.dead = false
    this.attackTimer = 1.0
    // disperse AI
    this.disperseAngle = Math.random() * Math.PI * 2
  }

  update(dt, player, enemies, canvasW, canvasH) {
    if (this.dead) return
    if (this.hitTimer > 0) this.hitTimer -= dt
    if (this.flashTimer > 0) this.flashTimer -= dt
    this.attackTimer -= dt

    this._move(dt, player, enemies, canvasW, canvasH)

    // melee attack
    if (!this.ranged) {
      const d = dist(this, player)
      if (d < this.radius + player.radius + 2 && this.attackTimer <= 0) {
        player.takeDamage(this.damage)
        this.attackTimer = 1.0
      }
    }
  }

  _move(dt, player, enemies, canvasW, canvasH) {
    if (this.hitTimer > 0) return
    const spd = this.speed * 60 * dt

    if (this.ranged) {
      this._moveRanged(spd, player, canvasW, canvasH)
    } else {
      this._moveChase(spd, player, canvasW, canvasH)
    }
  }

  _moveChase(spd, player, canvasW, canvasH) {
    const dx = player.x - this.x
    const dy = player.y - this.y
    const d = Math.hypot(dx, dy) || 1
    this.x = clamp(this.x + (dx / d) * spd, this.radius, canvasW - this.radius)
    this.y = clamp(this.y + (dy / d) * spd, this.radius, canvasH - this.radius)
  }

  _moveRanged(spd, player, canvasW, canvasH) {
    const dx = player.x - this.x
    const dy = player.y - this.y
    const d = Math.hypot(dx, dy) || 1
    const preferred = this.preferredDist || 200
    const diff = d - preferred

    if (Math.abs(diff) > 20) {
      const dir = diff > 0 ? 1 : -1
      this.x = clamp(this.x + (dx / d) * spd * dir, this.radius, canvasW - this.radius)
      this.y = clamp(this.y + (dy / d) * spd * dir, this.radius, canvasH - this.radius)
    }
  }

  takeDamage(dmg) {
    if (this.dead) return
    this.hp -= dmg
    this.flashTimer = 0.15
    this.hitTimer = 0.1
    if (this.hp <= 0) { this.hp = 0; this.dead = true }
  }

  draw(ctx) {
    const flash = this.flashTimer > 0
    ctx.save()
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    ctx.fillStyle = flash ? '#ffffff' : this.color
    ctx.fill()

    if (this.isBoss) {
      ctx.strokeStyle = '#ff0000'
      ctx.lineWidth = 3
      ctx.stroke()
    }

    // HP bar
    const bw = this.radius * 2
    const bh = 4
    const bx = this.x - this.radius
    const by = this.y - this.radius - 8
    ctx.fillStyle = '#333'
    ctx.fillRect(bx, by, bw, bh)
    ctx.fillStyle = this.isBoss ? '#ff4400' : '#ff2222'
    ctx.fillRect(bx, by, bw * (this.hp / this.maxHp), bh)

    ctx.restore()
  }
}

function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y) }
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)) }
