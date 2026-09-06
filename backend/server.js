const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { ALLOWED_EVENTS } = require("./services/etaEngine");
const { createTrainStore } = require("./services/trainStore");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize data with error handling
let store = null;
let initError = null;

try {
  const trainDataPath = path.join(__dirname, "data", "trains.json");
  if (!fs.existsSync(trainDataPath)) {
    throw new Error(`Data file not found: ${trainDataPath}`);
  }
  const dataset = JSON.parse(fs.readFileSync(trainDataPath, "utf8"));
  if (!dataset || !dataset.trains || !Array.isArray(dataset.trains)) {
    throw new Error("Invalid dataset format: missing trains array");
  }
  if (dataset.trains.length === 0) {
    throw new Error("No trains defined in dataset");
  }
  store = createTrainStore(dataset);
  console.log(`✓ Store initialized with ${dataset.trains.length} trains`);
} catch (error) {
  initError = error;
  console.error("✗ Failed to initialize store:", error.message);
}

function ensureStoreReady(req, res, next) {
  if (!store || initError) {
    console.error("⚠ Store not initialized:", initError?.message);
    return res.status(503).json({
      error: "Service unavailable",
      details: "Backend store not initialized",
      message: initError?.message || "Unknown initialization error"
    });
  }
  next();
}

function resolveTrainNumber(req) {
  return (
    req.params.trainId ||
    req.body?.trainNumber ||
    store.getSelectedTrainNumber()
  );
}

function handleError(res, error, fallback) {
  console.error(fallback, error);
  const status = error.statusCode || 500;
  res.status(status).json({ error: error.message || fallback });
}

// Apply store check to all API routes
app.use("/api/", ensureStoreReady);

app.get("/api/ready", (_req, res) => {
  if (!store || initError) {
    return res.status(503).json({ ready: false, error: initError?.message });
  }
  res.json({ ready: true });
});

app.get("/api/health", (_req, res) => {
  if (!store || initError) {
    return res.status(503).json({
      status: "error",
      error: initError?.message || "Store not initialized"
    });
  }
  res.json({
    status: "ok",
    dataStatus: store.dataset.dataStatus,
    simulation: store.getSimulationPublic(),
  });
});

/** Multi-train list + KPIs + network markers */
app.get("/api/trains", (_req, res) => {
  try {
    res.json(store.listTrains());
  } catch (error) {
    handleError(res, error, "Failed to list trains.");
  }
});

/** Full detail for one train */
app.get("/api/trains/:trainId", (req, res) => {
  try {
    res.json(store.getPayload(req.params.trainId));
  } catch (error) {
    handleError(res, error, "Failed to load train.");
  }
});

app.post("/api/trains/:trainId/select", (req, res) => {
  try {
    res.json(store.selectTrain(req.params.trainId));
  } catch (error) {
    handleError(res, error, "Failed to select train.");
  }
});

app.post("/api/trains/:trainId/event", (req, res) => {
  try {
    const { type } = req.body || {};
    if (!type || typeof type !== "string" || type === "none" || !ALLOWED_EVENTS.has(type)) {
      return res.status(400).json({
        error: "Missing or invalid event type.",
        allowed: ["speed_restriction", "congestion", "unexpected_stoppage"],
      });
    }
    // REPLACE previous scenario — do not accumulate
    res.json(store.setEvent(req.params.trainId, type));
  } catch (error) {
    handleError(res, error, "Failed to apply event.");
  }
});

app.post("/api/trains/:trainId/reset", (req, res) => {
  try {
    res.json(store.resetEvent(req.params.trainId));
  } catch (error) {
    handleError(res, error, "Failed to reset scenario.");
  }
});

/**
 * Compatibility endpoints — operate on the currently selected train.
 * Preserves original SIH acceptance-test contracts.
 */
app.get("/api/train", (_req, res) => {
  try {
    res.json(store.getPayload());
  } catch (error) {
    handleError(res, error, "Failed to compute train ETA state.");
  }
});

