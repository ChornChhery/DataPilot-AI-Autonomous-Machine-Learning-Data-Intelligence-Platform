import { useRef } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend,
} from 'recharts'
import { C, Card, Label, Metric, ChartTooltip, CHART_COLORS } from './constants'

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// ── Download cleaned CSV from backend ────────────────────────────────────────
async function downloadCleanedCSV(sessionId, filename) {
  try {
    const res = await fetch(`${API}/api/v1/download/${sessionId}`)
    if (!res.ok) throw new Error('Download failed')
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename.replace('.csv', '_cleaned.csv')
    a.click()
    URL.revokeObjectURL(url)
  } catch (e) {
    alert('Failed to download cleaned CSV: ' + e.message)
  }
}

// ── Generate PDF from results data (pure jsPDF, no html2canvas) ──────────────
async function generatePDF(results, filename) {
  // Dynamically load jsPDF
  if (!window.jspdf) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
      script.onload = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  const { jsPDF } = window.jspdf
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = 210  // A4 width mm
  const margin = 18
  const contentW = W - margin * 2
  let y = 0

  const isClass = results.problem_type === 'classification'
  const ts = new Date().toLocaleString()

  // ── Helpers ──
  const hex2rgb = hex => {
    const r = parseInt(hex.slice(1,3),16)
    const g = parseInt(hex.slice(3,5),16)
    const b = parseInt(hex.slice(5,7),16)
    return [r,g,b]
  }
  const setFill = (hex) => doc.setFillColor(...hex2rgb(hex))
  const setTxt  = (hex) => doc.setTextColor(...hex2rgb(hex))

  const newPage = () => {
    doc.addPage()
    y = margin
  }

  const checkY = (needed = 20) => {
    if (y + needed > 280) newPage()
  }

  // ── COVER / HEADER ──────────────────────────────────────────────────────────
  // Dark header bar
  setFill('#07090d')
  doc.rect(0, 0, W, 42, 'F')

  // Accent stripe
  setFill('#00e5b0')
  doc.rect(0, 42, W, 2, 'F')

  setTxt('#00e5b0')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.text('DataPilot AI', margin, 18)

  setTxt('#7a8899')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text('Autonomous ML Analysis Report', margin, 26)

  setTxt('#3a4555')
  doc.setFontSize(8)
  doc.text(`Generated: ${ts}`, margin, 34)
  doc.text(`Dataset: ${filename}`, W - margin, 34, { align: 'right' })

  y = 54

  // ── DATASET INFO ROW ────────────────────────────────────────────────────────
  const infoItems = [
    ['Problem Type', results.problem_type?.toUpperCase()],
    ['Best Model', results.best_model],
    ['Models Tested', String(results.model_metrics?.length || 0)],
    ['Features Used', String(results.feature_importance?.length || 0)],
  ]
  const boxW = contentW / infoItems.length
  infoItems.forEach(([label, value], i) => {
    const x = margin + i * boxW
    setFill('#0e1117')
    doc.roundedRect(x, y, boxW - 3, 18, 2, 2, 'F')
    setTxt('#3a4555')
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text(label.toUpperCase(), x + 5, y + 6)
    setTxt('#00e5b0')
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text(value || '—', x + 5, y + 14)
  })
  y += 26

  // ── BEST MODEL BANNER ───────────────────────────────────────────────────────
  checkY(35)
  setFill('#0e1117')
  doc.roundedRect(margin, y, contentW, 30, 3, 3, 'F')
  setFill('#00e5b0')
  doc.roundedRect(margin, y, 4, 30, 2, 2, 'F')

  setTxt('#3a4555')
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.text('BEST MODEL SELECTED', margin + 10, y + 8)

  setTxt('#dde4f0')
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text(results.best_model || '', margin + 10, y + 18)

  // Metrics on right side of banner
  const best = results.model_metrics?.find(m => m.model_name === results.best_model)
  if (best) {
    const metricsList = isClass
      ? [['ACCURACY', best.accuracy != null ? (best.accuracy*100).toFixed(1)+'%' : '—'],
         ['F1 SCORE', best.f1_score != null ? (best.f1_score*100).toFixed(1)+'%' : '—'],
         ['ROC-AUC',  best.roc_auc  != null ? (best.roc_auc*100).toFixed(1)+'%'  : '—'],
         ['CV SCORE', best.cv_mean  != null ? (best.cv_mean*100).toFixed(1)+'%'  : '—']]
      : [['RMSE',     best.rmse    != null ? best.rmse.toFixed(4)                 : '—'],
         ['R²',       best.r2      != null ? (best.r2*100).toFixed(1)+'%'         : '—'],
         ['CV SCORE', best.cv_mean != null ? (best.cv_mean*100).toFixed(1)+'%'   : '—']]

    const mW = 30
    const startX = W - margin - metricsList.length * mW
    metricsList.forEach(([mlabel, mval], mi) => {
      const mx = startX + mi * mW
      setTxt('#3a4555')
      doc.setFontSize(6)
      doc.setFont('helvetica', 'normal')
      doc.text(mlabel, mx, y + 10)
      setTxt('#00e5b0')
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text(mval, mx, y + 20)
    })
  }
  y += 38

  // ── MODEL COMPARISON TABLE ──────────────────────────────────────────────────
  checkY(10)
  setTxt('#dde4f0')
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Model Comparison', margin, y)
  setFill('#00e5b0')
  doc.rect(margin, y + 2, 28, 0.8, 'F')
  y += 10

  // Table headers
  const tHeaders = isClass
    ? ['Model', 'CV Score', 'CV Std', 'Accuracy', 'F1 Score', 'ROC-AUC', 'Time(s)']
    : ['Model', 'CV Score', 'CV Std', 'RMSE', 'R²', 'Time(s)']
  const tColW = isClass
    ? [55, 22, 20, 22, 22, 22, 18]
    : [65, 25, 22, 25, 25, 18]

  // Header row
  setFill('#141820')
  doc.rect(margin, y, contentW, 8, 'F')
  setTxt('#7a8899')
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  let tx = margin + 3
  tHeaders.forEach((h, i) => {
    doc.text(h, tx, y + 5.5)
    tx += tColW[i]
  })
  y += 8

  // Data rows
  results.model_metrics?.forEach((m, idx) => {
    checkY(9)
    const isBest = m.model_name === results.best_model
    if (isBest) {
      setFill('#0a1a14')
      doc.rect(margin, y, contentW, 8, 'F')
      // Left accent
      setFill('#00e5b0')
      doc.rect(margin, y, 2, 8, 'F')
    } else if (idx % 2 === 0) {
      setFill('#0e1117')
      doc.rect(margin, y, contentW, 8, 'F')
    }

    const rowData = isClass
      ? [
          (isBest ? '★ ' : '') + m.model_name,
          (m.cv_mean*100).toFixed(2)+'%',
          '±'+(m.cv_std*100).toFixed(2)+'%',
          m.accuracy != null ? (m.accuracy*100).toFixed(2)+'%' : '—',
          m.f1_score != null ? (m.f1_score*100).toFixed(2)+'%' : '—',
          m.roc_auc  != null ? (m.roc_auc*100).toFixed(2)+'%'  : '—',
          m.train_time_sec+'s',
        ]
      : [
          (isBest ? '★ ' : '') + m.model_name,
          (m.cv_mean*100).toFixed(2)+'%',
          '±'+(m.cv_std*100).toFixed(2)+'%',
          m.rmse != null ? m.rmse.toFixed(4) : '—',
          m.r2   != null ? (m.r2*100).toFixed(2)+'%' : '—',
          m.train_time_sec+'s',
        ]

    doc.setFont('helvetica', isBest ? 'bold' : 'normal')
    doc.setFontSize(7.5)
    tx = margin + 3
    rowData.forEach((cell, i) => {
      setTxt(isBest && i === 0 ? '#00e5b0' : '#c9d1d9')
      doc.text(String(cell), tx, y + 5.5)
      tx += tColW[i]
    })
    y += 8
  })
  y += 8

  // ── FEATURE IMPORTANCE ──────────────────────────────────────────────────────
  if (results.feature_importance?.length > 0) {
    checkY(15)
    setTxt('#dde4f0')
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Feature Importance', margin, y)
    setFill('#00e5b0')
    doc.rect(margin, y + 2, 32, 0.8, 'F')
    y += 10

    setTxt('#7a8899')
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text(`Top features used by ${results.best_model}`, margin, y)
    y += 6

    const maxImp = results.feature_importance[0].importance
    const barMaxW = contentW - 60

    results.feature_importance.slice(0, 15).forEach((fi, i) => {
      checkY(8)
      const barW = Math.max(2, (fi.importance / maxImp) * barMaxW)
      const pct = (fi.importance * 100).toFixed(2)

      // Rank
      setTxt('#3a4555')
      doc.setFontSize(7)
      doc.text(`#${i+1}`, margin, y + 4.5)

      // Feature name
      setTxt('#c9d1d9')
      doc.setFontSize(7.5)
      const truncName = fi.feature.length > 20 ? fi.feature.slice(0,20)+'…' : fi.feature
      doc.text(truncName, margin + 10, y + 4.5)

      // Bar background
      setFill('#141820')
      doc.roundedRect(margin + 58, y + 1, barMaxW, 5, 1, 1, 'F')

      // Bar fill — gradient effect via opacity
      const alpha = 0.9 - i * 0.04
      doc.setFillColor(0, Math.round(229*alpha), Math.round(176*alpha))
      doc.roundedRect(margin + 58, y + 1, barW, 5, 1, 1, 'F')

      // Percentage
      setTxt('#7a8899')
      doc.setFontSize(7)
      doc.text(pct+'%', margin + 58 + barMaxW + 2, y + 4.5)

      y += 8
    })
    y += 6
  }

  // ── CORRELATION HEATMAP ─────────────────────────────────────────────────────
  if (results.correlation_matrix) {
    const cols = Object.keys(results.correlation_matrix)
    if (cols.length >= 2) {
      checkY(20)
      setTxt('#dde4f0')
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text('Correlation Matrix', margin, y)
      setFill('#00e5b0')
      doc.rect(margin, y + 2, 28, 0.8, 'F')
      y += 10

      // Draw heatmap as colored rectangles
      const maxCols = Math.min(cols.length, 12)
      const displayCols = cols.slice(0, maxCols)
      const cellPx = Math.min(10, Math.floor(contentW / (maxCols + 3)))
      const labelW = 28
      const heatmapW = displayCols.length * cellPx
      const totalH = displayCols.length * cellPx + 20 // +20 for col labels

      checkY(totalH + 10)

      // Column labels (rotated via small font + truncate)
      setTxt('#7a8899')
      doc.setFontSize(5.5)
      displayCols.forEach((c, ci) => {
        const lx = margin + labelW + ci * cellPx + cellPx / 2
        const truncC = c.length > 8 ? c.slice(0,8)+'…' : c
        // Print vertically by drawing char by char is complex — just print short labels
        doc.text(truncC, lx, y + 8, { angle: 45, align: 'right' })
      })
      y += 14

      // Rows
      displayCols.forEach((r, ri) => {
        checkY(cellPx + 2)
        // Row label
        setTxt('#7a8899')
        doc.setFontSize(5.5)
        const truncR = r.length > 10 ? r.slice(0,10)+'…' : r
        doc.text(truncR, margin + labelW - 2, y + cellPx / 2 + 1.5, { align: 'right' })

        // Cells
        displayCols.forEach((c, ci) => {
          const val = results.correlation_matrix[r]?.[c]
          if (val == null) return

          const abs = Math.abs(val)
          const intensity = 0.1 + abs * 0.85
          let r2, g2, b2
          if (val > 0) {
            r2 = Math.round(0   * intensity)
            g2 = Math.round(229 * intensity)
            b2 = Math.round(176 * intensity)
          } else {
            r2 = Math.round(239 * intensity)
            g2 = Math.round(68  * intensity)
            b2 = Math.round(68  * intensity)
          }
          doc.setFillColor(r2, g2, b2)
          doc.rect(margin + labelW + ci * cellPx, y, cellPx - 1, cellPx - 1, 'F')

          // Value text if cell big enough
          if (cellPx >= 8) {
            setTxt(abs > 0.5 ? '#ffffff' : '#8b949e')
            doc.setFontSize(4)
            doc.text(val.toFixed(2), margin + labelW + ci * cellPx + cellPx/2, y + cellPx/2 + 1, { align: 'center' })
          }
        })
        y += cellPx
      })

      // Legend
      y += 6
      setTxt('#3a4555')
      doc.setFontSize(7)
      doc.setFillColor(239, 68, 68)
      doc.rect(margin, y, 4, 4, 'F')
      doc.text('Negative correlation', margin + 6, y + 3.5)
      doc.setFillColor(0, 229, 176)
      doc.rect(margin + 50, y, 4, 4, 'F')
      doc.text('Positive correlation', margin + 56, y + 3.5)
      y += 10
    }
  }

  // ── FOOTER on each page ─────────────────────────────────────────────────────
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    setFill('#0e1117')
    doc.rect(0, 287, W, 10, 'F')
    setTxt('#3a4555')
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text('DataPilot AI — Autonomous ML Platform', margin, 293)
    doc.text(`Page ${i} of ${pageCount}`, W - margin, 293, { align: 'right' })
  }

  doc.save(`datapilot_report_${Date.now()}.pdf`)
}

