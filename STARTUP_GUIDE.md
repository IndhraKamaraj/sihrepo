# ETA Intelligence - Startup & Verification Guide

## Prerequisites Check

Before starting, ensure:

```bash
# Check Node.js version (should be v18+)
node --version

# Check npm version (should be v9+)
npm --version
```

Expected output:
```
v18.0.0 or higher
9.0.0 or higher
```

---

## Step 1: Navigate to Project Directory

```bash
cd projectwithcursor
```

---

## Step 2: Install Dependencies

**First Time Only:**
```bash
npm run install:all
```

This installs dependencies for both backend and frontend.

**What it does:**
```
✓ Installs backend: express, cors
✓ Installs frontend: react, vite, tailwind
✓ Creates node_modules in both directories
```

---

## Step 3: Start Both Services

```bash
npm start
```

**Expected Console Output:**

**Backend (first)**:
```
✓ Store initialized with 5 trains
✓ ETA Intelligence API ready on http://localhost:3001
✓ Data status: Simulation / Demonstration Data
✓ Backend initialized successfully
✓ Ready to accept requests
```

**Frontend (then)**:
```
✓ Frontend VITE v6.0.7 ready in 1234 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

---

## Step 4: Open Dashboard

Open your browser to:
```
http://localhost:5173
```

**Expected to see:**
- Header: "ETA Intelligence System - SIH26028"
- Sidebar with navigation
- Dashboard loading animation briefly
- Then displays:
  - Train selector with 5 trains (12679 pre-selected)
  - Network map showing train positions
  - KPI cards (Active Trains, Delayed, etc.)
  - ETA card showing prediction
  - Simulation controls
  - Station timeline

---

## Verification Checklist

### ✓ Startup
- [ ] Backend console shows "Backend initialized successfully"
- [ ] Frontend console shows "ready in XXX ms"
- [ ] Dashboard loads without white screen
- [ ] No JavaScript errors in browser console

### ✓ Initial Data
- [ ] Train selector dropdown has 5 trains
- [ ] Train 12679 (CBE Intercity) is selected by default
- [ ] Network map displays route
- [ ] Station timeline shows 13 stations
- [ ] KPI cards show train counts

### ✓ Train Information
- [ ] Current location: "Salem Junction"
- [ ] Next station: "Erode Junction"
- [ ] Status: Shows operational status
- [ ] Current speed: Shows in km/h

### ✓ ETA Engine
- [ ] Scheduled arrival: 22:20
- [ ] Predicted arrival: 22:23 (shows 3 min baseline delay)
- [ ] Confidence: 90%
- [ ] Delay explanation visible

### ✓ Event System
Go to "Events" section:
- [ ] Click "Speed Restriction" → ETA changes to 22:28 (+8 min)
- [ ] Click "Reset" → ETA back to 22:23
- [ ] Click "Congestion" → ETA changes to 22:28 (+5 min)
- [ ] Click "Reset" → ETA back to 22:23
- [ ] Click "Stoppage" → ETA changes to 22:35 (+12 min)
- [ ] Click "Reset" → ETA back to 22:23

### ✓ Non-Accumulation Test
1. Select Speed Restriction → ETA: 22:28
2. Reset → ETA: 22:23
3. Select Congestion → ETA: 22:28
4. Expected: ETA should be 22:28 (NOT 22:33 = 22:20 + 5 + 8)
5. If so: ✓ Non-accumulation works

### ✓ Simulation
Go to "Simulation" section:
- [ ] Click "Start" → Simulation clock starts advancing
- [ ] Change speed to "5x" → Clock moves faster
- [ ] Click "Pause" → Clock stops
- [ ] Click "Reset" → Clock and trains return to initial state

### ✓ Train Selection
- [ ] Select "12680 MAS Intercity" from dropdown
- [ ] Dashboard updates with new train info
- [ ] Route shows reverse direction
- [ ] ETA for 12680 displays (14:00 arrival)
- [ ] Select back to "12679" → Original data returns

### ✓ Network Status
- [ ] All 5 trains visible on network map
- [ ] Color indicates status (on-time/delayed)
- [ ] Selected train highlighted
- [ ] Clicking different trains shows their positions

### ✓ Error Handling
Stop the backend:
- [ ] Open another terminal: `pkill -f "node server.js"`
- [ ] Refresh frontend browser
- [ ] Should see error message
- [ ] Should see "Retry" button
- [ ] Restart backend: `npm run dev:backend`
- [ ] Click Retry → Dashboard loads again ✓

---

## Startup Troubleshooting

### Issue: "Address already in use 0.0.0.0:3001"

**Cause**: Port 3001 occupied by existing process

**Fix**:
```bash
# Kill existing process
pkill -f "node server.js"

# Or find and kill manually
ps aux | grep node
kill -9 <PID>

