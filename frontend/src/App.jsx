import { useState, useEffect, useRef } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export default function App() {
  const [page, setPage] = useState('upload')
  const [session, setSession] = useState(null)
  const [columns, setColumns] = useState([])
  const [filename, setFilename] = useState(null)
  const [shape, setShape] = useState([])
  const [preview, setPreview] = useState([])
  const [target, setTarget] = useState('')
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('')
  const [logs, setLogs] = useState([])
  const [status, setStatus] = useState(null)
  const [results, setResults] = useState(null)
  const [dragging, setDragging] = useState(false)
  const pollRef = useRef(null)
  const logRef = useRef(null)

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [logs])

  async function handleFile(file) {
    if (!file?.name.endsWith('.csv')) return alert('CSV files only')
    const form = new FormData()
    form.append('file', file)
    try {
      const { data } = await axios.post(`${API}/api/v1/upload`, form)
      setSession(data.session_id)
      setFilename(data.filename)
      setColumns(data.columns)
      setShape(data.shape)
      setPreview(data.preview)
    } catch (e) {
      alert('Upload failed: ' + (e.response?.data?.detail || e.message))
    }
  }

  async function startAnalysis() {
    if (!target) return alert('Select a target column first')
    await axios.post(`${API}/api/v1/analyze`, { session_id: session, target_column: target })
    setStatus('running')
    setPage('processing')
    pollRef.current = setInterval(async () => {
      const { data } = await axios.get(`${API}/api/v1/status/${session}`)
      setProgress(data.progress)
      setCurrentStep(data.current_step)
      setLogs(data.logs || [])
      setStatus(data.status)
      if (data.status === 'completed') {
        clearInterval(pollRef.current)
        const res = await axios.get(`${API}/api/v1/results/${session}`)
        setResults(res.data)
      }
      if (data.status === 'failed') clearInterval(pollRef.current)
    }, 2000)
  }

  const STEPS = ['Data Understanding','Data Cleaning','Feature Engineering','Statistical Analysis','Model Training','Model Evaluation']
  const currentStepIdx = STEPS.findIndex(s => currentStep.includes(s.split(' ')[0]))

  const s = {
    bg: '#0a0c0f', surface: '#111418', surface2: '#181c22',
    border: '#1e2430', accent: '#00d4aa', accent2: '#0099ff',
    text: '#e2e8f0', text2: '#94a3b8', text3: '#4a5568',
    success: '#10b981', warn: '#f59e0b', mono: 'Space Mono, monospace',
    sans: 'DM Sans, system-ui, sans-serif',
  }

  const card = { background: s.surface, border: `1px solid ${s.border}`, borderRadius: 10, padding: 20 }

  return (
    <div style={{ background: s.bg, minHeight: '100vh', color: s.text, fontFamily: s.sans, display: 'grid', gridTemplateColumns: '200px 1fr', gridTemplateRows: '52px 1fr' }}>
      {/* Header */}
      <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: 12, padding: '0 24px', borderBottom: `1px solid ${s.border}`, background: 'rgba(10,12,15,0.97)' }}>
        <div style={{ background: 'linear-gradient(135deg,#00d4aa,#0099ff)', width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>⚛</div>
        <span style={{ fontFamily: s.mono, fontSize: 12, color: s.accent, fontWeight: 700 }}>AUTOML · AGENT · PLATFORM</span>
        <span style={{ marginLeft: 'auto', fontFamily: s.mono, fontSize: 10, color: s.text3, border: `1px solid ${s.border}`, padding: '2px 8px', borderRadius: 4 }}>CONNECTED TO BACKEND</span>
      </div>

      {/* Sidebar */}
      <nav style={{ borderRight: `1px solid ${s.border}`, padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {[['upload','⬆','Upload'], ['processing','⚙','Processing'], ['results','◈','Results']].map(([id, icon, label]) => (
          <div key={id} onClick={() => setPage(id)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 13, color: page === id ? s.accent : s.text2, background: page === id ? 'rgba(0,212,170,0.08)' : 'transparent', border: `1px solid ${page === id ? 'rgba(0,212,170,0.2)' : 'transparent'}` }}>
            <span>{icon}</span> {label}
          </div>
        ))}
      </nav>

      {/* Main */}
      <main style={{ padding: 28, overflowY: 'auto', maxHeight: 'calc(100vh - 52px)' }}>

        {/* ── UPLOAD PAGE ── */}
        {page === 'upload' && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: 22, fontWeight: 600 }}>Dataset Upload</h1>
              <p style={{ color: s.text2, fontSize: 13, marginTop: 4 }}>Upload a CSV and select your target column</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={card}>
                  <div style={{ fontFamily: s.mono, fontSize: 9, letterSpacing: 2, color: s.text3, marginBottom: 14, textTransform: 'uppercase' }}>Upload CSV</div>
                  <div
                    onDragOver={e => { e.preventDefault(); setDragging(true) }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
                    style={{ border: `2px dashed ${dragging ? s.accent : s.border}`, borderRadius: 10, padding: '50px 20px', textAlign: 'center', background: dragging ? 'rgba(0,212,170,0.03)' : 'transparent', transition: 'all 0.2s', position: 'relative' }}
                  >
                    <input type="file" accept=".csv" onChange={e => handleFile(e.target.files[0])} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
                    <div style={{ fontSize: 36, marginBottom: 10 }}>{filename ? '✓' : '📂'}</div>
                    <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 6 }}>{filename || 'Drop CSV here or click to browse'}</div>
                    <div style={{ fontSize: 11, color: s.text3, fontFamily: s.mono }}>{filename ? `${shape[0]?.toLocaleString()} rows · ${shape[1]} columns` : 'Max 100MB · CSV only'}</div>
                  </div>
                </div>

                {filename && (
                  <div style={card}>
                    <div style={{ fontFamily: s.mono, fontSize: 9, letterSpacing: 2, color: s.text3, marginBottom: 14, textTransform: 'uppercase' }}>Select Target Column</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12, maxHeight: 100, overflowY: 'auto' }}>
                      {columns.map(c => (
                        <span key={c} onClick={() => setTarget(c)} style={{ padding: '3px 10px', borderRadius: 4, fontSize: 11, fontFamily: s.mono, cursor: 'pointer', background: target===c ? 'rgba(0,212,170,0.1)' : '#181c22', border: `1px solid ${target===c ? s.accent : s.border}`, color: target===c ? s.accent : s.text2 }}>{c}</span>
                      ))}
                    </div>
                    <select value={target} onChange={e => setTarget(e.target.value)} style={{ width: '100%', background: '#181c22', border: `1px solid ${s.border}`, color: s.text, padding: '9px 12px', borderRadius: 7, fontFamily: s.sans, fontSize: 13, marginBottom: 14 }}>
                      <option value="">— select target column —</option>
                      {columns.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <button onClick={startAnalysis} disabled={!target} style={{ width: '100%', padding: '11px', background: target ? 'linear-gradient(135deg,#00d4aa,#00b894)' : '#1e2430', color: target ? '#0a0c0f' : s.text3, border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: target ? 'pointer' : 'not-allowed', fontFamily: s.sans }}>
                      ⚡ Start Autonomous Analysis
                    </button>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {filename && preview.length > 0 ? (
                  <div style={card}>
                    <div style={{ fontFamily: s.mono, fontSize: 9, letterSpacing: 2, color: s.text3, marginBottom: 14, textTransform: 'uppercase' }}>Data Preview</div>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                        <thead><tr>{columns.slice(0,6).map(c => <th key={c} style={{ textAlign:'left', padding:'8px 10px', fontFamily:s.mono, fontSize:9, letterSpacing:1.5, color:s.text3, borderBottom:`1px solid ${s.border}`, textTransform:'uppercase' }}>{c}</th>)}</tr></thead>
                        <tbody>{preview.slice(0,5).map((row,i) => <tr key={i}>{columns.slice(0,6).map(c => <td key={c} style={{ padding:'9px 10px', borderBottom:`1px solid ${s.border}`, color:s.text2 }}>{String(row[c]??'')}</td>)}</tr>)}</tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div style={{...card, minHeight: 200, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:10}}>
                    <div style={{ fontSize: 40 }}>🔬</div>
                    <div style={{ color: s.text3, fontSize: 13 }}>Upload a CSV to see preview</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── PROCESSING PAGE ── */}
        {page === 'processing' && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: 22, fontWeight: 600 }}>Pipeline Processing</h1>
              <p style={{ color: s.text2, fontSize: 13, marginTop: 4 }}>Session: <span style={{ fontFamily: s.mono, color: s.accent }}>{session?.slice(0,12)}...</span></p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={card}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 14 }}>
                    <div style={{ fontFamily: s.mono, fontSize: 9, letterSpacing: 2, color: s.text3, textTransform: 'uppercase' }}>Overall Progress</div>
                    <div style={{ fontFamily: s.mono, fontSize: 22, color: s.accent }}>{progress}<span style={{ fontSize: 12, color: s.text3 }}>%</span></div>
                  </div>
                  <div style={{ background: '#181c22', borderRadius: 3, height: 5, overflow: 'hidden' }}>
                    <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg,#00d4aa,#0099ff)', transition: 'width 0.4s ease', borderRadius: 3 }} />
                  </div>
                  <div style={{ marginTop: 8, fontSize: 11, color: s.text3, fontFamily: s.mono }}>
                    {status === 'completed' ? '✓ COMPLETED' : status === 'failed' ? '✗ FAILED' : `▶ ${currentStep.toUpperCase()}`}
                  </div>
                </div>

                <div style={card}>
                  <div style={{ fontFamily: s.mono, fontSize: 9, letterSpacing: 2, color: s.text3, marginBottom: 14, textTransform: 'uppercase' }}>Pipeline Steps</div>
                  {STEPS.map((step, i) => {
                    let state = i < currentStepIdx ? 'done' : i === currentStepIdx ? 'running' : 'pending'
                    if (status === 'completed') state = 'done'
                    const colors = { done: s.success, running: s.accent, pending: s.text3 }
                    return (
                      <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < STEPS.length-1 ? `1px solid ${s.border}` : 'none' }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, background: state==='done' ? 'rgba(16,185,129,0.1)' : state==='running' ? 'rgba(0,212,170,0.1)' : '#181c22', border: `1px solid ${colors[state]}30`, color: colors[state], flexShrink: 0 }}>
                          {state === 'done' ? '✓' : state === 'running' ? '◉' : i+1}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{step}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={card}>
                  <div style={{ fontFamily: s.mono, fontSize: 9, letterSpacing: 2, color: s.text3, marginBottom: 14, textTransform: 'uppercase' }}>Live Logs</div>
                  <div ref={logRef} style={{ background: '#07090c', borderRadius: 7, padding: 14, fontFamily: s.mono, fontSize: 11, lineHeight: 1.8, maxHeight: 280, overflowY: 'auto', color: s.text3 }}>
                    {logs.length === 0 ? <span>Waiting for pipeline...</span> : logs.map((log, i) => (
                      <div key={i} style={{ color: log.includes('Best') || log.includes('✓') ? s.success : log.includes('Error') ? s.warn : s.text2 }}>{log}</div>
                    ))}
                  </div>
                </div>

                {status === 'completed' && (
                  <div style={{...card, borderColor: 'rgba(0,212,170,0.3)', background: 'rgba(0,212,170,0.04)'}}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ fontSize: 28 }}>🎯</div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: s.accent, marginBottom: 4 }}>Analysis Complete!</div>
                        <div style={{ fontSize: 12, color: s.text3 }}>Best model: {results?.best_model}</div>
                      </div>
                      <button onClick={() => setPage('results')} style={{ marginLeft: 'auto', padding: '9px 18px', background: 'linear-gradient(135deg,#00d4aa,#00b894)', border: 'none', borderRadius: 8, color: '#0a0c0f', fontWeight: 700, cursor: 'pointer', fontSize: 13, fontFamily: s.sans }}>View Results →</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── RESULTS PAGE ── */}
        {page === 'results' && !results && (
          <div style={{ textAlign: 'center', paddingTop: 80 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔬</div>
            <div style={{ color: s.text3 }}>No results yet. Run an analysis first.</div>
            <button onClick={() => setPage('upload')} style={{ marginTop: 16, padding: '10px 20px', background: 'linear-gradient(135deg,#00d4aa,#00b894)', border: 'none', borderRadius: 8, color: '#0a0c0f', fontWeight: 700, cursor: 'pointer', fontSize: 13, fontFamily: s.sans }}>← Upload Dataset</button>
          </div>
        )}

        {page === 'results' && results && (
          <div>
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 600 }}>Analysis Results</h1>
                <p style={{ color: s.text2, fontSize: 13, marginTop: 4 }}>{filename} · <span style={{ padding: '2px 8px', borderRadius: 4, background: 'rgba(0,153,255,0.1)', color: '#0099ff', fontSize: 11, fontFamily: s.mono }}>{results.problem_type}</span></p>
              </div>
            </div>

            {/* Best model banner */}
            <div style={{ background: 'linear-gradient(135deg,rgba(0,212,170,0.06),rgba(0,153,255,0.04))', border: '1px solid rgba(0,212,170,0.2)', borderRadius: 12, padding: 24, display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
              <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg,#00d4aa,#0099ff)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🏆</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontFamily: s.mono, color: s.text3, letterSpacing: 2, marginBottom: 4 }}>BEST MODEL SELECTED</div>
                <div style={{ fontSize: 20, fontWeight: 600 }}>{results.best_model}</div>
              </div>
              {results.model_metrics?.filter(m => m.model_name === results.best_model).map(m => (
                <div key={m.model_name} style={{ display: 'flex', gap: 24 }}>
                  {m.accuracy != null && <div style={{ textAlign: 'center' }}><div style={{ fontFamily: s.mono, fontSize: 22, color: s.accent }}>{(m.accuracy*100).toFixed(1)}%</div><div style={{ fontSize: 9, fontFamily: s.mono, color: s.text3, letterSpacing: 1 }}>ACCURACY</div></div>}
                  {m.f1_score != null && <div style={{ textAlign: 'center' }}><div style={{ fontFamily: s.mono, fontSize: 22, color: '#0099ff' }}>{(m.f1_score*100).toFixed(1)}%</div><div style={{ fontSize: 9, fontFamily: s.mono, color: s.text3, letterSpacing: 1 }}>F1 SCORE</div></div>}
                  {m.roc_auc != null && <div style={{ textAlign: 'center' }}><div style={{ fontFamily: s.mono, fontSize: 22, color: '#a78bfa' }}>{(m.roc_auc*100).toFixed(1)}%</div><div style={{ fontSize: 9, fontFamily: s.mono, color: s.text3, letterSpacing: 1 }}>ROC-AUC</div></div>}
                  {m.rmse != null && <div style={{ textAlign: 'center' }}><div style={{ fontFamily: s.mono, fontSize: 22, color: s.accent }}>{m.rmse?.toFixed(3)}</div><div style={{ fontSize: 9, fontFamily: s.mono, color: s.text3, letterSpacing: 1 }}>RMSE</div></div>}
                  {m.r2 != null && <div style={{ textAlign: 'center' }}><div style={{ fontFamily: s.mono, fontSize: 22, color: '#0099ff' }}>{(m.r2*100).toFixed(1)}%</div><div style={{ fontSize: 9, fontFamily: s.mono, color: s.text3, letterSpacing: 1 }}>R²</div></div>}
                </div>
              ))}
            </div>

            {/* Model comparison table */}
            <div style={{...card, marginBottom: 20}}>
              <div style={{ fontFamily: s.mono, fontSize: 9, letterSpacing: 2, color: s.text3, marginBottom: 14, textTransform: 'uppercase' }}>All Models Compared</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead><tr>
                  {['Model','CV Score','CV Std', results.problem_type==='classification'?'Accuracy':'RMSE', results.problem_type==='classification'?'F1':'R²','Train Time'].map(h => (
                    <th key={h} style={{ textAlign:'left', padding:'9px 12px', fontFamily:s.mono, fontSize:9, color:s.text3, borderBottom:`1px solid ${s.border}`, letterSpacing:1.5, textTransform:'uppercase' }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {results.model_metrics?.map(m => (
                    <tr key={m.model_name} style={{ background: m.model_name===results.best_model ? 'rgba(0,212,170,0.03)' : 'transparent' }}>
                      <td style={{ padding:'11px 12px', borderBottom:`1px solid ${s.border}`, color: m.model_name===results.best_model ? s.accent : s.text }}>{m.model_name===results.best_model ? '🏆 ' : ''}{m.model_name}</td>
                      <td style={{ padding:'11px 12px', borderBottom:`1px solid ${s.border}`, fontFamily:s.mono, color:s.text2 }}>{(m.cv_mean*100).toFixed(2)}%</td>
                      <td style={{ padding:'11px 12px', borderBottom:`1px solid ${s.border}`, fontFamily:s.mono, color:s.text3 }}>±{(m.cv_std*100).toFixed(2)}%</td>
                      <td style={{ padding:'11px 12px', borderBottom:`1px solid ${s.border}`, fontFamily:s.mono, color:s.text2 }}>{results.problem_type==='classification' ? (m.accuracy!=null ? (m.accuracy*100).toFixed(2)+'%' : '—') : (m.rmse!=null ? m.rmse.toFixed(4) : '—')}</td>
                      <td style={{ padding:'11px 12px', borderBottom:`1px solid ${s.border}`, fontFamily:s.mono, color:s.text2 }}>{results.problem_type==='classification' ? (m.f1_score!=null ? (m.f1_score*100).toFixed(2)+'%' : '—') : (m.r2!=null ? (m.r2*100).toFixed(2)+'%' : '—')}</td>
                      <td style={{ padding:'11px 12px', borderBottom:`1px solid ${s.border}`, fontFamily:s.mono, color:s.text3 }}>{m.train_time_sec}s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Feature importance */}
            {results.feature_importance?.length > 0 && (
              <div style={card}>
                <div style={{ fontFamily: s.mono, fontSize: 9, letterSpacing: 2, color: s.text3, marginBottom: 14, textTransform: 'uppercase' }}>Feature Importance — {results.best_model}</div>
                {results.feature_importance.map((fi, i) => (
                  <div key={fi.feature} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 20, fontSize: 10, fontFamily: s.mono, color: s.text3 }}>#{i+1}</div>
                    <div style={{ width: 120, fontSize: 11, fontFamily: s.mono, color: s.text2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fi.feature}</div>
                    <div style={{ flex: 1, background: '#181c22', borderRadius: 3, height: 6, overflow: 'hidden' }}>
                      <div style={{ width: `${(fi.importance/results.feature_importance[0].importance*100).toFixed(0)}%`, height: '100%', background: 'linear-gradient(90deg,#00d4aa,#0099ff)', borderRadius: 3 }} />
                    </div>
                    <div style={{ width: 44, fontSize: 10, fontFamily: s.mono, color: s.text3, textAlign: 'right' }}>{(fi.importance*100).toFixed(1)}%</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}