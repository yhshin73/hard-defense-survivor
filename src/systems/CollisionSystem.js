import { Projectile, ExpDrop, drawExplosion } from '../entities/Projectile.js'

const EXPLOSION_RADIUS = 80

export class CollisionSystem {
  constructor() {
    this.explosions = [] // { x, y, timer }
  }

  update(dt, player, enemies, projectiles, expDrops, onExpGain) {
    // player projectiles vs enemies
    for (const proj of projectiles) {
      if (proj.dead || proj.fromEnemy) continue
      for (const enemy of enemies) {
        if (enemy.dead || proj.hitEnemies.has(enemy)) continue
        if (circleHit(proj, enemy)) {
          const wasAlive = !enemy.dead
          enemy.takeDamage(proj.atk)
          proj.hitEnemies.add(enemy)

          if (proj.explosive && !proj.dead) {
            this.explosions.push({ x: enemy.x, y: enemy.y, timer: 0.3 })
            for (const e2 of enemies) {
              if (!e2.dead && e2 !== enemy) {
                const d = Math.hypot(e2.x - enemy.x, e2.y - enemy.y)
                if (d < EXPLOSION_RADIUS) e2.takeDamage(Math.floor(proj.atk * 0.6))
              }
            }
          }

          if (proj.pierceLeft > 0) {
            proj.pierceLeft--
          } else {
            proj.dead = true
          }

          if (wasAlive && enemy.dead) {
            // enemy died from this hit
            expDrops.push(new ExpDrop(enemy.x, enemy.y, enemy.exp))
            if (player.splitOnKill) {
              this._spawnSplitProjectiles(proj, enemy, projectiles, player)
            }
          }
        }
      }
    }

    // enemy projectiles vs player
    for (const proj of projectiles) {
      if (proj.dead || !proj.fromEnemy) continue
      if (circleHit(proj, player)) {
        player.takeDamage(proj.damage)
        proj.dead = true
      }
    }

    // exp drops vs player
    const absorbRange = player.expRange
    for (const drop of expDrops) {
      if (drop.dead) continue
      const d = Math.hypot(drop.x - player.x, drop.y - player.y)
      if (d < absorbRange) {
        drop.dead = true
        onExpGain(drop.value)
      }
    }

    // update explosion timers
    this.explosions = this.explosions.filter(e => {
      e.timer -= dt
      return e.timer > 0
    })
  }

  drawExplosions(ctx) {
    for (const e of this.explosions) {
      const alpha = e.timer / 0.3
      const radius = EXPLOSION_RADIUS * (1 - alpha * 0.5 + 0.5)
      ctx.globalAlpha = alpha
      drawExplosion(ctx, e.x, e.y, radius)
      ctx.globalAlpha = 1
    }
  }

  _spawnSplitProjectiles(proj, enemy, projectiles, player) {
    const angles = [Math.PI / 4, -Math.PI / 4]
    const baseAngle = Math.atan2(proj.vy, proj.vx)
    for (const offset of angles) {
      const a = baseAngle + offset
      const tx = enemy.x + Math.cos(a) * 200
      const ty = enemy.y + Math.sin(a) * 200
      projectiles.push(new Projectile(enemy.x, enemy.y, tx, ty, player.effectiveAtk, 0, false))
    }
  }
}

function circleHit(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y) < (a.radius || 6) + (b.radius || 16)
}