# Try again
npm start
```

### Issue: "Cannot find module 'express'"

**Cause**: Dependencies not installed

**Fix**:
```bash
npm run install:all

# Or manually
npm install --prefix backend
npm install --prefix frontend
```

### Issue: Frontend shows blank white screen

**Cause**: API proxy not working or backend crashed

**Fix**:
1. Check backend console for errors
2. Verify backend is running: `curl http://localhost:3001/api/health`
3. Clear browser cache: `Ctrl+Shift+Delete`
4. Hard refresh: `Ctrl+Shift+R`

### Issue: "Cannot GET /api/trains"

**Cause**: Backend running but store not initialized

**Fix**:
1. Check `/home/claude/projectwithcursor/backend/data/trains.json` exists
2. Backend console should show "Store initialized with 5 trains"
3. If not, check trains.json syntax
4. Restart backend: `npm run dev:backend`

### Issue: CORS errors in browser console

**Cause**: Frontend/backend communication blocked

**Fix**:
1. Verify vite.config.js has:
```javascript
proxy: {
  "/api": {
    target: "http://localhost:3001",
    changeOrigin: true,
  },
}
```
2. Verify backend has: `app.use(cors())`
3. Restart both services

### Issue: "Request timed out"

**Cause**: Backend slow or unresponsive

**Fix**:
1. Check backend CPU/memory
2. Reduce simulation speed
3. Restart both services
4. Check network connectivity

---

## Individual Service Startup

If using separate terminals:

**Terminal 1 - Backend Only**:
```bash
npm run dev:backend
# Or
cd backend && node server.js
```

**Terminal 2 - Frontend Only**:
```bash
npm run dev:frontend
# Or
cd frontend && npm run dev
```

---

## Testing API Directly

### Check Backend Health
```bash
curl http://localhost:3001/api/health
```

Expected:
```json
{
  "status": "ok",
  "dataStatus": "Simulation / Demonstration Data",
  "simulation": {...}
}
```

### Get All Trains
```bash
curl http://localhost:3001/api/trains
```

Expected:
```json
{
  "dataStatus": "Simulation / Demonstration Data",
  "trains": [
    {
      "trainNumber": "12679",
      "trainName": "CBE Intercity",
      ...
    },
    ...
  ]
}
```

### Get Selected Train
```bash
curl http://localhost:3001/api/train
```

### Apply Speed Restriction Event
```bash
curl -X POST http://localhost:3001/api/train/event \
  -H "Content-Type: application/json" \
  -d '{"type": "speed_restriction"}'
```

### Reset Event
```bash
curl -X POST http://localhost:3001/api/train/reset
```

### Start Simulation
```bash
curl -X POST http://localhost:3001/api/simulation/start
```

---

## Performance Notes

### Frontend
- Refresh rate: 1000ms (1 second) during simulation
- Timeout: 8 seconds per request
- Auto-retry: 3 attempts with backoff

### Backend
- Store initialization: ~100ms
- Train list fetch: ~5ms
- ETA calculation: ~10ms
- Simulation tick: ~1ms per train

### Network
- API calls: ~50-100ms typical latency
- Dashboard full load: 2-3 seconds

---

## Development Console Tips

### Backend Console
Look for:
- `✓ Store initialized...` → Successful startup
- `✗ Failed to initialize...` → Initialization error
- `GET /api/trains` → Incoming API requests
- Request latency in console

### Frontend Console
Look for:
- `Fetch /api/trains` → API calls
- Retry attempt logs
- React errors or warnings
- Network timing information

Open developer console:
```
Chrome/Edge: F12 or Ctrl+Shift+I
Firefox: F12 or Ctrl+Shift+I
Safari: Cmd+Option+I
```

---

## Production Build

### Build Frontend
```bash
npm run build --prefix frontend
```

Output: `frontend/dist/` (static files for hosting)

### Deploy Backend
```bash
cd backend
npm install --production
NODE_ENV=production node server.js
```

---

## Key URLs

| Component | URL | Description |
|-----------|-----|-------------|
| Frontend | http://localhost:5173 | Main dashboard |
| Backend | http://localhost:3001 | API server |
| Backend Health | http://localhost:3001/api/health | Health check |
| Backend Ready | http://localhost:3001/api/ready | Readiness probe |

---

## Stopping Services

To stop running services:

**Graceful shutdown**:
```bash
Ctrl+C in terminal running npm start
```

**Kill all node processes**:
```bash
pkill -f "node"
```

**Kill specific processes**:
```bash
pkill -f "server.js"  # Backend
pkill -f "vite"       # Frontend
```

---

## Next Steps

Once verified:
1. Review API documentation in `/api` section of README
2. Explore all navigation sections in sidebar
3. Test all scenario combinations
4. Try different simulation speeds
5. Review network map and KPI changes
6. Check explainable predictions for each event

---

**Happy Testing! 🚀**

All systems ready for SIH26028 Demonstration
