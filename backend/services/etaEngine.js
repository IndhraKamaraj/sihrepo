/**
 * ETA Intelligence Engine
 * Single source of truth for arrival predictions (demonstration model).
 */

const ALLOWED_EVENTS = new Set([
  "none",
  "speed_restriction",
  "congestion",
  "unexpected_stoppage",
]);

function parseTimeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== "string") {
    throw new Error(`Invalid time value: ${timeStr}`);
  }
  const [hours, minutes] = timeStr.split(":").map(Number);
  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    throw new Error(`Invalid time format: ${timeStr}`);
  }
  return hours * 60 + minutes;
}

function formatMinutesToTime(totalMinutes) {
  const normalized = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function addDelayToTime(timeStr, delayMinutes) {
  if (!timeStr) return null;
  return formatMinutesToTime(parseTimeToMinutes(timeStr) + delayMinutes);
}

function resolveEvent(eventDefinitions, eventType) {
  const type = eventType || "none";
  if (!ALLOWED_EVENTS.has(type)) {
    const error = new Error(`Invalid event type: ${type}`);
    error.statusCode = 400;
    throw error;
  }
  const event = eventDefinitions[type];
  if (!event) {
    const error = new Error(`Unknown event definition: ${type}`);
    error.statusCode = 400;
    throw error;
  }
  return event;
}

function getOrderedStations(corridorStations, direction) {
  if (direction === "reverse") {
    return [...corridorStations].reverse().map((station, index, arr) => ({
      ...station,
      isOrigin: index === 0,
      isDestination: index === arr.length - 1,
    }));
  }
  return corridorStations;
}

function resolveStationTimes(train, corridorStations) {
  const ordered = getOrderedStations(corridorStations, train.direction);
  // Primary corridor timetable is for MAS→CBE daytime schedule.
  // For other trains, shift station times relative to their journey window.
  if (!train.primary && train.direction !== "reverse") {
    const primaryDep = parseTimeToMinutes("14:30");
    const trainDep = parseTimeToMinutes(train.scheduledJourney.departure);
    const shift = trainDep - primaryDep;
    return ordered.map((station) => ({
      ...station,
      scheduledArrival: station.scheduledArrival
        ? addDelayToTime(station.scheduledArrival, shift)
        : null,
      scheduledDeparture: station.scheduledDeparture
        ? addDelayToTime(station.scheduledDeparture, shift)
        : null,
    }));
  }

  if (train.direction === "reverse") {
    // Demo reverse timetable: CBE 06:10 → MAS 14:00 (synthetic station times).
    const anchors = {
      CBE: { arrival: null, departure: "06:10" },
      CBF: { arrival: "06:35", departure: "06:37" },
      TUP: { arrival: "07:20", departure: "07:22" },
      ED: { arrival: "08:05", departure: "08:10" },
      SA: { arrival: "09:00", departure: "09:05" },
      BQI: { arrival: "09:35", departure: "09:36" },
      MAP: { arrival: "09:55", departure: "09:56" },
      SLY: { arrival: "10:15", departure: "10:16" },
      JTJ: { arrival: "10:40", departure: "10:45" },
      AB: { arrival: "11:20", departure: "11:22" },
      KPD: { arrival: "12:00", departure: "12:05" },
      AJJ: { arrival: "12:50", departure: "12:55" },
      MAS: { arrival: "14:00", departure: null },
    };
    return ordered.map((station) => {
      const times = anchors[station.code] || { arrival: null, departure: null };
      return {
        ...station,
        scheduledArrival: times.arrival,
        scheduledDeparture: times.departure,
      };
    });
  }

  return ordered;
}

function buildStationPredictions(stations, totalDelayMinutes, currentLocationCode) {
  const currentIndex = stations.findIndex((s) => s.code === currentLocationCode);

  return stations.map((station, index) => {
    let status;
    if (index < currentIndex) {
      status = "Completed";
    } else if (index === currentIndex) {
      status = totalDelayMinutes > 0 ? "Delayed" : "Current";
      if (totalDelayMinutes > 0) {
        // Keep Current semantics for highlighting; Delayed is for upcoming with delay.
        status = "Current";
      }
    } else {
      status = totalDelayMinutes > 0 ? "Delayed" : "Upcoming";
    }

    const appliedDelay = index < currentIndex ? 0 : totalDelayMinutes;
    const scheduledArrival = station.scheduledArrival;
    const predictedArrival =
      scheduledArrival === null ? null : addDelayToTime(scheduledArrival, appliedDelay);

    return {
      code: station.code,
      name: station.name,
      scheduledArrival,
      scheduledDeparture: station.scheduledDeparture,
      predictedArrival,
      delayMinutes: scheduledArrival === null ? null : appliedDelay,
      status,
      isOrigin: station.isOrigin,
      isDestination: station.isDestination,
    };
  });
}

function deriveOperationalStatus(eventType, delayMinutes, speedKmh, atDestination) {
  if (atDestination) return "Arrived";
  if (eventType === "unexpected_stoppage") return "Halted";
  if (eventType === "congestion") return "Congested";
  if (eventType === "speed_restriction") return "Restricted";
  if (speedKmh > 0 && speedKmh < 40) return "Approaching Station";
  if (delayMinutes > 0) return "Delayed";
  return "Running";
}

function getAffectedSection(stations, currentLocationCode) {
  const index = stations.findIndex((s) => s.code === currentLocationCode);
  if (index < 0) return null;
  const from = stations[index];
  const to = stations[Math.min(index + 1, stations.length - 1)];
  if (from.code === to.code) {
    return { from: from.code, to: from.code, label: `${from.name}` };
  }
  return {
    from: from.code,
    to: to.code,
    label: `${from.name} → ${to.name}`,
  };
}

/**
 * Compute full prediction payload.
 * Events REPLACE one another — they never accumulate.
 *
 * @param {object} context
 * @param {object} context.train - train definition from data file
 * @param {object[]} context.corridorStations - shared corridor stations
 * @param {object} context.eventDefinitions
 * @param {string} context.dataStatus
 * @param {string} [context.futureNote]
 * @param {string} activeEventType
 * @param {object} runtimeState - { currentLocationCode, currentSpeedKmh, currentDelayMinutes, progressToNext }
 */
function calculateEta(context, activeEventType = "none", runtimeState) {
  const { train, corridorStations, eventDefinitions, dataStatus, futureNote } = context;
  const event = resolveEvent(eventDefinitions, activeEventType);
  const stations = resolveStationTimes(train, corridorStations);

  const currentLocationCode =
    runtimeState.currentLocationCode || train.baselineState.currentLocationCode;
  const currentDelayMinutes =
    runtimeState.currentDelayMinutes ?? train.baselineState.currentDelayMinutes;
  const currentSpeedKmh =
    runtimeState.currentSpeedKmh ?? train.baselineState.currentSpeedKmh;
  const progressToNext = runtimeState.progressToNext ?? 0;

  const currentIndex = stations.findIndex((s) => s.code === currentLocationCode);
  const currentStation = stations[currentIndex] || stations[0];
  const nextStation =
    currentIndex >= 0 && currentIndex < stations.length - 1
      ? stations[currentIndex + 1]
      : null;
  const atDestination = currentIndex === stations.length - 1;

  const additionalDelayMinutes = event.additionalDelayMinutes;
  const predictedDelayMinutes = currentDelayMinutes + additionalDelayMinutes;

  const scheduledArrival = train.scheduledJourney.arrival;
  const predictedArrival = addDelayToTime(scheduledArrival, predictedDelayMinutes);

  const stationPredictions = buildStationPredictions(
    stations,
    predictedDelayMinutes,
    currentLocationCode
  );

  const operationalStatus = deriveOperationalStatus(
    event.id,
    predictedDelayMinutes,
    currentSpeedKmh,
    atDestination
  );

  const affectedSection = getAffectedSection(stations, currentLocationCode);

  const explanation =
    event.id === "none"
      ? {
          activeScenario: event.label,
          impact: event.impact,
          reason: "Baseline prediction using current delay only. No operational event is active.",
        }
      : {
          activeScenario: event.label,
          impact: event.impact,
          reason: event.reason,
        };

  return {
    trainNumber: train.trainNumber,
    trainName: train.trainName,
    primary: Boolean(train.primary),
    source: train.source,
    destination: train.destination,
    scheduledJourney: train.scheduledJourney,
    direction: train.direction || "forward",
    currentState: {
      location: { code: currentStation.code, name: currentStation.name },
      nextStation: nextStation
        ? { code: nextStation.code, name: nextStation.name }
        : null,
      speedKmh: currentSpeedKmh,
      delayMinutes: currentDelayMinutes,
      progressToNext,
      stationIndex: currentIndex,
      status: operationalStatus,
    },
    activeScenario: {
      type: event.id,
      label: event.label,
      additionalDelayMinutes: event.additionalDelayMinutes,
      networkCondition: event.networkCondition || "Normal",
    },
    prediction: {
      scheduledArrival,
      predictedArrival,
      predictedDelayMinutes,
      baselineDelayMinutes: currentDelayMinutes,
      eventDelayMinutes: additionalDelayMinutes,
      confidencePercent: event.confidencePercent,
      confidenceNote: "Demonstration confidence score - not a validated ML probability.",
    },
    stations: stationPredictions,
    corridorStations: corridorStations.map((s) => ({ code: s.code, name: s.name })),
    affectedSection,
    explanation,
    impactSummary: {
      condition: event.id === "none" ? "Normal operations" : event.label,
      estimatedImpactMinutes: additionalDelayMinutes,
      affectedTrain: `${train.trainNumber} ${train.trainName}`,
      affectedSection: affectedSection?.label || "N/A",
      confidencePercent: event.confidencePercent,
    },
    dataStatus,
    futureNote:
      futureNote || "Real-time railway data integration is planned for future deployment.",
  };
}

function summarizeTrain(payload) {
  return {
    trainNumber: payload.trainNumber,
    trainName: payload.trainName,
    primary: payload.primary,
    source: payload.source,
    destination: payload.destination,
    currentLocation: payload.currentState.location,
    nextStation: payload.currentState.nextStation,
    speedKmh: payload.currentState.speedKmh,
    currentDelayMinutes: payload.currentState.delayMinutes,
    status: payload.currentState.status,
    scheduledArrival: payload.prediction.scheduledArrival,
    predictedArrival: payload.prediction.predictedArrival,
    predictedDelayMinutes: payload.prediction.predictedDelayMinutes,
    confidencePercent: payload.prediction.confidencePercent,
    activeScenario: payload.activeScenario.type,
    progressToNext: payload.currentState.progressToNext,
    stationIndex: payload.currentState.stationIndex,
    direction: payload.direction,
  };
}

module.exports = {
  calculateEta,
  summarizeTrain,
  resolveEvent,
  resolveStationTimes,
  getOrderedStations,
  ALLOWED_EVENTS,
  parseTimeToMinutes,
  formatMinutesToTime,
  addDelayToTime,
};
