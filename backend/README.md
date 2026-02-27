# Backend Setup Guide - DataPilot AI

Complete step-by-step instructions to set up and run the DataPilot AI backend on Windows, macOS, or Linux.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Quick Install](#quick-install)
- [Detailed Setup](#detailed-setup)
- [Configuration](#configuration)
- [Running the Server](#running-the-server)
- [Testing APIs](#testing-apis)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Requirements
- **Python**: 3.12.x ([Download](https://www.python.org/downloads/))
- **MongoDB**: 8.2.5 ([Download](https://www.mongodb.com/try/download/community))

### Verify Installations

```powershell
python --version        # Should show: Python 3.12.x
mongod --version       # Should show: db version v8.2.5
```

## Quick Install

```powershell
cd D:\Jame\DataPilot_AI\backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file
@"
MONGODB_URL=mongodb://127.0.0.1:27017
MONGODB_DB=datapilot
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:8000
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=100
CV_FOLDS=5
TEST_SIZE=0.2
RANDOM_STATE=42
DEBUG=False
"@ | Out-File .env -Encoding UTF8

# Start server
uvicorn app.main:app --reload --port 8000
```

## Detailed Setup

### Step 1: Create Virtual Environment

```powershell
cd D:\Jame\DataPilot_AI\backend
python -m venv venv
```

### Step 2: Activate Virtual Environment

**Windows**:
```powershell
venv\Scripts\activate
```

**macOS/Linux**:
```bash
source venv/bin/activate
```

You should see `(venv)` prefix in terminal.

### Step 3: Upgrade pip & Install Dependencies

```powershell
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Wait for installation to complete (2-3 minutes).

### Step 4: Start MongoDB

**Windows** (if installed as service):
```powershell
# Verify connection
mongosh

# Type: exit (to close)
```

**Manual start**:
```powershell
mongod --dbpath "C:\data\db"
```

### Step 5: Create .env File

Create `.env` file in `backend/` directory:

```env
MONGODB_URL=mongodb://127.0.0.1:27017
MONGODB_DB=datapilot
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:8000
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=100
CV_FOLDS=5
TEST_SIZE=0.2
RANDOM_STATE=42
DEBUG=False
APP_NAME=AutoML Agent Platform
```

### Step 6: Start Backend Server

```powershell
# Make sure (venv) is activated
uvicorn app.main:app --reload --port 8000
```

**Expected output**:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Started server process [xxxxx]
2026-02-27 11:19:52,460 [INFO] app.core.database — Connected to MongoDB: datapilot
INFO:     Application startup complete.
```

## Configuration

### Environment Variables

| Variable | Value | Notes |
|----------|-------|-------|
| `MONGODB_URL` | `mongodb://127.0.0.1:27017` | Local MongoDB |
| `MONGODB_DB` | `datapilot` | Database name |
| `ALLOWED_ORIGINS` | `http://localhost:5173,http://localhost:3000,http://localhost:8000` | CORS allowed URLs |
| `UPLOAD_DIR` | `uploads` | CSV upload directory |
| `MAX_FILE_SIZE_MB` | `100` | Max upload size |
| `CV_FOLDS` | `5` | Cross-validation folds |
| `TEST_SIZE` | `0.2` | Train/test split |
| `RANDOM_STATE` | `42` | For reproducibility |

## Running the Server

### Start with Auto-reload (Development)

```powershell
uvicorn app.main:app --reload --port 8000
```

### Access API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## Testing APIs

### Using PowerShell/curl

**Upload CSV**:
```powershell
curl -X POST -F "file=@test.csv" http://localhost:8000/api/v1/upload
```

**Response example**:
```json
{
  "session_id": "abc-123",
  "filename": "test.csv",
  "columns": ["age", "income", "score"],
  "shape": [4, 3],
  "preview": [...]
}
```

**Start Analysis**:
```powershell
curl -X POST http://localhost:8000/api/v1/analyze `
  -H "Content-Type: application/json" `
  -d '{"session_id":"abc-123","target_column":"score"}'
```

**Check Status**:
```powershell
curl http://localhost:8000/api/v1/status/abc-123
```

**Get Results**:
```powershell
curl http://localhost:8000/api/v1/results/abc-123
```

## Troubleshooting

### Issue: `ModuleNotFoundError: No module named 'app.models.schemas'`

**Solution**:
```powershell
pip install -r requirements.txt
```

### Issue: `ImportError: cannot import name '_QUERY_OPTIONS'`

**Solution** (MongoDB/PyMongo version conflict):
```powershell
rmdir /s /q venv
python -m venv venv
venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
```

### Issue: MongoDB Connection Failed

**Solution**:
```powershell
# Check MongoDB is running
mongosh

# If fails, start MongoDB manually
mongod --dbpath "C:\data\db"
```

**Verify in .env**:
```env
MONGODB_URL=mongodb://127.0.0.1:27017
```

### Issue: CORS Error on Frontend Upload

**Solution**:
1. Check .env has correct ALLOWED_ORIGINS:
```env
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:8000
```
2. Restart backend server

### Issue: Port 8000 In Use

**Solution**:
```powershell
# Use different port
uvicorn app.main:app --reload --port 8001

# Or kill process on 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Issue: Permission Denied for uploads directory

**Solution**:
```powershell
mkdir uploads
# Or set in .env:
UPLOAD_DIR=C:\tmp\uploads
mkdir C:\tmp\uploads
```

## Directory Structure

```
backend/
├── venv/                    # Virtual environment
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app
│   ├── agents/
│   │   └── orchestrator.py  # ML pipeline
│   ├── api/
│   │   └── routes/
│   │       ├── upload.py
│   │       ├── analyze.py
│   │       ├── status.py
│   │       └── results.py
│   ├── core/
│   │   ├── config.py
│   │   └── database.py
│   ├── models/
│   │   └── schemas.py
│   └── modules/             # ML functions
│       ├── data_cleaning.py
│       ├── data_understanding.py
│       ├── feature_engineering.py
│       ├── model_evaluation.py
│       ├── model_training.py
│       └── statistical_analysis.py
├── uploads/                 # CSV files stored here
├── .env                     # Configuration
├── requirements.txt         # Dependencies
└── README.md               # This file
```

## Next Steps

✅ Backend running on http://localhost:8000

**Next**: Set up Frontend
```powershell
cd ..\frontend
npm install
npm run dev
```

Then open: http://localhost:5173

---

For issues, review the [Troubleshooting](#troubleshooting) section or contact support.