app.post("/api/train/select", (req, res) => {
  try {
    const trainNumber = req.body?.trainNumber;
    if (!trainNumber) {
      return res.status(400).json({ error: "trainNumber is required." });
    }
    res.json(store.selectTrain(String(trainNumber)));
  } catch (error) {
    handleError(res, error, "Failed to select train.");
  }
});

app.post("/api/train/event", (req, res) => {
  try {
    const { type } = req.body || {};

    if (!type || typeof type !== "string") {
      return res.status(400).json({
        error: "Missing or invalid event type.",
        allowed: ["speed_restriction", "congestion", "unexpected_stoppage"],
      });
    }

    if (type === "none") {
      return res.status(400).json({
        error: "Use POST /api/train/reset to clear the scenario.",
      });
    }

    if (!ALLOWED_EVENTS.has(type)) {
      return res.status(400).json({
        error: `Invalid event type: ${type}`,
        allowed: ["speed_restriction", "congestion", "unexpected_stoppage"],
      });
    }

    const trainNumber = resolveTrainNumber(req);
    // REPLACE previous scenario — do not accumulate
    res.json(store.setEvent(trainNumber, type));
  } catch (error) {
    handleError(res, error, "Failed to apply event.");
  }
});

app.post("/api/train/reset", (_req, res) => {
  try {
    res.json(store.resetEvent(store.getSelectedTrainNumber()));
  } catch (error) {
    handleError(res, error, "Failed to reset scenario.");
  }
});

/** Simulation controls */
app.get("/api/simulation", (_req, res) => {
  try {
    res.json({
      ...store.getSimulationPublic(),
      selectedTrainNumber: store.getSelectedTrainNumber(),
    });
  } catch (error) {
    handleError(res, error, "Failed to read simulation state.");
  }
});

app.post("/api/simulation/start", (_req, res) => {
  try {
    store.startSimulation();
    res.json(store.listTrains());
  } catch (error) {
    handleError(res, error, "Failed to start simulation.");
  }
});

app.post("/api/simulation/pause", (_req, res) => {
  try {
    store.pauseSimulation();
    res.json(store.listTrains());
  } catch (error) {
    handleError(res, error, "Failed to pause simulation.");
  }
});

app.post("/api/simulation/reset", (_req, res) => {
  try {
    res.json(store.resetSimulation());
  } catch (error) {
    handleError(res, error, "Failed to reset simulation.");
  }
});

app.post("/api/simulation/speed", (req, res) => {
  try {
    store.setSimulationSpeed(Number(req.body?.speed));
    res.json(store.listTrains());
  } catch (error) {
    handleError(res, error, "Failed to set simulation speed.");
  }
});

const frontendDist = path.join(__dirname, "..", "frontend", "dist");

// Serve static frontend assets
app.use(express.static(frontendDist));

// API 404 handler for unmatched /api routes
app.use("/api", (req, res) => {
  res.status(404).json({ error: `Not found: ${req.method} ${req.path}` });
});

// SPA fallback for all other routes
app.get("*", (req, res) => {
  const indexPath = path.join(frontendDist, "index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send("Frontend assets not built. Run npm run build.");
  }
});

app.listen(PORT, "0.0.0.0", () => {
  if (initError) {
    console.error(`✗ ETA Intelligence API listening on http://0.0.0.0:${PORT}`);
    console.error(`✗ ERROR: Backend store failed to initialize`);
    console.error(`✗ Details: ${initError.message}`);
    console.error(`✗ Frontend will receive error from /api/health endpoint`);
  } else {
    console.log(`✓ ETA Intelligence API ready on http://0.0.0.0:${PORT}`);
    console.log(`✓ Data status: Simulation / Demonstration Data`);
    console.log(`✓ Backend initialized successfully`);
    console.log(`✓ Ready to accept requests`);
  }
});
