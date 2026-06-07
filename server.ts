import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import mqtt from "mqtt";

const app = express();
const PORT = 3000;

app.use(express.json());

// List of MQTT brokers matching ESP32 firmware config exactly
const brokers = [
  {
    id: 1,
    name: "CloudAMQP",
    server: "kingfisher.lmq.cloudamqp.com",
    port: 8883,
    user: "azfrfvzw:azfrfvzw",
    pass: "HMxpFwhwM9i7bDo2bp8XoBipnq2ZcmxQ",
    clientIdPrefix: "WebProxy_CloudAMQP"
  },
  {
    id: 2,
    name: "Cedalo",
    server: "pf-26xt4cmufmfw6kr1zpyq.cedalo.cloud",
    port: 8883,
    user: "Esp2",
    pass: "d",
    clientIdPrefix: "WebProxy_Cedalo"
  },
  {
    id: 3,
    name: "Flespi",
    server: "mqtt.flespi.io",
    port: 8883,
    user: "UJyFksta5S1kfEMf95YVPQIn0X2o9u4OFvWvVeAMuGEORyCzS5elmDywO9xhS5ay",
    pass: "",
    clientIdPrefix: "WebProxy_Flespi"
  }
];

// Backend state structure
const state = {
  temperature: "27.4",
  humidity: "62.0",
  brokerIndex: 0, // 0 = CloudAMQP, 1 = Cedalo, 2 = Flespi
  relays: [false, false, false, false],
  variasi1: false,
  variasi2: false,
  statusBrokerMsg: "Broker belum terhubung",
  connectionStatus: "disconnected" as "disconnected" | "connecting" | "connected" | "error",
  simulationEnabled: false,
  logs: [] as string[]
};

// SSE streaming clients
let sseClients: any[] = [];

function broadcastState() {
  const payload = JSON.stringify({ type: "state", state });
  sseClients.forEach(client => {
    try {
      client.write(`data: ${payload}\n\n`);
    } catch (e) {
      // client connection already gone
    }
  });
}

function addLog(message: string) {
  const timestamp = new Date().toLocaleTimeString("id-ID", { hour12: false });
  const logMsg = `[${timestamp}] ${message}`;
  state.logs.unshift(logMsg);
  if (state.logs.length > 80) {
    state.logs.pop();
  }
  broadcastState();
}

// MQTT client handle
let mqttClient: mqtt.MqttClient | null = null;

