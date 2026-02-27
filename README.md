# DataPilot AI - AutoML Agent Platform

Advanced autonomous machine learning platform for analyzing datasets and generating predictive models automatically.

![Status](https://img.shields.io/badge/status-stable-brightgreen)
![Python](https://img.shields.io/badge/python-3.12-blue)
![Node.js](https://img.shields.io/badge/node.js-v24-green)

---

## 📋 Project Overview

DataPilot AI is a full-stack autonomous machine learning platform that automates the entire data science workflow:

1. **Upload** your CSV dataset
2. **Select** target column to predict
3. **Watch** as the system automatically:
   - Analyzes data structure and types
   - Detects problem type (classification/regression)
   - Cleans and preprocesses data
   - Engineers features
   - Runs statistical analysis
   - Trains multiple ML models
   - Evaluates and selects the best model
   - Shows feature importance
4. **View** comprehensive results with model comparisons

### 🎯 Key Features

- **Zero Coding Required**: Upload CSV, get results
- **Multi-Model Training**: Tests Logistic Regression, Random Forest, Gradient Boosting
- **Real-time Processing**: Live progress updates and logs
- **Comprehensive Analysis**: Statistical summaries, correlations, feature importance
- **Modern UI**: Clean React dashboard with dark theme
- **RESTful API**: Well-documented FastAPI backend
- **Persistent Storage**: MongoDB for session management

---

## 🚀 Quick Start (Windows)

**Prerequisites**: Python 3.12, Node.js 24, MongoDB 8.2.5

### Step 1: Start MongoDB
```powershell
# If installed as service, verify it's running:
mongosh
# Type 'exit' to close

# Or start manually:
mongod --dbpath "C:\data\db"
```

### Step 2: Backend Setup (Terminal 1)
```powershell
cd D:\Jame\DataPilot_AI\backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Environment variables (.env already created)
cat .env

# Start server
uvicorn app.main:app --reload --port 8000
```

**Expected output**:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Started server process [xxxxx]
2026-02-27 11:19:52,460 [INFO] app.core.database — Connected to MongoDB: datapilot
INFO:     Application startup complete.
```

### Step 3: Frontend Setup (Terminal 2)
```powershell
cd D:\Jame\DataPilot_AI\frontend

# Install dependencies
npm install

# Environment variables (.env already exists)
cat .env

# Start development server
npm run dev
```

**Expected output**:
```
VITE v5.0.8  dev server running at:

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### Step 4: Use the Platform
1. Open browser: **http://localhost:5173**
2. Upload a CSV file (drag & drop or click)
3. Select target column
4. Click "Start Autonomous Analysis"
5. Watch real-time progress
6. View results when complete

---

## 📁 Project Structure

```
DataPilot_AI/
├── backend/                     # FastAPI Backend
│   ├── app/
│   │   ├── agents/              # Orchestration logic
│   │   │   └── orchestrator.py  # Main ML pipeline
│   │   ├── api/                 # REST API routes
│   │   │   └── routes/
│   │   │       ├── upload.py    # File upload endpoint
│   │   │       ├── analyze.py   # Start analysis
│   │   │       ├── status.py    # Get progress
│   │   │       └── results.py   # Get results
│   │   ├── core/                # Core configuration
│   │   │   ├── config.py        # Settings & env vars
│   │   │   └── database.py      # MongoDB connection
│   │   ├── models/              # Data schemas
│   │   │   └── schemas.py       # Pydantic models
│   │   ├── modules/             # ML modules
│   │   │   ├── data_understanding.py
│   │   │   ├── data_cleaning.py
│   │   │   ├── feature_engineering.py
│   │   │   ├── statistical_analysis.py
│   │   │   ├── model_training.py
│   │   │   └── model_evaluation.py
│   │   ├── main.py              # FastAPI app entry
│   │   └── __init__.py
│   ├── uploads/                 # Uploaded CSV files
│   ├── venv/                    # Python virtual environment
│   ├── .env                     # Environment variables
│   ├── requirements.txt         # Python dependencies
│   └── README.md               # Backend documentation
│
├── frontend/                    # React Frontend
│   ├── src/
│   │   ├── App.jsx              # Main React component
│   │   ├── main.jsx             # React entry point
│   │   └── assets/              # Static assets
│   ├── public/                  # Public assets
│   ├── dist/                    # Production build
│   ├── node_modules/            # NPM dependencies
│   ├── .env                     # Frontend environment
│   ├── package.json             # NPM configuration
│   ├── vite.config.js           # Vite configuration
│   └── README.md               # Frontend documentation
│
├── k8s/                         # Kubernetes manifests (optional)
├── .gitignore                   # Git ignore rules
└── README.md                   # This file
```

## 🛠️ Technology Stack

### Backend
- **Python 3.12** - Programming language
- **FastAPI** - High-performance web framework
- **Uvicorn** - ASGI server
- **MongoDB 8.2.5** - NoSQL database
- **Motor** - Async MongoDB driver
- **Pandas** - Data manipulation
- **NumPy** - Numerical computing
- **Scikit-learn** - Machine learning
- **SciPy** - Scientific computing
- **Pydantic** - Data validation
- **python-multipart** - File upload support

### Frontend
- **React 19** - UI library
- **Vite 7** - Build tool & dev server
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **Node.js 24** - Runtime environment

### Infrastructure
- **REST API** - Communication protocol
- **CORS** - Cross-origin resource sharing
- **JSON** - Data format

---

## 📖 Detailed Documentation

### For Users
- [Backend Setup Guide](backend/README.md) - Complete installation, configuration, and troubleshooting
- [Frontend Setup Guide](frontend/README.md) - React setup, development, and deployment

### For Developers
- **API Documentation**: http://localhost:8000/docs (Swagger UI)
- **API Schema**: http://localhost:8000/redoc (ReDoc)
- **Health Check**: http://localhost:8000/health

### Key Components

#### Backend Modules
1. **Data Understanding** (`data_understanding.py`)
   - Analyze dataset structure
   - Detect problem type (classification/regression)
   - Identify data types and null values

2. **Data Cleaning** (`data_cleaning.py`)
   - Remove duplicates
   - Handle missing values
   - Encode categorical variables

3. **Feature Engineering** (`feature_engineering.py`)
   - Scale numerical features
   - Prepare data for modeling

4. **Statistical Analysis** (`statistical_analysis.py`)
   - Generate descriptive statistics
   - Calculate correlations

5. **Model Training** (`model_training.py`)
   - Train multiple algorithms
   - Classification: Logistic Regression, Random Forest, Gradient Boosting
   - Regression: Linear Regression, Random Forest, Gradient Boosting

6. **Model Evaluation** (`model_evaluation.py`)
   - Cross-validation
   - Performance metrics
   - Feature importance
   - Best model selection

#### Frontend Components
- **Upload View**: File drag-drop, column selection
- **Processing View**: Real-time progress, pipeline steps, live logs
- **Results View**: Model comparison table, feature importance visualization

---

## 🔧 Configuration

### Backend Environment Variables (`.env`)
```env
MONGODB_URL=mongodb://127.0.0.1:27017    # MongoDB connection
MONGODB_DB=datapilot                     # Database name
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:8000
UPLOAD_DIR=uploads                      # CSV upload directory
MAX_FILE_SIZE_MB=100                    # Max upload size
CV_FOLDS=5                              # Cross-validation folds
TEST_SIZE=0.2                           # Train/test split
RANDOM_STATE=42                         # Reproducibility
DEBUG=False                             # Debug mode
APP_NAME=AutoML Agent Platform          # Application name
```

### Frontend Environment Variables (`.env`)
```env
VITE_API_BASE_URL=http://localhost:8000  # Backend API URL
```

---

## 🧪 Testing the Platform

### Test CSV Dataset
Create a simple test file `test.csv`:
```csv
age,income,score
25,50000,85
30,60000,92
35,70000,78
40,80000,88
45,90000,95
```

### API Testing with curl
```powershell
# Upload file
curl -X POST -F "file=@test.csv" http://localhost:8000/api/v1/upload

# Start analysis (replace session_id)
curl -X POST http://localhost:8000/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{"session_id":"YOUR_SESSION_ID","target_column":"score"}'

# Check status
curl http://localhost:8000/api/v1/status/YOUR_SESSION_ID

# Get results
curl http://localhost:8000/api/v1/results/YOUR_SESSION_ID
```

---

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Ensure MongoDB is running
   - Check `MONGODB_URL` in `.env`
   - Verify port 27017 is available

2. **CORS Error**
   - Check `ALLOWED_ORIGINS` in backend `.env`
   - Restart backend server
   - Refresh frontend browser

3. **Port Already in Use**
   ```powershell
   # Kill process on port 8000
   netstat -ano | findstr :8000
   taskkill /PID <PID> /F
   ```

4. **Dependencies Installation Failed**
   ```powershell
   # Backend
   pip install --upgrade pip
   pip install -r requirements.txt
   
   # Frontend
   Remove-Item -Recurse node_modules
   npm install
   ```

5. **Module Import Errors**
   - Ensure virtual environment is activated
   - Check for `__init__.py` files
   - Restart development servers

### Logs and Debugging

**Backend Logs**: Visible in terminal where `uvicorn` is running
**Frontend Logs**: Browser Developer Tools (F12 → Console)
**MongoDB Logs**: Check MongoDB service logs or terminal output

---

## 📈 Performance Tips

- **Small datasets** (< 1000 rows): Results in 10-30 seconds
- **Medium datasets** (1000-10000 rows): Results in 1-5 minutes
- **Large datasets** (> 10000 rows): May take 5-15 minutes

**Optimization**:
- Use `TEST_SIZE=0.1` for faster results
- Reduce `CV_FOLDS` to 3 for quicker cross-validation
- Ensure sufficient RAM for large datasets

---

## 🚀 Deployment Options

### Production Build
```powershell
# Frontend production build
cd frontend
npm run build
# Output: dist/ folder ready for deployment

# Serve with any static file server
npm run preview  # For local testing
```

### Containerization (Docker)
```dockerfile
# Dockerfile example
FROM python:3.12
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Cloud Deployment
- **Backend**: Azure App Service, AWS EC2, Google Cloud Run
- **Frontend**: Vercel, Netlify, GitHub Pages
- **Database**: MongoDB Atlas (cloud MongoDB)

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

### Development Guidelines
- Follow existing code style
- Add tests for new features
- Update documentation
- Ensure all tests pass

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by automated ML platforms
- Designed for data scientists and analysts

---

**Built with ❤️ for the data science community**

For questions or support, please open an issue on GitHub.