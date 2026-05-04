import { WEAPONS } from '../data/weapons.js'
import { Projectile, OrbitalProjectile } from '../entities/Projectile.js'

const EXPLOSION_RADIUS = 80

export class WeaponSystem {
  constructor() {
    this.equipped = []        // weapon runtime objects { def, damage, cooldown }
    this.timers = {}          // weaponId → remaining cooldown
    this.upgrades = {}        // weaponId → upgrade count
    this.orbitals = []        // OrbitalProjectile[]
    // sweep/aura/trap visual effects
    this.effects = []         // { type, x, y, radius, timer, maxTimer, color }
    this.trapZones = []       // { x, y, radius, damage, timer, tickTimer, color }
  }

  equip(weaponDef) {
    const existing = this.equipped.find(w => w.def.id === weaponDef.id)
    if (existing) {
      // upgrade
      existing.damage = Math.floor(existing.damage * 1.15)
      existing.cooldown = existing.cooldown * 0.9
      this.upgrades[weaponDef.id] = (this.upgrades[weaponDef.id] || 0) + 1
      // sync orbital damage if applicable
      for (const orb of this.orbitals) {
        if (orb._weaponRuntime === existing) orb.atk = existing.damage
      }
    } else {
      const runtime = {
        def: weaponDef,
        damage: weaponDef.baseDamage,
        cooldown: weaponDef.cooldown,
      }
      this.equipped.push(runtime)
      this.timers[weaponDef.id] = 0
      this.upgrades[weaponDef.id] = 0
      // spawn orbital slots if needed
      if (weaponDef.pattern === 'orbital') {
        this._spawnOrbital(runtime)
      }
    }
  }

  getRandomChoices(count) {
    const choices = []
    // prefer unequipped weapons first
    const unequipped = WEAPONS.filter(w => !this.equipped.find(e => e.def.id === w.id))
    const equipped = this.equipped.map(e => e.def)

    const pool = [...unequipped, ...equipped]
    const seen = new Set()
    while (choices.length < count && pool.length > 0) {
      const idx = Math.floor(Math.random() * pool.length)
      const w = pool.splice(idx, 1)[0]
      if (!seen.has(w.id)) {
        seen.add(w.id)
        choices.push(w)
      }
    }
    return choices
  }

  // Returns new Projectile[] to add to main projectiles array
  update(dt, player, enemies) {
    const newProjectiles = []

    // orbital update
    for (const orb of this.orbitals) {
      const hits = orb.update(dt, enemies)
      for (const e of hits) {
        const wasAlive = !e.dead
        e.takeDamage(orb.atk)
        if (orb.lifesteal > 0 && wasAlive) {
          player.hp = Math.min(player.hp + orb.atk * orb.lifesteal, player.maxHp)
        }
      }
    }

    // trap zones update
    for (const trap of this.trapZones) {
      trap.timer -= dt
      trap.tickTimer -= dt
      if (trap.tickTimer <= 0) {
        trap.tickTimer = 0.5
        for (const e of enemies) {
          if (e.dead) continue
          if (Math.hypot(e.x - trap.x, e.y - trap.y) < trap.radius + e.radius) {
            e.takeDamage(trap.damage)
            e.slowTimer = Math.max(e.slowTimer || 0, 0.5)
            e.slowFactor = 0
          }
        }
      }
    }
    this.trapZones = this.trapZones.filter(t => t.timer > 0)

    // effects timer
    this.effects = this.effects.filter(ef => {
      ef.timer -= dt
      return ef.timer > 0
    })

    // regular weapon cooldowns
    for (const weapon of this.equipped) {
      if (weapon.def.pattern === 'orbital') continue // handled above
      this.timers[weapon.def.id] = (this.timers[weapon.def.id] || 0) - dt
      if (this.timers[weapon.def.id] <= 0) {
        this.timers[weapon.def.id] = weapon.cooldown
        const fired = this._fireWeapon(weapon, player, enemies)
        newProjectiles.push(...fired)
      }
    }

    return newProjectiles
  }

  _fireWeapon(weapon, player, enemies) {
    switch (weapon.def.pattern) {
      case 'projectile': return this._fireProjectile(weapon, player, enemies)
      case 'sweep':      this._fireSweep(weapon, player, enemies); return []
      case 'aura':       this._fireAura(weapon, player, enemies); return []
      case 'trap':       this._fireTrap(weapon, player, enemies); return []
      default: return []
    }
  }

  _fireProjectile(weapon, player, enemies) {
    const def = weapon.def
    const target = _nearest(player, enemies)
    if (!target) return []

    const tx = def.id === 'bomb_throw' ? target.x + (Math.random() - 0.5) * 40 : target.x
    const ty = def.id === 'bomb_throw' ? target.y + (Math.random() - 0.5) * 40 : target.y

    const proj = new Projectile(player.x, player.y, tx, ty, weapon.damage, {
      speed: def.speed,
      pierce: def.pierce || 0,
      explosive: def.explosive || false,
      slow: def.slow || 0,
      slowDuration: def.slowDuration || 0,
      chain: def.chain || false,
      weaponType: def.id,
      color: def.color,
      radius: def.radius,
    })
    return [proj]
  }

