export const EXP_TABLE = [0, 50, 100, 180, 280, 400]
// EXP_TABLE[i] = EXP required to go from level i to i+1 (1-indexed, level 6+ uses 1.5x multiplier)

export function expToNextLevel(level) {
  if (level <= 5) return EXP_TABLE[level]
  return Math.floor(EXP_TABLE[5] * Math.pow(1.5, level - 5))
}

export function expPerKill(level) {
  if (level <= 5) return 4 + level
  return level * 2
}

export const RARITIES = {
  common: { name: '일반', color: '#aaaaaa' },
  rare: { name: '희귀', color: '#4488ff' },
  epic: { name: '에픽', color: '#aa44ff' },
  legendary: { name: '전설', color: '#ffaa00' },
}

export const ITEMS = [
  {
    id: 'power_up', name: '파워 업', icon: '⚔️',
    desc: '공격력 +20%', rarity: 'common', maxStack: 5,
    apply: (player) => { player.atkMultiplier = (player.atkMultiplier || 1) * 1.2 },
  },
  {
    id: 'rapid_fire', name: '속사', icon: '💨',
    desc: '공격 속도 +25%', rarity: 'rare', maxStack: 4,
    apply: (player) => { player.atkSpeedMultiplier = (player.atkSpeedMultiplier || 1) * 1.25 },
  },
  {
    id: 'piercing', name: '관통탄', icon: '🔱',
    desc: '투사체가 적을 관통', rarity: 'rare', maxStack: 3,
    apply: (player) => { player.pierce = (player.pierce || 0) + 1 },
  },
  {
    id: 'split_shot', name: '분열탄', icon: '✨',
    desc: '적 처치 시 투사체 2개 분열', rarity: 'epic', maxStack: 1,
    apply: (player) => { player.splitOnKill = true },
  },
  {
    id: 'heal', name: '체력 회복', icon: '❤️',
    desc: 'HP +30 즉시 회복', rarity: 'common', maxStack: Infinity,
    apply: (player) => { player.hp = Math.min(player.hp + 30, player.maxHp) },
  },
  {
    id: 'armor', name: '방어구', icon: '🛡️',
    desc: '받는 피해 -15%', rarity: 'rare', maxStack: 4,
    apply: (player) => { player.damageReduction = (player.damageReduction || 0) + 0.15 },
  },
  {
    id: 'max_hp', name: '체력 증가', icon: '💗',
    desc: '최대 HP +50', rarity: 'common', maxStack: 5,
    apply: (player) => { player.maxHp += 50; player.hp = Math.min(player.hp + 50, player.maxHp) },
  },
  {
    id: 'speed_boost', name: '속도 부스트', icon: '👟',
    desc: '이동 속도 +20%', rarity: 'common', maxStack: 3,
    apply: (player) => { player.speedMultiplier = (player.speedMultiplier || 1) * 1.2 },
  },
  {
    id: 'magnet', name: '자석', icon: '🧲',
    desc: 'EXP 흡수 범위 2배', rarity: 'rare', maxStack: 1,
    apply: (player) => { player.expRange *= 2 },
  },
  {
    id: 'explosive', name: '폭발탄', icon: '💥',
    desc: '범위 폭발 공격 추가', rarity: 'epic', maxStack: 2,
    apply: (player) => { player.explosiveShots = (player.explosiveShots || 0) + 1 },
  },
  {
    id: 'multi_shot', name: '멀티샷', icon: '🌟',
    desc: '3방향 동시 발사', rarity: 'legendary', maxStack: 1,
    apply: (player) => { player.multiShot = true },
  },
]
