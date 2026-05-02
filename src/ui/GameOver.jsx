import React from 'react'

export function GameOver({ elapsed, kills, level, newBestTime, newBestKills, onRetry, onMenu }) {
  const min = Math.floor(elapsed / 60).toString().padStart(2, '0')
  const sec = Math.floor(elapsed % 60).toString().padStart(2, '0')

  return (
    <div style={styles.wrapper}>
      <div style={styles.title}>게임 오버</div>

      <div style={styles.stats}>
        <StatRow label="생존 시간" value={`${min}:${sec}`} highlight={newBestTime} />
        <StatRow label="처치 수" value={kills} highlight={newBestKills} />
        <StatRow label="최종 레벨" value={`Lv. ${level}`} />
      </div>

      <div style={styles.buttons}>
        <button style={styles.btn} onClick={onRetry}>다시 시작</button>
        <button style={{ ...styles.btn, background: '#444' }} onClick={onMenu}>메인 메뉴</button>
      </div>
    </div>
  )
}

function StatRow({ label, value, highlight }) {
  return (
    <div style={styles.row}>
      <span style={styles.rowLabel}>{label}</span>
      <span style={{ ...styles.rowValue, color: highlight ? '#ffcc00' : '#fff' }}>
        {value} {highlight && '🏆'}
      </span>
    </div>
  )
}

const styles = {
  wrapper: {
    position: 'absolute', inset: 0,
    background: 'rgba(0,0,0,0.88)',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Malgun Gothic', sans-serif", color: '#fff',
  },
  title: {
    fontSize: 48, fontWeight: 'bold', color: '#ff4444',
    textShadow: '0 0 20px #ff4444', marginBottom: 32,
  },
  stats: {
    background: 'rgba(255,255,255,0.05)', border: '1px solid #333',
    borderRadius: 12, padding: '20px 40px', marginBottom: 32, width: 280,
  },
  row: { display: 'flex', justifyContent: 'space-between', marginBottom: 12 },
  rowLabel: { color: '#aaa', fontSize: 15 },
  rowValue: { fontWeight: 'bold', fontSize: 15 },
  buttons: { display: 'flex', gap: 16 },
  btn: {
    background: 'linear-gradient(90deg, #0088cc, #00ccff)',
    color: '#fff', border: 'none', borderRadius: 24,
    padding: '12px 32px', fontSize: 16, fontWeight: 'bold', cursor: 'pointer',
  },
}
