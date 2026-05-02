import React, { useRef, useEffect, useState, useCallback } from 'react'
import { GameLoop } from './core/GameLoop.js'
import { Renderer } from './core/Renderer.js'
import { InputManager } from './core/InputManager.js'
import { Player } from './entities/Player.js'
import { Projectile } from './entities/Projectile.js'
import { SpawnSystem } from './systems/SpawnSystem.js'
import { CollisionSystem } from './systems/CollisionSystem.js'
import { LevelSystem } from './systems/LevelSystem.js'
import { ItemSystem } from './systems/ItemSystem.js'
import { saveIfBest } from './systems/StorageSystem.js'
import { expPerKill } from './data/items.js'
import { HUD } from './ui/HUD.jsx'
import { ItemSelectModal } from './ui/ItemSelectModal.jsx'
import { MainMenu } from './ui/MainMenu.jsx'
import { GameOver } from './ui/GameOver.jsx'
import { PauseMenu } from './ui/PauseMenu.jsx'
import { VirtualJoystick } from './ui/VirtualJoystick.jsx'

// screens: 'menu' | 'playing' | 'paused' | 'levelup' | 'gameover'

export default function App() {
  const canvasRef = useRef(null)
  const gameRef = useRef(null)
  const [screen, setScreen] = useState('menu')
  const [hudData, setHudData] = useState({ hp: 100, maxHp: 100, expPercent: 0, level: 1, kills: 0, elapsed: 0 })
  const [levelUpItems, setLevelUpItems] = useState([])
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
    const itemSystem = new ItemSystem()

    let enemies = []
    let projectiles = []
    let expDrops = []
    let elapsed = 0
    let paused = false
    let awaitingLevelUp = false

    const state = {
      renderer, input, player, spawnSystem, collisionSystem,
      levelSystem, itemSystem, enemies, projectiles, expDrops,
    }

    const update = (dt) => {
      if (paused || awaitingLevelUp) return
      elapsed += dt

      // ESC toggle pause
      if (input.isEscPressed()) {
        // handled via keyup event to avoid repeat
      }

      player.update(dt, input, W, H)

      // shooting
      const shots = player.tryShoot(enemies)
      for (const s of shots) {
        projectiles.push(new Projectile(
          s.x, s.y, s.tx, s.ty,
          player.effectiveAtk,
          player.pierce,
          player.explosiveShots > 0,
        ))
      }

      // enemy update
      for (const e of enemies) {
        e.update(dt, player, enemies, W, H)
        // mage projectile
        if (e.tryShoot) {
          const p = e.tryShoot(player)
          if (p) projectiles.push(new Projectile(p.x, p.y, p.tx, p.ty, 0, 0, false, true, p.damage))
        }
      }

      // projectiles update
      for (const p of projectiles) p.update(dt, W, H)

      // spawn
      const spawned = spawnSystem.update(dt, levelSystem.level)
      enemies.push(...spawned)

      // collision
      collisionSystem.update(dt, player, enemies, projectiles, expDrops, (expVal) => {
        const leveled = levelSystem.addExp(expVal)
        if (leveled.length > 0) {
          awaitingLevelUp = true
          const choices = itemSystem.getRandomChoices(3)
          setLevelUpItems(choices)
          setScreen('levelup')
        }
      })

      // count kills from newly dead enemies this frame
      const newKills = enemies.filter(e => e.dead).length
      for (let i = 0; i < newKills; i++) levelSystem.addKill()

      // cull dead
      enemies = state.enemies = enemies.filter(e => !e.dead)
      projectiles = state.projectiles = projectiles.filter(p => !p.dead)
      expDrops = state.expDrops = expDrops.filter(d => !d.dead)

      // game over
      if (player.dead) {
        const result = saveIfBest(elapsed, levelSystem.kills)
        setGameOverData({
          elapsed,
          kills: levelSystem.kills,
          level: levelSystem.level,
          ...result,
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
      })
    }

    const render = () => {
      renderer.clear()
      const ctx = renderer.ctx

      for (const d of state.expDrops) d.draw(ctx)
      for (const e of state.enemies) e.draw(ctx)
      for (const p of state.projectiles) p.draw(ctx)
      collisionSystem.drawExplosions(ctx)
      player.draw(ctx)
    }

    const loop = new GameLoop(update, render)

    gameRef.current = {
      loop, input, player, levelSystem, itemSystem,
      getElapsed: () => elapsed,
      setPaused: (v) => { paused = v },
      setAwaitingLevelUp: (v) => { awaitingLevelUp = v },
      applyItem: (item) => {
        itemSystem.apply(item, player)
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

  const handleItemSelect = useCallback((item) => {
    gameRef.current?.applyItem(item)
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

      {screen === 'levelup' && levelUpItems.length > 0 && (
        <ItemSelectModal items={levelUpItems} onSelect={handleItemSelect} />
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