// Connect to selected broker
function connectBroker(index: number) {
  if (index < 0 || index >= brokers.length) return;

  // Stop previous connection
  if (mqttClient) {
    addLog(`Memutuskan koneksi dari broker lama [${brokers[state.brokerIndex].name}]...`);
    mqttClient.end(true);
    mqttClient = null;
  }

  state.brokerIndex = index;
  const b = brokers[index];
  state.connectionStatus = "connecting";
  state.statusBrokerMsg = `Connecting to ${b.name}...`;
  broadcastState();

  const brokerUrl = `mqtts://${b.server}:${b.port}`;
  const options = {
    username: b.user || undefined,
    password: b.pass || undefined,
    clientId: `${b.clientIdPrefix}_Server_${Math.random().toString(36).substring(2, 7)}`,
    rejectUnauthorized: false, // matches setInsecure() in ESP32
    connectTimeout: 8000,
    reconnectPeriod: 5000,
  };

  addLog(`[System] Menghubungkan ke ${b.name} (${b.server}:${b.port})`);

  try {
    mqttClient = mqtt.connect(brokerUrl, options);

    mqttClient.on("connect", () => {
      state.connectionStatus = "connected";
      state.statusBrokerMsg = `Broker aktif: ${b.name} (${b.server})`;
      addLog(`[MQTT] Terhubung secara aman ke [${b.name}]!`);

      // Subscribe to all telemetry and command feedbacks
      if (mqttClient) {
        mqttClient.subscribe("sensor/suhu", { qos: 1 });
        mqttClient.subscribe("sensor/kelembaban", { qos: 1 });
        mqttClient.subscribe("status/broker", { qos: 1 });
        mqttClient.subscribe("kontrol/relay1", { qos: 1 });
        mqttClient.subscribe("kontrol/relay2", { qos: 1 });
        mqttClient.subscribe("kontrol/relay3", { qos: 1 });
        mqttClient.subscribe("kontrol/relay4", { qos: 1 });
        mqttClient.subscribe("kontrol/variasi1", { qos: 1 });
        mqttClient.subscribe("kontrol/variasi2", { qos: 1 });
        mqttClient.subscribe("kontrol/broker", { qos: 1 });
      }
      broadcastState();
    });

    mqttClient.on("message", (topic, payload) => {
      const msg = payload.toString().trim();
      let stateChanged = false;

      if (topic === "sensor/suhu") {
        state.temperature = msg;
        stateChanged = true;
        addLog(`[Sensor] Suhu: ${msg} °C`);
      } else if (topic === "sensor/kelembaban") {
        state.humidity = msg;
        stateChanged = true;
        addLog(`[Sensor] Kelembaban: ${msg} %`);
      } else if (topic === "status/broker") {
        state.statusBrokerMsg = msg;
        stateChanged = true;
        addLog(`[Broker Status Feedback] ${msg}`);
      } else if (topic === "kontrol/relay1") {
        state.relays[0] = (msg === "ON");
        stateChanged = true;
        addLog(`[Relay State] Relay 1 diatur ke ${msg}`);
      } else if (topic === "kontrol/relay2") {
        state.relays[1] = (msg === "ON");
        stateChanged = true;
        addLog(`[Relay State] Relay 2 diatur ke ${msg}`);
      } else if (topic === "kontrol/relay3") {
        state.relays[2] = (msg === "ON");
        stateChanged = true;
        addLog(`[Relay State] Relay 3 diatur ke ${msg}`);
      } else if (topic === "kontrol/relay4") {
        state.relays[3] = (msg === "ON");
        stateChanged = true;
        addLog(`[Relay State] Relay 4 diatur ke ${msg}`);
      } else if (topic === "kontrol/variasi1") {
        state.variasi1 = (msg === "START");
        if (state.variasi1) state.variasi2 = false;
        stateChanged = true;
        addLog(`[Variasi 1] State: ${msg}`);
      } else if (topic === "kontrol/variasi2") {
        state.variasi2 = (msg === "START");
        if (state.variasi2) state.variasi1 = false;
        stateChanged = true;
        addLog(`[Variasi 2] State: ${msg}`);
      } else if (topic === "kontrol/broker") {
        const val = parseInt(msg);
        if (!isNaN(val) && val >= 1 && val <= brokers.length) {
          const targetIdx = val - 1;
          if (targetIdx !== state.brokerIndex) {
            addLog(`[Remote Broker Switch] Menerima instruksi broker -> ${brokers[targetIdx].name}`);
            setTimeout(() => {
              connectBroker(targetIdx);
            }, 1000);
          }
        }
      }

      if (stateChanged) {
        broadcastState();
      }
    });

    mqttClient.on("error", (err) => {
      state.connectionStatus = "error";
      state.statusBrokerMsg = `Gagal: ${err.message}`;
      addLog(`[MQTT Error] Gagal koneksi ke ${b.name}: ${err.message}`);
      broadcastState();
    });

    mqttClient.on("close", () => {
      if (state.connectionStatus === "connected") {
        state.connectionStatus = "disconnected";
        state.statusBrokerMsg = "Broker MQTT terputus";
        addLog(`[MQTT Session Closed] Putus dari broker ${b.name}.`);
        broadcastState();
      }
    });

  } catch (err: any) {
    state.connectionStatus = "error";
    state.statusBrokerMsg = `Exception: ${err.message}`;
    addLog(`[MQTT Exception] Gagal menghubungkan: ${err.message}`);
    broadcastState();
  }
}

// Start with CloudAMQP as the first broker
connectBroker(0);

// Set up periodic mock data simulation when simulation mode is active
let stepCounter = 0;
setInterval(() => {
  if (state.simulationEnabled) {
    // Simulate slight temperature & humidity fluctuations
    const tempVal = parseFloat(state.temperature) + (Math.random() - 0.5) * 0.4;
    const humVal = parseFloat(state.humidity) + (Math.random() - 0.5) * 0.6;
    state.temperature = Math.max(18, Math.min(42, tempVal)).toFixed(1);
    state.humidity = Math.max(35, Math.min(95, humVal)).toFixed(1);

    // If step sequence is enabled, simulate running LED blinking
    if (state.variasi1) {
      const activeRelay = stepCounter % 4;
      state.relays = [false, false, false, false];
      state.relays[activeRelay] = true;
      addLog(`[Simul] Variasi 1 LED Berjalan: Relay ${activeRelay + 1} ON`);
      stepCounter++;
    } else if (state.variasi2) {
      const activeRelay = 3 - (stepCounter % 4);
      state.relays = [false, false, false, false];
      state.relays[activeRelay] = true;
      addLog(`[Simul] Variasi 2 LED Berjalan: Relay ${activeRelay + 1} ON`);
      stepCounter++;
    }

    broadcastState();
  }
}, 4000);

