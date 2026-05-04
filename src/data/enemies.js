export const ENEMY_TYPES = {
  slime: {
    id: 'slime', name: '슬라임', color: '#44ff44',
    image: '/images/slime.png',
    hp: 30, speed: 1.5, damage: 5, exp: 5, radius: 14,
    minLevel: 1,
  },
  goblin: {
    id: 'goblin', name: '고블린', color: '#ff8844',
    image: '/images/goblin.png',
    hp: 20, speed: 2.5, damage: 8, exp: 7, radius: 12,
    minLevel: 2,
  },
  orc: {
    id: 'orc', name: '오크', color: '#884422',
    image: '/images/orc.png',
    hp: 80, speed: 1.0, damage: 15, exp: 15, radius: 20,
    minLevel: 4,
  },
  mage: {
    id: 'mage', name: '마법사', color: '#aa44ff',
    image: '/images/mage.png',
    hp: 40, speed: 1.2, damage: 12, exp: 12, radius: 13,
    minLevel: 5, ranged: true, preferredDist: 200,
  },
  boss: {
    id: 'boss', name: '보스', color: '#ff2222',
    image: '/images/boss.png',
    hp: 500, speed: 0.8, damage: 30, exp: 100, radius: 32,
    minLevel: 5, isBoss: true,
  },
}

export function getScaledStats(type, level) {
  const base = ENEMY_TYPES[type]
  return {
    ...base,
    hp: Math.floor(base.hp * (1 + level * 0.15)),
    speed: Math.min(base.speed * (1 + level * 0.05), 3.0),
    damage: Math.floor(base.damage * (1 + level * 0.10)),
  }
}

export function getAvailableTypes(level) {
  return Object.values(ENEMY_TYPES).filter(t => !t.isBoss && t.minLevel <= level)
}
