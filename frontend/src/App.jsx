import { useCallback, useEffect, useRef, useState } from "react";
import Header from "./components/Header.jsx";
import Sidebar from "./components/Sidebar.jsx";
import KpiCards from "./components/KpiCards.jsx";
import TrainSelector from "./components/TrainSelector.jsx";
import SimulationControls from "./components/SimulationControls.jsx";
import NetworkMap from "./components/NetworkMap.jsx";
import TrainMonitor from "./components/TrainMonitor.jsx";
import EtaCard from "./components/EtaCard.jsx";
import EventControls from "./components/EventControls.jsx";
import StationTimeline from "./components/StationTimeline.jsx";
import Explainability from "./components/Explainability.jsx";
import ImpactPanel from "./components/ImpactPanel.jsx";
import NetworkStatus from "./components/NetworkStatus.jsx";
import SystemStatus from "./components/SystemStatus.jsx";
import LoadingState from "./components/LoadingState.jsx";
import ErrorState from "./components/ErrorState.jsx";
import {
  applyTrainEvent,
  fetchTrainState,
  fetchTrains,
  pauseSimulation,
  resetSimulation,
  resetTrainScenario,
  selectTrain,
  setSimulationSpeed,
  startSimulation,
} from "./services/api.js";

function isValidTrainPayload(data) {
  return (
    data &&
    typeof data === "object" &&
    data.trainNumber &&
    data.prediction &&
    data.prediction.predictedArrival &&
    Array.isArray(data.stations)
  );
}

function isFleetPayload(data) {
  return data && Array.isArray(data.trains) && data.simulation;
}

export default function App() {
  const [section, setSection] = useState("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [train, setTrain] = useState(null);
  const [fleet, setFleet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionPending, setActionPending] = useState(false);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const pollRef = useRef(null);

  const refreshAll = useCallback(async () => {
    const [trainData, fleetData] = await Promise.all([fetchTrainState(), fetchTrains()]);
    if (!isValidTrainPayload(trainData)) {
      throw new Error("Malformed response: missing required train fields.");
    }
    setTrain(trainData);
    setFleet(fleetData);
  }, []);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    setError(null);
    setActionError(null);
    try {
      await refreshAll();
    } catch (err) {
      setTrain(null);
      setFleet(null);
      setError(
        err.message ||
          "Backend unavailable. Start the ETA simulation server and try again."
      );
    } finally {
      setLoading(false);
    }
  }, [refreshAll]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  useEffect(() => {
    const running = Boolean(train?.simulation?.running || fleet?.simulation?.running);
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (!running) return undefined;

    pollRef.current = setInterval(async () => {
      try {
        await refreshAll();
      } catch (err) {
        setActionError(err.message || "Simulation poll failed.");
      }
    }, 1000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [train?.simulation?.running, fleet?.simulation?.running, refreshAll]);

  const runAction = async (fn) => {
    setActionPending(true);
    setActionError(null);
    try {
      const data = await fn();
      if (isValidTrainPayload(data)) {
        setTrain(data);
        const fleetData = await fetchTrains();
        setFleet(fleetData);
      } else if (isFleetPayload(data)) {
        setFleet(data);
        const trainData = await fetchTrainState();
        if (!isValidTrainPayload(trainData)) {
          throw new Error("Malformed response after simulation action.");
        }
        setTrain(trainData);
      } else {
        await refreshAll();
      }
    } catch (err) {
      setActionError(err.message || "Action failed.");
    } finally {
      setActionPending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ops-bg">
        <Header dataStatus="Simulation / Demonstration Data" />
        <LoadingState />
      </div>
    );
  }

  if (error || !train) {
    return (
      <div className="min-h-screen bg-ops-bg">
        <Header dataStatus="Simulation / Demonstration Data" />
        <ErrorState message={error} onRetry={loadInitial} />
      </div>
    );
  }

  const simulation = train.simulation || fleet?.simulation;
  const network = train.network || fleet?.network;
  const kpis = train.kpis || fleet?.kpis;
  const trains = fleet?.trains || [];

  const inSection = (...ids) => ids.includes(section) || section === "overview";

  return (
    <div className="flex min-h-screen bg-ops-bg text-ops-text">
      <Sidebar
        active={section}
        onChange={setSection}
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header dataStatus={train.dataStatus} simulation={simulation} />

        <main className="animate-fade-in flex-1 space-y-4 overflow-auto p-4 lg:p-6">
          {actionError ? (
            <div
              role="alert"
              className="rounded-md border border-ops-danger/40 bg-ops-danger/10 px-4 py-3 text-sm text-ops-danger"
            >
              {actionError}
            </div>
          ) : null}

          {inSection("simulation") ? <KpiCards kpis={kpis} /> : null}

          <TrainSelector
            trains={trains}
            selectedTrainNumber={train.trainNumber}
            onSelect={(id) => runAction(() => selectTrain(id))}
            disabled={actionPending}
          />

          {inSection("simulation", "network") ? (
            <NetworkMap network={network} selectedTrainNumber={train.trainNumber} />
          ) : null}

          {inSection("simulation") ? (
            <SimulationControls
              simulation={simulation}
              onStart={() => runAction(() => startSimulation())}
              onPause={() => runAction(() => pauseSimulation())}
              onReset={() => runAction(() => resetSimulation())}
              onSpeed={(speed) => runAction(() => setSimulationSpeed(speed))}
              disabled={actionPending}
            />
          ) : null}

          {inSection("monitor") ? <TrainMonitor train={train} /> : null}

          {inSection("eta") ? (
            <EtaCard prediction={train.prediction} activeScenario={train.activeScenario} />
          ) : null}

          {inSection("events") ? (
            <EventControls
              activeType={train.activeScenario?.type}
              activeScenario={train.activeScenario}
              explanation={train.explanation}
              onEvent={(type) => runAction(() => applyTrainEvent(type))}
              onReset={() => runAction(() => resetTrainScenario())}
              disabled={actionPending}
            />
          ) : null}

          <div className="grid gap-4 xl:grid-cols-5">
            {inSection("eta", "monitor") ? (
              <div className="xl:col-span-3">
                <StationTimeline stations={train.stations} />
              </div>
            ) : null}
            <div
              className={`space-y-4 ${
                inSection("eta", "monitor") ? "xl:col-span-2" : "xl:col-span-5"
              }`}
            >
              {inSection("events", "eta") ? (
                <>
                  <Explainability
                    explanation={train.explanation}
                    activeType={train.activeScenario?.type}
                  />
                  <ImpactPanel
                    impactSummary={train.impactSummary}
                    dataStatus={train.dataStatus}
                  />
                </>
              ) : null}
              {inSection("network") ? (
                <NetworkStatus network={network} trains={trains} />
              ) : null}
              <SystemStatus
                dataStatus={train.dataStatus}
                futureNote={train.futureNote}
                confidenceNote={train.prediction?.confidenceNote}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
