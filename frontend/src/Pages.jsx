import { useRef } from 'react'
import axios from 'axios'
import { C, Card, Label, PIPELINE_STEPS } from './constants'

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// ════════════════════════════════════════════════════════════
//  UPLOAD PAGE
// ════════════════════════════════════════════════════════════
export function UploadPage({
  filename, shape, columns, preview, target, dragging,
  setTarget, setDragging, setSession, setFilename,
  setColumns, setShape, setPreview, setResults,
  setStatus, setProgress, setLogs, onStartAnalysis,
}) {
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
      setResults(null)
      setStatus(null)
      setProgress(0)
      setLogs([])
      setTarget('')
    } catch (e) {
      alert('Upload failed: ' + (e.response?.data?.detail || e.message))
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 26 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5 }}>Dataset Upload</h1>
        <p style={{ color: C.text2, fontSize: 13, marginTop: 5 }}>
          Upload a CSV, select your target column, then start the analysis
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* ── Drop zone ── */}
          <Card>
            <Label>Step 1 — Upload CSV</Label>
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
              style={{
                border: `2px dashed ${dragging ? C.accent : C.border}`,
                borderRadius: 10, padding: '48px 20px', textAlign: 'center',
                background: dragging ? 'rgba(0,229,176,0.03)' : C.surface2,
                transition: 'all 0.2s', position: 'relative', cursor: 'pointer',
              }}
            >
              <input
                type="file" accept=".csv"
                onChange={e => handleFile(e.target.files[0])}
                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
              />
              <div style={{ fontSize: 34, marginBottom: 12 }}>{filename ? '✅' : '📂'}</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>
                {filename || 'Drop CSV here or click to browse'}
              </div>
              <div style={{ fontSize: 11, color: C.text3, fontFamily: C.mono }}>
                {filename
                  ? `${shape[0]?.toLocaleString()} rows · ${shape[1]} columns`
                  : 'Max 100MB · CSV only'}
              </div>
            </div>
          </Card>

          {/* ── Target selector + Start button (only after upload) ── */}
          {filename && (
            <Card>
              <Label>Step 2 — Select Target Column to Predict</Label>

              {/* Helper text */}
              <p style={{ fontSize: 11, color: C.text3, fontFamily: C.mono, marginBottom: 12 }}>
                Click one column chip below — this is the value your model will learn to predict.
              </p>

              {/* Column chips — single select, clear visual active state */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14, maxHeight: 110, overflowY: 'auto' }}>
                {columns.map(c => {
                  const active = target === c
                  return (
                    <span
                      key={c}
                      onClick={() => setTarget(active ? '' : c)}
                      title={`Select "${c}" as target`}
                      style={{
                        padding: '5px 12px', borderRadius: 6, fontSize: 11,
                        fontFamily: C.mono, cursor: 'pointer', userSelect: 'none',
                        background: active ? 'rgba(0,229,176,0.12)' : C.surface2,
                        border: `1px solid ${active ? C.accent : C.border}`,
                        color: active ? C.accent : C.text2,
                        boxShadow: active ? `0 0 8px rgba(0,229,176,0.2)` : 'none',
                        transition: 'all 0.12s',
                        position: 'relative',
                      }}
                    >
                      {active && (
                        <span style={{ marginRight: 5, fontSize: 9 }}>✓</span>
                      )}
                      {c}
                    </span>
                  )
                })}
              </div>

              {/* Dropdown fallback for many columns */}
              <select
                value={target}
                onChange={e => setTarget(e.target.value)}
                style={{
                  width: '100%', background: C.surface2,
                  border: `1px solid ${target ? C.accent : C.border}`,
                  color: target ? C.text : C.text3,
                  padding: '10px 12px', borderRadius: 8,
                  fontFamily: C.mono, fontSize: 12, marginBottom: 18, outline: 'none',
                }}
              >
                <option value="">— or pick from dropdown —</option>
                {columns.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              {/* Selected target confirmation badge */}
              {target && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                  background: 'rgba(0,229,176,0.05)', border: `1px solid rgba(0,229,176,0.2)`,
                  borderRadius: 8, marginBottom: 16, fontSize: 12,
                }}>
                  <span style={{ color: C.accent, fontFamily: C.mono, fontSize: 10 }}>TARGET</span>
                  <span style={{ fontFamily: C.mono, color: C.text, fontWeight: 600 }}>{target}</span>
                  <span
                    onClick={() => setTarget('')}
                    style={{ marginLeft: 'auto', cursor: 'pointer', color: C.text3, fontSize: 14, lineHeight: 1 }}
                    title="Clear selection"
                  >✕</span>
                </div>
              )}

              {/* ── START BUTTON — lives here, in context ── */}
              <button
                onClick={onStartAnalysis}
                disabled={!target}
                style={{
                  width: '100%', padding: '13px',
                  background: target
                    ? 'linear-gradient(135deg,#00e5b0,#00c49a)'
                    : C.surface2,
                  color: target ? '#07090d' : C.text3,
                  border: `1px solid ${target ? 'transparent' : C.border}`,
                  borderRadius: 9, fontSize: 14, fontWeight: 700,
                  cursor: target ? 'pointer' : 'not-allowed',
                  fontFamily: C.sans, letterSpacing: 0.3,
                  transition: 'all 0.15s',
                  opacity: target ? 1 : 0.5,
                }}
              >
                {target ? `⚡ Analyse "${target}"` : '⚡ Start Autonomous Analysis'}
              </button>

              {!target && (
                <p style={{ textAlign: 'center', fontSize: 10, color: C.text3, fontFamily: C.mono, marginTop: 8 }}>
                  Select a target column above to enable
                </p>
              )}
            </Card>
          )}
        </div>

        {/* ── Preview table ── */}
        <div>
          {filename && preview.length > 0 ? (
            <Card>
              <Label>Data Preview — first 5 rows</Label>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr>
                      {columns.slice(0, 6).map(c => (
                        <th
                          key={c}
                          onClick={() => setTarget(target === c ? '' : c)}
                          title={`Click to select "${c}" as target`}
                          style={{
                            textAlign: 'left', padding: '8px 10px',
                            fontFamily: C.mono, fontSize: 9,
                            color: target === c ? C.accent : C.text3,
                            borderBottom: `1px solid ${target === c ? C.accent : C.border}`,
                            letterSpacing: 1.5, textTransform: 'uppercase',
                            whiteSpace: 'nowrap', cursor: 'pointer',
                            background: target === c ? 'rgba(0,229,176,0.05)' : 'transparent',
                          }}
                        >
                          {target === c ? '✓ ' : ''}{c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.slice(0, 5).map((row, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                        {columns.slice(0, 6).map(c => (
                          <td
                            key={c}
                            style={{
                              padding: '9px 10px',
                              borderBottom: `1px solid ${C.border}`,
                              color: target === c ? C.accent : C.text2,
                              whiteSpace: 'nowrap', maxWidth: 120,
                              overflow: 'hidden', textOverflow: 'ellipsis',
                              background: target === c ? 'rgba(0,229,176,0.03)' : 'transparent',
                            }}
                          >
                            {String(row[c] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {columns.length > 6 && (
                <div style={{ marginTop: 10, fontFamily: C.mono, fontSize: 10, color: C.text3 }}>
                  +{columns.length - 6} more columns · use chips above to select any column
                </div>
              )}
              <div style={{ marginTop: 10, fontFamily: C.mono, fontSize: 9, color: C.text3 }}>
                💡 You can also click a column header above to select it as target
              </div>
            </Card>
          ) : (
            <Card style={{ minHeight: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 42 }}>🔬</div>
              <div style={{ color: C.text3, fontSize: 13 }}>Upload a CSV to see preview</div>
              <div style={{ color: C.text3, fontSize: 11, fontFamily: C.mono }}>Supports any size up to 100MB</div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}


// ════════════════════════════════════════════════════════════
//  PROCESSING PAGE
// ════════════════════════════════════════════════════════════
export function ProcessingPage({ session, filename, progress, currentStep, logs, status, results, setPage }) {
  const logRef = useRef(null)
  const currentStepIdx = PIPELINE_STEPS.findIndex(s => currentStep?.includes(s.split(' ')[0]))

  return (
    <div>
      <div style={{ marginBottom: 26 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5 }}>Pipeline Processing</h1>
        <p style={{ color: C.text2, fontSize: 13, marginTop: 5 }}>
          Session: <span style={{ fontFamily: C.mono, color: C.accent }}>{session?.slice(0, 14)}…</span>
          {filename && <span style={{ color: C.text3 }}> · {filename}</span>}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <ProgressCard progress={progress} currentStep={currentStep} status={status} />
          <PipelineSteps currentStepIdx={currentStepIdx} status={status} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <LiveLogs logs={logs} logRef={logRef} />

          {status === 'completed' && (
            <Card glow style={{ background: 'rgba(0,229,176,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ fontSize: 30 }}>🎯</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: C.accent, marginBottom: 4 }}>Analysis Complete!</div>
                  <div style={{ fontSize: 12, color: C.text3 }}>Best model: <span style={{ color: C.text }}>{results?.best_model}</span></div>
                </div>
                <button
                  onClick={() => setPage('results')}
                  style={{ marginLeft: 'auto', padding: '10px 20px', background: `linear-gradient(135deg,${C.accent},#00c49a)`, border: 'none', borderRadius: 9, color: '#07090d', fontWeight: 700, cursor: 'pointer', fontSize: 13, fontFamily: C.sans }}
                >
                  View Results →
                </button>
              </div>
            </Card>
          )}

          {status === 'failed' && (
            <Card style={{ borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 24 }}>⚠️</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.danger }}>Pipeline Failed</div>
                  <div style={{ fontSize: 12, color: C.text3, marginTop: 3 }}>Check logs above for details</div>
                </div>
                <button
                  onClick={() => setPage('upload')}
                  style={{ marginLeft: 'auto', padding: '8px 16px', background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text2, cursor: 'pointer', fontSize: 12, fontFamily: C.sans }}
                >
                  ← Try Again
                </button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function ProgressCard({ progress, currentStep, status }) {
  const done = status === 'completed'
  return (
    <Card glow={done}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Label>Overall Progress</Label>
        <div style={{ fontFamily: C.mono, fontSize: 26, color: done ? C.success : C.accent, lineHeight: 1 }}>
          {progress}<span style={{ fontSize: 13, color: C.text3 }}>%</span>
        </div>
      </div>
      <div style={{ background: C.surface2, borderRadius: 4, height: 6, overflow: 'hidden' }}>
        <div style={{
          width: `${progress}%`, height: '100%',
          background: done
            ? `linear-gradient(90deg,${C.success},#00e5b0)`
            : `linear-gradient(90deg,${C.accent},${C.blue})`,
          transition: 'width 0.5s ease', borderRadius: 4,
        }} />
      </div>
      <div style={{ marginTop: 10, fontSize: 11, color: C.text3, fontFamily: C.mono }}>
        {status === 'completed' ? '✓ PIPELINE COMPLETE'
          : status === 'failed' ? '✗ PIPELINE FAILED'
          : `▶ ${currentStep?.toUpperCase() || 'INITIALISING...'}`}
      </div>
    </Card>
  )
}

function PipelineSteps({ currentStepIdx, status }) {
  return (
    <Card>
      <Label>Pipeline Steps</Label>
      {PIPELINE_STEPS.map((step, i) => {
        let state = i < currentStepIdx ? 'done' : i === currentStepIdx ? 'running' : 'pending'
        if (status === 'completed') state = 'done'
        const col = { done: C.success, running: C.accent, pending: C.text3 }[state]
        return (
          <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: i < PIPELINE_STEPS.length - 1 ? `1px solid ${C.border}` : 'none' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, background: `${col}14`, border: `1px solid ${col}40`, color: col, flexShrink: 0, fontFamily: C.mono }}>
              {state === 'done' ? '✓' : state === 'running' ? '◉' : i + 1}
            </div>
            <div style={{ fontSize: 13, fontWeight: 500, color: state === 'pending' ? C.text2 : C.text }}>{step}</div>
            {state === 'running' && <div style={{ marginLeft: 'auto', fontFamily: C.mono, fontSize: 9, color: C.accent }}>RUNNING…</div>}
            {state === 'done'    && <div style={{ marginLeft: 'auto', fontFamily: C.mono, fontSize: 9, color: C.success }}>DONE</div>}
          </div>
        )
      })}
    </Card>
  )
}

function LiveLogs({ logs, logRef }) {
  return (
    <Card style={{ flex: 1 }}>
      <Label>Live Logs</Label>
      <div
        ref={logRef}
        style={{ background: '#030407', borderRadius: 8, padding: 14, fontFamily: C.mono, fontSize: 11, lineHeight: 2, maxHeight: 300, overflowY: 'auto', color: C.text3, border: `1px solid ${C.border}` }}
      >
        {logs.length === 0
          ? <span style={{ color: C.text3 }}>Waiting for pipeline to start…</span>
          : logs.map((log, i) => (
            <div key={i} style={{ color: log.includes('Best') || log.includes('complete') ? C.success : log.includes('Error') || log.includes('failed') ? C.danger : C.text2 }}>
              <span style={{ color: C.text3, userSelect: 'none' }}>{String(i + 1).padStart(2, '0')} › </span>{log}
            </div>
          ))
        }
      </div>
    </Card>
  )
}