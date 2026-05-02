import { ITEMS } from '../data/items.js'

export class ItemSystem {
  constructor() {
    this.acquired = {} // itemId -> count
  }

  getRandomChoices(count = 3) {
    const available = ITEMS.filter(item => {
      const cur = this.acquired[item.id] || 0
      return cur < item.maxStack
    })
    if (available.length === 0) return []
    const shuffled = [...available].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, Math.min(count, shuffled.length))
  }

  apply(item, player) {
    this.acquired[item.id] = (this.acquired[item.id] || 0) + 1
    item.apply(player)
  }
}
