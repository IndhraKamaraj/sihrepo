/**
 * In-memory multi-train state + demo simulation clock.
 * Simulation advances selected corridor trains deterministically.
 */

const {
  calculateEta,
  summarizeTrain,
  resolveStationTimes,
  formatMinutesToTime,
  parseTimeToMinutes,
} = require("./etaEngine");

const TICK_MS = 1000;

function cloneBaseline(train) {
  return {
    currentLocationCode: train.baselineState.currentLocationCode,
    currentSpeedKmh: train.baselineState.currentSpeedKmh,
    currentDelayMinutes: train.baselineState.currentDelayMinutes,
    progressToNext: train.baselineState.progressToNext ?? 0,
  };
}

function createTrainStore(dataset) {
  const runtime = new Map();
  const events = new Map();

  for (const train of dataset.trains) {
    runtime.set(train.trainNumber, cloneBaseline(train));
    events.set(train.trainNumber, "none");
  }

  let selectedTrainNumber =
    dataset.trains.find((t) => t.primary)?.trainNumber || dataset.trains[0].trainNumber;

  let simulation = {
    running: false,
    speed: 1,
    currentTimeMinutes: parseTimeToMinutes("18:42"),
    journeyStart: "14:30",
    journeyEnd: "22:20",
    modeLabel: "SIMULATION MODE",
  };

  let tickTimer = null;

  function getTrainDef(trainNumber) {
    const train = dataset.trains.find((t) => t.trainNumber === trainNumber);
    if (!train) {
      const error = new Error(`Train not found: ${trainNumber}`);
      error.statusCode = 404;
      throw error;
    }
    return train;
  }

  function buildContext(train) {
    return {
      train,
      corridorStations: dataset.stations,
      eventDefinitions: dataset.eventDefinitions,
      dataStatus: dataset.dataStatus,
      futureNote: dataset.futureNote,
    };
  }

  function getPayload(trainNumber = selectedTrainNumber) {
    const train = getTrainDef(trainNumber);
    const runtimeState = runtime.get(trainNumber);
    const activeEventType = events.get(trainNumber) || "none";
    const payload = calculateEta(buildContext(train), activeEventType, runtimeState);
    return {
      ...payload,
      selectedTrainNumber,
      simulation: getSimulationPublic(),
      network: buildNetworkSnapshot(),
      kpis: buildKpis(),
    };
  }

  function listTrains() {
    const trains = dataset.trains.map((train) => {
      const payload = calculateEta(
        buildContext(train),
        events.get(train.trainNumber) || "none",
        runtime.get(train.trainNumber)
      );
      return summarizeTrain(payload);
    });

    return {
      dataStatus: dataset.dataStatus,
      futureNote: dataset.futureNote,
      selectedTrainNumber,
      simulation: getSimulationPublic(),
      corridor: dataset.corridor,
      stations: dataset.stations.map((s) => ({ code: s.code, name: s.name })),
      trains,
      kpis: buildKpis(trains),
      network: buildNetworkSnapshot(trains),
    };
  }

  function selectTrain(trainNumber) {
    getTrainDef(trainNumber);
    selectedTrainNumber = trainNumber;
    return getPayload(trainNumber);
  }

  function setEvent(trainNumber, type) {
    getTrainDef(trainNumber);
    events.set(trainNumber, type);
    // Event effects on demo speed
    const state = runtime.get(trainNumber);
    if (type === "unexpected_stoppage") {
      state.currentSpeedKmh = 0;
    } else if (type === "speed_restriction") {
      state.currentSpeedKmh = Math.max(35, Math.min(state.currentSpeedKmh, 48));
    } else if (type === "congestion") {
      state.currentSpeedKmh = Math.max(40, Math.min(state.currentSpeedKmh, 55));
    } else {
      state.currentSpeedKmh = getTrainDef(trainNumber).baselineState.currentSpeedKmh;
    }
    return getPayload(trainNumber);
  }

  function resetEvent(trainNumber) {
    getTrainDef(trainNumber);
    events.set(trainNumber, "none");
    const baseline = cloneBaseline(getTrainDef(trainNumber));
    const current = runtime.get(trainNumber);
    runtime.set(trainNumber, {
      ...current,
      currentDelayMinutes: baseline.currentDelayMinutes,
      currentSpeedKmh: baseline.currentSpeedKmh,
    });
    return getPayload(trainNumber);
  }

  function resetSimulation() {
    stopTimer();
    simulation.running = false;
    simulation.speed = 1;
    simulation.currentTimeMinutes = parseTimeToMinutes("18:42");
    for (const train of dataset.trains) {
      runtime.set(train.trainNumber, cloneBaseline(train));
      events.set(train.trainNumber, "none");
    }
    selectedTrainNumber =
      dataset.trains.find((t) => t.primary)?.trainNumber || dataset.trains[0].trainNumber;
    return listTrains();
  }

  function setSimulationSpeed(speed) {
    const allowed = [1, 5, 10];
    if (!allowed.includes(Number(speed))) {
      const error = new Error("Invalid simulation speed. Allowed: 1, 5, 10");
      error.statusCode = 400;
      throw error;
    }
    simulation.speed = Number(speed);
    if (simulation.running) {
      stopTimer();
      startTimer();
    }
    return getSimulationPublic();
  }

  function startSimulation() {
    simulation.running = true;
    startTimer();
    return getSimulationPublic();
  }

  function pauseSimulation() {
    simulation.running = false;
    stopTimer();
    return getSimulationPublic();
  }

  function getSimulationPublic() {
    return {
      running: simulation.running,
      speed: simulation.speed,
      currentTime: formatMinutesToTime(simulation.currentTimeMinutes),
      journeyStart: simulation.journeyStart,
      journeyEnd: simulation.journeyEnd,
      modeLabel: simulation.modeLabel,
      dataStatus: dataset.dataStatus,
    };
  }

  function buildKpis(trainSummaries) {
    const trains =
      trainSummaries ||
      dataset.trains.map((train) =>
        summarizeTrain(
          calculateEta(
            buildContext(train),
            events.get(train.trainNumber) || "none",
            runtime.get(train.trainNumber)
          )
        )
      );
    const delayed = trains.filter((t) => t.predictedDelayMinutes > 0);
    const avgDelay =
      trains.reduce((sum, t) => sum + t.predictedDelayMinutes, 0) / Math.max(trains.length, 1);
    const health =
      delayed.length === 0 ? "Healthy" : delayed.length <= 2 ? "Watch" : "Stressed";

    return {
      activeTrains: trains.length,
      delayedTrains: delayed.length,
      averageDelayMinutes: Math.round(avgDelay * 10) / 10,
      networkHealth: health,
    };
  }

  function buildNetworkSnapshot(trainSummaries) {
    const trains =
      trainSummaries ||
      dataset.trains.map((train) =>
        summarizeTrain(
          calculateEta(
            buildContext(train),
            events.get(train.trainNumber) || "none",
            runtime.get(train.trainNumber)
          )
        )
      );

    const selected = trains.find((t) => t.trainNumber === selectedTrainNumber) || trains[0];
    const selectedEvent = events.get(selectedTrainNumber) || "none";
    const eventDef = dataset.eventDefinitions[selectedEvent];

    const markers = trains.map((t) => {
      const corridorIndex = dataset.stations.findIndex(
        (s) => s.code === t.currentLocation.code
      );
      return {
        trainNumber: t.trainNumber,
        trainName: t.trainName,
        stationCode: t.currentLocation.code,
        stationIndex: corridorIndex >= 0 ? corridorIndex : 0,
        progressToNext: t.progressToNext,
        status: t.status,
        delayed: t.predictedDelayMinutes > 0,
        selected: t.trainNumber === selectedTrainNumber,
        direction: t.direction,
      };
    });

    return {
      corridor: dataset.corridor,
      condition: eventDef.networkCondition || "Normal",
      affectedSection: selected
        ? `${selected.currentLocation.code} → ${selected.nextStation?.code || selected.currentLocation.code}`
        : null,
      stations: dataset.stations.map((s) => ({ code: s.code, name: s.name })),
      markers,
    };
  }

  function advanceTrain(trainNumber) {
    const train = getTrainDef(trainNumber);
    const state = runtime.get(trainNumber);
    const eventType = events.get(trainNumber) || "none";
    const stations = resolveStationTimes(train, dataset.stations);
    const index = stations.findIndex((s) => s.code === state.currentLocationCode);
    if (index < 0 || index >= stations.length - 1) {
      state.currentSpeedKmh = 0;
      state.progressToNext = 1;
      return;
    }

    if (eventType === "unexpected_stoppage") {
      state.currentSpeedKmh = 0;
      return;
    }

    // Progress per sim-minute depends on event
    let step = 0.12;
    if (eventType === "speed_restriction") step = 0.07;
    if (eventType === "congestion") step = 0.09;

    // Speed display updates
    if (eventType === "speed_restriction") {
      state.currentSpeedKmh = 42 + Math.round((1 - state.progressToNext) * 8);
    } else if (eventType === "congestion") {
      state.currentSpeedKmh = 48 + Math.round(state.progressToNext * 10);
    } else {
      state.currentSpeedKmh = 65 + Math.round(state.progressToNext * 15);
    }

    // Approaching station slows slightly
    if (state.progressToNext > 0.85) {
      state.currentSpeedKmh = Math.min(state.currentSpeedKmh, 38);
    }

    state.progressToNext += step;
    if (state.progressToNext >= 1) {
      state.progressToNext = 0;
      const next = stations[index + 1];
      state.currentLocationCode = next.code;
      // Small dwell effect when arriving
      if (eventType === "none" && state.currentDelayMinutes > 0) {
        // keep delay
      }
      if (index + 1 === stations.length - 1) {
        state.currentSpeedKmh = 0;
        state.progressToNext = 1;
      }
    }
  }

  function tick() {
    simulation.currentTimeMinutes =
      (simulation.currentTimeMinutes + simulation.speed) % (24 * 60);
    for (const train of dataset.trains) {
      advanceTrain(train.trainNumber);
    }
  }

  function startTimer() {
    if (tickTimer) return;
    tickTimer = setInterval(() => {
      if (!simulation.running) return;
      tick();
    }, TICK_MS);
  }

  function stopTimer() {
    if (tickTimer) {
      clearInterval(tickTimer);
      tickTimer = null;
    }
  }

  return {
    getPayload,
    listTrains,
    selectTrain,
    setEvent,
    resetEvent,
    resetSimulation,
    setSimulationSpeed,
    startSimulation,
    pauseSimulation,
    getSimulationPublic,
    getSelectedTrainNumber: () => selectedTrainNumber,
    dataset,
  };
}

module.exports = { createTrainStore };
