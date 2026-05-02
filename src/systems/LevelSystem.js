import { expToNextLevel } from '../data/items.js'

export class LevelSystem {
  constructor() {
    this.level = 1
    this.exp = 0
    this.expToNext = expToNextLevel(1)
    this.kills = 0
  }

  addExp(amount) {
    this.exp += amount
    const leveled = []
    while (this.exp >= this.expToNext) {
      this.exp -= this.expToNext
      this.level++
      this.expToNext = expToNextLevel(this.level)
      leveled.push(this.level)
    }
    return leveled
  }

  addKill() { this.kills++ }

  get expPercent() { return this.exp / this.expToNext }
}
