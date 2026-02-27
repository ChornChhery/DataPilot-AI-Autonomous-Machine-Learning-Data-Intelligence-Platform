# 🚀 DataPilot AI - Quick Start Guide

## 🎯 Fast Setup (5 Minutes)

### 1. Check Requirements
```powershell
python --version    # Should be 3.12.x
node --version      # Should be 24.x
mongod --version    # Should be 8.2.5
```

### 2. Start MongoDB
```powershell
mongod --dbpath "C:\data\db"
```

### 3. Backend Setup (Terminal 1)
```powershell
cd D:\Jame\DataPilot_AI\backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 4. Frontend Setup (Terminal 2)
```powershell
cd D:\Jame\DataPilot_AI\frontend
npm install
npm run dev
```

### 5. Use the Platform
Open browser: **http://localhost:5173**

---

## 📋 What to Do Next

1. **Upload a CSV file** (try `test_sample.csv`)
2. **Select target column** (e.g., "education_score")
3. **Click "Start Autonomous Analysis"**
4. **Watch the progress** in real-time
5. **View results** when complete

---

## 🚨 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| **MongoDB won't start** | Create folder: `mkdir C:\data\db` then run `mongod --dbpath "C:\data\db"` |
| **Port in use** | Change port: `uvicorn app.main:app --reload --port 8001` |
| **Packages won't install** | Run: `pip install --upgrade pip` then `pip install -r requirements.txt` |
| **CORS error** | Check backend `.env` has `ALLOWED_ORIGINS=http://localhost:5173` |

---

## 📁 Key Files

- **Backend**: `D:\Jame\DataPilot_AI\backend\`
- **Frontend**: `D:\Jame\DataPilot_AI\frontend\`
- **Test Data**: `D:\Jame\DataPilot_AI\test_sample.csv`
- **Backend Config**: `D:\Jame\DataPilot_AI\backend\.env`
- **Frontend Config**: `D:\Jame\DataPilot_AI\frontend\.env`

---

## 🎯 Success Indicators

✅ MongoDB console shows connection successful
✅ Backend shows "Connected to MongoDB: datapilot"
✅ Frontend shows "CONNECTED TO BACKEND" indicator
✅ Browser loads http://localhost:5173 successfully
✅ File upload works and shows data preview

---

## 📖 Detailed Guides

- **Backend Setup**: [backend/README.md](backend/README.md)
- **Frontend Setup**: [frontend/README.md](frontend/README.md)
- **Full Project Info**: [README.md](README.md)

---

**Need help?** Check the detailed README files or look for error messages in the terminal!