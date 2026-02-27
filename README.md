# DataPilot AI - AutoML Agent Platform

DataPilot AI is an advanced autonomous machine learning platform that enables users to upload datasets, automatically analyze them, and generate predictive models without requiring deep expertise in data science. The platform leverages multiple machine learning algorithms to automatically preprocess data, engineer features, train models, and select the best-performing solution.

![Status](https://img.shields.io/badge/status-stable-brightgreen)
![Python](https://img.shields.io/badge/python-3.12-blue)
![Node.js](https://img.shields.io/badge/node.js-v24-green)

## Table of Contents
- [Quick Start](#quick-start)
- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Detailed Setup Guide](#detailed-setup-guide)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Quick Start

For a complete step-by-step setup, see:
- **Backend Setup**: [backend/README.md](backend/README.md)
- **Frontend Setup**: [frontend/README.md](frontend/README.md)

**TL;DR** (assumes MongoDB is running):
```bash
# Terminal 1: Backend
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Terminal 2: Frontend
cd frontend
npm install
npm run dev

# Open http://localhost:5173
```

## Features

- **Automated Data Analysis**: Automatically understands dataset structure, detects data types, and identifies potential issues
- **Intelligent Problem Type Detection**: Determines if the task is classification or regression based on target column characteristics
- **Comprehensive Data Preprocessing**: Handles missing values, categorical encoding, and data normalization
- **Feature Engineering**: Creates new features and selects the most relevant ones for modeling
- **Statistical Analysis**: Performs correlation analysis and generates descriptive statistics
- **Multi-Model Training**: Trains multiple algorithms (Random Forest, XGBoost, SVM, etc.) and compares performance
- **Model Evaluation & Selection**: Evaluates models using cross-validation and selects the best performer
- **Feature Importance Analysis**: Identifies which features contribute most to predictions
- **Real-time Progress Tracking**: Monitors pipeline execution with detailed logs
- **Interactive Dashboard**: Clean, modern UI built with React for easy interaction

## Architecture

The platform follows a microservices architecture with a clear separation of concerns:

- **Frontend**: React-based single-page application that communicates with the backend via REST APIs
- **Backend**: FastAPI-based server handling data processing, model training, and orchestration
- **Database**: MongoDB for storing session data, analysis results, and metadata
- **Processing Engine**: Asynchronous pipeline that handles the complete ML workflow

## Technology Stack

### Backend
- **Python 3.8+**
- **FastAPI**: High-performance web framework with automatic API documentation
- **MongoDB**: NoSQL database for storing session data and results
- **Motor**: Asynchronous MongoDB driver
- **Pandas**: Data manipulation and analysis
- **NumPy**: Numerical computing
- **Scikit-learn**: Machine learning algorithms and utilities
- **SciPy**: Scientific computing
- **XGBoost**: Gradient boosting framework
- **Pydantic**: Data validation and settings management

### Frontend
- **React 19**: Component-based UI library
- **Vite**: Fast build tool and development server
- **Axios**: HTTP client for API communication
- **Recharts**: Charting library for visualizations

### Other Dependencies
- **uvicorn**: ASGI server for running the FastAPI application
- **python-multipart**: Handling file uploads

## Detailed Setup Guide

### Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
- MongoDB (local installation or cloud service)

### Backend Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/DataPilot_AI.git
cd DataPilot_AI/backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd ../frontend
```

2. Install dependencies:
```bash
npm install
```

## Configuration

### Backend Configuration

Edit the `.env` file in the backend directory:

```
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB=automl_platform
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=100
CV_FOLDS=5
TEST_SIZE=0.2
RANDOM_STATE=42
DEBUG=False
```

Key configuration options:
- `MONGODB_URL`: Connection string for MongoDB
- `MONGODB_DB`: Database name to use
- `ALLOWED_ORIGINS`: Comma-separated list of allowed origins for CORS
- `UPLOAD_DIR`: Directory to store uploaded CSV files
- `MAX_FILE_SIZE_MB`: Maximum file size allowed for uploads
- `CV_FOLDS`: Number of folds for cross-validation
- `TEST_SIZE`: Proportion of data to use for testing
- `RANDOM_STATE`: Random seed for reproducible results

### Frontend Configuration

Create a `.env` file in the frontend directory:

```
VITE_API_BASE_URL=http://localhost:8000
```

## Usage

### Running the Application

1. Start MongoDB (ensure it's running locally or accessible via configured URL)

2. Run the backend:
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

3. In a new terminal, run the frontend:
```bash
cd frontend
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Using the Platform

1. **Upload Data**: Drag and drop or select a CSV file containing your dataset
2. **Select Target**: Choose the column you want to predict (target variable)
3. **Start Analysis**: Click "Start Autonomous Analysis" to begin the automated ML pipeline
4. **Monitor Progress**: Watch real-time progress through the six stages:
   - Data Understanding
   - Data Cleaning
   - Feature Engineering
   - Statistical Analysis
   - Model Training
   - Model Evaluation
5. **Review Results**: Examine the best model, performance metrics, and feature importance

## API Endpoints

### Upload
- `POST /api/v1/upload` - Upload a CSV file for analysis
- Request: `multipart/form-data` with file
- Response: Session ID, filename, columns, shape, and data preview

### Analyze
- `POST /api/v1/analyze` - Start the automated analysis pipeline
- Request: `{"session_id": "string", "target_column": "string"}`
- Response: Confirmation that analysis has started

### Status
- `GET /api/v1/status/{session_id}` - Get current status of analysis
- Response: Current progress, step, logs, and status

### Results
- `GET /api/v1/results/{session_id}` - Get final analysis results
- Response: Best model, metrics, feature importance, and detailed results

### Health Check
- `GET /health` - Check if the API is running
- Response: `{"status": "ok"}`

## Project Structure

```
DataPilot_AI/
├── backend/
│   ├── app/
│   │   ├── agents/
│   │   │  └── orchestrator.py         # Main pipeline orchestrator
│   │   ├── api/
│   │   │  └── routes/
│   │   │       ├── analyze.py          # Analysis endpoints
│   │   │       ├── results.py          # Results endpoints
│   │   │       ├── status.py           # Status endpoints
│   │   │      └── upload.py           # Upload endpoints
│   │   ├── core/
│   │   │   ├── config.py               # Configuration settings
│   │   │  └── database.py             # Database connection
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── schemas.py              # Pydantic models
│   │   ├── modules/
│   │   │   ├── data_cleaning.py        # Data cleaning functions
│   │   │   ├── data_understanding.py   # Data understanding functions
│   │   │   ├── feature_engineering.py  # Feature engineering functions
│   │   │   ├── model_evaluation.py     # Model evaluation functions
│   │   │   ├── model_training.py       # Model training functions
│   │   │  └── statistical_analysis.py # Statistical analysis functions
│   │   └── main.py                     # Main FastAPI application
│   ├── uploads/                        # Uploaded CSV files
│   ├── .env                            # Environment variables
│   └── requirements.txt                # Python dependencies
└── frontend/
    ├── src/
    │   ├── App.jsx                     # Main React component
    │   ├── App.css
    │   ├── index.css
    │   └── main.jsx
    ├── public/
    ├── package.json
    ├── vite.config.js
   └── .env                            # Environment variables
```

## Troubleshooting

### Common Issues

#### Backend Not Starting
- Verify Python version (3.8+)
- Check if all dependencies are installed
- Ensure MongoDB is running and accessible
- Verify environment variables are set correctly

#### Frontend Not Loading
- Ensure Node.js is installed (16+)
- Run `npm install` to install dependencies
- Check if the backend API is running
- Verify the API URL in frontend `.env` file

#### Upload Issues
- Check file size limits (default 100MB)
- Ensure file is valid CSV format
- Verify upload directory permissions
- Check available disk space

#### Analysis Failures
- Review logs in the processing interface
- Check dataset quality and format
- Ensure target column exists in dataset
- Verify sufficient memory for processing

### Debugging Tips

1. **Check Backend Logs**: Look for error messages in the terminal running uvicorn
2. **Check Frontend Console**: Open browser developer tools to see JavaScript errors
3. **Verify API Connection**: Test endpoints directly using tools like Postman
4. **Check MongoDB**: Ensure the database is accessible and has proper permissions

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Ensure your code follows the project's style guidelines
5. Add tests if applicable
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Development Guidelines

- Write clear, descriptive commit messages
- Add documentation for new features
- Follow PEP 8 style guidelines for Python code
- Use TypeScript for type safety where applicable
- Write unit tests for critical functionality

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions about the platform, please open an issue in the GitHub repository or contact the development team.

---

Built with ❤️ for the data science community.