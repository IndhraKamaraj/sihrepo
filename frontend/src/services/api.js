const API_BASE = "/api";
const REQUEST_TIMEOUT_MS = 8000;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestWithRetry(path, options = {}, retryCount = 0) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      signal: controller.signal,
      ...options,
    });

    let data = null;
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      try {
        data = await response.json();
      } catch {
        throw new Error("Received a malformed JSON response from the server.");
      }
    } else {
      const text = await response.text();
      if (!response.ok) {
        throw new Error(text || `Request failed with status ${response.status}`);
      }
      throw new Error("Unexpected non-JSON response from the server.");
    }

    if (!response.ok) {
      // If it's a 503 (service unavailable), retry
      if (response.status === 503 && retryCount < MAX_RETRIES) {
        clearTimeout(timeoutId);
        await delay(RETRY_DELAY_MS * (retryCount + 1));
        return requestWithRetry(path, options, retryCount + 1);
      }
      throw new Error(data?.error || `Request failed with status ${response.status}`);
    }

    if (!data || typeof data !== "object") {
      throw new Error("Malformed response: expected a JSON object.");
    }

    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      // Timeout - if we haven't retried yet, try again
      if (retryCount < MAX_RETRIES) {
        clearTimeout(timeoutId);
        await delay(RETRY_DELAY_MS * (retryCount + 1));
        return requestWithRetry(path, options, retryCount + 1);
      }
      throw new Error("Request timed out. Is the backend running?");
    }
    if (error instanceof TypeError) {
      // Network error - retry if possible
      if (retryCount < MAX_RETRIES) {
        clearTimeout(timeoutId);
        await delay(RETRY_DELAY_MS * (retryCount + 1));
        return requestWithRetry(path, options, retryCount + 1);
      }
      throw new Error(
        "Backend unavailable. Make sure the ETA simulation server is running on port 3001."
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function request(path, options = {}) {
  return requestWithRetry(path, options, 0);
}

export function fetchTrainState() {
  return request("/train");
}

export function fetchTrains() {
  return request("/trains");
}

export function fetchTrainById(trainNumber) {
  return request(`/trains/${encodeURIComponent(trainNumber)}`);
}

export function selectTrain(trainNumber) {
  return request("/train/select", {
    method: "POST",
    body: JSON.stringify({ trainNumber }),
  });
}

export function applyTrainEvent(type) {
  return request("/train/event", {
    method: "POST",
    body: JSON.stringify({ type }),
  });
}

export function resetTrainScenario() {
  return request("/train/reset", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function startSimulation() {
  return request("/simulation/start", { method: "POST", body: "{}" });
}

export function pauseSimulation() {
  return request("/simulation/pause", { method: "POST", body: "{}" });
}

export function resetSimulation() {
  return request("/simulation/reset", { method: "POST", body: "{}" });
}

export function setSimulationSpeed(speed) {
  return request("/simulation/speed", {
    method: "POST",
    body: JSON.stringify({ speed }),
  });
}
