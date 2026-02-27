# DataPilot AI Frontend Setup - Simple Guide

This guide will walk you through setting up the DataPilot AI frontend step by step.

## 🎯 What You'll Do
1. Check if Node.js is installed
2. Navigate to the frontend folder
3. Install all required packages
4. Configure the connection to your backend
5. Start the development server
6. Test that everything works

## ✅ Step 1: Check Your Software

Open Command Prompt or PowerShell and run:

```powershell
node --version
```
**You should see:** `v24.11.1` (or similar 24.x version)

```powershell
npm --version
```
**You should see:** `10.x.x` (or higher)

If you don't have these, download Node.js from [nodejs.org](https://nodejs.org/)

## 📁 Step 2: Navigate to Frontend Folder

```powershell
cd D:\Jame\DataPilot_AI\frontend
```

Verify you're in the right place:
```powershell
dir
```
You should see `package.json`, `src/` folder, etc.

## 📥 Step 3: Install Required Packages

This downloads all the libraries your frontend needs:

```powershell
npm install
```

This will take 1-2 minutes. You'll see a progress bar and package names.

**Note:** If this fails, try:
```powershell
npm cache clean --force
Remove-Item -Recurse node_modules
npm install
```

## ⚙️ Step 4: Configure Backend Connection

Create a file called `.env` in your frontend folder:

```env
VITE_API_BASE_URL=http://localhost:8000
```

This tells your frontend where to find the backend server.

## ▶️ Step 5: Start the Frontend Server

```powershell
npm run dev
```

**You should see output like:**
```
VITE v5.0.8  dev server running at:

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

## 🌐 Step 6: Open in Your Browser

Open your web browser and go to: **http://localhost:5173**

You should see the DataPilot AI upload interface!

## 🧪 Step 7: Test Everything Works

1. **Page Loads**: You should see the file upload area
2. **Backend Connection**: The "CONNECTED TO BACKEND" indicator should be visible
3. **File Upload**: Try uploading the `test_sample.csv` file
4. **Analysis**: Select "education_score" as target and click "Start Autonomous Analysis"

## 🔄 Keeping Your Frontend Running

- Keep the terminal window open
- The server will automatically reload when you change code
- To stop: Press `Ctrl+C` in the terminal

## 🚨 Common Problems and Solutions

### Problem: "npm is not recognized"
**Solution:** Node.js isn't installed properly. Reinstall from [nodejs.org](https://nodejs.org/)

### Problem: "Cannot find module 'react'"
**Solution:** Packages not installed. Run:
```powershell
npm install
```

### Problem: "Port 5173 is already in use"
**Solution:** Use a different port:
```powershell
npm run dev -- --port 5174
```

### Problem: "Cannot connect to backend"
**Checklist:**
1. Is your backend running? (Check http://localhost:8000/health)
2. Is the `.env` file correct?
3. Did you restart the frontend after changing `.env`?

### Problem: "CORS Error" in browser console
**Solution:**
1. Make sure backend is running
2. Check backend `.env` has: `ALLOWED_ORIGINS=http://localhost:5173`
3. Restart backend server

### Problem: Upload doesn't work
**Checklist:**
1. Backend is running
2. MongoDB is running
3. File is a valid CSV
4. Check browser console (F12) for error messages

## 📁 Your Frontend Folder Structure

```
frontend/
├── src/              # Source code
│   ├── App.jsx       # Main application
│   ├── main.jsx      # Entry point
│   └── assets/       # Images, etc.
├── public/           # Static files
├── node_modules/     # Installed packages
├── .env              # Configuration
├── package.json      # Dependencies list
└── vite.config.js    # Build configuration
```

## 🎯 Next Steps

✅ Frontend is running on http://localhost:5173
✅ Backend should be running on http://localhost:8000

Now you can:
1. Upload CSV files
2. Run automated machine learning analysis
3. View results and model comparisons

## 🛠️ Useful Commands

```powershell
# Start development server
npm run dev

# Create production build
npm run build

# Preview production build
npm run preview

# Check for code problems
npm run lint
```

## 🎨 What You Can Do

- **Upload CSV files** via drag & drop or file browser
- **Select target columns** to predict
- **Watch real-time progress** of analysis
- **View detailed results** including:
  - Model performance comparisons
  - Feature importance rankings
  - Statistical analysis
  - Best model recommendations

---

**Need help?** Check the common problems section above or make sure your backend is running properly!

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