  _fireSweep(weapon, player, enemies) {
    const def = weapon.def
    const sweepAngle = def.sweepAngle || Math.PI
    const sweepRadius = def.sweepRadius || 100

    // aim toward nearest enemy or last move direction
    const target = _nearest(player, enemies)
    const aimAngle = target
      ? Math.atan2(target.y - player.y, target.x - player.x)
      : -Math.PI / 2

    for (const e of enemies) {
      if (e.dead) continue
      const d = Math.hypot(e.x - player.x, e.y - player.y)
      if (d > sweepRadius + e.radius) continue
      const angle = Math.atan2(e.y - player.y, e.x - player.x)
      let diff = angle - aimAngle
      while (diff > Math.PI) diff -= Math.PI * 2
      while (diff < -Math.PI) diff += Math.PI * 2
      if (Math.abs(diff) <= sweepAngle / 2) {
        e.takeDamage(weapon.damage)
      }
    }

    this.effects.push({
      type: 'sweep',
      x: player.x, y: player.y,
      aimAngle, sweepAngle, sweepRadius,
      timer: 0.25, maxTimer: 0.25,
      color: def.color || '#884422',
    })
  }

  _fireAura(weapon, player, enemies) {
    const auraRadius = weapon.def.auraRadius || 100
    for (const e of enemies) {
      if (e.dead) continue
      if (Math.hypot(e.x - player.x, e.y - player.y) < auraRadius + e.radius) {
        e.takeDamage(weapon.damage)
      }
    }
    this.effects.push({
      type: 'aura',
      x: player.x, y: player.y,
      radius: auraRadius,
      timer: weapon.def.cooldown * 0.8,
      maxTimer: weapon.def.cooldown * 0.8,
      color: weapon.def.color || '#ffffaa',
    })
  }

  _fireTrap(weapon, player, enemies) {
    const target = _nearest(player, enemies)
    const tx = target ? target.x : player.x
    const ty = target ? target.y : player.y

    this.trapZones.push({
      x: tx, y: ty,
      radius: weapon.def.trapRadius || 80,
      damage: weapon.damage,
      timer: weapon.def.trapDuration || 2.0,
      tickTimer: 0,
      color: weapon.def.color || '#44cc44',
    })
  }

  _spawnOrbital(weapon) {
    const existingCount = this.orbitals.filter(o => o.weapon.def.id === weapon.def.id).length
    const angleOffset = (Math.PI * 2 / (existingCount + 1)) * existingCount
    const orb = new OrbitalProjectile(null, weapon.def.orbitRadius, angleOffset, {
      ...weapon.def,
      baseDamage: weapon.damage,
    })
    // orbital needs owner reference — set via update or keep as closure
    orb._weaponRuntime = weapon
    // Override x/y getters to use weapon.def dynamically — we'll patch owner in update
    // Instead store ownerRef separately
    this.orbitals.push(orb)
  }

  // Draw weapon effects (sweep arcs, aura rings, trap zones)
  drawEffects(ctx) {
    for (const ef of this.effects) {
      const alpha = ef.timer / ef.maxTimer
      ctx.save()
      ctx.globalAlpha = alpha * 0.4

      if (ef.type === 'sweep') {
        ctx.beginPath()
        ctx.moveTo(ef.x, ef.y)
        ctx.arc(ef.x, ef.y, ef.sweepRadius, ef.aimAngle - ef.sweepAngle / 2, ef.aimAngle + ef.sweepAngle / 2)
        ctx.closePath()
        ctx.fillStyle = ef.color
        ctx.fill()
      } else if (ef.type === 'aura') {
        ctx.beginPath()
        ctx.arc(ef.x, ef.y, ef.radius, 0, Math.PI * 2)
        ctx.strokeStyle = ef.color
        ctx.lineWidth = 3
        ctx.stroke()
      }

      ctx.restore()
    }

    for (const trap of this.trapZones) {
      ctx.save()
      ctx.globalAlpha = 0.3
      ctx.beginPath()
      ctx.arc(trap.x, trap.y, trap.radius, 0, Math.PI * 2)
      ctx.fillStyle = trap.color
      ctx.fill()
      ctx.strokeStyle = trap.color
      ctx.lineWidth = 2
      ctx.globalAlpha = 0.7
      ctx.stroke()
      ctx.restore()
    }
  }
}

function _nearest(player, enemies) {
  let best = null
  let bestD = Infinity
  for (const e of enemies) {
    if (e.dead) continue
    const d = Math.hypot(e.x - player.x, e.y - player.y)
    if (d < bestD) { bestD = d; best = e }
  }
  return best
}
