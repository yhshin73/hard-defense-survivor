import React, { useState, useEffect } from 'react'
import { RARITIES } from '../data/weapons.js'

export function WeaponSelectModal({ weapons, upgrades, onSelect }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  const handleSelect = (weapon) => {
    setVisible(false)
    setTimeout(() => onSelect(weapon), 300)
  }

  return (
    <div style={{ ...styles.overlay, opacity: visible ? 1 : 0 }}>
      <div style={styles.title}>레벨 업!</div>
      <div style={styles.subtitle}>무기를 선택하세요</div>
      <div style={styles.cardRow}>
        {weapons.map(w => (
          <WeaponCard key={w.id} weapon={w} upgradeLevel={upgrades[w.id] || 0} onSelect={handleSelect} />
        ))}
      </div>
    </div>
  )
}

function WeaponCard({ weapon, upgradeLevel, onSelect }) {
  const [hovered, setHovered] = useState(false)
  const rarity = RARITIES[weapon.rarity]
  const isUpgrade = upgradeLevel > 0

  return (
    <div
      style={{
        ...styles.card,
        transform: hovered ? 'scale(1.07)' : 'scale(1)',
        borderColor: rarity.color,
        boxShadow: hovered ? `0 0 18px ${rarity.color}` : '0 2px 8px rgba(0,0,0,0.5)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect(weapon)}
    >
      <div style={styles.iconRow}>
        <span style={styles.icon}>{weapon.icon}</span>
        {isUpgrade && (
          <span style={{ ...styles.badge, background: rarity.color }}>+{upgradeLevel}</span>
        )}
      </div>
      <div style={styles.name}>{weapon.name}</div>
      <div style={{ ...styles.rarity, color: rarity.color }}>
        {isUpgrade ? `업그레이드 +${upgradeLevel + 1}` : rarity.name}
      </div>
      <div style={styles.desc}>{weapon.desc}</div>
      <div style={styles.stats}>
        <span>데미지: {weapon.baseDamage}</span>
        <span>쿨다운: {weapon.cooldown}s</span>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'absolute', inset: 0,
    background: 'rgba(0,0,0,0.75)',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    transition: 'opacity 0.3s',
    fontFamily: "'Malgun Gothic', sans-serif",
    zIndex: 10,
  },
  title: {
    color: '#ffcc00', fontSize: 32, fontWeight: 'bold',
    marginBottom: 8, textShadow: '0 0 20px #ffcc00',
  },
  subtitle: { color: '#cccccc', fontSize: 16, marginBottom: 28 },
  cardRow: {
    display: 'flex', gap: 20,
    flexWrap: 'wrap', justifyContent: 'center',
  },
  card: {
    width: 160, background: '#1a1a2e',
    border: '2px solid', borderRadius: 12,
    padding: '18px 14px', cursor: 'pointer',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
    transition: 'transform 0.15s, box-shadow 0.15s',
    userSelect: 'none',
  },
  iconRow: { position: 'relative', display: 'flex', alignItems: 'center' },
  icon: { fontSize: 36 },
  badge: {
    position: 'absolute', top: -6, right: -14,
    borderRadius: 8, padding: '1px 5px',
    fontSize: 11, fontWeight: 'bold', color: '#fff',
  },
  name: { color: '#ffffff', fontSize: 15, fontWeight: 'bold', textAlign: 'center' },
  rarity: { fontSize: 12, fontWeight: 'bold' },
  desc: { color: '#aaaaaa', fontSize: 12, textAlign: 'center', lineHeight: 1.4 },
  stats: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 2, color: '#888', fontSize: 11,
  },
}
