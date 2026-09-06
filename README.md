# ETA Intelligence System - SIH26028

**Dynamic Forecast of Expected Time of Arrival (ETA) for Coaching Trains**

Ministry: Ministry of Railways  
Problem ID: SIH26028  
Status: **Simulation / Demonstration Data** (Not Real-Time Railway Data)

---

## Overview

ETA Intelligence is an AI-powered railway operations dashboard that demonstrates dynamic ETA prediction for coaching trains. The system simulates realistic operational scenarios and shows how various track conditions affect arrival predictions.

**Key Train**: 12679 CBE Intercity (Chennai Central → Coimbatore Junction)  
**Route**: 13 stations over 7.5 hours (14:30 - 22:20)

### Demonstration Trains

| Train Number | Name | Route | Status |
|---|---|---|---|
| 12679 | CBE Intercity | MAS → CBE | Primary Demo |
| 12680 | MAS Intercity | CBE → MAS (Reverse) | Demo |
| 16617 | Coimbatore Express | MAS → CBE | Demo |
| 22637 | West Coast | MAS → CBE | Demo |
| 12623 | Trivandrum Mail | MAS → CBE | Demo |

---

## Quick Start

### Prerequisites
- Node.js v18+
- npm v9+

### Install & Run
```bash
cd projectwithcursor
npm run install:all
npm start
```

Open http://localhost:5173 in your browser.

**Backend**: http://localhost:3001  
**Frontend**: http://localhost:5173

---

## Architecture

### Tech Stack
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express.js  
- **ETA Engine**: Deterministic prediction model

### Folder Structure
```
backend/
├── server.js              # API server
├── services/
│   ├── etaEngine.js      # ETA calculation
│   └── trainStore.js     # State management
└── data/trains.json      # Train definitions

frontend/
├── src/
│   ├── App.jsx           # Main app
│   ├── components/       # UI components
│   └── services/api.js   # API client
└── vite.config.js        # API proxy
```

---

## API Endpoints

### Status
- `GET /api/ready` - Readiness check
- `GET /api/health` - Backend health
- `GET /api/simulation` - Simulation state

### Trains
- `GET /api/trains` - List all trains
- `GET /api/train` - Get selected train
- `GET /api/trains/:trainId` - Get specific train
- `POST /api/train/select` - Select train (body: `{trainNumber}`)
- `POST /api/trains/:trainId/select` - Select train (param)

### Events
- `POST /api/train/event` - Apply event (body: `{type}`)
- `POST /api/trains/:trainId/event` - Apply event (param)
- `POST /api/train/reset` - Reset to baseline
- `POST /api/trains/:trainId/reset` - Reset (param)

Event types:
- `speed_restriction` (+8 min)
- `congestion` (+5 min)
- `unexpected_stoppage` (+12 min)

### Simulation
- `POST /api/simulation/start` - Start simulation
- `POST /api/simulation/pause` - Pause simulation
- `POST /api/simulation/reset` - Reset to initial state
- `POST /api/simulation/speed` - Set speed (body: `{speed: 1|5|10}`)

---

## Features

### Dashboard
- **Network Overview**: All trains and their status
- **KPI Cards**: Active trains, delays, health status
- **Train Selector**: Choose from 5 demonstration trains
- **Simulation Controls**: Start/Pause/Reset with speed control

### ETA Prediction
- **Baseline ETA**: From scheduled arrival + current delay
- **Event Scenarios**: Speed restriction, congestion, stoppage
- **Confidence Score**: 60-90% based on event type
- **Station-Wise Details**: Predictions for all stations

### Key Feature: Non-Accumulating Events
Events **replace**, not add:
- Select Speed Restriction → +8 min
- Reset → Back to baseline
- Select Congestion → +5 min (NOT +13 min)
- Reset → Back to baseline

### Simulation
- Live clock showing journey progress
- Trains move through stations in real-time
- Multiple speed options: 1x, 5x, 10x
- Visual position indicators

---

## Test Scenarios

### TEST 1: Dashboard Loads
```
Open http://localhost:5173
Expected: 5 trains display, 12679 selected, no errors
```

### TEST 2: Speed Restriction Event
```
Select 12679 → Click "Speed Restriction"
Expected: ETA changes from 22:20 to 22:28 (+8 min)
All downstream stations delayed by 8 min
```

### TEST 3: Non-Accumulation
```
Speed Restriction → Reset
Congestion → Check ETA
Expected: 22:25 (baseline 22:20 + 5 min)
NOT 22:28 (no accumulation)
```

### TEST 4: Simulation
```
Set speed to 5x → Click "Start"
Expected: Clock progresses, trains move through stations
Pause → Simulation stops at current time
Reset → Returns to initial state
```

### TEST 5: Error Recovery
```
Stop backend → Refresh frontend
Expected: Error message with Retry button
Restart backend → Click Retry
Expected: Dashboard loads successfully
```

---

## Troubleshooting

### "Unable to load dashboard"
- Check backend running: `npm run dev:backend`
- Verify port 3001 available
- Browser cache issue: Clear and refresh
- Click Retry button (has auto-retry logic)

### "Request timed out"
- Backend slow/unresponsive
- Network connectivity issue
- Restart backend and frontend

### Port 3001 already in use
```bash
pkill -f "node server.js"
sleep 2
npm run dev:backend
```

### CORS errors
- Verify vite.config.js proxy setup
- Backend should have `app.use(cors())`
- Restart both services

---

## Development Notes

### ETA Calculation
```
Predicted ETA = Scheduled Arrival 
              + Current Baseline Delay 
              + Event Delay
```

### Events Never Accumulate
```javascript
// Backend enforces:
function setEvent(trainNumber, type) {
  events.set(trainNumber, type);  // REPLACES
  // Not events.push(type) or events.add(type)
}
```

### Simulation Time
- Tick: Every 1 real second
- Speed multiplier: 1x, 5x, 10x
- Range: Full 24-hour cycle
- Trains advance based on speed and distance

---

## Limitations (Important)

**This is a DEMONSTRATION using simulated data.**

### What It Does NOT Do
- ❌ Real-time GPS tracking
- ❌ Live Indian Railways data
- ❌ Actual delay information
- ❌ Production-grade predictions
- ❌ Data persistence

### For Production Deployment Would Need
- Real-time railway data feeds
- Machine learning ETA model
- Database (PostgreSQL/MongoDB)
- WebSocket for live updates
- User authentication
- Distributed architecture
- Persistent state management

---

## Features Included

✅ Multi-train support (5 demo trains)  
✅ Dynamic ETA calculation  
✅ Event-based scenario simulation  
✅ Non-accumulating event system  
✅ Station-wise predictions  
✅ Explainable predictions  
✅ Network overview  
✅ Simulation with time control  
✅ Confidence scoring  
✅ Error handling & retry logic  
✅ Professional UI  
✅ Responsive design  

---

## Build for Production

### Frontend
```bash
npm run build --prefix frontend
# Output: frontend/dist/ (static files)
```

### Backend
```bash
cd backend
npm install --production
NODE_ENV=production node server.js
```

---

## Environment Variables

```bash
PORT=3001              # Backend port (default: 3001)
NODE_ENV=development   # development or production
```

---

## Important Disclaimer

⚠️ **This prototype uses simulation/demonstration data and does NOT claim to provide:**
- Real-time railway tracking
- Accurate Indian Railways information
- Official station timing data
- Production-grade ETA accuracy

**Use for demonstration and educational purposes only.**

---

**Project**: SIH26028 - ETA Intelligence System  
**Institution**: Sri Ramakrishna Engineering College  
**Last Updated**: September 2026

