# DataPilot AI — Autonomous Data Scientist Agent Platform

A production-ready full-stack AutoML platform. Upload a CSV, select a target column, and the system automatically cleans your data, trains multiple ML models, selects the best one, and delivers a visual dashboard with downloadable PDF report and cleaned dataset.

![Status](https://img.shields.io/badge/status-stable-brightgreen)
![Python](https://img.shields.io/badge/python-3.12-blue)
![Node.js](https://img.shields.io/badge/node.js-v24-green)
![MongoDB](https://img.shields.io/badge/mongodb-8.2.5-green)
![React](https://img.shields.io/badge/react-19-61dafb)
![FastAPI](https://img.shields.io/badge/fastapi-0.111-009688)

---

## Table of Contents

- [What This Does](#what-this-does)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start — Local Development](#quick-start--local-development)
- [Quick Start — Docker](#quick-start--docker)
- [Environment Variables](#environment-variables)
- [Frontend Architecture](#frontend-architecture)
- [ML Pipeline](#ml-pipeline)
- [API Reference](#api-reference)
- [Download Features](#download-features)
- [Known Issues & Fixes](#known-issues--fixes)
- [Performance Notes](#performance-notes)
- [Deployment](#deployment)
- [Troubleshooting Checklist](#troubleshooting-checklist)
- [What To Build Next](#what-to-build-next)

---

## What This Does

DataPilot AI is a zero-code AutoML platform that runs a full data science pipeline automatically:

1. **Upload** — drag-and-drop CSV upload with live data preview (first 5 rows)
2. **Select Target** — pick which single column to predict using chips or dropdown
3. **Pipeline runs automatically (6 stages):**
   - Data Understanding — detects column types, null %, problem type
   - Data Cleaning — removes duplicates, fills nulls, encodes categoricals
   - Feature Engineering — scales numerics, builds X/y matrices
   - Statistical Analysis — descriptive stats, Pearson correlation matrix
   - Model Training — trains 3 models simultaneously
   - Model Evaluation — cross-validation, test metrics, best model selection
4. **Results Dashboard:**
   - Best model banner with key metrics (Accuracy, F1, ROC-AUC / RMSE, R²)
   - Model comparison bar chart (CV Score, Accuracy, F1 or R²)
   - Feature importance horizontal bar chart (top 10)
   - Correlation matrix heatmap (SVG, teal = positive, red = negative)
   - Full metrics table comparing all models
5. **Download:**
   - **Cleaned CSV** — the preprocessed dataset ready for external use
   - **PDF Report** — full A4 report with metrics table, feature importance bars, correlation heatmap, and best model summary

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend | React | 19 |
| Frontend | Vite | 7 |
| Frontend | Recharts | 3.x |
| Frontend | Axios | 1.x |
| Frontend | jsPDF (PDF generation) | 2.5 (CDN, no install) |
| Backend | Python | 3.12 |
| Backend | FastAPI | 0.111 |
| Backend | Uvicorn | 0.30 |
| ML | Scikit-learn | 1.5 |
| ML | Pandas | 2.2 |
| ML | NumPy | 1.26 |
| ML | SciPy | 1.13 |
| Database | MongoDB | 8.2.5 |
| Database | Motor (async driver) | 3.7.1 |
| Database | PyMongo | 4.10.1 |
| DevOps | Docker + docker-compose | Latest |
| DevOps | Kubernetes | k8s/ manifests |

---

## Project Structure

```
DataPilot_AI/
├── docker-compose.yml               # Full stack: MongoDB + Backend + Frontend
├── README.md                        # This file
│
├── backend/
│   ├── Dockerfile                   # Python 3.12 slim image
│   ├── requirements.txt             # Pinned Python dependencies
│   ├── .env                         # Environment variables (UTF-8, create manually)
│   └── app/
│       ├── main.py                  # FastAPI entry point + CORS + GZip middleware
│       ├── agents/
│       │   └── orchestrator.py      # Full ML pipeline async runner
│       ├── api/
│       │   └── routes/
│       │       ├── upload.py        # POST /api/v1/upload
│       │       ├── analyze.py       # POST /api/v1/analyze
│       │       ├── status.py        # GET  /api/v1/status/{session_id}
│       │       ├── results.py       # GET  /api/v1/results/{session_id}
│       │       └── download.py      # GET  /api/v1/download/{session_id}
│       ├── core/
│       │   ├── config.py            # Pydantic settings (ALLOWED_ORIGINS hardcoded here)
│       │   └── database.py          # MongoDB async connection via Motor
│       ├── models/
│       │   └── schemas.py           # Pydantic request/response schemas
│       └── modules/
│           ├── data_understanding.py  # Column type detection, problem type
│           ├── data_cleaning.py       # Null handling, encoding, dedup
│           ├── feature_engineering.py # Scaling, X/y preparation
│           ├── statistical_analysis.py # Descriptive stats, correlation matrix
│           ├── model_training.py      # Train classification/regression models
│           └── model_evaluation.py    # CV, metrics, feature importance
│
├── frontend/
│   ├── Dockerfile                   # Node 24 builder + nginx:alpine production
│   ├── nginx.conf                   # SPA routing + static asset caching
│   ├── package.json                 # Dependencies: React 19, Vite 7, Recharts 3
│   ├── vite.config.js               # Vite build configuration
│   ├── .env                         # VITE_API_BASE_URL (create manually)
│   └── src/
│       ├── main.jsx                 # React entry point — do not modify
│       ├── App.jsx                  # Global layout, all state, polling, routing
│       ├── Pages.jsx                # UploadPage + ProcessingPage components
│       ├── ResultsPage.jsx          # Charts, heatmap, metrics, PDF/CSV download
│       └── constants.jsx            # ALL shared: design tokens, Card, Label,
│                                    # Metric, ChartTooltip, CHART_COLORS,
│                                    # PIPELINE_STEPS
│
└── k8s/                             # Kubernetes deployment manifests
```

---

## Prerequisites

| Software | Required Version | Download |
|---|---|---|
| Python | 3.12.x | https://www.python.org/downloads/ |
| Node.js | 24.x | https://nodejs.org/ |
| MongoDB | 8.2.5 | https://www.mongodb.com/try/download/community |
| Docker | Latest (optional) | https://www.docker.com/products/docker-desktop |

Verify before starting:

```powershell
python --version    # Must show: Python 3.12.x
node --version      # Must show: v24.x.x
npm --version       # Must show: 10.x.x or higher
mongod --version    # Must show: db version v8.2.5
```

---

## Quick Start — Local Development

### Step 1 — Start MongoDB

```powershell
# Verify MongoDB is running
mongosh
# If you see a prompt, type 'exit' — MongoDB is running fine

# If mongosh fails, start MongoDB manually
mkdir C:\data\db    # Only needed first time
mongod --dbpath "C:\data\db"
```

### Step 2 — Backend Setup

```powershell
cd D:\Jame\DataPilot_AI\backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate
# You should now see (venv) at the start of your prompt

# Install all dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

**Create `.env` file** — must be **UTF-8 encoded** (see Known Issues #1 if unsure):

```env
MONGODB_URL=mongodb://127.0.0.1:27017
MONGODB_DB=datapilot
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=100
CV_FOLDS=5
TEST_SIZE=0.2
RANDOM_STATE=42
DEBUG=False
APP_NAME=AutoML Agent Platform
```

> ⚠️ **Do NOT add `ALLOWED_ORIGINS` to `.env`** — it is hardcoded in `config.py` to avoid
> pydantic-settings v2 JSON parsing errors. See Known Issues #2.

> ⚠️ **Do NOT use PowerShell `Out-File` without `-Encoding UTF8`** — PowerShell saves UTF-16
> by default which breaks dotenv. Use VS Code or `Out-File .env -Encoding UTF8`.

**Start the backend:**

```powershell
uvicorn app.main:app --reload --port 8000
```

**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Started reloader process [xxxxx]
INFO:     Connected to MongoDB: datapilot
INFO:     Application startup complete.
```

If you see errors, check [Known Issues & Fixes](#known-issues--fixes) below.

### Step 3 — Frontend Setup

```powershell
cd D:\Jame\DataPilot_AI\frontend

# Install all npm packages (includes React, Vite, Recharts, Axios)
npm install
```

**Create `.env` file:**

```env
VITE_API_BASE_URL=http://localhost:8000
```

**Start the development server:**

```powershell
npm run dev
```

**Expected output:**
```
VITE v7.x  ready in 269ms
➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Step 4 — Open the App

Go to **http://localhost:5173** in your browser.

You should see the DataPilot AI upload interface with a CONNECTED indicator in the top right.

---

## Quick Start — Docker

Runs the entire stack — MongoDB + Backend + Frontend — with a single command. No manual setup needed.

```powershell
cd D:\Jame\DataPilot_AI

docker compose up --build
```

First build takes 3–5 minutes (downloads base images and installs dependencies). Subsequent starts are instant.

After build completes:

| Service | URL |
|---|---|
| Frontend | http://localhost:80 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| API Docs (ReDoc) | http://localhost:8000/redoc |

**Stop the stack:**
```powershell
docker compose down          # Stop but keep MongoDB data
docker compose down -v       # Stop and delete all data volumes
```

**Rebuild after code changes:**
```powershell
docker compose up --build
```

---

## Environment Variables

### Backend `.env`

| Variable | Default | Description |
|---|---|---|
| `MONGODB_URL` | `mongodb://127.0.0.1:27017` | MongoDB connection string |
| `MONGODB_DB` | `datapilot` | Database name |
| `UPLOAD_DIR` | `uploads` | Directory where uploaded CSVs are stored |
| `MAX_FILE_SIZE_MB` | `100` | Maximum upload file size in MB |
| `CV_FOLDS` | `5` | Cross-validation folds (reduce to 2–3 for small datasets) |
| `TEST_SIZE` | `0.2` | Fraction of data held out for testing (0.0–1.0) |
| `RANDOM_STATE` | `42` | Random seed for reproducibility |
| `DEBUG` | `False` | Enable debug mode |
| `APP_NAME` | `AutoML Agent Platform` | Application name shown in logs |

> `ALLOWED_ORIGINS` is **not** read from `.env`. It is defined as a Python list directly
> in `config.py`. Edit that file to add new origins for production deployments.

### Frontend `.env`

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8000` | Backend API URL. Must start with `VITE_` for Vite to expose it. |

---

## Frontend Architecture

The `frontend/src/` directory contains exactly **4 source files** plus `main.jsx`:

### `constants.jsx`
Single source of truth for all shared code:
- `C` — design token object (colors, fonts, spacing)
- `CHART_COLORS` — array of chart palette colors
- `PIPELINE_STEPS` — ordered list of pipeline stage names
- `Card` — reusable card wrapper component
- `Label` — section label component
- `Metric` — metric display component (value + label)
- `ChartTooltip` — custom Recharts tooltip component

> ⚠️ All other source files import from `./constants`. Do not create additional utility files
> (`utils.jsx`, `config.jsx`, etc.) — this causes duplicate export errors. See Known Issues #4.

### `App.jsx`
- Global layout: header, sidebar navigation, main content area
- Holds all application state (session, columns, results, status, etc.)
- Handles polling logic (checks status every 2 seconds during processing)
- Routes between Upload / Processing / Results views
- Calls `startAnalysis()` and passes it down as `onStartAnalysis` prop

### `Pages.jsx`
- `UploadPage` — CSV drag-and-drop, file preview table, column chip selector, start button
- `ProcessingPage` — progress bar, pipeline step tracker, live log console
- `StartButton` — exported separately for use in App.jsx sidebar

### `ResultsPage.jsx`
- Best model banner with live metrics
- Model comparison bar chart (Recharts `BarChart`)
- Feature importance horizontal bar chart (Recharts `BarChart` layout=vertical)
- Correlation matrix heatmap (pure SVG, no external library)
- Full metrics comparison table
- Feature importance detail bars
- **Download Cleaned CSV** button — calls backend `/api/v1/download/{session_id}`
- **Download PDF Report** button — generates A4 PDF using jsPDF (loaded from CDN)

---

## ML Pipeline

The pipeline runs 6 sequential stages inside `orchestrator.py`:

| Stage | Module | What It Does |
|---|---|---|
| Data Understanding | `data_understanding.py` | Reads CSV, detects column types, counts nulls, detects problem type (classification if target has ≤20 unique values or is string/bool, else regression) |
| Data Cleaning | `data_cleaning.py` | Removes duplicate rows, fills numeric nulls with median, fills categorical nulls with mode, applies LabelEncoder to categorical columns |
| Feature Engineering | `feature_engineering.py` | Applies StandardScaler to numeric features, builds final X matrix and y vector |
| Statistical Analysis | `statistical_analysis.py` | Computes descriptive statistics (mean, std, min, max, quartiles), builds Pearson correlation matrix |
| Model Training | `model_training.py` | Trains all models on the full training set |
| Model Evaluation | `model_evaluation.py` | Runs k-fold cross-validation, evaluates on held-out test set, extracts feature importances, selects best model |

### Models Trained

**Classification:**
- Logistic Regression (`max_iter=500`)
- Random Forest Classifier (`n_estimators=100`)
- Gradient Boosting Classifier (`n_estimators=100`)

**Regression:**
- Linear Regression
- Random Forest Regressor (`n_estimators=100`)
- Gradient Boosting Regressor (`n_estimators=100`)

### Evaluation Metrics

**Classification:** Accuracy, F1 Score (weighted), ROC-AUC (binary or OvR multiclass), CV Mean, CV Std, Train Time

**Regression:** RMSE, R², CV Mean, CV Std, Train Time

**Best model selection:** Highest cross-validation mean score (`f1_weighted` for classification, `r2` for regression).

### Feature Importance

Extracted from `feature_importances_` attribute (tree-based models) or `coef_` (linear models). Top 15 features returned, sorted by importance descending.

---

## API Reference

**Base URL:** `http://localhost:8000`

**Interactive docs:** http://localhost:8000/docs (Swagger UI)

**Schema docs:** http://localhost:8000/redoc (ReDoc)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check → `{"status":"ok"}` |
| `POST` | `/api/v1/upload` | Upload CSV file, returns session_id + columns |
| `POST` | `/api/v1/analyze` | Start ML pipeline for a session |
| `GET` | `/api/v1/status/{session_id}` | Poll progress (0–100%), current step, logs |
| `GET` | `/api/v1/results/{session_id}` | Get full results JSON when completed |
| `GET` | `/api/v1/download/{session_id}` | Download cleaned CSV as file |

### Upload Response Example

```json
{
  "session_id": "62dd1db6-aac4-4273-afec-abf8eaed6d0b",
  "filename": "customer_churn.csv",
  "columns": ["age", "tenure", "monthly_charges", "churn"],
  "shape": [1000, 4],
  "preview": [
    {"age": 25, "tenure": 12, "monthly_charges": 65.5, "churn": 0}
  ]
}
```

### Status Response Example

```json
{
  "status": "running",
  "progress": 60,
  "current_step": "Model Training",
  "logs": [
    "[Data Understanding] Loading dataset...",
    "[Data Understanding] Problem type: classification. Shape: (1000, 4)",
    "[Data Cleaning] Clean shape: (998, 4)",
    "[Feature Engineering] Features: 3",
    "[Statistical Analysis] Statistics complete.",
    "[Model Training] Training models..."
  ]
}
```

### Results Response Example

```json
{
  "session_id": "62dd1db6-...",
  "problem_type": "classification",
  "best_model": "Random Forest",
  "model_metrics": [
    {
      "model_name": "Random Forest",
      "cv_mean": 0.9124,
      "cv_std": 0.0213,
      "accuracy": 0.935,
      "f1_score": 0.9298,
      "roc_auc": 0.9712,
      "train_time_sec": 0.453
    }
  ],
  "feature_importance": [
    {"feature": "monthly_charges", "importance": 0.4821},
    {"feature": "tenure", "importance": 0.3104}
  ],
  "statistics": { ... },
  "correlation_matrix": { ... }
}
```

### Full Example Flow (curl)

```powershell
# 1. Upload CSV
curl -X POST -F "file=@mydata.csv" http://localhost:8000/api/v1/upload

# 2. Start analysis (replace session_id with value from step 1)
curl -X POST http://localhost:8000/api/v1/analyze `
  -H "Content-Type: application/json" `
  -d '{"session_id":"YOUR_SESSION_ID","target_column":"churn"}'

# 3. Poll status until "completed"
curl http://localhost:8000/api/v1/status/YOUR_SESSION_ID

# 4. Get results
curl http://localhost:8000/api/v1/results/YOUR_SESSION_ID

# 5. Download cleaned CSV
curl http://localhost:8000/api/v1/download/YOUR_SESSION_ID -o cleaned_data.csv
```

---

## Download Features

### Cleaned CSV

**Button:** `⬇ Cleaned CSV` on the Results page

**What it contains:** The original dataset after running through the full cleaning pipeline:
- Duplicate rows removed
- Numeric null values filled with column median
- Categorical null values filled with column mode
- Categorical columns label-encoded to numeric

**How it works:** Calls `GET /api/v1/download/{session_id}` → backend re-runs the cleaning modules on the stored original file → streams back as `filename_cleaned.csv`.

**Use case:** Take the cleaned data and use it in other tools (Excel, Jupyter, another ML platform) without having to clean it yourself.

---

### PDF Report

**Button:** `📄 PDF Report` on the Results page

**What it contains (A4 format):**
- Dark header with DataPilot AI branding and timestamp
- Dataset info row (problem type, best model, models tested, features used)
- Best model banner with all key metrics
- Full model comparison table with all models and metrics
- Feature importance bars (top 15, color-coded by rank)
- Correlation matrix heatmap (color-coded cells with values)
- Page footer with page numbers

**How it works:** Runs entirely in the browser. On first click, loads jsPDF 2.5.1 from the Cloudflare CDN. Generates the PDF using native jsPDF drawing commands (no screenshots, no html2canvas). Downloads as `datapilot_report_timestamp.pdf`.

**No npm install needed** — jsPDF loads automatically on first click.

---

## Known Issues & Fixes

These are real issues encountered during development, documented so you don't hit them again.

---

### ❌ Issue 1 — `.env` UnicodeDecodeError: `utf-8 codec can't decode byte 0xff`

**Full error:**
```
UnicodeDecodeError: 'utf-8' codec can't decode byte 0xff in position 0: invalid start byte
```

**Cause:** PowerShell's `Out-File` saves UTF-16 (with BOM) by default. The python-dotenv parser requires pure UTF-8.

**Fix — choose one method:**
```powershell
# Method 1: PowerShell with explicit encoding flag
@"
MONGODB_URL=mongodb://127.0.0.1:27017
MONGODB_DB=datapilot
"@ | Out-File .env -Encoding UTF8

# Method 2: Create the file in VS Code (File > New File > Save As .env)
# VS Code always saves as UTF-8 by default

# Method 3: Notepad → File > Save As → change Encoding dropdown to UTF-8
```

---

### ❌ Issue 2 — `error parsing value for field "ALLOWED_ORIGINS"`

**Full error:**
```
pydantic_settings.sources.SettingsError: error parsing value for field "ALLOWED_ORIGINS"
from source "DotEnvSettingsSource"
```

**Cause:** Pydantic-settings v2 automatically tries to JSON-parse any field typed as `List[str]` before any validator can run. A comma-separated string (`http://a,http://b`) fails JSON parsing. Even a correctly formatted JSON array can fail if the `.env` file has encoding issues.

**Fix:** `ALLOWED_ORIGINS` is removed from `.env` entirely and hardcoded as a Python list in `config.py`. To change allowed origins (e.g. for production), edit `config.py` directly:

```python
# backend/app/core/config.py
ALLOWED_ORIGINS: List[str] = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:8000",
    # Add your production URL here:
    # "https://your-production-domain.com",
]
```

---

### ❌ Issue 3 — `ImportError: cannot import name '_QUERY_OPTIONS'`

**Full error:**
```
ImportError: cannot import name '_QUERY_OPTIONS' from 'pymongo.cursor'
```

**Cause:** `motor==3.2.0` is incompatible with `pymongo>=4.5`. PyMongo 4.5 removed the internal `_QUERY_OPTIONS` attribute that older Motor versions depended on.

**Fix:** Upgrade both packages to compatible versions:
```powershell
pip install "motor==3.7.1" "pymongo==4.10.1"
```

The `requirements.txt` in this repo already has the correct versions pinned. Always use `pip install -r requirements.txt` rather than installing packages individually to avoid version drift.

---

### ⚠️ Warning — `n_splits=5 cannot be greater than the number of members in each class`

**Full message:**
```
Cross-validation failed: n_splits=5 cannot be greater than the number of members in each class.
```

**Cause:** Your dataset has fewer than 5 samples per class, so 5-fold CV is impossible. This commonly appears with small test datasets (< 50 rows).

**This is not a crash.** The code catches this exception and falls back to a simple train-score evaluation. Results are still returned correctly.

**To suppress the warning**, reduce `CV_FOLDS` in `.env`:
```env
CV_FOLDS=2
```

---

### ❌ Issue 4 — `does not provide an export named 'C'` (frontend)

**Full error in browser console:**
```
Pages.jsx:3  Uncaught SyntaxError: The requested module '/src/constants.jsx'
does not provide an export named 'C'
```

**Cause:** Multiple conflicting utility files exist in `src/` — e.g. `constants.jsx`, `config.jsx`, `Utils.jsx` — with overlapping or missing exports. Vite resolves the wrong file.

**Fix:** The `src/` directory must contain **exactly** these files and no others:

```
src/
├── App.jsx           ← imports from ./constants, ./Pages, ./ResultsPage
├── Pages.jsx         ← imports from ./constants
├── ResultsPage.jsx   ← imports from ./constants
├── constants.jsx     ← exports: C, CHART_COLORS, PIPELINE_STEPS, Card,
│                        Label, Metric, ChartTooltip
├── main.jsx          ← do not modify
├── App.css           ← keep as-is
└── index.css         ← keep as-is
```

Delete any extra files: `config.jsx`, `Utils.jsx`, `utils.jsx`, `pages.jsx` (lowercase), or any other duplicates.

---

## Performance Notes

| Dataset Size | Expected Analysis Time |
|---|---|
| < 1,000 rows | 10–30 seconds |
| 1,000–10,000 rows | 1–5 minutes |
| 10,000–100,000 rows | 5–15 minutes |
| > 100,000 rows | May hit memory limits |

**To speed up large datasets**, reduce in `.env`:
```env
CV_FOLDS=3       # Default 5 — fewer folds = faster
TEST_SIZE=0.1    # Default 0.2 — smaller test set = more training data, faster CV
```

**Memory tip:** Ensure MongoDB has sufficient RAM. For datasets > 50,000 rows, monitor backend memory usage.

---

## Deployment

### Option 1 — Docker Compose (Recommended for VPS/Server)

```powershell
# Production start (detached)
docker compose up --build -d

# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Stop
docker compose down
```

### Option 2 — Frontend Only (Static Hosting)

```powershell
cd frontend
npm run build
# Creates optimized production build in dist/
# Deploy dist/ to Vercel, Netlify, GitHub Pages, or any CDN
```

Preview the production build locally:
```powershell
npm run preview
```

### Option 3 — Kubernetes

Manifests are in the `k8s/` directory:
```powershell
kubectl apply -f k8s/
```

### Cloud Deployment Options

| Component | Recommended Services |
|---|---|
| Backend (FastAPI) | Azure App Service, AWS EC2, Google Cloud Run, Railway |
| Frontend (React) | Vercel, Netlify, GitHub Pages, Cloudflare Pages |
| Database (MongoDB) | MongoDB Atlas (managed), or self-hosted on VPS |

**For production**, update `config.py` with your production domain in `ALLOWED_ORIGINS`:
```python
ALLOWED_ORIGINS: List[str] = [
    "https://your-app.vercel.app",
    "https://your-custom-domain.com",
]
```

---

## Troubleshooting Checklist

Work through this list before asking for help:

- [ ] MongoDB is running — `mongosh` connects without error
- [ ] Virtual environment is activated — `(venv)` shows at start of terminal prompt
- [ ] `.env` is UTF-8 encoded — not UTF-16 (see Issue #1)
- [ ] `ALLOWED_ORIGINS` is **not** in `.env` — it lives only in `config.py` (see Issue #2)
- [ ] Motor and PyMongo are compatible versions — `motor==3.7.1` + `pymongo==4.10.1` (see Issue #3)
- [ ] `src/` has no duplicate utility files — only `constants.jsx`, no `utils.jsx` or `config.jsx` (see Issue #4)
- [ ] Frontend `.env` has `VITE_API_BASE_URL=http://localhost:8000`
- [ ] Backend is running on port 8000 — visit http://localhost:8000/health
- [ ] Frontend is running on port 5173 — visit http://localhost:5173
- [ ] Browser console (F12) shows no import errors
- [ ] For Docker: both `backend` and `frontend` containers show as healthy in `docker compose ps`

---

## What To Build Next

Features remaining from the original master plan, in recommended build order:

| Priority | Feature | Status |
|---|---|---|
| 🔴 High | GitHub Actions CI/CD pipeline | Not started |
| 🔴 High | Kubernetes manifests (k8s/ is empty) | Not started |
| 🟡 Medium | Exclude columns feature (ignore ID/name/date columns before analysis) | Not started |
| 🟡 Medium | Model saving + `/predict` endpoint (save best model with joblib, run predictions on new data) | Not started |
| 🟡 Medium | Session history page (view past analyses without re-running) | Not started |
| 🟢 Low | Tailwind CSS migration (replace inline styles) | Not started |
| 🟢 Low | More ML models (XGBoost, LightGBM, SVM, KNN) | Not started |

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

**Built for the data science community.**
For questions or issues, open a ticket on GitHub.