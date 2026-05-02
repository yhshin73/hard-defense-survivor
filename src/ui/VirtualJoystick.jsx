import React, { useRef, useCallback } from 'react'

const BASE_R = 56
const STICK_R = 22

export function VirtualJoystick({ onMove }) {
  const baseRef = useRef(null)
  const touching = useRef(false)
  const basePos = useRef({ x: 0, y: 0 })

  const handleStart = useCallback((e) => {
    e.preventDefault()
    const touch = e.touches[0]
    const rect = baseRef.current.getBoundingClientRect()
    basePos.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    }
    touching.current = true
    handleMove(e)
  }, [])

  const handleMove = useCallback((e) => {
    if (!touching.current) return
    e.preventDefault()
    const touch = e.touches[0]
    const dx = touch.clientX - basePos.current.x
    const dy = touch.clientY - basePos.current.y
    const d = Math.hypot(dx, dy) || 1
    const clamped = Math.min(d, BASE_R)
    const nx = (dx / d) * clamped / BASE_R
    const ny = (dy / d) * clamped / BASE_R
    onMove(nx, ny, true)
  }, [onMove])

  const handleEnd = useCallback((e) => {
    touching.current = false
    onMove(0, 0, false)
  }, [onMove])

  return (
    <div
      ref={baseRef}
      style={styles.base}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
    >
      <div style={styles.stick} />
    </div>
  )
}

const styles = {
  base: {
    position: 'absolute', bottom: 24, left: 24,
    width: BASE_R * 2, height: BASE_R * 2,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.12)',
    border: '2px solid rgba(255,255,255,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    touchAction: 'none',
  },
  stick: {
    width: STICK_R * 2, height: STICK_R * 2,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.4)',
    border: '2px solid rgba(255,255,255,0.6)',
    pointerEvents: 'none',
  },
}
