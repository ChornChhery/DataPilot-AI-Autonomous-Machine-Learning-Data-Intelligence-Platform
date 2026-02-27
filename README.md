# DataPilot AI — Autonomous Data Scientist Agent Platform

A production-ready full-stack AutoML platform that automatically analyzes CSV datasets, trains multiple ML models, and returns ranked results with visual reports.

![Status](https://img.shields.io/badge/status-stable-brightgreen)
![Python](https://img.shields.io/badge/python-3.12-blue)
![Node.js](https://img.shields.io/badge/node.js-v24-green)
![MongoDB](https://img.shields.io/badge/mongodb-8.2.5-green)

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start — Local Development](#quick-start--local-development)
- [Quick Start — Docker](#quick-start--docker)
- [Environment Variables](#environment-variables)
- [Known Issues & Fixes](#known-issues--fixes)
- [API Reference](#api-reference)
- [Frontend Pages](#frontend-pages)
- [ML Pipeline](#ml-pipeline)
- [Performance Notes](#performance-notes)
- [Deployment](#deployment)

---

## Project Overview

DataPilot AI is a zero-code AutoML platform. Upload a CSV, select a target column, and the system automatically:

1. Analyzes dataset structure and detects problem type (classification / regression)
2. Cleans and preprocesses data (handles missing values, encodes categoricals, scales numerics)
3. Runs statistical analysis and generates a correlation matrix
4. Trains multiple ML models in parallel
5. Evaluates models using cross-validation and selects the best one
6. Returns a visual dashboard with charts, feature importance, and a downloadable report

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 7, Recharts, Axios |
| Backend | Python 3.12, FastAPI, Uvicorn |
| ML | Scikit-learn, Pandas, NumPy, SciPy |
| Database | MongoDB 8.2.5, Motor (async driver) |
| DevOps | Docker, docker-compose, Kubernetes |

---

## Project Structure

```
DataPilot_AI/
├── docker-compose.yml               # Full stack local Docker setup
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .env                         # Environment variables (create manually)
│   └── app/
│       ├── main.py                  # FastAPI app entry point
│       ├── agents/
│       │   └── orchestrator.py      # ML pipeline runner
│       ├── api/routes/
│       │   ├── upload.py            # POST /api/v1/upload
│       │   ├── analyze.py           # POST /api/v1/analyze
│       │   ├── status.py            # GET  /api/v1/status/{id}
│       │   └── results.py           # GET  /api/v1/results/{id}
│       ├── core/
│       │   ├── config.py            # Pydantic settings
│       │   └── database.py          # MongoDB connection
│       ├── models/
│       │   └── schemas.py           # Pydantic schemas
│       └── modules/
│           ├── data_understanding.py
│           ├── data_cleaning.py
│           ├── feature_engineering.py
│           ├── statistical_analysis.py
│           ├── model_training.py
│           └── model_evaluation.py
│
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf                   # Production nginx config
│   ├── package.json
│   ├── vite.config.js
│   ├── .env                         # VITE_API_BASE_URL
│   └── src/
│       ├── App.jsx                  # Layout, state, routing
│       ├── pages.jsx                # UploadPage + ProcessingPage
│       ├── ResultsPage.jsx          # Charts, heatmap, metrics table
│       ├── utils.jsx                # Design tokens, shared components
│       └── main.jsx
│
└── k8s/                             # Kubernetes manifests
```

---

## Prerequisites

Install these before starting:

| Software | Version | Download |
|---|---|---|
| Python | 3.12.x | https://www.python.org/downloads/ |
| Node.js | 24.x | https://nodejs.org/ |
| MongoDB | 8.2.5 | https://www.mongodb.com/try/download/community |

Verify your installations:

```powershell
python --version    # Python 3.12.x
node --version      # v24.x.x
npm --version       # 10.x.x
mongod --version    # db version v8.2.5
```

---

## Quick Start — Local Development

### Step 1 — Start MongoDB

```powershell
# If installed as a Windows service, verify it's running:
mongosh
# Type 'exit' to close

# If not running, start manually:
mongod --dbpath "C:\data\db"
# Create the folder first if it doesn't exist: mkdir C:\data\db
```

### Step 2 — Backend Setup

```powershell
cd D:\Jame\DataPilot_AI\backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

Create the `.env` file. **Important: save as UTF-8**, not UTF-16.
The safest way is to create it manually in VS Code or Notepad, or download it from this repo.

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

> ⚠️ Do NOT create `.env` using PowerShell's `Out-File` without specifying `-Encoding UTF8`.
> PowerShell saves as UTF-16 by default which breaks dotenv parsing.
> Safe method: `Out-File .env -Encoding UTF8` or create it in VS Code.

Start the backend:

```powershell
uvicorn app.main:app --reload --port 8000
```

Expected output:
```
INFO: Uvicorn running on http://127.0.0.1:8000
INFO: Connected to MongoDB: datapilot
INFO: Application startup complete.
```

### Step 3 — Frontend Setup

```powershell
cd D:\Jame\DataPilot_AI\frontend

npm install
```

Create `.env` file:
```env
VITE_API_BASE_URL=http://localhost:8000
```

Start the dev server:
```powershell
npm run dev
```

Expected output:
```
VITE v7.x  ready in 269ms
➜  Local: http://localhost:5173/
```

### Step 4 — Open the App

Go to **http://localhost:5173** in your browser.

---

## Quick Start — Docker

Runs the entire stack (MongoDB + Backend + Frontend) with one command.

```powershell
cd D:\Jame\DataPilot_AI

docker compose up --build
```

First build takes 3–5 minutes. After that:

- Frontend: http://localhost:80
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

To stop:
```powershell
docker compose down
```

To stop and remove all data:
```powershell
docker compose down -v
```

---

## Environment Variables

### Backend `.env`

| Variable | Default | Description |
|---|---|---|
| `MONGODB_URL` | `mongodb://127.0.0.1:27017` | MongoDB connection string |
| `MONGODB_DB` | `datapilot` | Database name |
| `UPLOAD_DIR` | `uploads` | Directory for uploaded CSV files |
| `MAX_FILE_SIZE_MB` | `100` | Maximum CSV upload size |
| `CV_FOLDS` | `5` | Cross-validation folds (reduce to 3 for small datasets) |
| `TEST_SIZE` | `0.2` | Train/test split ratio |
| `RANDOM_STATE` | `42` | Random seed for reproducibility |
| `DEBUG` | `False` | Debug mode |

> `ALLOWED_ORIGINS` is defined directly in `config.py` to avoid pydantic-settings parsing issues with list values. Edit `config.py` if you need to add new origins.

### Frontend `.env`

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8000` | Backend API URL (must start with `VITE_`) |

---

## Known Issues & Fixes

These are real issues encountered during development with their solutions documented.

---

### ❌ Issue 1: `.env` UnicodeDecodeError — `utf-8 codec can't decode byte 0xff`

**Symptom:**
```
UnicodeDecodeError: 'utf-8' codec can't decode byte 0xff in position 0: invalid start byte
```

**Cause:** The `.env` file was created with PowerShell's `Out-File` which defaults to UTF-16 encoding. The dotenv parser requires UTF-8.

**Fix:** Recreate the `.env` file with explicit UTF-8 encoding:
```powershell
# Method 1 — PowerShell with explicit encoding
@"
MONGODB_URL=mongodb://127.0.0.1:27017
MONGODB_DB=datapilot
"@ | Out-File .env -Encoding UTF8

# Method 2 — Use VS Code to create the file (always saves as UTF-8)
# Method 3 — Use Notepad → Save As → Encoding: UTF-8
```

---

### ❌ Issue 2: `error parsing value for field "ALLOWED_ORIGINS"`

**Symptom:**
```
pydantic_settings.sources.SettingsError: error parsing value for field "ALLOWED_ORIGINS"
```

**Cause:** Pydantic-settings v2 tries to JSON-parse any `List[str]` field read from `.env`. A comma-separated string like `http://a,http://b` fails JSON parsing. Even a JSON array `["http://a"]` can fail if the file has encoding issues.

**Fix:** `ALLOWED_ORIGINS` is hardcoded as a Python list in `config.py` and intentionally excluded from `.env`. This completely bypasses pydantic-settings' automatic JSON parsing. If you need to change allowed origins, edit `config.py` directly:

```python
ALLOWED_ORIGINS: List[str] = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:8000",
]
```

---

### ❌ Issue 3: `ImportError: cannot import name '_QUERY_OPTIONS' from 'pymongo.cursor'`

**Symptom:**
```
ImportError: cannot import name '_QUERY_OPTIONS' from 'pymongo.cursor'
```

**Cause:** Version mismatch between `motor` and `pymongo`. PyMongo 4.5+ removed the internal `_QUERY_OPTIONS` API that older motor versions (≤ 3.2) depended on.

**Fix:** Upgrade both packages together:
```powershell
pip install "motor==3.7.1" "pymongo==4.10.1"
```

The `requirements.txt` in this repo already specifies the correct compatible versions. If you ever recreate the venv, run `pip install -r requirements.txt` and this will be handled automatically.

---

### ⚠️ Warning: `n_splits=5 cannot be greater than the number of members in each class`

**Symptom:** Console warning during model evaluation (not a crash):
```
Cross-validation failed: n_splits=5 cannot be greater than the number of members in each class.
```

**Cause:** Your dataset is too small for 5-fold cross-validation. Each class needs at least 5 samples. This warning appears with toy/test datasets of fewer than ~50 rows.

**This is handled automatically.** The code falls back to a simpler scoring method when CV fails. Results are still returned correctly.

**If you want to suppress it:** Reduce `CV_FOLDS` in `.env` to match your smallest class size:
```env
CV_FOLDS=2
```

---

## API Reference

Base URL: `http://localhost:8000`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check → `{"status":"ok"}` |
| `POST` | `/api/v1/upload` | Upload CSV file |
| `POST` | `/api/v1/analyze` | Start ML pipeline |
| `GET` | `/api/v1/status/{session_id}` | Poll pipeline progress |
| `GET` | `/api/v1/results/{session_id}` | Get final results |

Interactive API docs: **http://localhost:8000/docs**

### Example: Upload + Analyze flow

```powershell
# 1. Upload CSV
curl -X POST -F "file=@mydata.csv" http://localhost:8000/api/v1/upload
# Response: { "session_id": "abc-123", "columns": [...], "shape": [100, 5] }

# 2. Start analysis
curl -X POST http://localhost:8000/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{"session_id":"abc-123","target_column":"label"}'

# 3. Poll status
curl http://localhost:8000/api/v1/status/abc-123
# Response: { "status": "running", "progress": 60, "current_step": "Model Training", "logs": [...] }

# 4. Get results (once status = "completed")
curl http://localhost:8000/api/v1/results/abc-123
```

---

## Frontend Pages

### Upload Page (`/`)
- Drag-and-drop or click to upload CSV
- Preview first 5 rows and column names
- Select target column via chips or dropdown
- Start analysis button

### Processing Page
- Real-time progress bar (polls every 2 seconds)
- Pipeline step tracker (6 steps with live status)
- Live log console with color-coded messages
- Auto-redirects to Results when complete

### Results Page
- Best model banner with key metrics
- Model comparison bar chart (CV Score, Accuracy, F1 or R²)
- Feature importance horizontal bar chart (top 10)
- Correlation matrix heatmap (SVG, color-coded teal/red)
- Full metrics table with all models
- Download Report button (exports CSV)

---

## ML Pipeline

The pipeline runs 6 sequential stages:

| Stage | Module | What it does |
|---|---|---|
| Data Understanding | `data_understanding.py` | Detects column types, null values, problem type |
| Data Cleaning | `data_cleaning.py` | Removes duplicates, fills nulls, encodes categoricals |
| Feature Engineering | `feature_engineering.py` | Scales numerics, prepares X and y matrices |
| Statistical Analysis | `statistical_analysis.py` | Descriptive stats, correlation matrix |
| Model Training | `model_training.py` | Trains 3 models in parallel |
| Model Evaluation | `model_evaluation.py` | Cross-validation, test metrics, best model selection |

### Models Trained

**Classification:** Logistic Regression, Random Forest, Gradient Boosting

**Regression:** Linear Regression, Random Forest Regressor, Gradient Boosting Regressor

### Evaluation Metrics

**Classification:** Accuracy, F1 Score (weighted), ROC-AUC

**Regression:** RMSE, R²

Best model is selected by highest cross-validation mean score.

---

## Performance Notes

| Dataset Size | Expected Time |
|---|---|
| < 1,000 rows | 10–30 seconds |
| 1,000–10,000 rows | 1–5 minutes |
| > 10,000 rows | 5–15 minutes |

To speed up large datasets:
```env
CV_FOLDS=3
TEST_SIZE=0.1
```

---

## Deployment

### Production Docker Build

```powershell
docker compose up --build -d
```

### Frontend Production Build (standalone)

```powershell
cd frontend
npm run build
# Output in dist/ — deploy to Vercel, Netlify, or any static host
```

### Cloud Options

| Component | Recommended Services |
|---|---|
| Backend | Azure App Service, AWS EC2, Google Cloud Run |
| Frontend | Vercel, Netlify, GitHub Pages |
| Database | MongoDB Atlas |

### Kubernetes

Manifests are in the `k8s/` directory. Apply with:
```powershell
kubectl apply -f k8s/
```

---

## Troubleshooting Checklist

Before reporting an issue, verify:

- [ ] MongoDB is running (`mongosh` connects successfully)
- [ ] Virtual environment is activated (`(venv)` shows in terminal)
- [ ] `.env` file is UTF-8 encoded (not UTF-16)
- [ ] `ALLOWED_ORIGINS` is NOT in `.env` — it's in `config.py`
- [ ] motor and pymongo versions are compatible (`motor==3.7.1`, `pymongo==4.10.1`)
- [ ] Frontend `.env` has `VITE_API_BASE_URL=http://localhost:8000`
- [ ] Both backend (port 8000) and frontend (port 5173) are running

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

**Built for the data science community.**
For questions, open an issue on GitHub.