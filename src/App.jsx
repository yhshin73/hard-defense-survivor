import React, { useRef, useEffect, useState, useCallback } from 'react'
import { GameLoop } from './core/GameLoop.js'
import { Renderer } from './core/Renderer.js'
import { InputManager } from './core/InputManager.js'
import { Player } from './entities/Player.js'
import { Projectile } from './entities/Projectile.js'
import { SpawnSystem } from './systems/SpawnSystem.js'
import { CollisionSystem } from './systems/CollisionSystem.js'
import { LevelSystem } from './systems/LevelSystem.js'
import { WeaponSystem } from './systems/WeaponSystem.js'
import { DropSystem } from './systems/DropSystem.js'
import { WEAPONS } from './data/weapons.js'
import { saveIfBest } from './systems/StorageSystem.js'
import { HUD } from './ui/HUD.jsx'
import { WeaponSelectModal } from './ui/WeaponSelectModal.jsx'
import { MainMenu } from './ui/MainMenu.jsx'
import { GameOver } from './ui/GameOver.jsx'
import { PauseMenu } from './ui/PauseMenu.jsx'
import { VirtualJoystick } from './ui/VirtualJoystick.jsx'

// screens: 'menu' | 'playing' | 'paused' | 'levelup' | 'gameover'

export default function App() {
  const canvasRef = useRef(null)
  const gameRef = useRef(null)
  const [screen, setScreen] = useState('menu')
  const [hudData, setHudData] = useState({
    hp: 100, maxHp: 100, expPercent: 0, level: 1, kills: 0, elapsed: 0,
    weapons: [], weaponUpgrades: {},
  })
  const [levelUpWeapons, setLevelUpWeapons] = useState([])
  const [gameOverData, setGameOverData] = useState(null)
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

  const startGame = useCallback(() => {
    if (gameRef.current) {
      gameRef.current.loop.stop()
    }

    const canvas = canvasRef.current
    const renderer = new Renderer(canvas)
    const input = new InputManager()
    const W = renderer.width
    const H = renderer.height
    const player = new Player(W / 2, H / 2)
    const spawnSystem = new SpawnSystem(W, H)
    const collisionSystem = new CollisionSystem()
    const levelSystem = new LevelSystem()
    const weaponSystem = new WeaponSystem()
    const dropSystem = new DropSystem()

    // 시작 기본 무기: 마법 지팡이
    weaponSystem.equip(WEAPONS.find(w => w.id === 'magic_wand'))

    let enemies = []
    let projectiles = []
    let expDrops = []
    let dropItems = []
    let elapsed = 0
    let paused = false
    let awaitingLevelUp = false

    const state = {
      renderer, input, player, spawnSystem, collisionSystem,
      levelSystem, weaponSystem, dropSystem,
      enemies, projectiles, expDrops, dropItems,
    }

    const handleLevelUp = (leveled) => {
      if (leveled.length === 0) return
      for (let i = 0; i < leveled.length; i++) {
        player.maxHp += 20
        player.hp = Math.min(player.hp + 20, player.maxHp)
      }
      awaitingLevelUp = true
      const choices = weaponSystem.getRandomChoices(3)
      setLevelUpWeapons(choices)
      setScreen('levelup')
    }

    const handleDropPickup = (drop) => {
      const extras = dropSystem.applyPickup(drop, player, state.enemies, state.expDrops, (expVal) => {
        const leveled = levelSystem.addExp(expVal)
        handleLevelUp(leveled)
      })
      if (extras && extras.length > 0) {
        state.dropItems = dropItems = [...dropItems, ...extras]
      }
    }

    const update = (dt) => {
      if (paused || awaitingLevelUp) return
      elapsed += dt

      player.update(dt, input, W, H)

      // weapon system fires and returns new projectiles
      const newProjs = weaponSystem.update(dt, player, state.enemies)
      for (const p of newProjs) projectiles.push(p)

      // enemy update
      for (const e of state.enemies) {
        e.update(dt, player, state.enemies, W, H)
        if (e.tryShoot) {
          const p = e.tryShoot(player)
          if (p) projectiles.push(new Projectile(p.x, p.y, p.tx, p.ty, 0, { fromEnemy: true, damage: p.damage }))
        }
      }

      // projectiles update
      for (const p of projectiles) p.update(dt, W, H)

      // drop items update
      for (const d of dropItems) d.update(dt)

      // spawn
      const spawned = spawnSystem.update(dt, levelSystem.level)
      state.enemies = enemies = [...enemies, ...spawned]

      // collision
      collisionSystem.update(
        dt, player, state.enemies, projectiles, expDrops,
        (expVal) => {
          const leveled = levelSystem.addExp(expVal)
          handleLevelUp(leveled)
        },
        dropItems,
        handleDropPickup,
      )

      // count new kills, spawn drops
      for (const e of state.enemies) {
        if (e.dead && !e._dropChecked) {
          e._dropChecked = true
          levelSystem.addKill()
          const drop = dropSystem.spawnFromKill(e.x, e.y)
          if (drop) dropItems.push(drop)
        }
      }

      // cull dead
      state.enemies = enemies = enemies.filter(e => !e.dead)
      state.projectiles = projectiles = projectiles.filter(p => !p.dead)
      state.expDrops = expDrops = expDrops.filter(d => !d.dead)
      state.dropItems = dropItems = dropItems.filter(d => !d.dead)

      // game over
      if (player.dead) {
        const result = saveIfBest(elapsed, levelSystem.kills)
        setGameOverData({
          elapsed, kills: levelSystem.kills, level: levelSystem.level, ...result,
        })
        setScreen('gameover')
        loop.stop()
        return
      }

      setHudData({
        hp: player.hp, maxHp: player.maxHp,
        expPercent: levelSystem.expPercent,
        level: levelSystem.level,
        kills: levelSystem.kills,
        elapsed,
        weapons: [...weaponSystem.equipped],
        weaponUpgrades: { ...weaponSystem.upgrades },
      })
    }

    const render = () => {
      renderer.clear()
      const ctx = renderer.ctx

      for (const d of state.expDrops) d.draw(ctx)
      for (const d of state.dropItems) d.draw(ctx)
      for (const e of state.enemies) e.draw(ctx)
      for (const p of state.projectiles) p.draw(ctx)
      for (const orb of weaponSystem.orbitals) orb.draw(ctx)
      weaponSystem.drawEffects(ctx)
      collisionSystem.drawExplosions(ctx)
      player.draw(ctx)
    }

    const loop = new GameLoop(update, render)

    gameRef.current = {
      loop, input, player, levelSystem, weaponSystem,
      getElapsed: () => elapsed,
      setPaused: (v) => { paused = v },
      setAwaitingLevelUp: (v) => { awaitingLevelUp = v },
      applyWeapon: (weapon) => {
        weaponSystem.equip(weapon)
        // link orbital owner to player
        for (const orb of weaponSystem.orbitals) {
          if (!orb.owner) orb.owner = player
        }
        awaitingLevelUp = false
        paused = false
        setScreen('playing')
      },
    }

    loop.start()
    setScreen('playing')
  }, [])

  // ESC key handler
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.code !== 'Escape') return
      if (screen === 'playing') {
        gameRef.current?.setPaused(true)
        setScreen('paused')
      } else if (screen === 'paused') {
        gameRef.current?.setPaused(false)
        setScreen('playing')
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [screen])

  const handleWeaponSelect = useCallback((weapon) => {
    gameRef.current?.applyWeapon(weapon)
  }, [])

  const handleResume = useCallback(() => {
    gameRef.current?.setPaused(false)
    setScreen('playing')
  }, [])

  const handleMenu = useCallback(() => {
    gameRef.current?.loop.stop()
    gameRef.current?.input.destroy()
    gameRef.current = null
    setScreen('menu')
  }, [])

  const handleJoystick = useCallback((dx, dy, active) => {
    gameRef.current?.input.setJoystick(dx, dy, active)
  }, [])

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#000', overflow: 'hidden' }}>
      <canvas ref={canvasRef} />

      {screen === 'menu' && <MainMenu onStart={startGame} />}

      {(screen === 'playing' || screen === 'levelup' || screen === 'paused') && (
        <HUD {...hudData} />
      )}

      {screen === 'levelup' && levelUpWeapons.length > 0 && (
        <WeaponSelectModal
          weapons={levelUpWeapons}
          upgrades={gameRef.current?.weaponSystem?.upgrades || {}}
          onSelect={handleWeaponSelect}
        />
      )}

      {screen === 'paused' && gameRef.current && (
        <PauseMenu
          player={gameRef.current.player}
          level={hudData.level}
          elapsed={hudData.elapsed}
          onResume={handleResume}
          onMenu={handleMenu}
        />
      )}

      {screen === 'gameover' && gameOverData && (
        <GameOver
          {...gameOverData}
          onRetry={startGame}
          onMenu={handleMenu}
        />
      )}

      {isMobile && screen === 'playing' && (
        <VirtualJoystick onMove={handleJoystick} />
      )}
    </div>
  )
}
