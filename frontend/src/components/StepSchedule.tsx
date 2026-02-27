import { useState, useEffect } from 'react'
import { pinterestApi } from '../services/api'

interface Props {
  product: any
  content: any
  design: any
  onSchedule: (params: any) => void
  onBack: () => void
}

export default function StepSchedule({ product, content, design, onSchedule, onBack }: Props) {
  const [boards, setBoards] = useState<{ id: string; name: string }[]>([])
  const [boardId, setBoardId] = useState('')
  const [boardName, setBoardName] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [accessToken, setAccessToken] = useState('demo')

  useEffect(() => {
    pinterestApi.getBoards(accessToken).then(data => {
      setBoards(data)
      if (data.length > 0) { setBoardId(data[0].id); setBoardName(data[0].name) }
    })
  }, [])

  // Suggest an initial publish time
  useEffect(() => {
    const now = new Date()
    now.setDate(now.getDate() + ((6 - now.getDay() + 7) % 7 || 7)) // Next Saturday
    now.setHours(20, 0, 0, 0) // 8PM
    setScheduledAt(now.toISOString().slice(0, 16))
  }, [])

  const handleBoardChange = (id: string) => {
    setBoardId(id)
    setBoardName(boards.find(b => b.id === id)?.name || '')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={card}>
        <div style={fieldLabel}>Pinterest Access Token</div>
        <input
          value={accessToken}
          onChange={e => setAccessToken(e.target.value)}
          placeholder="Leave as 'demo' to test without connecting Pinterest"
          style={input}
        />
        <div style={{ fontSize: 11, color: '#554466', marginTop: 4 }}>
          Get a token at developers.pinterest.com — or use "demo" to test the full flow
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={card}>
          <div style={fieldLabel}>Board</div>
          <select value={boardId} onChange={e => handleBoardChange(e.target.value)} style={select}>
            {boards.map(b => <option key={b.id} value={b.id} style={{ background: '#1a0025' }}>{b.name}</option>)}
          </select>
        </div>
        <div style={card}>
          <div style={fieldLabel}>Publish Date & Time</div>
          <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} style={input} />
          <div style={{ fontSize: 11, color: '#ff9999', marginTop: 4 }}>
            ⭐ AI suggests: {content.bestTimeToPost}
          </div>
        </div>
      </div>

      {/* Preview */}
      <div style={{ ...card, display: 'flex', gap: 16, alignItems: 'center' }}>
        <img src={product.images?.[0]} alt="" style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover' }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: '#f0e8ff', lineHeight: 1.4, marginBottom: 4 }}>{content.title}</div>
          <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
            <span style={{ color: '#665577' }}>Board: <span style={{ color: '#ff9999' }}>{boardName}</span></span>
            <span style={{ color: '#665577' }}>Price: <span style={{ color: '#e60023' }}>{product.price}</span></span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={onBack} style={secondaryBtn}>← Back</button>
        <button
          onClick={() => onSchedule({ boardId, boardName, scheduledAt, accessToken })}
          disabled={!boardId || !scheduledAt}
          style={{ ...primaryBtn, opacity: (!boardId || !scheduledAt) ? 0.5 : 1 }}>
          📌 Publish to Pinterest
        </button>
      </div>
    </div>
  )
}

const card: React.CSSProperties = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 16 }
const fieldLabel: React.CSSProperties = { fontSize: 11, color: '#9988bb', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }
const input: React.CSSProperties = { width: '100%', padding: '10px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#f0e8ff', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }
const select: React.CSSProperties = { ...input, cursor: 'pointer' }
const primaryBtn: React.CSSProperties = { padding: '13px 24px', borderRadius: 10, background: 'linear-gradient(135deg, #e60023, #bd0019)', border: 'none', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', flex: 1 }
const secondaryBtn: React.CSSProperties = { padding: '13px 20px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#9988bb', cursor: 'pointer', fontSize: 13 }
