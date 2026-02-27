# Frontend Setup Guide - DataPilot AI

Complete step-by-step instructions to set up and run the DataPilot AI frontend on Windows.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Quick Install](#quick-install)
- [Detailed Setup](#detailed-setup)
- [Configuration](#configuration)
- [Running the Server](#running-the-server)
- [Testing the Frontend](#testing-the-frontend)
- [Troubleshooting](#troubleshooting)
- [Directory Structure](#directory-structure)
- [Next Steps](#next-steps)

---

## Prerequisites

### Requirements
- **Node.js**: 24.x
- **npm**: 10.x (comes with Node.js)
- **Backend running**: On port 8000 (see [../backend/README.md](../backend/README.md))

### Verify Installation

```powershell
node --version    # Should show v24.x.x
npm --version     # Should show 10.x.x
```

---

## Quick Install

For experienced developers, here's the fast path:

```powershell
cd D:\Jame\DataPilot_AI\frontend
npm install
```

Then create `.env`:

```powershell
@"
VITE_API_BASE_URL=http://localhost:8000
"@ | Out-File .env -Encoding UTF8
```

Finally start it:

```powershell
npm run dev
```

Open: **http://localhost:5173** ✨

---

## Detailed Setup

### Step 1: Navigate to Frontend Directory

```powershell
cd D:\Jame\DataPilot_AI\frontend
```

Expected output:
```
D:\Jame\DataPilot_AI\frontend>
```

### Step 2: Install Dependencies

```powershell
npm install
```

This reads `package.json` and installs all required packages into `node_modules/`.

Expected output:
```
added 387 packages in 15s
```

### Step 3: Create Environment File

Create `.env` file in frontend directory with backend URL:

```powershell
@"
VITE_API_BASE_URL=http://localhost:8000
"@ | Out-File .env -Encoding UTF8
```

Verify it was created:

```powershell
cat .env
```

Expected output:
```
VITE_API_BASE_URL=http://localhost:8000
```

### Step 4: Verify Backend is Running

Before starting frontend, ensure backend is healthy:

```powershell
curl http://localhost:8000/health
```

Expected output:
```json
{"status":"ok"}
```

If you get a connection error, start the backend first following [../backend/README.md](../backend/README.md).

### Step 5: Start Development Server

```powershell
npm run dev
```

Expected output:
```
VITE v5.0.8  dev server running at:

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

---

## Configuration

### Environment Variables

Edit `.env` file (created in Step 3):

| Variable | Value | Purpose |
|----------|-------|---------|
| `VITE_API_BASE_URL` | `http://localhost:8000` | Backend API URL (must start with `VITE_` for Vite) |

**Note**: After changing `.env`, restart `npm run dev` for changes to take effect.

### Available Scripts

In the `package.json`, you can run these commands:

```powershell
npm run dev       # Start dev server on port 5173
npm run build     # Create production build in dist/
npm run preview   # Preview production build locally
```

To use a different port:

```powershell
npm run dev -- --port 5174
```

---

## Running the Server

### Start the Frontend

```powershell
npm run dev
```

You should see:
```
  ➜  Local:   http://localhost:5173/
```

### Access the Application

Open your browser and go to: **http://localhost:5173**

You should see:
- File upload area with drag-and-drop support
- Column selection interface
- Ready to upload a CSV file

### Keep It Running

The dev server stays running. Keep this terminal open while developing.

To stop: Press `Ctrl+C` in the terminal.

---

## Testing the Frontend

### Test 1: Page Loads

1. Open http://localhost:5173
2. You should see the upload interface
3. Check browser console (F12 → Console) for any errors

Expected: No error messages

### Test 2: Backend Connection

1. In browser console (F12 → Console), run:
```javascript
fetch('http://localhost:8000/health').then(r => r.json()).then(d => console.log(d))
```

Expected output in console:
```
{status: 'ok'}
```

### Test 3: File Upload

1. Go to http://localhost:5173
2. Click "Choose File" or drag and drop a CSV
3. File should show: columns, shape, and data preview

If it fails, check:
- Backend is running (`curl http://localhost:8000/health`)
- Browser console (F12) for error messages
- CORS settings in backend `.env`

---

## Troubleshooting

### Issue: Port 5173 Already in Use

**Problem**: Another process is using port 5173

**Solution**:
```powershell
# Use a different port
npm run dev -- --port 5174

# Or find and kill the process
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### Issue: Dependencies Installation Fails

**Problem**: `npm install` fails with permission or network errors

**Solution**:
```powershell
# Clear npm cache
npm cache clean --force

# Remove old installation
Remove-Item -Recurse node_modules
Remove-Item package-lock.json

# Reinstall
npm install
```

### Issue: `Cannot find module...` Error

**Problem**: Missing dependencies or invalid node_modules

**Solution**:
```powershell
# Reinstall all dependencies
Remove-Item -Recurse node_modules
npm install

# Start fresh
npm run dev
```

### Issue: CORS Error - "Access-Control-Allow-Origin"

**Problem**: Frontend can't upload files - browser shows CORS error

**Symptoms**: Error in console like "Access to XMLHttpRequest blocked by CORS policy"

**Solution**:
1. Check backend is running:
   ```powershell
   curl http://localhost:8000/health
   ```

2. Edit backend `.env` and add frontend URL:
   ```
   ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:8000
   ```

3. Restart backend:
   ```powershell
   # In backend terminal, press Ctrl+C then:
   uvicorn app.main:app --reload --port 8000
   ```

4. Refresh frontend browser (F5)

### Issue: API Calls Failing - "Cannot reach backend"

**Problem**: Frontend starts but can't connect to backend

**Symptoms**: Upload button doesn't work, no data preview

**Solution**:
1. Verify backend is running:
   ```powershell
   curl http://localhost:8000/health
   # Expected: {"status":"ok"}
   ```

2. Check `.env` has correct URL:
   ```powershell
   cat .env
   # Should show: VITE_API_BASE_URL=http://localhost:8000
   ```

3. Restart frontend (Ctrl+C in npm dev terminal, then `npm run dev`)

4. Open browser console (F12 → Console) and check for errors

5. Test backend health directly:
   ```powershell
   curl -v http://localhost:8000/health
   ```

### Issue: Slow Performance or Hot Reload Not Working

**Problem**: Changes don't appear, or app is slow

**Solution**:
```powershell
# Clear Vite cache
Remove-Item -Recurse -Force node_modules\.vite

# Or complete reinstall
Remove-Item -Recurse node_modules, dist, .vite
npm install
npm run dev
```

### Issue: Node/npm Version Wrong

**Problem**: Error like "Node version too old" or npm errors

**Solution**:
```powershell
node --version  # Should be v24.x.x
npm --version   # Should be 10.x.x

# If wrong versions, download from nodejs.org or use nvm
```

### Issue: File Upload Shows No Preview

**Problem**: Upload completes but columns and preview don't show

**Solution**:
1. Check browser console (F12 → Network tab)
2. Look at `/api/v1/upload` response - should show columns
3. Verify backend is processing the file
4. Check backend logs for errors
5. Ensure CSV file is valid (text format, comma-separated)

---

## Directory Structure

```
frontend/
├── src/
│   ├── main.jsx              # React entry point
│   ├── App.jsx               # Main application component
│   ├── App.css               # Application styles
│   └── index.css             # Global styles
├── public/                   # Static assets (images, etc.)
├── dist/                     # Production build (created by npm run build)
├── node_modules/             # Dependencies (created by npm install)
├── package.json              # Project metadata and dependencies
├── package-lock.json         # Locked dependency versions
├── vite.config.js            # Vite configuration
├── .env                      # Environment variables (you create this)
└── README.md                 # This file
```

### Key Files

| File | Purpose |
|------|---------|
| `src/App.jsx` | Main React component with upload, processing, and results views |
| `src/App.css` | Styles for the application |
| `vite.config.js` | Build configuration and dev server settings |
| `.env` | API URL and other env variables (create manually) |
| `package.json` | Dependencies: React, Vite, Axios |

---

## Next Steps

✅ **Frontend is running** on http://localhost:5173

1. **Ensure Backend is running** - Check [../backend/README.md](../backend/README.md)
2. **Start using the platform**:
   - Prepare a CSV file (headers + data rows)
   - Upload it to DataPilot
   - Select a target column to predict
   - Watch the ML pipeline run in real-time
3. **Production deployment** - Run `npm run build` to create optimized build for deployment
4. **Need help?** - Check [Troubleshooting](#troubleshooting) section above

---

## Technology Stack

- **React 18** - Component-based UI library
- **Vite 5** - Fast build tool and dev server
- **Axios** - HTTP client for API requests
- **JavaScript** - Modern ES6+ syntax
- **CSS** - Inline styles with dark theme

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

Built with ❤️ for the data science community.