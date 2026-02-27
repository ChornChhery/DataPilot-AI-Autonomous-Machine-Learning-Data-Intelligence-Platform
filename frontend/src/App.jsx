import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { C } from './constants'
import { UploadPage, ProcessingPage } from './Pages'
import { ResultsPage } from './ResultsPage'

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export default function App() {
  const [page, setPage]               = useState('upload')
  const [session, setSession]         = useState(null)
  const [columns, setColumns]         = useState([])
  const [filename, setFilename]       = useState(null)
  const [shape, setShape]             = useState([])
  const [preview, setPreview]         = useState([])
  const [target, setTarget]           = useState('')
  const [progress, setProgress]       = useState(0)
  const [currentStep, setCurrentStep] = useState('')
  const [logs, setLogs]               = useState([])
  const [status, setStatus]           = useState(null)
  const [results, setResults]         = useState(null)
  const [dragging, setDragging]       = useState(false)
  const [downloading, setDownloading] = useState(false)
  const pollRef = useRef(null)

  useEffect(() => () => clearInterval(pollRef.current), [])

  useEffect(() => {
    if (status === 'completed' && results) {
      const t = setTimeout(() => setPage('results'), 1200)
      return () => clearTimeout(t)
    }
  }, [status, results])

  async function startAnalysis() {
    if (!target) return alert('Select a target column first')
    clearInterval(pollRef.current)
    await axios.post(`${API}/api/v1/analyze`, { session_id: session, target_column: target })
    setStatus('running')
    setPage('processing')
    pollRef.current = setInterval(async () => {
      try {
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
      } catch (err) {
        console.error('Polling error:', err)
      }
    }, 2000)
  }

  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.text, fontFamily: C.sans, display: 'grid', gridTemplateColumns: '210px 1fr', gridTemplateRows: '54px 1fr' }}>

      {/* ── HEADER ── */}
      <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: 14, padding: '0 26px', borderBottom: `1px solid ${C.border}`, background: 'rgba(7,9,13,0.97)', backdropFilter: 'blur(8px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ background: 'linear-gradient(135deg,#00e5b0,#3b8ef3)', width: 30, height: 30, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>⚛</div>
        <span style={{ fontFamily: C.mono, fontSize: 11, color: C.accent, fontWeight: 700, letterSpacing: 1.5 }}>DATAPILOT AI</span>
        <span style={{ fontFamily: C.mono, fontSize: 10, color: C.text3, marginLeft: 4 }}>/ Autonomous ML Platform</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontFamily: C.mono, fontSize: 9, color: C.success, border: `1px solid rgba(16,185,129,0.2)`, padding: '3px 10px', borderRadius: 20 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.success, display: 'inline-block', animation: 'pulse 2s infinite' }} />
          CONNECTED
        </div>
      </div>

      {/* ── SIDEBAR — navigation only, no action buttons ── */}
      <nav style={{ borderRight: `1px solid ${C.border}`, padding: '20px 10px', display: 'flex', flexDirection: 'column', gap: 3, background: C.bg }}>
        {[
          ['upload',     '⬆', 'Upload',     'Dataset Input'],
          ['processing', '⚙', 'Processing', 'ML Pipeline'],
          ['results',    '◈', 'Results',    'Analysis Output'],
        ].map(([id, icon, label, sub]) => (
          <div key={id} onClick={() => setPage(id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, cursor: 'pointer', color: page === id ? C.accent : C.text2, background: page === id ? 'rgba(0,229,176,0.07)' : 'transparent', border: `1px solid ${page === id ? 'rgba(0,229,176,0.18)' : 'transparent'}`, transition: 'all 0.15s' }}>
            <span style={{ fontSize: 14 }}>{icon}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
              <div style={{ fontSize: 9, fontFamily: C.mono, color: C.text3, marginTop: 1 }}>{sub}</div>
            </div>
          </div>
        ))}

        {/* Session info at bottom */}
        <div style={{ marginTop: 'auto', padding: '12px', borderTop: `1px solid ${C.border}`, fontFamily: C.mono, fontSize: 9, color: C.text3 }}>
          {session ? (
            <>
              <div style={{ marginBottom: 4, color: C.text3 }}>SESSION</div>
              <div style={{ color: C.text2, wordBreak: 'break-all' }}>{session.slice(0, 16)}…</div>
              {filename && <div style={{ marginTop: 6, color: C.text3 }}>{filename}</div>}
            </>
          ) : (
            <div style={{ color: C.text3 }}>No active session</div>
          )}
        </div>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <main style={{ padding: 28, overflowY: 'auto', maxHeight: 'calc(100vh - 54px)' }}>
        {page === 'upload' && (
          <UploadPage
            filename={filename} shape={shape} columns={columns}
            preview={preview} target={target} dragging={dragging}
            setTarget={setTarget} setDragging={setDragging}
            setSession={setSession} setFilename={setFilename}
            setColumns={setColumns} setShape={setShape}
            setPreview={setPreview} setResults={setResults}
            setStatus={setStatus} setProgress={setProgress}
            setLogs={setLogs}
            onStartAnalysis={startAnalysis}
          />
        )}

        {page === 'processing' && (
          <ProcessingPage
            session={session} filename={filename}
            progress={progress} currentStep={currentStep}
            logs={logs} status={status} results={results}
            setPage={setPage}
          />
        )}

        {page === 'results' && (
          <ResultsPage
            results={results} filename={filename}
            sessionId={session}
            downloading={downloading} setDownloading={setDownloading}
            setPage={setPage}
          />
        )}
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
      `}</style>
    </div>
  )
}