import { ExpDrop, drawExplosion } from '../entities/Projectile.js'

const EXPLOSION_RADIUS = 80

export class CollisionSystem {
  constructor() {
    this.explosions = [] // { x, y, timer }
  }

  // dropItems and onDropPickup are optional
  update(dt, player, enemies, projectiles, expDrops, onExpGain, dropItems, onDropPickup) {
    // player projectiles vs enemies
    for (const proj of projectiles) {
      if (proj.dead || proj.fromEnemy) continue
      for (const enemy of enemies) {
        if (enemy.dead || proj.hitEnemies.has(enemy)) continue
        if (circleHit(proj, enemy)) {
          const wasAlive = !enemy.dead
          enemy.takeDamage(proj.atk)
          proj.hitEnemies.add(enemy)

          // slow effect (ice_spear)
          if (proj.slow > 0) {
            enemy.slowTimer = Math.max(enemy.slowTimer || 0, proj.slowDuration || 2)
            enemy.slowFactor = 1 - proj.slow
          }

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
            expDrops.push(new ExpDrop(enemy.x, enemy.y, enemy.exp))
          }

          // thunder lance chain
          if (proj.chain && wasAlive) {
            const chainTarget = _nearestAlive(enemy, enemies, 120)
            if (chainTarget) {
              chainTarget.takeDamage(Math.floor(proj.atk * 0.7))
              if (chainTarget.dead) {
                expDrops.push(new ExpDrop(chainTarget.x, chainTarget.y, chainTarget.exp))
              }
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
      if (Math.hypot(drop.x - player.x, drop.y - player.y) < absorbRange) {
        drop.dead = true
        onExpGain(drop.value)
      }
    }

    // ground drop items vs player
    if (dropItems && onDropPickup) {
      for (const drop of dropItems) {
        if (drop.dead) continue
        if (Math.hypot(drop.x - player.x, drop.y - player.y) < player.radius + drop.radius) {
          drop.dead = true
          onDropPickup(drop)
        }
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
}

function circleHit(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y) < (a.radius || 6) + (b.radius || 16)
}

function _nearestAlive(origin, enemies, maxDist) {
  let best = null, bestD = maxDist
  for (const e of enemies) {
    if (e.dead || e === origin) continue
    const d = Math.hypot(e.x - origin.x, e.y - origin.y)
    if (d < bestD) { bestD = d; best = e }
  }
  return best
}