// ════════════════════════════════════════════════════════════
//  RESULTS PAGE
// ════════════════════════════════════════════════════════════
export function ResultsPage({ results, filename, sessionId, setPage }) {
  const pdfRef = useRef(null)

  if (!results) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 100 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔬</div>
        <div style={{ color: C.text3, fontSize: 15, marginBottom: 20 }}>No results yet. Run an analysis first.</div>
        <button onClick={() => setPage('upload')} style={{ padding: '11px 24px', background: `linear-gradient(135deg,${C.accent},#00c49a)`, border: 'none', borderRadius: 9, color: '#07090d', fontWeight: 700, cursor: 'pointer', fontSize: 14, fontFamily: C.sans }}>
          ← Upload Dataset
        </button>
      </div>
    )
  }

  const isClass = results.problem_type === 'classification'

  const modelChartData = results.model_metrics?.map(m => ({
    name: m.model_name.replace(' Regressor', '').replace(' Regression', ' Reg'),
    'CV Score': +(m.cv_mean * 100).toFixed(2),
    ...(isClass
      ? { Accuracy: +((m.accuracy || 0) * 100).toFixed(2), F1: +((m.f1_score || 0) * 100).toFixed(2) }
      : { 'R²': +((m.r2 || 0) * 100).toFixed(2) }),
  }))

  const featureChartData = results.feature_importance?.slice(0, 10).map(f => ({
    name: f.feature.length > 14 ? f.feature.slice(0, 14) + '…' : f.feature,
    importance: +(f.importance * 100).toFixed(2),
  }))

  return (
    <div ref={pdfRef}>
      {/* ── Page header ── */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5 }}>Analysis Results</h1>
          <p style={{ color: C.text2, fontSize: 13, marginTop: 5 }}>
            {filename}
            <span style={{ marginLeft: 8, padding: '2px 9px', borderRadius: 20, background: 'rgba(59,142,243,0.1)', color: C.blue, fontSize: 10, fontFamily: C.mono, border: `1px solid rgba(59,142,243,0.2)` }}>
              {results.problem_type}
            </span>
          </p>
        </div>

        {/* ── Download buttons ── */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <DownloadButton
            label="⬇ Cleaned CSV"
            title="Download the cleaned & preprocessed dataset"
            color={C.blue}
            onClick={() => downloadCleanedCSV(sessionId, filename)}
          />
          <DownloadButton
            label="📄 PDF Report"
            title="Download full analysis report as PDF"
            color={C.accent}
            onClick={() => generatePDF(results, filename)}
            primary
          />
        </div>
      </div>

      {/* ── Best model banner ── */}
      <BestModelBanner results={results} isClass={isClass} />

      {/* ── Charts row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <ModelComparisonChart modelChartData={modelChartData} isClass={isClass} />
        {featureChartData?.length > 0 && <FeatureImportanceChart featureChartData={featureChartData} />}
      </div>

      {/* ── Correlation heatmap ── */}
      {results.correlation_matrix && Object.keys(results.correlation_matrix).length > 1 && (
        <Card style={{ marginBottom: 20 }}>
          <Label>Correlation Matrix Heatmap</Label>
          <CorrelationHeatmap matrix={results.correlation_matrix} />
        </Card>
      )}

      {/* ── Full metrics table ── */}
      <MetricsTable results={results} isClass={isClass} />

      {/* ── Feature importance bars ── */}
      {results.feature_importance?.length > 0 && (
        <Card style={{ marginTop: 20 }}>
          <Label>Feature Importance Detail — {results.best_model}</Label>
          {results.feature_importance.map((fi, i) => (
            <div key={fi.feature} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{ width: 22, fontSize: 10, fontFamily: C.mono, color: C.text3, textAlign: 'right' }}>#{i + 1}</div>
              <div style={{ width: 140, fontSize: 11, fontFamily: C.mono, color: C.text2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={fi.feature}>{fi.feature}</div>
              <div style={{ flex: 1, background: C.surface2, borderRadius: 3, height: 7, overflow: 'hidden' }}>
                <div style={{ width: `${(fi.importance / results.feature_importance[0].importance * 100).toFixed(0)}%`, height: '100%', background: `linear-gradient(90deg,${C.accent},${C.blue})`, borderRadius: 3, transition: 'width 0.5s ease' }} />
              </div>
              <div style={{ width: 50, fontSize: 10, fontFamily: C.mono, color: C.text3, textAlign: 'right' }}>{(fi.importance * 100).toFixed(2)}%</div>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}

// ── Download button component ─────────────────────────────────────────────────
function DownloadButton({ label, title, color, onClick, primary = false }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        display: 'flex', alignItems: 'center', gap: 7,
        padding: '10px 18px',
        background: primary ? `linear-gradient(135deg,${color},#00c49a)` : C.surface,
        border: `1px solid ${primary ? 'transparent' : color}`,
        borderRadius: 9,
        color: primary ? '#07090d' : color,
        cursor: 'pointer', fontSize: 13, fontWeight: 600,
        fontFamily: C.sans, transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  )
}

// ── Best model banner ─────────────────────────────────────────────────────────
function BestModelBanner({ results, isClass }) {
  const best = results.model_metrics?.find(m => m.model_name === results.best_model)
  return (
    <div style={{ background: 'linear-gradient(135deg,rgba(0,229,176,0.05),rgba(59,142,243,0.03))', border: `1px solid rgba(0,229,176,0.2)`, borderRadius: 14, padding: '22px 26px', display: 'flex', alignItems: 'center', gap: 22, marginBottom: 20, flexWrap: 'wrap' }}>
      <div style={{ width: 54, height: 54, background: 'linear-gradient(135deg,#00e5b0,#3b8ef3)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>🏆</div>
      <div style={{ flex: 1, minWidth: 140 }}>
        <div style={{ fontSize: 10, fontFamily: C.mono, color: C.text3, letterSpacing: 2, marginBottom: 5 }}>BEST MODEL SELECTED</div>
        <div style={{ fontSize: 21, fontWeight: 700 }}>{results.best_model}</div>
      </div>
      {best && (
        <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
          {best.accuracy != null && <Metric value={(best.accuracy*100).toFixed(1)+'%'} label="Accuracy" color={C.accent} />}
          {best.f1_score != null && <Metric value={(best.f1_score*100).toFixed(1)+'%'} label="F1 Score" color={C.blue} />}
          {best.roc_auc  != null && <Metric value={(best.roc_auc*100).toFixed(1)+'%'}  label="ROC-AUC"  color={C.purple} />}
          {best.rmse     != null && <Metric value={best.rmse.toFixed(4)}               label="RMSE"     color={C.accent} />}
          {best.r2       != null && <Metric value={(best.r2*100).toFixed(1)+'%'}       label="R²"       color={C.blue} />}
          {best.cv_mean  != null && <Metric value={(best.cv_mean*100).toFixed(1)+'%'}  label="CV Score" color={C.warn} />}
        </div>
      )}
    </div>
  )
}

// ── Model comparison bar chart ────────────────────────────────────────────────
function ModelComparisonChart({ modelChartData, isClass }) {
  return (
    <Card>
      <Label>Model Comparison — CV Score %</Label>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={modelChartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
          <XAxis dataKey="name" tick={{ fill: C.text2, fontSize: 10, fontFamily: C.mono }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: C.text3, fontSize: 10, fontFamily: C.mono }} axisLine={false} tickLine={false} domain={[0, 100]} />
          <Tooltip content={<ChartTooltip />} />
          <Legend wrapperStyle={{ fontSize: 10, fontFamily: C.mono, color: C.text2 }} />
          <Bar dataKey="CV Score" radius={[4, 4, 0, 0]}>
            {modelChartData?.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
          </Bar>
          {isClass && <Bar dataKey="Accuracy" radius={[4, 4, 0, 0]} fill={C.blue} opacity={0.7} />}
          {isClass && <Bar dataKey="F1" radius={[4, 4, 0, 0]} fill={C.purple} opacity={0.7} />}
          {!isClass && <Bar dataKey="R²" radius={[4, 4, 0, 0]} fill={C.blue} opacity={0.7} />}
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}

// ── Feature importance chart ──────────────────────────────────────────────────
function FeatureImportanceChart({ featureChartData }) {
  return (
    <Card>
      <Label>Feature Importance — Top 10</Label>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={featureChartData} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} />
          <XAxis type="number" tick={{ fill: C.text3, fontSize: 9, fontFamily: C.mono }} axisLine={false} tickLine={false} domain={[0, 'auto']} tickFormatter={v => v + '%'} />
          <YAxis type="category" dataKey="name" tick={{ fill: C.text2, fontSize: 9, fontFamily: C.mono }} axisLine={false} tickLine={false} width={90} />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="importance" name="Importance %" radius={[0, 4, 4, 0]}>
            {featureChartData.map((_, i) => <Cell key={i} fill={`rgba(0,229,176,${0.9 - i * 0.07})`} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}

// ── Correlation Heatmap (SVG) ─────────────────────────────────────────────────
export function CorrelationHeatmap({ matrix }) {
  if (!matrix || !Object.keys(matrix).length) return null
  const cols = Object.keys(matrix)
  if (cols.length < 2) return null

  const cellSize = Math.min(52, Math.max(32, Math.floor(520 / cols.length)))
  const padLeft  = 90
  const padTop   = 90
  const padRight = 60

  const svgWidth  = padLeft + cols.length * cellSize + padRight
  const svgHeight = padTop  + cols.length * cellSize + 10

  const getColor = v => {
    if (v == null) return C.surface2
    const abs = Math.abs(v)
    return v > 0
      ? `rgba(0,229,176,${0.1 + abs * 0.85})`
      : `rgba(239,68,68,${0.1 + abs * 0.85})`
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width={svgWidth} height={svgHeight} style={{ fontFamily: C.mono }}>
        {cols.map((c, ci) => {
          const x = padLeft + ci * cellSize + cellSize / 2
          const y = padTop - 8
          return (
            <text key={`col-${c}`} x={x} y={y} textAnchor="start"
              transform={`rotate(-45,${x},${y})`}
              fontSize={Math.max(8, Math.min(11, cellSize * 0.22))} fill={C.text2}>
              {c.length > 12 ? c.slice(0, 12) + '…' : c}
            </text>
          )
        })}
        {cols.map((r, ri) => (
          <text key={`row-${r}`} x={padLeft - 8} y={padTop + ri * cellSize + cellSize / 2 + 4}
            textAnchor="end" fontSize={Math.max(8, Math.min(11, cellSize * 0.22))} fill={C.text2}>
            {r.length > 12 ? r.slice(0, 12) + '…' : r}
          </text>
        ))}
        {cols.map((r, ri) => cols.map((c, ci) => {
          const val = matrix[r]?.[c]
          return (
            <g key={`${r}-${c}`}>
              <rect x={padLeft + ci * cellSize} y={padTop + ri * cellSize}
                width={cellSize - 2} height={cellSize - 2} rx={3} fill={getColor(val)} />
              {cellSize > 30 && val != null && (
                <text x={padLeft + ci * cellSize + cellSize / 2} y={padTop + ri * cellSize + cellSize / 2 + 4}
                  textAnchor="middle" fontSize={Math.max(7, Math.min(10, cellSize * 0.2))}
                  fill={Math.abs(val) > 0.5 ? '#fff' : C.text2}>
                  {val.toFixed(2)}
                </text>
              )}
            </g>
          )
        }))}
      </svg>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, fontFamily: C.mono, fontSize: 10, color: C.text2 }}>
        <span style={{ color: 'rgba(239,68,68,0.9)' }}>■</span> Negative
        <span style={{ marginLeft: 8, color: 'rgba(0,229,176,0.9)' }}>■</span> Positive
        <span style={{ color: C.text3, marginLeft: 8 }}>(darker = stronger)</span>
      </div>
    </div>
  )
}

// ── Full metrics table ────────────────────────────────────────────────────────
function MetricsTable({ results, isClass }) {
  return (
    <Card>
      <Label>All Models — Full Metrics</Label>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              {['Model','CV Score','CV Std', isClass?'Accuracy':'RMSE', isClass?'F1 Score':'R²', isClass?'ROC-AUC':null,'Train Time']
                .filter(Boolean).map(h => (
                  <th key={h} style={{ textAlign:'left', padding:'10px 14px', fontFamily:C.mono, fontSize:9, color:C.text3, borderBottom:`1px solid ${C.border}`, letterSpacing:1.5, textTransform:'uppercase', whiteSpace:'nowrap' }}>{h}</th>
                ))}
            </tr>
          </thead>
          <tbody>
            {results.model_metrics?.map((m, idx) => (
              <tr key={m.model_name} style={{ background: m.model_name===results.best_model ? 'rgba(0,229,176,0.03)' : idx%2===0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                <td style={{ padding:'12px 14px', borderBottom:`1px solid ${C.border}`, color: m.model_name===results.best_model ? C.accent : C.text, fontWeight: m.model_name===results.best_model ? 600 : 400 }}>
                  {m.model_name===results.best_model ? '🏆 ':''}{m.model_name}
                </td>
                <td style={{ padding:'12px 14px', borderBottom:`1px solid ${C.border}`, fontFamily:C.mono, color:C.text2 }}>{(m.cv_mean*100).toFixed(2)}%</td>
                <td style={{ padding:'12px 14px', borderBottom:`1px solid ${C.border}`, fontFamily:C.mono, color:C.text3 }}>±{(m.cv_std*100).toFixed(2)}%</td>
                <td style={{ padding:'12px 14px', borderBottom:`1px solid ${C.border}`, fontFamily:C.mono, color:C.text2 }}>
                  {isClass ? (m.accuracy!=null?(m.accuracy*100).toFixed(2)+'%':'—') : (m.rmse!=null?m.rmse.toFixed(4):'—')}
                </td>
                <td style={{ padding:'12px 14px', borderBottom:`1px solid ${C.border}`, fontFamily:C.mono, color:C.text2 }}>
                  {isClass ? (m.f1_score!=null?(m.f1_score*100).toFixed(2)+'%':'—') : (m.r2!=null?(m.r2*100).toFixed(2)+'%':'—')}
                </td>
                {isClass && <td style={{ padding:'12px 14px', borderBottom:`1px solid ${C.border}`, fontFamily:C.mono, color:C.text2 }}>{m.roc_auc!=null?(m.roc_auc*100).toFixed(2)+'%':'—'}</td>}
                <td style={{ padding:'12px 14px', borderBottom:`1px solid ${C.border}`, fontFamily:C.mono, color:C.text3 }}>{m.train_time_sec}s</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}