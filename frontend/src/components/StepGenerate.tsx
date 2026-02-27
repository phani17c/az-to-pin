import { useState } from 'react'

interface Props {
  content: any
  product: any
  onDesign: (theme?: string) => void
  onBack: () => void
}

export default function StepGenerate({ content, product, onDesign, onBack }: Props) {
  const [tab, setTab] = useState<'title' | 'description' | 'hashtags' | 'seo'>('title')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Pin Score */}
      <div style={scoreCard}>
        <div style={{ textAlign: 'center', minWidth: 80 }}>
          <div style={{ fontSize: 44, fontWeight: 800, color: '#e60023', lineHeight: 1 }}>{content.pinScore}</div>
          <div style={{ fontSize: 10, color: '#ff8899', letterSpacing: '0.12em', marginTop: 4 }}>PIN SCORE</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
            <div style={{ height: '100%', width: `${content.pinScore}%`, background: 'linear-gradient(90deg, #e60023, #ff6b35)', borderRadius: 4, transition: 'width 1s ease' }} />
          </div>
          <div style={{ fontSize: 13, color: '#c8a8ff' }}>
            {content.pinScore >= 90 ? '🔥 Viral potential! This pin is predicted to perform exceptionally.' :
             content.pinScore >= 75 ? '✨ Strong content! High engagement expected.' :
             '👍 Solid pin. Good engagement potential.'}
          </div>
          <div style={{ marginTop: 6, fontSize: 12, color: '#665577' }}>
            Best time to post: <span style={{ color: '#ff9999' }}>{content.bestTimeToPost}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 4 }}>
        {(['title', 'description', 'hashtags', 'seo'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '8px 0', borderRadius: 7,
            background: tab === t ? 'rgba(230,0,35,0.25)' : 'transparent',
            border: `1px solid ${tab === t ? 'rgba(230,0,35,0.4)' : 'transparent'}`,
            color: tab === t ? '#ff9999' : '#554466', cursor: 'pointer',
            fontSize: 12, textTransform: 'capitalize', transition: 'all 0.2s',
          }}>
            {t === 'title' ? '📣 Title' : t === 'description' ? '📝 Desc' : t === 'hashtags' ? '🏷️ Tags' : '🔑 SEO'}
          </button>
        ))}
      </div>

      {tab === 'title' && (
        <div style={card}>
          <div style={fieldLabel}>Pinterest Title <span style={{ color: '#554466' }}>({content.title?.length}/100)</span></div>
          <div style={{ fontSize: 17, lineHeight: 1.6, color: '#f0e8ff', fontWeight: 500 }}>{content.title}</div>
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={fieldLabel}>Call to Action</div>
            <div style={{ display: 'inline-block', background: '#e60023', color: 'white', padding: '4px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>{content.callToAction}</div>
          </div>
        </div>
      )}

      {tab === 'description' && (
        <div style={card}>
          <div style={fieldLabel}>SEO Description <span style={{ color: '#554466' }}>({content.description?.length} chars)</span></div>
          <div style={{ fontSize: 14, lineHeight: 1.8, color: '#d0c0ee' }}>{content.description}</div>
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={fieldLabel}>Alt Text</div>
            <div style={{ fontSize: 13, color: '#9988bb', fontStyle: 'italic' }}>{content.altText}</div>
          </div>
        </div>
      )}

      {tab === 'hashtags' && (
        <div style={card}>
          <div style={fieldLabel}>{content.hashtags?.length} Trending Hashtags</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {content.hashtags?.map((h: string) => (
              <span key={h} style={{ background: 'rgba(230,0,35,0.1)', border: '1px solid rgba(230,0,35,0.25)', color: '#ff9999', fontSize: 13, padding: '4px 12px', borderRadius: 20 }}>
                #{h}
              </span>
            ))}
          </div>
        </div>
      )}

      {tab === 'seo' && (
        <div style={card}>
          <div style={fieldLabel}>Primary SEO Keywords</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {content.seoKeywords?.map((k: string) => (
              <span key={k} style={{ background: 'rgba(130,0,200,0.15)', border: '1px solid rgba(130,0,200,0.3)', color: '#c878ff', fontSize: 13, padding: '4px 12px', borderRadius: 20 }}>
                {k}
              </span>
            ))}
          </div>
          <div style={fieldLabel}>Category</div>
          <div style={{ color: '#d0c0ee', fontSize: 14 }}>{product.category}</div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={onBack} style={secondaryBtn}>← Back</button>
        <button onClick={() => onDesign()} style={primaryBtn}>🎨 Design Pin →</button>
      </div>
    </div>
  )
}

const card: React.CSSProperties = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 20 }
const scoreCard: React.CSSProperties = { background: 'linear-gradient(135deg, rgba(230,0,35,0.12), rgba(120,0,80,0.12))', border: '1px solid rgba(230,0,35,0.25)', borderRadius: 14, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 24 }
const fieldLabel: React.CSSProperties = { fontSize: 11, color: '#9988bb', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }
const primaryBtn: React.CSSProperties = { padding: '13px 24px', borderRadius: 10, background: 'linear-gradient(135deg, #e60023, #bd0019)', border: 'none', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', flex: 1 }
const secondaryBtn: React.CSSProperties = { padding: '13px 20px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#9988bb', cursor: 'pointer', fontSize: 13 }
