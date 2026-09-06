# PROJECT_STATE.md — SIH26028 ETA Intelligence

## Project purpose

Training prototype for **Smart India Hackathon** project **SIH26028**:  
**Dynamic Forecast of Expected Time of Arrival (ETA) for Coaching Trains**.

Upgraded from a single-train static page into a multi-train operations-style dashboard with demo simulation movement. All values remain **Simulation / Demonstration Data**.

## Architecture

```
Browser (React ops dashboard)
   │  /api/*
   ▼
Express API (server.js)
   │
   ├─ trainStore.js  (multi-train runtime + simulation clock)
   └─ etaEngine.js   (single source of truth for ETA math)
          │
          ▼
   data/trains.json  (corridor + fleet + event definitions)
```

## Technology stack

- Frontend: React 18, Vite 6, Tailwind CSS 3
- Backend: Node.js, Express 4
- Root: concurrently

## Key behaviours

### ETA engine

`predictedDelay = currentDelay + eventDelay` (event replaces, never stacks)  
`predictedArrival = scheduledArrival + predictedDelay` (clock arithmetic)

### Simulation

- In-memory demo clock (default 18:42)
- Start / Pause / Reset / speed 1x·5x·10x
- Advances train progress along station sequence
- Frontend polls every 1s while running
- ETA always recalculated via `etaEngine`

### Events (non-accumulating)

| Event | Extra | Confidence | Network condition |
|-------|-------|------------|-------------------|
| none | +0 | 90% | Normal |
| speed_restriction | +8 | 82% | Restricted |
| congestion | +5 | 82% | Congested |
| unexpected_stoppage | +12 | 78% | Delayed |

### Multi-train

Five demo trains on MAS–CBE corridor (one reverse working). Selection updates monitor, ETA, timeline, events, and network highlight.

## API surface

Preserved:

- `GET /api/train`
- `POST /api/train/event`
- `POST /api/train/reset`

Added:

- `GET /api/trains`, `GET /api/trains/:id`
- `POST /api/train/select`
- `POST /api/simulation/start|pause|reset`
- `POST /api/simulation/speed`

## Files touched (upgrade)

- `backend/data/trains.json` — multi-train dataset
- `backend/services/etaEngine.js` — runtime state, status, impact fields
- `backend/services/trainStore.js` — **new** fleet + simulation
- `backend/server.js` — new endpoints; legacy routes kept
- `frontend/src/**` — ops-center UI (sidebar, network map, sim controls, KPIs)
- `README.md`, `PROJECT_STATE.md`

## Testing performed

| # | Test | Result |
|---|------|--------|
| 1 | Initial load | Pass |
| 2 | Train selection | Pass |
| 3 | Simulation start | Pass |
| 4 | Simulation pause | Pass |
| 5 | Simulation reset | Pass |
| 6 | Speed Restriction | Pass |
| 7 | Track Congestion | Pass |
| 8 | Unexpected Stoppage | Pass |
| 9 | Repeated event clicks (no accumulate) | Pass |
| 10 | Event replacement | Pass |
| 11 | Reset scenario | Pass |
| 12 | Station-wise ETA | Pass |
| 13 | Multiple trains in fleet | Pass |
| 14 | API communication | Pass |
| 15 | Refresh / re-fetch | Pass |
| 16 | Backend unavailable → visible error | Pass |

## Known limitations

- In-memory state only (lost on backend restart)
- No live railway APIs
- Schematic corridor (not GIS)
- Confidence is a demo lookup, not ML
- Simulation movement is deterministic demo logic, not physics/GPS
