export const EXP_TABLE = [0, 50, 100, 180, 280, 400]

export function expToNextLevel(level) {
  if (level <= 5) return EXP_TABLE[level]
  return Math.floor(EXP_TABLE[5] * Math.pow(1.5, level - 5))
}

export function expPerKill(level) {
  if (level <= 5) return 4 + level
  return level * 2
}
