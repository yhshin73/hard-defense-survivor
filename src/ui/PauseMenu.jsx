import React from 'react'

export function PauseMenu({ player, level, elapsed, onResume, onMenu }) {
  const min = Math.floor(elapsed / 60).toString().padStart(2, '0')
  const sec = Math.floor(elapsed % 60).toString().padStart(2, '0')

  return (
    <div style={styles.wrapper}>
      <div style={styles.title}>일시 정지</div>

      <div style={styles.stats}>
        <StatRow label="레벨" value={`Lv. ${level}`} />
        <StatRow label="생존 시간" value={`${min}:${sec}`} />
        <StatRow label="HP" value={`${player.hp} / ${player.maxHp}`} />
        <StatRow label="공격력" value={player.effectiveAtk} />
        <StatRow label="이동 속도" value={player.effectiveSpeed.toFixed(1)} />
      </div>

      <div style={styles.buttons}>
        <button style={styles.btn} onClick={onResume}>계속하기</button>
        <button style={{ ...styles.btn, background: '#555' }} onClick={onMenu}>메인 메뉴</button>
      </div>
      <div style={styles.hint}>ESC 키로 재개</div>
    </div>
  )
}

function StatRow({ label, value }) {
  return (
    <div style={styles.row}>
      <span style={styles.label}>{label}</span>
      <span style={styles.value}>{value}</span>
    </div>
  )
}

const styles = {
  wrapper: {
    position: 'absolute', inset: 0,
    background: 'rgba(0,0,0,0.8)',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Malgun Gothic', sans-serif", color: '#fff',
  },
  title: { fontSize: 36, fontWeight: 'bold', color: '#00ccff', marginBottom: 24 },
  stats: {
    background: 'rgba(255,255,255,0.05)', border: '1px solid #333',
    borderRadius: 12, padding: '16px 36px', marginBottom: 28, width: 260,
  },
  row: { display: 'flex', justifyContent: 'space-between', marginBottom: 10 },
  label: { color: '#aaa', fontSize: 14 },
  value: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  buttons: { display: 'flex', gap: 14, marginBottom: 12 },
  btn: {
    background: 'linear-gradient(90deg, #0088cc, #00ccff)',
    color: '#fff', border: 'none', borderRadius: 22,
    padding: '10px 28px', fontSize: 15, fontWeight: 'bold', cursor: 'pointer',
  },
  hint: { color: '#555', fontSize: 12 },
}
