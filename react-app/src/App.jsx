import { useState } from 'react'
import './App.css'

function formatScore(value) {
  return value.toLocaleString() + '원'
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function App() {
  const [count, setCount] = useState(4)
  const [inputs, setInputs] = useState(['선우', '종민', '근우', '성빈'])
  const [names, setNames] = useState(['선우', '종민', '근우', '성빈'])
  const [personalScores, setPersonalScores] = useState({
    선우: 0,
    종민: 0,
    근우: 0,
    성빈: 0,
  })
  const [team1, setTeam1] = useState([])
  const [team2, setTeam2] = useState([])
  const [currentMoney, setCurrentMoney] = useState(0)
  const [moneyInput, setMoneyInput] = useState('')
  const [winnerSelected, setWinnerSelected] = useState(true)
  const [isDrawing, setIsDrawing] = useState(false)
  const [editingName, setEditingName] = useState(null)
  const [editingValue, setEditingValue] = useState('')

  const generateNameInputs = () => {
    const n = Number(count)
    if (!Number.isInteger(n) || n < 2 || n > 100) {
      alert('인원수는 2명 이상 100명 이하로 입력해주세요!')
      return
    }
    setInputs(Array.from({ length: n }, (_, i) => inputs[i] ?? '').map((v, i) => v || names[i] || ''))
    // 필요시 길이 조정
    setInputs((prev) => {
      const next = Array.from({ length: n }, (_, i) => prev[i] ?? names[i] ?? '')
      return next
    })
  }

  const applyMembers = () => {
    const newNames = inputs.map((v) => v.trim()).filter(Boolean)
    if (newNames.length < 2) {
      alert('이름을 2명 이상 입력해주세요!')
      return
    }
    if (newNames.length !== inputs.length) {
      alert('빈 이름 칸이 있습니다. 모두 입력해 주세요!')
      return
    }
    if (new Set(newNames).size !== newNames.length) {
      alert('같은 이름은 중복해서 쓸 수 없습니다!')
      return
    }
    setPersonalScores((old) => {
      const next = {}
      newNames.forEach((name) => {
        next[name] = old[name] || 0
      })
      return next
    })
    setNames(newNames)
    setTeam1([])
    setTeam2([])
    setWinnerSelected(true)
    setEditingName(null)
    alert(`참가자가 적용되었습니다! (${newNames.length}명)`)
  }

  const setMoney = () => {
    const money = Number(moneyInput)
    if (!Number.isSafeInteger(money) || money <= 0) {
      alert('올바른 금액을 입력해주세요!')
      return
    }
    setCurrentMoney(money)
    setMoneyInput('')
    alert('금액이 적용되었습니다!')
  }

  const makeTeams = () => {
    if (isDrawing) return
    if (names.length < 2) {
      alert('먼저 참가자를 2명 이상 설정해주세요!')
      return
    }
    setIsDrawing(true)
    setWinnerSelected(true)
    setTeam1([])
    setTeam2([])
    setTimeout(() => {
      const shuffled = shuffle(names)
      const half = Math.ceil(shuffled.length / 2)
      setTeam1(shuffled.slice(0, half))
      setTeam2(shuffled.slice(half))
      setWinnerSelected(false)
      setIsDrawing(false)
    }, 2000)
  }

  const addScore = (team) => {
    if (winnerSelected || isDrawing) {
      alert('이번 팀의 승리는 이미 결정되었습니다!')
      return
    }
    if (currentMoney <= 0) {
      alert('먼저 금액을 설정해주세요!')
      return
    }
    const winners = team === 1 ? team1 : team2
    const losers = team === 1 ? team2 : team1
    if (winners.length === 0 || losers.length === 0) {
      alert('먼저 팀을 나눠주세요!')
      return
    }
    setWinnerSelected(true)
    setPersonalScores((prev) => {
      const next = { ...prev }
      winners.forEach((name) => {
        next[name] = (next[name] || 0) + currentMoney
      })
      losers.forEach((name) => {
        next[name] = (next[name] || 0) - currentMoney
      })
      return next
    })
    alert(`${team}팀 승리!\n승리 팀: +${currentMoney.toLocaleString()}원\n패배 팀: -${currentMoney.toLocaleString()}원`)
  }

  const resetScore = () => {
    setEditingName(null)
    if (confirm('모든 개인별 누적 금액을 초기화할까요?')) {
      const next = {}
      names.forEach((name) => {
        next[name] = 0
      })
      setPersonalScores(next)
    }
  }

  const startEdit = (name) => {
    if (isDrawing || editingName) return
    setEditingName(name)
    setEditingValue(String(personalScores[name] || 0))
  }

  const finishEdit = (save) => {
    if (!editingName) return
    const name = editingName
    setEditingName(null)
    if (save) {
      const raw = editingValue.replace(/,/g, '').replace(/원/g, '').replace(/\s/g, '')
      if (!/^-?\d+$/.test(raw)) {
        alert('숫자만 입력해주세요!')
        return
      }
      const value = Number(raw)
      if (!Number.isSafeInteger(value)) {
        alert('올바른 금액을 입력해주세요!')
        return
      }
      setPersonalScores((prev) => ({ ...prev, [name]: value }))
    }
  }

  return (
    <div className="page">
      <h1>🎲 랜덤 팀 나누기</h1>
      <p>인원수와 이름을 입력한 뒤 팀을 나눠보세요!</p>

      <section className="member-area card">
        <h2>👥 참가자 설정</h2>
        <label>
          인원수
          <input
            type="number"
            min="2"
            max="100"
            step="1"
            value={count}
            onChange={(e) => {
              const n = Number(e.target.value)
              setCount(e.target.value)
              if (Number.isInteger(n) && n >= 2 && n <= 100) {
                setInputs((prev) => Array.from({ length: n }, (_, i) => prev[i] ?? names[i] ?? ''))
              }
            }}
          />
        </label>
        <div className="name-inputs">
          {inputs.map((v, i) => (
            <input
              key={i}
              type="text"
              placeholder={`${i + 1}번째 이름`}
              value={v}
              onChange={(e) => {
                const next = [...inputs]
                next[i] = e.target.value
                setInputs(next)
              }}
            />
          ))}
        </div>
        <button onClick={applyMembers}>참가자 적용</button>
        <p className="hint">이름은 모두 입력해야 합니다. 같은 이름은 중복해서 쓸 수 없습니다.</p>
      </section>

      <div className="team-container">
        <div className="team card">
          <h2>1팀</h2>
          <div className="members">{team1.length ? team1.join(' ') : isDrawing ? '편성 중...' : '?'}</div>
          <ul>
            {team1.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
          <button disabled={winnerSelected || isDrawing} onClick={() => addScore(1)}>
            1팀 승리!
          </button>
        </div>
        <div className="team card">
          <h2>2팀</h2>
          <div className="members">{team2.length ? team2.join(' ') : isDrawing ? '편성 중...' : '?'}</div>
          <ul>
            {team2.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
          <button disabled={winnerSelected || isDrawing} onClick={() => addScore(2)}>
            2팀 승리!
          </button>
        </div>
      </div>

      <button onClick={makeTeams} disabled={isDrawing}>
        {isDrawing ? '팀 편성 중...' : '팀 나누기!'}
      </button>

      <section className="money-area card">
        <h2>💰 금액 설정</h2>
        <input type="number" min="1" step="1" placeholder="금액 입력" value={moneyInput} onChange={(e) => setMoneyInput(e.target.value)} />
        <button onClick={setMoney}>금액 적용</button>
        <p>현재 적용 금액</p>
        <div className="current-money">{formatScore(currentMoney)}</div>
        <p>금액을 변경하기 전까지 계속 유지됩니다.</p>
      </section>

      <section className="personal-container card">
        <h2>👤 개인별 누적 금액</h2>
        <p className="hint">금액을 클릭하면 직접 수정할 수 있습니다.</p>
        {names.map((name) => (
          <div className="person" key={name}>
            <span>{name}</span>
            {editingName === name ? (
              <input
                className="score-input"
                value={editingValue}
                autoFocus
                onChange={(e) => setEditingValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') finishEdit(true)
                  if (e.key === 'Escape') finishEdit(false)
                }}
                onBlur={() => finishEdit(true)}
              />
            ) : (
              <span
                className="personal-money"
                title="클릭하여 직접 수정"
                onClick={() => startEdit(name)}
                style={{ color: (personalScores[name] || 0) < 0 ? '#3157a4' : '#e05b45' }}
              >
                {formatScore(personalScores[name] || 0)}
              </span>
            )}
          </div>
        ))}
      </section>

      <button className="reset-button" onClick={resetScore}>
        전체 점수 초기화
      </button>
    </div>
  )
}
