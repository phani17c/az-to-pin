interface Props {
  design: any
  product: any
  content: any
  onSchedule: () => void
  onRedesign: (theme: string) => void
  onBack: () => void
}

const themes = [
  { id: 'bold', label: '🔥 Bold', desc: 'Dark & dramatic' },
  { id: 'elegant', label: '✨ Elegant', desc: 'Light & refined' },
  { id: 'fresh', label: '💎 Fresh', desc: 'Cool neon vibes' },
  { id: 'warm', label: '🌟 Warm', desc: 'Golden & cozy' },
]

export default function StepDesign({ design, product, content, onSchedule, onRedesign, onBack }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
        {/* Pin Preview */}
        <div>
          <div style={fieldLabel}>📌 Pin Preview (600×900)</div>
          <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
            <img
              src={design.svgDataUrl}
              alt="Pin design"
              style={{ width: '100%', display: 'block' }}
            />
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={card}>
            <div style={fieldLabel}>Choose Theme</div>
            {themes.map(t => (
              <button
                key={t.id}
                onClick={() => onRedesign(t.id)}
                style={{
                  width: '100%', marginBottom: 8, padding: '10px 14px',
                  borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                  background: design.theme === t.id ? 'rgba(230,0,35,0.2)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${design.theme === t.id ? 'rgba(230,0,35,0.5)' : 'rgba(255,255,255,0.08)'}`,
                  color: design.theme === t.id ? '#ff9999' : '#9988bb',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                <span style={{ fontSize: 14 }}>{t.label}</span>
                <span style={{ fontSize: 11, opacity: 0.6 }}>{t.desc}</span>
              </button>
            ))}
          </div>

          <div style={card}>
            <div style={fieldLabel}>Pin Specs</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                ['Dimensions', `${design.width}×${design.height}px`],
                ['Ratio', '2:3 (Pinterest optimal)'],
                ['Format', 'SVG (vector)'],
                ['Theme', design.theme],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#665577' }}>{k}</span>
                  <span style={{ color: '#c0a8e0', textTransform: 'capitalize' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <a
            href={design.svgDataUrl}
            download={`pin-${product.asin}.svg`}
            style={{ ...secondaryBtn, textDecoration: 'none', textAlign: 'center', display: 'block' }}>
            ⬇️ Download SVG
          </a>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={onBack} style={secondaryBtn}>← Back</button>
        <button onClick={onSchedule} style={primaryBtn}>📅 Schedule to Pinterest →</button>
      </div>
    </div>
  )
}

const card: React.CSSProperties = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 16 }
const fieldLabel: React.CSSProperties = { fontSize: 11, color: '#9988bb', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }
const primaryBtn: React.CSSProperties = { padding: '13px 24px', borderRadius: 10, background: 'linear-gradient(135deg, #e60023, #bd0019)', border: 'none', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', flex: 1 }
const secondaryBtn: React.CSSProperties = { padding: '12px 20px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#9988bb', cursor: 'pointer', fontSize: 13 }
