import React, { useState, useEffect } from 'react'
import { RARITIES } from '../data/items.js'

export function ItemSelectModal({ items, onSelect }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  const handleSelect = (item) => {
    setVisible(false)
    setTimeout(() => onSelect(item), 300)
  }

  return (
    <div style={{ ...styles.overlay, opacity: visible ? 1 : 0 }}>
      <div style={styles.title}>레벨 업!</div>
      <div style={styles.subtitle}>아이템을 선택하세요</div>
      <div style={styles.cardRow}>
        {items.map(item => (
          <ItemCard key={item.id} item={item} onSelect={handleSelect} />
        ))}
      </div>
    </div>
  )
}

function ItemCard({ item, onSelect }) {
  const [hovered, setHovered] = useState(false)
  const rarity = RARITIES[item.rarity]

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
      onClick={() => onSelect(item)}
    >
      <div style={styles.icon}>{item.icon}</div>
      <div style={styles.name}>{item.name}</div>
      <div style={{ ...styles.rarity, color: rarity.color }}>{rarity.name}</div>
      <div style={styles.desc}>{item.desc}</div>
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
  icon: { fontSize: 36 },
  name: { color: '#ffffff', fontSize: 15, fontWeight: 'bold', textAlign: 'center' },
  rarity: { fontSize: 12, fontWeight: 'bold' },
  desc: { color: '#aaaaaa', fontSize: 12, textAlign: 'center', lineHeight: 1.4 },
}
