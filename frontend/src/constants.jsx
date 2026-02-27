// ── Design tokens ────────────────────────────────────────────────────────────
export const C = {
  bg:       '#07090d',
  surface:  '#0e1117',
  surface2: '#141820',
  border:   '#1c2333',
  accent:   '#00e5b0',
  blue:     '#3b8ef3',
  purple:   '#a78bfa',
  warn:     '#f59e0b',
  success:  '#10b981',
  danger:   '#ef4444',
  text:     '#dde4f0',
  text2:    '#7a8899',
  text3:    '#3a4555',
  mono:     '"JetBrains Mono", "Fira Code", monospace',
  sans:     '"Sora", "DM Sans", system-ui, sans-serif',
}

// ── Chart colors ──────────────────────────────────────────────────────────────
export const CHART_COLORS = ['#00e5b0', '#3b8ef3', '#a78bfa', '#f59e0b', '#ef4444', '#10b981']

// ── Pipeline step names ───────────────────────────────────────────────────────
export const PIPELINE_STEPS = [
  'Data Understanding',
  'Data Cleaning',
  'Feature Engineering',
  'Statistical Analysis',
  'Model Training',
  'Model Evaluation',
]

// ── Card ──────────────────────────────────────────────────────────────────────
export const Card = ({ children, style = {}, glow = false }) => (
  <div style={{
    background: C.surface,
    border: `1px solid ${glow ? 'rgba(0,229,176,0.25)' : C.border}`,
    borderRadius: 12,
    padding: 22,
    boxShadow: glow ? '0 0 24px rgba(0,229,176,0.06)' : 'none',
    ...style,
  }}>
    {children}
  </div>
)

// ── Section label ─────────────────────────────────────────────────────────────
export const Label = ({ children }) => (
  <div style={{
    fontFamily: C.mono,
    fontSize: 9,
    letterSpacing: 2.5,
    color: C.text3,
    textTransform: 'uppercase',
    marginBottom: 14,
  }}>
    {children}
  </div>
)

// ── Metric (used in best-model banner) ───────────────────────────────────────
export const Metric = ({ value, label, color }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ fontFamily: C.mono, fontSize: 22, color, lineHeight: 1.1 }}>{value}</div>
    <div style={{ fontSize: 9, fontFamily: C.mono, color: C.text3, letterSpacing: 1.5, marginTop: 4 }}>{label}</div>
  </div>
)

// ── Recharts custom tooltip ───────────────────────────────────────────────────
export const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: C.surface2,
      border: `1px solid ${C.border}`,
      borderRadius: 8,
      padding: '10px 14px',
      fontFamily: C.mono,
      fontSize: 11,
    }}>
      <div style={{ color: C.text2, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || C.accent }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(4) : p.value}
        </div>
      ))}
    </div>
  )
}

// ── Download report as CSV ────────────────────────────────────────────────────
export const downloadReport = (results, filename) => {
  const ts = new Date().toISOString().slice(0, 19).replace('T', ' ')
  const isClass = results.problem_type === 'classification'

  const metricsHeader = isClass
    ? 'Model,CV Mean,CV Std,Accuracy,F1 Score,ROC-AUC,Train Time (s)'
    : 'Model,CV Mean,CV Std,RMSE,R2,Train Time (s)'

  const metricsRows = results.model_metrics?.map(m =>
    isClass
      ? `${m.model_name},${m.cv_mean},${m.cv_std},${m.accuracy ?? ''},${m.f1_score ?? ''},${m.roc_auc ?? ''},${m.train_time_sec}`
      : `${m.model_name},${m.cv_mean},${m.cv_std},${m.rmse ?? ''},${m.r2 ?? ''},${m.train_time_sec}`
  ).join('\n')

  const featureRows = results.feature_importance?.map(f =>
    `${f.feature},${f.importance}`
  ).join('\n') || ''

  const csv = [
    '# DataPilot AI — Analysis Report',
    `# Generated: ${ts}`,
    `# Dataset: ${filename}`,
    `# Problem Type: ${results.problem_type}`,
    `# Best Model: ${results.best_model}`,
    '',
    '## MODEL COMPARISON',
    metricsHeader,
    metricsRows,
    '',
    '## FEATURE IMPORTANCE',
    'Feature,Importance',
    featureRows,
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `datapilot_report_${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}