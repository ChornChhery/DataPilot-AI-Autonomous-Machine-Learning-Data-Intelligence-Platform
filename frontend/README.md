# Frontend Setup Guide - DataPilot AI

This guide provides step-by-step instructions to set up and run the DataPilot AI frontend on Windows, macOS, or Linux.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Frontend](#running-the-frontend)
- [Development](#development)
- [Building for Production](#building-for-production)
- [Troubleshooting](#troubleshooting)
- [Docker Setup (Optional)](#docker-setup-optional)

## Prerequisites

### System Requirements
- **Node.js**: 24.x ([Download](https://nodejs.org/))
- **npm**: 10.x (comes with Node.js)
- **Git**: For cloning the repository
- **RAM**: 2GB minimum
- **Disk Space**: 500MB minimum
- **Backend**: Must be running on http://localhost:8000

### Verify Installations

Open a terminal/PowerShell and run:

```powershell
node --version          # Should show: v24.x.x
npm --version          # Should show: 10.x.x
```

If any command is not recognized, install Node.js from [nodejs.org](https://nodejs.org/).

## Installation

### Step 1: Navigate to Frontend Directory

```powershell
cd D:\Jame\DataPilot_AI\frontend
```

### Step 2: Install Dependencies

Install all required npm packages:

```powershell
npm install
```

This installs:
- React 18.2.0
- Vite 5.0.8 (build tool)
- Axios 1.6.0 (HTTP client)
- Zustand 4.4.0 (state management)
- React Router DOM 6.20.0 (routing)

**Note**: First install may take 1-2 minutes.

### Step 3: Verify Installation

Check that dependencies are installed correctly:

```powershell
# List installed packages
npm list

# Should show React, Vite, Axios, and other packages
```

## Configuration

### Step 1: Create .env File

Create a `.env` file in the `frontend` directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000
```

This tells the frontend where to find the backend API.

### Step 2: Update Vite Config (if needed)

The `vite.config.js` should already have proxy settings:

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
})
```

This configuration:
- Runs frontend on port 5173
- Proxies `/api` calls to backend on port 8000
- Allows you to use relative paths like `/api/v1/upload`

## Running the Frontend

### Start Development Server

```powershell
cd D:\Jame\DataPilot_AI\frontend

# Start the development server
npm run dev
```

### Expected Output

```
VITE v5.0.8  ready in 234 ms

➜  Local:   http://127.0.0.1:5173/
➜  press h + enter to show help
```

### Access the Application

Open your browser and go to:
- **Development URL**: http://localhost:5173
- **Backend API Docs**: http://localhost:8000/docs (while backend is running)

### Stop Development Server

Press `CTRL+C` in the terminal where the dev server is running.

## Development

### Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable React components
│   ├── hooks/               # Custom React hooks
│   ├── pages/               # Page components
│   │   ├── App.jsx         # Main app component
│   │   └── App.css         # Styling
│   ├── utils/              # Utility functions
│   ├── main.jsx            # Entry point
│   └── index.css            # Global styles
├── public/                  # Static files
├── index.html              # Main HTML file
├── package.json            # Dependencies
├── vite.config.js          # Vite configuration
├── .env                    # Environment variables
└── README.md              # This file
```

### Available Scripts

```powershell
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run development with verbose output
npm run dev -- --debug

# Build with detailed output
npm run build -- --debug
```

### Hot Module Replacement (HMR)

When you edit a file in `src/`, the browser automatically reloads the changes. No manual refresh needed!

## Building for Production

### Create Production Build

```powershell
npm run build
```

This creates:
- **Output Directory**: `dist/`
- **File Size**: ~200KB (gzipped)
- **Optimization**: Minified, tree-shaken, and optimized

### Preview Production Build

```powershell
npm run preview
```

This starts a local server to test the production build before deployment.

### Deployment Options

```bash
# Option 1: Deploy to GitHub Pages
npm install --save-dev gh-pages
# Then update build config for GitHub Pages

# Option 2: Deploy to Netlify
# Drop the 'dist' folder into Netlify

# Option 3: Deploy with Docker
docker build -t datapilot-frontend .
docker run -p 80:80 datapilot-frontend

# Option 4: Deploy to Azure Static Web Apps, Vercel, etc.
# See their documentation for setup
```

## Troubleshooting

### Issue: Port 5173 Already in Use

**Problem**: Another process is using port 5173

**Solution**:
```powershell
# Use a different port
npm run dev -- --port 5174

# Or kill the process using port 5173 (Windows):
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### Issue: `Cannot find module...` Error

**Problem**: Dependencies aren't installed

**Solution**:
```powershell
# Reinstall all dependencies
rm -r node_modules
npm install
```

### Issue: CORS Error - "Access-Control-Allow-Origin"

**Problem**: Backend doesn't allow frontend origin

**Solution**:
1. Check backend is running: `curl http://localhost:8000/health`
2. Add frontend URL to backend `.env`:
   ```env
   ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
   ```
3. Restart backend server
4. Check vite proxy config includes `/api` path

### Issue: API Calls Failing - "Cannot reach backend"

**Problem**: Frontend can't connect to backend

**Solution**:
1. Verify backend is running on http://localhost:8000
2. Check `.env` has correct `VITE_API_BASE_URL`:
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   ```
3. Test backend directly: `curl http://localhost:8000/health`
4. Check browser console (F12) for detailed error messages

### Issue: Slow Performance / Hot Reload Not Working

**Problem**: Vite cache or node_modules corruption

**Solution**:
```powershell
# Clear Vite cache
rm -r node_modules/.vite

# Or complete reinstall
rm -r node_modules dist .vite
npm install
npm run dev
```

### Issue: Build Fails with Memory Error

**Problem**: Not enough memory for build

**Solution**:
```powershell
# Increase Node.js memory limit
$env:NODE_OPTIONS = "--max-old-space-size=4096"
npm run build
```

## Docker Setup (Optional)

### Create Dockerfile

Create a `Dockerfile` in the frontend directory:

```dockerfile
# Build stage
FROM node:24-slim as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Build and Run

```powershell
docker build -t datapilot-frontend .
docker run -p 80:80 datapilot-frontend
```

Access at: http://localhost

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `http://localhost:8000` | Backend API base URL |

## Next Steps

1. ✅ Frontend is running on http://localhost:5173
2. Ensure Backend is running: [../backend/README.md](../backend/README.md)
3. Start using: Upload a CSV file and select a target column
4. Monitor progress in real-time

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Support

For issues or questions:
- Check the [Troubleshooting](#troubleshooting) section
- Review [Vite Documentation](https://vitejs.dev/)
- Check [React Documentation](https://react.dev/)

---

**Frontend setup complete!** ✨

## Features

- **Modern UI/UX**: Clean, dark-themed interface with intuitive navigation
- **Drag-and-Drop Upload**: Easy CSV file upload with drag-and-drop support
- **Data Preview**: Real-time preview of uploaded datasets
- **Column Selection**: Visual interface for selecting target columns
- **Progress Tracking**: Real-time monitoring of the ML pipeline progress
- **Visual Pipeline Steps**: Clear visualization of the 6-stage processing pipeline
- **Live Logging**: Real-time logs showing the analysis process
- **Results Visualization**: Comprehensive display of model performance metrics
- **Model Comparison**: Side-by-side comparison of different trained models
- **Feature Importance Charts**: Visual representation of feature importance rankings
- **Responsive Design**: Works well on various screen sizes

## Technology Stack

- **React 19**: Component-based UI library with hooks for state management
- **Vite**: Next-generation build tool for fast development and optimized builds
- **Axios**: Promise-based HTTP client for API communication
- **Recharts**: Declarative charting library for data visualization
- **ESLint**: JavaScript linter for code quality and consistency
- **JavaScript/JSX**: Language for building user interfaces

## Architecture

The frontend follows a component-based architecture with a single main App component that manages state and coordinates different views:

```
App.jsx
├── State Management (useState, useEffect, useRef)
├── Page Views
│   ├── Upload Page
│   ├── Processing Page
│   └── Results Page
├── API Integration (axios)
└── Styling (inline styles)
```

### State Management
The application uses React hooks for state management:
- `useState` for managing component state
- `useEffect` for side effects and lifecycle management
- `useRef` for accessing DOM elements and storing mutable values

### Navigation
The application uses a simple state-driven navigation system:
- Upload page for file upload and target selection
- Processing page for monitoring analysis progress
- Results page for viewing model performance and insights

## Installation

### Prerequisites
- Node.js 16 or higher
- npm or yarn package manager

### Setup Process

1. Navigate to the frontend directory:
```bash
cd DataPilot_AI/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Verify installation by checking package versions:
```bash
npm list react react-dom vite
```

## Configuration

### Environment Variables

Create a `.env` file in the frontend directory with the following variables:

```
VITE_API_BASE_URL=http://localhost:8000
```

- `VITE_API_BASE_URL`: The base URL for the backend API (must start with VITE_ to be recognized by Vite)

### Package Dependencies

Key dependencies from `package.json`:
- `react`: Core UI library
- `react-dom`: DOM renderer for React
- `axios`: HTTP client for API requests
- `recharts`: Charting library (though not heavily used in current implementation)
- `vite`: Build tool and development server

## Development

### Starting the Development Server

Run the following command to start the development server:

```bash
npm run dev
```

This will start the application on `http://localhost:5173` with hot-reloading enabled.

### Available Scripts

- `npm run dev`: Starts the development server with hot-reload
- `npm run build`: Builds the production-ready application
- `npm run lint`: Runs ESLint to check code quality
- `npm run preview`: Locally previews the production build

### Development Workflow

1. Make changes to JSX/JS files
2. Changes will automatically reflect in the browser (hot-reload)
3. Use browser developer tools to debug React components
4. Test API interactions with the backend server running

## Project Structure

```
frontend/
├── src/
│   ├── App.jsx                 # Main application component
│   ├── App.css                 # Global CSS styles
│   ├── index.css               # CSS reset/base styles
│   └── main.jsx                # Entry point that renders App
├── public/                     # Static assets
├── package.json               # Project metadata and dependencies
├── package-lock.json          # Locked dependency versions
├── vite.config.js             # Vite build configuration
├── eslint.config.js           # ESLint configuration
├── .env                       # Environment variables
└── README.md                  # This file
```

## Components

### Main App Component ([App.jsx](file:///d:/Jame/DataPilot_AI/frontend/src/App.jsx))

The main component handles:

#### State Management
- `page`: Current view (upload, processing, results)
- `session`: Current session ID
- `columns`: List of dataset columns
- `filename`: Name of uploaded file
- `shape`: Dimensions of the dataset
- `preview`: Sample rows from the dataset
- `target`: Selected target column
- `progress`: Current analysis progress percentage
- `currentStep`: Current stage in the pipeline
- `logs`: Live logs from the analysis
- `status`: Current analysis status
- `results`: Final analysis results
- `dragging`: Flag for drag-and-drop state
- `pollRef`: Reference for polling interval
- `logRef`: Reference for scrolling logs

#### Key Functions
- `handleFile()`: Processes uploaded CSV files
- `startAnalysis()`: Initiates the ML pipeline
- `Polling Logic`: Continuously fetches status updates

#### Views
- **Upload View**: File upload and target selection interface
- **Processing View**: Progress tracking and live logs
- **Results View**: Model performance metrics and visualizations

## API Integration

### API Base URL
The application reads the backend API URL from the `VITE_API_BASE_URL` environment variable, defaulting to `http://localhost:8000`.

### API Calls
The frontend makes the following API requests:

1. **Upload**: `POST /api/v1/upload`
   - Uploads CSV files to the backend
   - Returns session info and data preview

2. **Analyze**: `POST /api/v1/analyze`
   - Starts the ML pipeline with specified target column
   - Returns confirmation of analysis start

3. **Status**: `GET /api/v1/status/{session_id}`
   - Polls for current analysis progress
   - Returns status, progress, and logs

4. **Results**: `GET /api/v1/results/{session_id}`
   - Retrieves final analysis results
   - Returns model performance and metrics

### Error Handling
- Network errors are caught and displayed as alerts
- Validation errors from the backend are shown to the user
- File format restrictions are enforced client-side

## Styling

The application uses inline styles with a consistent dark theme defined in the `s` object:

### Color Palette
- `bg`: `#0a0c0f` - Main background
- `surface`: `#111418` - Card backgrounds
- `surface2`: `#181c22` - Secondary surfaces
- `border`: `#1e2430` - Border color
- `accent`: `#00d4aa` - Primary accent (teal-green)
- `accent2`: `#0099ff` - Secondary accent (blue)
- `text`: `#e2e8f0` - Main text
- `text2`: `#94a3b8` - Secondary text
- `text3`: `#4a5568` - Tertiary text
- `success`: `#10b981` - Success indicators
- `warn`: `#f59e0b` - Warning indicators

### Typography
- `sans`: System font stack with DM Sans as primary
- `mono`: Space Mono for monospace text
- Consistent sizing and spacing throughout

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:8000` |

## Deployment

### Building for Production

To create a production build:

```bash
npm run build
```

This creates a `dist/` folder with optimized, minified assets ready for deployment.

### Deployment Options

1. **Static Host**: Deploy the `dist/` folder contents to any static hosting service (Netlify, Vercel, GitHub Pages, etc.)
2. **Node Server**: Serve the built files using a Node.js server
3. **CDN**: Upload to a CDN for global distribution

### Optimization Features

- Bundle splitting and code splitting
- Asset optimization and compression
- Tree-shaking of unused code
- Modern JavaScript syntax compilation

## Troubleshooting

### Common Issues

#### API Connection Problems
- Verify backend server is running on the configured port
- Check that CORS settings allow requests from frontend origin
- Confirm `VITE_API_BASE_URL` is correctly set

#### Build Errors
- Ensure all dependencies are installed (`npm install`)
- Check for syntax errors in JSX files
- Verify environment variables are properly configured

#### Performance Issues
- Large datasets may cause UI lag during preview
- Consider implementing pagination for large data previews
- Optimize re-rendering with React.memo if needed

### Development Tips

- Use React Developer Tools browser extension for debugging
- Monitor network requests in browser dev tools
- Check console for warnings and errors
- Use conditional rendering to optimize performance

---

Made with ❤️ using React and Vite.