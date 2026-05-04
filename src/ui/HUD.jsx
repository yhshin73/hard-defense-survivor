import React from 'react'

export function HUD({ hp, maxHp, expPercent, level, kills, elapsed, weapons, weaponUpgrades }) {
  const min = Math.floor(elapsed / 60).toString().padStart(2, '0')
  const sec = Math.floor(elapsed % 60).toString().padStart(2, '0')

  return (
    <div style={styles.wrapper}>
      {/* Top-left: HP + EXP bars */}
      <div style={styles.leftPanel}>
        <div style={styles.barRow}>
          <span style={styles.label}>HP</span>
          <div style={styles.barBg}>
            <div style={{ ...styles.barFill, width: `${(hp / maxHp) * 100}%`, background: '#ff4444' }} />
          </div>
          <span style={styles.barText}>{hp}/{maxHp}</span>
        </div>
        <div style={styles.barRow}>
          <span style={styles.label}>EXP</span>
          <div style={styles.barBg}>
            <div style={{ ...styles.barFill, width: `${expPercent * 100}%`, background: '#44aaff' }} />
          </div>
        </div>
      </div>

      {/* Top-right: Level / Time / Kills */}
      <div style={styles.rightPanel}>
        <div style={styles.stat}>Lv. <b>{level}</b></div>
        <div style={styles.stat}>{min}:{sec}</div>
        <div style={styles.stat}>처치 <b>{kills}</b></div>
      </div>

      {/* Bottom-left: Equipped weapons */}
      {weapons && weapons.length > 0 && (
        <div style={styles.weaponBar}>
          {weapons.map(w => (
            <div key={w.def.id} style={styles.weaponSlot} title={w.def.name}>
              <span style={styles.weaponIcon}>{w.def.icon}</span>
              {weaponUpgrades && weaponUpgrades[w.def.id] > 0 && (
                <span style={styles.weaponBadge}>+{weaponUpgrades[w.def.id]}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const styles = {
  wrapper: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    display: 'flex', justifyContent: 'space-between',
    padding: '10px 14px', pointerEvents: 'none',
    fontFamily: "'Malgun Gothic', sans-serif",
  },
  leftPanel: { display: 'flex', flexDirection: 'column', gap: 4, alignSelf: 'flex-start' },
  barRow: { display: 'flex', alignItems: 'center', gap: 6 },
  label: { color: '#ccc', fontSize: 12, width: 28 },
  barBg: { width: 160, height: 12, background: '#333', borderRadius: 6, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 6, transition: 'width 0.1s' },
  barText: { color: '#fff', fontSize: 11 },
  rightPanel: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, alignSelf: 'flex-start' },
  stat: { color: '#eee', fontSize: 14, background: 'rgba(0,0,0,0.5)', padding: '2px 8px', borderRadius: 4 },
  weaponBar: {
    position: 'absolute', bottom: 14, left: 14,
    display: 'flex', gap: 8,
  },
  weaponSlot: {
    position: 'relative',
    width: 44, height: 44,
    background: 'rgba(0,0,0,0.6)',
    border: '1px solid rgba(255,255,255,0.25)',
    borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  weaponIcon: { fontSize: 22 },
  weaponBadge: {
    position: 'absolute', top: -4, right: -4,
    background: '#4488ff', color: '#fff',
    fontSize: 10, fontWeight: 'bold',
    borderRadius: 6, padding: '0 4px',
  },
}