// API Endpoints

// Get current system status
app.get("/api/status", (req, res) => {
  res.json(state);
});

// Switch Broker
app.post("/api/control/broker", (req, res) => {
  const { index } = req.body;
  if (index === undefined || index < 0 || index >= brokers.length) {
    return res.status(400).json({ success: false, message: "Broker index tidak valid" });
  }

  const brokerNum = (index + 1).toString();
  addLog(`[Broker Control] Kirim perintah pindah broker ke [${brokers[index].name}]`);

  // Publish target broker instruction on the current broker so ESP32 knows
  if (mqttClient && mqttClient.connected) {
    mqttClient.publish("kontrol/broker", brokerNum, { qos: 1 });
    addLog(`[MQTT Publish] kontrol/broker -> "${brokerNum}"`);
  }

  // Brief timeout to let ESP receive and process before server disconnects
  setTimeout(() => {
    connectBroker(index);
  }, 1200);

  res.json({ success: true, message: `Instruksi pindah broker dikirim ke ${brokers[index].name}` });
});

// Control relays
app.post("/api/control/relay", (req, res) => {
  const { index, state: targetState } = req.body; // index: 0, 1, 2, 3. state: 'ON' | 'OFF'
  if (index === undefined || index < 0 || index > 3 || !["ON", "OFF"].includes(targetState)) {
    return res.status(400).json({ success: false, message: "Argumen tidak valid" });
  }

  const topic = `kontrol/relay${index + 1}`;
  addLog(`[Relay Control] Relay ${index + 1} -> ${targetState}`);

  if (mqttClient && mqttClient.connected) {
    mqttClient.publish(topic, targetState, { qos: 1 });
  }

  // Update locally immediately for high-responsive interaction
  state.relays[index] = (targetState === "ON");
  broadcastState();

  res.json({ success: true });
});

// Control variations
app.post("/api/control/variasi", (req, res) => {
  const { index, state: targetState } = req.body; // index: 1, 2. state: 'START' | 'STOP'
  if (index === undefined || ![1, 2].includes(index) || !["START", "STOP"].includes(targetState)) {
    return res.status(400).json({ success: false, message: "Argumen tidak valid" });
  }

  const topic = `kontrol/variasi${index}`;
  addLog(`[Sequence Control] Variasi ${index} -> ${targetState}`);

  if (mqttClient && mqttClient.connected) {
    mqttClient.publish(topic, targetState, { qos: 1 });
  }

  // Update local states
  if (index === 1) {
    state.variasi1 = (targetState === "START");
    if (state.variasi1) {
      state.variasi2 = false;
      stepCounter = 0;
    }
  } else {
    state.variasi2 = (targetState === "START");
    if (state.variasi2) {
      state.variasi1 = false;
      stepCounter = 0;
    }
  }
  broadcastState();

  res.json({ success: true });
});

// Toggle simulation
app.post("/api/control/simulation", (req, res) => {
  const { enabled } = req.body;
  state.simulationEnabled = !state.simulationEnabled;
  addLog(`[Simulation] Mode simulasi hardware ditandai: ${state.simulationEnabled ? "AKTIF" : "NONAKTIF"}`);
  broadcastState();
  res.json({ success: true, simulationEnabled: state.simulationEnabled });
});

// Server-Sent Events setup
app.get("/api/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  // Send initial load
  res.write(`data: ${JSON.stringify({ type: "init", state })}\n\n`);

  sseClients.push(res);

  req.on("close", () => {
    sseClients = sseClients.filter(c => c !== res);
  });
});

// Serve frontend build static files in production
if (process.env.NODE_ENV === "production") {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
} else {
  // Vite dev mode
  const startVite = async () => {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  };
  startVite();
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is listening on port ${PORT}`);
});
