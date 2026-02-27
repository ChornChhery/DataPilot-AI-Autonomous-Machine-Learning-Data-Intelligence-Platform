# DataPilot AI - AutoML Agent Platform

Advanced autonomous machine learning platform for analyzing datasets and generating predictive models automatically.

![Status](https://img.shields.io/badge/status-stable-brightgreen)
![Python](https://img.shields.io/badge/python-3.12-blue)
![Node.js](https://img.shields.io/badge/node.js-v24-green)

---

## 🚀 Quick Start

**Requires**: Python 3.12, Node.js 24, MongoDB 8.2.5

### Backend Setup (Terminal 1)
```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

# Create .env
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

uvicorn app.main:app --reload --port 8000
```

### Frontend Setup (Terminal 2)
```powershell
cd frontend
npm install

# Create .env
@"
VITE_API_BASE_URL=http://localhost:8000
"@ | Out-File .env -Encoding UTF8

npm run dev
```

Open: **http://localhost:5173**

---

## 📖 Full Documentation

- [Backend Setup](backend/README.md) - Complete backend installation & configuration
- [Frontend Setup](frontend/README.md) - Complete frontend installation & configuration

---

## ✨ Features

- **Automated Data Analysis**: Understand dataset structure, detect data types, identify issues
- **Problem Type Detection**: Automatically detect classification vs regression
- **Data Preprocessing**: Handle missing values, encoding, normalization
- **Feature Engineering**: Create and select relevant features
- **Statistical Analysis**: Generate correlations and statistics
- **Multi-Model Training**: Train multiple algorithms automatically
- **Model Evaluation**: Cross-validation and best model selection
- **Feature Importance**: Identify most important features
- **Real-time Progress**: Track pipeline execution with live logs
- **Interactive Dashboard**: Modern React UI for easy interaction

---

## 🏗️ Architecture

```
Frontend (React)        Backend (FastAPI)       Database (MongoDB)
Port 5173     ◄──API──►  Port 8000    ◄────────►  Port 27017
```

---

## 🛠️ Technology Stack

### Backend
- **Python 3.12** | **FastAPI** | **MongoDB** | **Motor** | **Pandas** | **NumPy** | **Scikit-learn** | **SciPy** | **XGBoost** | **Pydantic** | **Uvicorn**

### Frontend
- **React 18**  | **Vite** | **Axios** | **Node.js 24**

### Database
- **MongoDB 8.2.5** - NoSQL document database

---

## ⚙️ Next Steps

Once you have the application running, refer to the detailed README files for more information:

1. **[Backend Details](backend/README.md)** - Configuration, testing, troubleshooting
2. **[Frontend Details](frontend/README.md)** - Component structure, features, deployment

---

## 📝 License

This project is licensed under the MIT License.

---

Built with ❤️ for the data science community.