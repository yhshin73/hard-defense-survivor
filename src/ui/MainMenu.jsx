import React from 'react'
import { getBestTime, getBestKills } from '../systems/StorageSystem.js'

export function MainMenu({ onStart }) {
  const bestTime = getBestTime()
  const bestKills = getBestKills()
  const min = Math.floor(bestTime / 60).toString().padStart(2, '0')
  const sec = Math.floor(bestTime % 60).toString().padStart(2, '0')

  return (
    <div style={styles.wrapper}>
      <div style={styles.title}>서바이버 디펜스</div>
      <div style={styles.subtitle}>SURVIVOR DEFENSE</div>

      {bestTime > 0 && (
        <div style={styles.record}>
          <div style={styles.recordTitle}>최고 기록</div>
          <div style={styles.recordRow}>생존 시간: <b>{min}:{sec}</b></div>
          <div style={styles.recordRow}>최다 처치: <b>{bestKills}</b></div>
        </div>
      )}

      <button style={styles.btn} onClick={onStart}>게임 시작</button>

      <div style={styles.controls}>
        <div>이동: WASD / 방향키</div>
        <div>일시정지: ESC</div>
        <div>공격: 자동</div>
      </div>
    </div>
  )
}

const styles = {
  wrapper: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(135deg, #0d0d1a 0%, #1a1a3a 100%)',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Malgun Gothic', sans-serif",
    color: '#fff',
  },
  title: {
    fontSize: 48, fontWeight: 'bold', color: '#00ccff',
    textShadow: '0 0 30px #00ccff', marginBottom: 6,
  },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 40, letterSpacing: 4 },
  record: {
    background: 'rgba(255,255,255,0.05)', border: '1px solid #333',
    borderRadius: 10, padding: '14px 28px', marginBottom: 32, textAlign: 'center',
  },
  recordTitle: { color: '#ffcc00', fontWeight: 'bold', marginBottom: 8 },
  recordRow: { color: '#ccc', fontSize: 14, marginBottom: 4 },
  btn: {
    background: 'linear-gradient(90deg, #0088cc, #00ccff)',
    color: '#fff', border: 'none', borderRadius: 30,
    padding: '14px 48px', fontSize: 18, fontWeight: 'bold',
    cursor: 'pointer', marginBottom: 36,
    boxShadow: '0 4px 20px rgba(0,200,255,0.4)',
    transition: 'transform 0.1s',
  },
  controls: {
    color: '#666', fontSize: 13, textAlign: 'center', lineHeight: 2,
  },
}
