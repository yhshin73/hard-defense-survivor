import { Enemy } from '../entities/Enemy.js'
import { BossEnemy, MageEnemy } from '../entities/EnemyTypes.js'
import { getScaledStats, getAvailableTypes, ENEMY_TYPES } from '../data/enemies.js'

export class SpawnSystem {
  constructor(canvasW, canvasH) {
    this.canvasW = canvasW
    this.canvasH = canvasH
    this.timer = 0
    this.bossSpawnedLevels = new Set()
    this.elapsedTime = 0
  }

  get spawnInterval() {
    // starts at 3s, -0.1s every 30s of play, min 0.5s
    return Math.max(3.0 - Math.floor(this.elapsedTime / 30) * 0.1, 0.5)
  }

  get maxSpawnCount() {
    return Math.min(1 + Math.floor(this.elapsedTime / 30), 6)
  }

  update(dt, level) {
    this.elapsedTime += dt
    this.timer -= dt
    const spawned = []

    // boss check
    const bossLevel = Math.floor(level / 5) * 5
    if (bossLevel >= 5 && !this.bossSpawnedLevels.has(bossLevel)) {
      this.bossSpawnedLevels.add(bossLevel)
      spawned.push(this._spawnBoss(level))
    }

    if (this.timer <= 0) {
      this.timer = this.spawnInterval
      const count = this.maxSpawnCount
      for (let i = 0; i < count; i++) {
        spawned.push(this._spawnRandom(level))
      }
    }

    return spawned.filter(Boolean)
  }

  _randomEdgePos() {
    const margin = 30 + Math.random() * 30
    const side = Math.floor(Math.random() * 4)
    switch (side) {
      case 0: return { x: Math.random() * this.canvasW, y: -margin }
      case 1: return { x: Math.random() * this.canvasW, y: this.canvasH + margin }
      case 2: return { x: -margin, y: Math.random() * this.canvasH }
      default: return { x: this.canvasW + margin, y: Math.random() * this.canvasH }
    }
  }

  _spawnRandom(level) {
    const types = getAvailableTypes(level)
    const type = types[Math.floor(Math.random() * types.length)]
    const { x, y } = this._randomEdgePos()
    const stats = getScaledStats(type.id, level)

    if (type.id === 'mage') return new MageEnemy(stats, x, y)
    return new Enemy(stats, x, y)
  }

  _spawnBoss(level) {
    const { x, y } = this._randomEdgePos()
    const stats = getScaledStats('boss', level)
    return new BossEnemy(stats, x, y)
  }
}
