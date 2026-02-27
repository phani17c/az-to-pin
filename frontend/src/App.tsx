import { useState } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import { scraperApi, aiApi, pinDesignerApi, pinterestApi, affiliateApi } from './services/api'
import StepExtract from './components/StepExtract'
import StepGenerate from './components/StepGenerate'
import StepDesign from './components/StepDesign'
import StepSchedule from './components/StepSchedule'
import StepTrack from './components/StepTrack'
import Dashboard from './components/Dashboard'

export type AppStep = 'idle' | 'extract' | 'generate' | 'design' | 'schedule' | 'track'

export default function App() {
  const [step, setStep] = useState<AppStep>('idle')
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [showDashboard, setShowDashboard] = useState(false)

  // Data state
  const [product, setProduct] = useState<any>(null)
  const [content, setContent] = useState<any>(null)
  const [design, setDesign] = useState<any>(null)
  const [affiliateLink, setAffiliateLink] = useState<any>(null)
  const [scheduledPin, setScheduledPin] = useState<any>(null)
  const [affiliateTag, setAffiliateTag] = useState('mypins-20')

  const load = async (msg: string, fn: () => Promise<void>) => {
    setLoading(true)
    setLoadingMsg(msg)
    try {
      await fn()
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e.message || 'Something went wrong')
    } finally {
      setLoading(false)
      setLoadingMsg('')
    }
  }

  const handleExtract = async (url: string) => {
    await load('🔍 Extracting product data from Amazon...', async () => {
      const data = await scraperApi.extract(url)
      setProduct(data)
      setStep('extract')
      toast.success('Product extracted successfully!')
    })
  }

  const handleGenerate = async () => {
    await load('🤖 Generating Pinterest content with AI...', async () => {
      const data = await aiApi.generate(product)
      setContent(data)
      setStep('generate')
      toast.success('Content generated!')
    })
  }

  const handleDesign = async (theme?: string) => {
    await load('🎨 Designing your pin...', async () => {
      const data = await pinDesignerApi.design(product, content, theme)
      setDesign(data)
      setStep('design')
      toast.success('Pin designed!')
    })
  }

  const handleSchedule = async (params: { boardId: string; boardName: string; scheduledAt: string; accessToken: string }) => {
    await load('📌 Generating affiliate link & scheduling pin...', async () => {
      // Generate affiliate link
      const link = await affiliateApi.generateLink(product.asin, affiliateTag)
      setAffiliateLink(link)

      // Schedule pin
      const pin = await pinterestApi.schedule({
        ...params,
        title: content.title,
        description: content.description,
        imageUrl: product.images[0],
        affiliateUrl: link.trackingUrl,
      })
      setScheduledPin(pin)
      setStep('track')
      toast.success('🎉 Pin scheduled to Pinterest!')
    })
  }

  const reset = () => {
    setStep('idle')
    setProduct(null)
    setContent(null)
    setDesign(null)
    setAffiliateLink(null)
    setScheduledPin(null)
  }

  if (showDashboard) {
    return (
      <div style={styles.root}>
        <Toaster position="top-right" toastOptions={{ style: { background: '#1a0a2e', color: '#f0e8ff', border: '1px solid rgba(230,0,35,0.3)' } }} />
        <Dashboard onBack={() => setShowDashboard(false)} />
      </div>
    )
  }

  return (
    <div style={styles.root}>
      <Toaster position="top-right" toastOptions={{ style: { background: '#1a0a2e', color: '#f0e8ff', border: '1px solid rgba(230,0,35,0.3)' } }} />

      {/* Background */}
      <div style={styles.bg} />

      <div style={styles.container}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <span style={{ fontSize: 28 }}>🛒</span>
            <div style={styles.headerDivider} />
            <span style={{ fontSize: 28 }}>📌</span>
            <div style={{ marginLeft: 16 }}>
              <h1 style={styles.title}>PinIt Pro</h1>
              <p style={styles.subtitle}>Amazon → Pinterest Automation</p>
            </div>
          </div>
          <button onClick={() => setShowDashboard(true)} style={styles.dashBtn}>
            📊 Dashboard
          </button>
        </header>

        {/* Progress Steps */}
        {step !== 'idle' && (
          <div style={styles.progress}>
            {(['extract', 'generate', 'design', 'schedule', 'track'] as AppStep[]).map((s, i) => {
              const steps: AppStep[] = ['extract', 'generate', 'design', 'schedule', 'track']
              const curIdx = steps.indexOf(step)
              const thisIdx = steps.indexOf(s)
              const done = thisIdx < curIdx
              const active = s === step
              const icons = ['🔍', '✨', '🎨', '📅', '📊']
              const labels = ['Extract', 'Generate', 'Design', 'Schedule', 'Track']
              return (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      ...styles.stepDot,
                      background: done ? '#e60023' : active ? 'rgba(230,0,35,0.25)' : 'rgba(255,255,255,0.05)',
                      border: `2px solid ${done || active ? '#e60023' : 'rgba(255,255,255,0.1)'}`,
                    }}>
                      {done ? '✓' : icons[i]}
                    </div>
                    <div style={{ fontSize: 11, color: done || active ? '#ff9999' : '#443355', marginTop: 4 }}>{labels[i]}</div>
                  </div>
                  {i < 4 && <div style={{ width: 32, height: 1, background: done ? '#e60023' : 'rgba(255,255,255,0.08)', marginBottom: 18 }} />}
                </div>
              )
            })}
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div style={styles.loadingCard}>
            <div style={styles.spinner} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <p style={{ color: '#e0c8ff', fontSize: 16, margin: 0 }}>{loadingMsg}</p>
          </div>
        )}

        {/* Steps */}
        {!loading && step === 'idle' && (
          <StepExtract onExtract={handleExtract} affiliateTag={affiliateTag} setAffiliateTag={setAffiliateTag} />
        )}
        {!loading && step === 'extract' && product && (
          <StepExtract product={product} onGenerate={handleGenerate} onReset={reset} affiliateTag={affiliateTag} setAffiliateTag={setAffiliateTag} />
        )}
        {!loading && step === 'generate' && content && (
          <StepGenerate content={content} product={product} onDesign={handleDesign} onBack={() => setStep('extract')} />
        )}
        {!loading && step === 'design' && design && (
          <StepDesign design={design} product={product} content={content} onSchedule={() => setStep('schedule')} onRedesign={handleDesign} onBack={() => setStep('generate')} />
        )}
        {!loading && step === 'schedule' && (
          <StepSchedule product={product} content={content} design={design} onSchedule={handleSchedule} onBack={() => setStep('design')} />
        )}
        {!loading && step === 'track' && (
          <StepTrack pin={scheduledPin} affiliateLink={affiliateLink} product={product} onNew={reset} onDashboard={() => setShowDashboard(true)} />
        )}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #080010 0%, #12001a 50%, #080010 100%)',
    fontFamily: "'Georgia', 'Palatino Linotype', serif",
    color: '#f0e8ff',
  },
  bg: {
    position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
    background: 'radial-gradient(ellipse 80% 50% at 50% -5%, rgba(228,0,0,0.1) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 85% 90%, rgba(140,0,180,0.08) 0%, transparent 60%)',
  },
  container: { position: 'relative', zIndex: 1, maxWidth: 780, margin: '0 auto', padding: '32px 24px 80px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  headerDivider: { width: 32, height: 3, background: 'linear-gradient(90deg, #e60023, #bd0019)', borderRadius: 2 },
  title: { margin: 0, fontSize: 28, fontWeight: 700, background: 'linear-gradient(135deg, #fff 0%, #e8c5ff 60%, #ff9999 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' },
  subtitle: { margin: 0, fontSize: 12, color: '#665577', letterSpacing: '0.08em', textTransform: 'uppercase' },
  dashBtn: { padding: '10px 18px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#c8a8ff', cursor: 'pointer', fontSize: 13 },
  progress: { display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 4, marginBottom: 36 },
  stepDot: { width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, transition: 'all 0.3s', cursor: 'default' },
  loadingCard: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(230,0,35,0.2)', borderRadius: 16, padding: '56px 32px', textAlign: 'center' },
  spinner: { width: 48, height: 48, border: '3px solid rgba(230,0,35,0.15)', borderTopColor: '#e60023', borderRadius: '50%', margin: '0 auto 24px', animation: 'spin 0.8s linear infinite' },
}
