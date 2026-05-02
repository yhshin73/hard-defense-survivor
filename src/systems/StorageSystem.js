const KEY_BEST_TIME = 'sd_best_time'
const KEY_BEST_KILLS = 'sd_best_kills'

export function getBestTime() { return parseFloat(localStorage.getItem(KEY_BEST_TIME) || '0') }
export function getBestKills() { return parseInt(localStorage.getItem(KEY_BEST_KILLS) || '0') }

export function saveIfBest(survivalTime, kills) {
  const prevTime = getBestTime()
  const prevKills = getBestKills()
  const newBestTime = survivalTime > prevTime
  const newBestKills = kills > prevKills
  if (newBestTime) localStorage.setItem(KEY_BEST_TIME, survivalTime.toFixed(1))
  if (newBestKills) localStorage.setItem(KEY_BEST_KILLS, kills)
  return { newBestTime, newBestKills }
}
