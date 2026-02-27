interface Props {
  pin: any
  affiliateLink: any
  product: any
  onNew: () => void
  onDashboard: () => void
}

export default function StepTrack({ pin, affiliateLink, product, onNew, onDashboard }: Props) {
  const copy = (text: string) => { navigator.clipboard.writeText(text); }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Success Banner */}
      <div style={{ background: 'linear-gradient(135deg, rgba(230,0,35,0.15), rgba(80,0,120,0.15))', border: '1px solid rgba(230,0,35,0.3)', borderRadius: 16, padding: '28px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>🎉</div>
        <h3 style={{ margin: '0 0 8px', fontSize: 20, color: '#f0e8ff' }}>Pin Created!</h3>
        <p style={{ margin: 0, color: '#9988bb', fontSize: 14 }}>
          Pinned to <strong style={{ color: '#ff9999' }}>{pin?.boardName}</strong> · Affiliate tracking active
        </p>
        {pin?.pinId && (
          <div style={{ marginTop: 10, fontSize: 12, color: '#554466', fontFamily: 'monospace' }}>
            Pin ID: {pin.pinId}
          </div>
        )}
      </div>

      {/* Live Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        {[
          { icon: '👁️', label: 'Impressions', value: '—', sub: 'Data updates after publish' },
          { icon: '🖱️', label: 'Clicks', value: '0', sub: 'Tracking active' },
          { icon: '💰', label: 'Earnings', value: '$0.00', sub: '~4% commission' },
        ].map(s => (
          <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#e60023' }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#554466', marginTop: 3 }}>{s.label}</div>
            <div style={{ fontSize: 10, color: '#443355', marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Affiliate Link */}
      {affiliateLink && (
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 11, color: '#9988bb', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}>🔗 Your Affiliate Link</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ flex: 1, background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: '8px 12px', fontFamily: 'monospace', fontSize: 12, color: '#c8a8ff', wordBreak: 'break-all' }}>
              {affiliateLink.trackingUrl}
            </div>
            <button onClick={() => copy(affiliateLink.trackingUrl)} style={{ padding: '8px 14px', borderRadius: 8, background: 'rgba(230,0,35,0.2)', border: '1px solid rgba(230,0,35,0.3)', color: '#ff9999', cursor: 'pointer', fontSize: 12, whiteSpace: 'nowrap' }}>
              Copy
            </button>
          </div>
          <div style={{ display: 'flex', gap: 20, marginTop: 12, fontSize: 12 }}>
            {[
              ['Short Code', affiliateLink.shortCode],
              ['Tag', affiliateLink.tag],
              ['ASIN', affiliateLink.asin],
            ].map(([k, v]) => (
              <span key={k} style={{ color: '#554466' }}>{k}: <span style={{ color: '#9988bb' }}>{v}</span></span>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={onDashboard} style={secondaryBtn}>📊 View Dashboard</button>
        <button onClick={onNew} style={primaryBtn}>+ Create Another Pin</button>
      </div>
    </div>
  )
}

const primaryBtn: React.CSSProperties = { padding: '13px 24px', borderRadius: 10, background: 'linear-gradient(135deg, #e60023, #bd0019)', border: 'none', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', flex: 1 }
const secondaryBtn: React.CSSProperties = { padding: '13px 20px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#9988bb', cursor: 'pointer', fontSize: 13 }
