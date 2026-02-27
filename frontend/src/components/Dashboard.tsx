import { useState, useEffect } from 'react'
import { affiliateApi, pinterestApi } from '../services/api'

interface Props { onBack: () => void }

export default function Dashboard({ onBack }: Props) {
  const [stats, setStats] = useState<any>(null)
  const [pins, setPins] = useState<any[]>([])
  const [links, setLinks] = useState<any[]>([])
  const [tab, setTab] = useState<'overview' | 'pins' | 'links'>('overview')

  useEffect(() => {
    affiliateApi.getStats().then(setStats).catch(() => setStats({ totalClicks: 0, totalConversions: 0, totalRevenue: 0, conversionRate: 0, topLinks: [] }))
    pinterestApi.getPins().then(setPins).catch(() => setPins([]))
    affiliateApi.getLinks().then(setLinks).catch(() => setLinks([]))
  }, [])

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '32px 24px 80px', position: 'relative', zIndex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 28, fontWeight: 700, color: '#f0e8ff' }}>📊 Dashboard</h1>
          <p style={{ margin: 0, fontSize: 13, color: '#554466' }}>Affiliate performance & published pins</p>
        </div>
        <button onClick={onBack} style={secondaryBtn}>← Back to Tool</button>
      </div>

      {/* Overview Cards */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
          {[
            { icon: '📌', label: 'Total Pins', value: pins.length },
            { icon: '🖱️', label: 'Total Clicks', value: stats.totalClicks },
            { icon: '✅', label: 'Conversions', value: stats.totalConversions },
            { icon: '💰', label: 'Revenue', value: `$${stats.totalRevenue.toFixed(2)}` },
          ].map(s => (
            <div key={s.label} style={card}>
              <div style={{ fontSize: 20, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#e60023' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#554466', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Conversion Rate Bar */}
      {stats && (
        <div style={{ ...card, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={fieldLabel}>Conversion Rate</span>
            <span style={{ color: '#ff9999', fontSize: 14, fontWeight: 600 }}>{stats.conversionRate}%</span>
          </div>
          <div style={{ height: 8, background: 'rgba(255,255,255,0.07)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(stats.conversionRate * 10, 100)}%`, background: 'linear-gradient(90deg, #e60023, #ff6b35)', borderRadius: 4 }} />
          </div>
          <div style={{ fontSize: 12, color: '#554466', marginTop: 6 }}>Amazon Associates avg: 1–4% · Your rate: {stats.conversionRate}%</div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 4, marginBottom: 16 }}>
        {(['overview', 'pins', 'links'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '8px', borderRadius: 7,
            background: tab === t ? 'rgba(230,0,35,0.25)' : 'transparent',
            border: `1px solid ${tab === t ? 'rgba(230,0,35,0.4)' : 'transparent'}`,
            color: tab === t ? '#ff9999' : '#554466', cursor: 'pointer', fontSize: 13, textTransform: 'capitalize',
          }}>
            {t === 'overview' ? '📈 Overview' : t === 'pins' ? `📌 Pins (${pins.length})` : `🔗 Links (${links.length})`}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div style={card}>
          <div style={fieldLabel}>Recent Activity</div>
          {pins.length === 0 && links.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#554466', fontSize: 14 }}>
              No activity yet. Create your first pin to see data here!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {pins.slice(0, 5).map((p: any) => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <div style={{ fontSize: 13, color: '#e0c8ff' }}>{p.title?.substring(0, 60)}</div>
                    <div style={{ fontSize: 11, color: '#554466', marginTop: 2 }}>{p.boardName} · {new Date(p.createdAt).toLocaleDateString()}</div>
                  </div>
                  <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 12, background: p.status === 'published' ? 'rgba(0,200,100,0.15)' : 'rgba(230,150,0,0.15)', color: p.status === 'published' ? '#00cc66' : '#ffaa00' }}>
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'pins' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {pins.length === 0 ? (
            <div style={{ ...card, textAlign: 'center', padding: '40px', color: '#554466' }}>No pins created yet.</div>
          ) : pins.map((p: any) => (
            <div key={p.id} style={{ ...card, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: '#f0e8ff', marginBottom: 4 }}>{p.title}</div>
                <div style={{ fontSize: 12, color: '#554466' }}>Board: {p.boardName} · Publish time: {new Date(p.scheduledAt).toLocaleString()}</div>
                <div style={{ fontSize: 11, color: '#443355', marginTop: 3, fontFamily: 'monospace' }}>ID: {p.pinId || p.id}</div>
              </div>
              <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 12, whiteSpace: 'nowrap', background: p.status === 'published' ? 'rgba(0,200,100,0.15)' : 'rgba(230,150,0,0.15)', color: p.status === 'published' ? '#00cc66' : '#ffaa00' }}>
                {p.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {tab === 'links' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {links.length === 0 ? (
            <div style={{ ...card, textAlign: 'center', padding: '40px', color: '#554466' }}>No affiliate links generated yet.</div>
          ) : links.map((l: any) => (
            <div key={l.id} style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: '#f0e8ff', fontFamily: 'monospace' }}>ASIN: {l.asin}</span>
                <span style={{ fontSize: 12, color: '#ff9999' }}>Tag: {l.tag}</span>
              </div>
              <div style={{ fontSize: 12, color: '#554466', marginBottom: 8, wordBreak: 'break-all' }}>{l.trackingUrl}</div>
              <div style={{ display: 'flex', gap: 20, fontSize: 13 }}>
                <span>👁️ <strong style={{ color: '#e60023' }}>{l.clicks}</strong> clicks</span>
                <span>✅ <strong style={{ color: '#00cc66' }}>{l.conversions}</strong> conversions</span>
                <span>💰 <strong style={{ color: '#ffd700' }}>${l.revenue.toFixed(2)}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const card: React.CSSProperties = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 16 }
const fieldLabel: React.CSSProperties = { fontSize: 11, color: '#9988bb', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }
const secondaryBtn: React.CSSProperties = { padding: '10px 18px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#9988bb', cursor: 'pointer', fontSize: 13 }
