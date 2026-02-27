import { useState } from 'react'

interface Props {
  product?: any
  onExtract?: (url: string) => void
  onGenerate?: () => void
  onReset?: () => void
  affiliateTag: string
  setAffiliateTag: (v: string) => void
}

export default function StepExtract({ product, onExtract, onGenerate, onReset, affiliateTag, setAffiliateTag }: Props) {
  const [url, setUrl] = useState('')

  if (product) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={card}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
            <img src={product.images?.[0]} alt={product.title} style={{ width: 110, height: 110, borderRadius: 10, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                {product.badge && <span style={badgeStyle}>{product.badge}</span>}
                <span style={{ color: '#665577', fontSize: 11, fontFamily: 'monospace' }}>ASIN: {product.asin}</span>
              </div>
              <h3 style={{ margin: '0 0 10px', fontSize: 14, lineHeight: 1.5, color: '#f0e8ff', fontWeight: 500 }}>{product.title}</h3>
              <div style={{ display: 'flex', gap: 24 }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#e60023' }}>{product.price}</div>
                  <div style={{ fontSize: 11, color: '#554466' }}>Amazon price</div>
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#ffd700' }}>⭐ {product.rating}</div>
                  <div style={{ fontSize: 11, color: '#554466' }}>{product.reviewCount}</div>
                </div>
              </div>
            </div>
          </div>
          {product.features?.length > 0 && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 12, color: '#9988bb', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Key Features</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {product.features.slice(0, 3).map((f: string, i: number) => (
                  <div key={i} style={{ fontSize: 13, color: '#c0a8e0', display: 'flex', gap: 8 }}>
                    <span style={{ color: '#e60023' }}>•</span> {f.substring(0, 100)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ background: 'rgba(230,0,35,0.07)', border: '1px solid rgba(230,0,35,0.2)', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: '#ff9999' }}>
          ✅ Product data extracted — {product.images?.length} image(s), {product.features?.length} features ready
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onReset} style={secondaryBtn}>← Start Over</button>
          <button onClick={onGenerate} style={primaryBtn}>✨ Generate Pinterest Content</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={card}>
        <label style={label}>Amazon Product URL</label>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <input
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && url.trim() && onExtract?.(url)}
            placeholder="https://amazon.com/dp/B08N5WRWNW"
            style={input}
          />
          <button onClick={() => url.trim() && onExtract?.(url)} style={primaryBtn}>Extract →</button>
        </div>
        <div>
          <label style={{ ...label, marginBottom: 8 }}>Amazon Affiliate Tag</label>
          <input
            value={affiliateTag}
            onChange={e => setAffiliateTag(e.target.value)}
            placeholder="your-tag-20"
            style={{ ...input, fontFamily: 'monospace' }}
          />
          <div style={{ fontSize: 11, color: '#554466', marginTop: 4 }}>Used to generate tracking URLs for commission</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {[
          { icon: '🔍', t: 'Smart Extraction', d: 'Title, price, images, rating, features' },
          { icon: '🤖', t: 'AI Content', d: 'Claude generates viral Pinterest copy' },
          { icon: '🎨', t: 'Pin Designer', d: 'Auto-built pin with your branding' },
          { icon: '📊', t: 'Affiliate Tracking', d: 'Clicks, conversions & commissions' },
        ].map(f => (
          <div key={f.t} style={{ ...card, display: 'flex', gap: 12, padding: '14px 16px' }}>
            <span style={{ fontSize: 20 }}>{f.icon}</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: '#e8d8ff', marginBottom: 2 }}>{f.t}</div>
              <div style={{ fontSize: 12, color: '#554466' }}>{f.d}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const card: React.CSSProperties = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 20 }
const label: React.CSSProperties = { display: 'block', marginBottom: 10, color: '#c8a8ff', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase' }
const input: React.CSSProperties = { flex: 1, width: '100%', padding: '12px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#f0e8ff', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }
const primaryBtn: React.CSSProperties = { padding: '12px 24px', borderRadius: 10, background: 'linear-gradient(135deg, #e60023, #bd0019)', border: 'none', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flex: 1 }
const secondaryBtn: React.CSSProperties = { padding: '12px 20px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#9988bb', cursor: 'pointer', fontSize: 13 }
const badgeStyle: React.CSSProperties = { background: '#ff9900', color: '#000', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4 }
