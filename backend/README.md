# DataPilot AI Backend Setup - Simple Step-by-Step Guide

This guide will help you set up the DataPilot AI backend easily, even if you're new to Python development.

## 🎯 What You'll Do
1. Check if you have the right software installed
2. Create a Python virtual environment (like a safe sandbox)
3. Install all required packages
4. Configure your settings
5. Start the server
6. Test that everything works

## ✅ Step 1: Check Your Software

First, let's make sure you have everything you need:

Open Command Prompt or PowerShell and run these commands:

```powershell
python --version
```
**You should see:** `Python 3.12.9` (or similar 3.12.x version)

```powershell
mongod --version
```
**You should see:** `db version v8.2.5`

If you don't have these versions, you'll need to install them first:
- **Python 3.12**: [Download here](https://www.python.org/downloads/)
- **MongoDB 8.2.5**: [Download here](https://www.mongodb.com/try/download/community)

## 📦 Step 2: Navigate to Backend Folder

```powershell
cd D:\Jame\DataPilot_AI\backend
```

You should now be in the backend folder. You can verify by listing files:
```powershell
dir
```
You should see files like `requirements.txt`, `app/` folder, etc.

## 🌍 Step 3: Create Virtual Environment

This creates a isolated Python environment for your project:

```powershell
python -m venv venv
```

This creates a `venv` folder. Now activate it:

```powershell
venv\Scripts\activate
```

**You should now see `(venv)` at the beginning of your command prompt.**

## 📥 Step 4: Install Required Packages

Now install all the software your backend needs:

```powershell
pip install --upgrade pip
pip install -r requirements.txt
```

This will take 2-3 minutes. You'll see lots of package names scrolling by - this is normal!

## 🛠️ Step 5: Start MongoDB Database

MongoDB needs to be running for your backend to work.

**Check if it's already running:*
```powershell
mongosh
```

If you see a MongoDB prompt, type `exit` to close it. MongoDB is running!

**If MongoDB isn't running, start it:*
```powershell
mongod --dbpath "C:\data\db"
```

*Note: You might need to create the `C:\data\db` folder first*

## ⚙️ Step 6: Configure Your Settings

Create a file called `.env` in your backend folder with these settings:

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

## ▶️ Step 7: Start the Backend Server

Make sure you're still in the `(venv)` environment, then run:

```powershell
uvicorn app.main:app --reload --port 8000
```

**You should see output like this:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Started server process [xxxxx]
2026-02-27 11:19:52,460 [INFO] app.core.database — Connected to MongoDB: datapilot
INFO:     Application startup complete.
```

**🎉 Congratulations! Your backend is now running!**

## 🧪 Step 8: Test Your Backend

Open your web browser and go to: **http://localhost:8000/health**

You should see: `{"status":"ok"}`

You can also check the API documentation at: **http://localhost:8000/docs**

## 🔄 Keeping Your Backend Running

- Keep the terminal window open
- The server will automatically restart when you change code (thanks to `--reload`)
- To stop the server: Press `Ctrl+C` in the terminal

## 🚨 Common Problems and Solutions

### Problem: "python is not recognized"
**Solution:** Python isn't in your PATH. Reinstall Python and check "Add to PATH" during installation.

### Problem: "mongod is not recognized"
**Solution:** MongoDB isn't installed or isn't in your PATH. Install MongoDB from the link above.

### Problem: "ModuleNotFoundError"
**Solution:** Make sure you:
1. Activated your virtual environment (`venv\Scripts\activate`)
2. Installed requirements (`pip install -r requirements.txt`)

### Problem: "Cannot connect to MongoDB"
**Solution:** Make sure MongoDB is running:
```powershell
mongod --dbpath "C:\data\db"
```

### Problem: "Port 8000 is already in use"
**Solution:** Either kill the process using port 8000, or use a different port:
```powershell
uvicorn app.main:app --reload --port 8001
```

## 📁 Your Backend Folder Structure

```
backend/
├── venv/           # Your Python virtual environment
├── app/            # Main application code
│   ├── main.py     # Starting point
│   ├── api/        # API endpoints
│   ├── core/       # Configuration and database
│   └── modules/    # Machine learning functions
├── uploads/        # Where uploaded CSV files are stored
├── .env            # Your configuration file
└── requirements.txt # List of required packages
```

## 🎯 Next Steps

✅ Backend is running on http://localhost:8000

Now set up the frontend:
```powershell
cd ..\frontend
npm install
npm run dev
```

Then open: http://localhost:5173

---

**Need help?** Check the common problems section above or ask for assistance!

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
