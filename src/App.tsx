import React, { useState, useEffect } from "react";
import { Server, Mic, Terminal, Settings2, Cpu, HelpCircle, LogOut, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { DashboardState } from "./types";
import MetricCard from "./components/MetricCard";
import BrokerSelector from "./components/BrokerSelector";
import RelayControl from "./components/RelayControl";
import VoiceController from "./components/VoiceController";
import ActivityLogs from "./components/ActivityLogs";

export default function App() {
  const [state, setState] = useState<DashboardState>({
    temperature: "---",
    humidity: "---",
    brokerIndex: 0,
    relays: [false, false, false, false],
    variasi1: false,
    variasi2: false,
    statusBrokerMsg: "Menghubungkan ke stream server...",
    connectionStatus: "disconnected",
    simulationEnabled: false,
    logs: []
  });

  const [localTime, setLocalTime] = useState("");

  // Clock simulator
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLocalTime(now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Listen for real-time Server Sent Events (SSE) push notifications from Node Server
  useEffect(() => {
    const eventSource = new EventSource("/api/stream");

    eventSource.onopen = () => {
      console.log("Koneksi push stream SSE terbuka.");
    };

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === "init" || payload.type === "state") {
          setState((prevState) => ({
            ...prevState,
            ...payload.state,
            // Keep logs accumulated locally or override, backend keeps latest 80 logs
            logs: payload.state.logs || prevState.logs
          }));
        }
      } catch (err) {
        console.error("Gagal mendecode payload stream SSE", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("Error SSE EventSource stream:", err);
      setState(prev => ({
        ...prev,
        connectionStatus: "disconnected",
        statusBrokerMsg: "Stream push server terputus. Menghubungkan ulang..."
      }));
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // API Call Helpers
  const handleToggleRelay = async (index: number, targetState: "ON" | "OFF") => {
    try {
      const response = await fetch("/api/control/relay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index, state: targetState })
      });
      if (!response.ok) throw new Error("Gagal mengirim instruksi relay");
    } catch (err) {
      console.error("Error mengontrol relay:", err);
    }
  };

  const handleToggleVariasi = async (index: number, targetState: "START" | "STOP") => {
    try {
      const response = await fetch("/api/control/variasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index, state: targetState })
      });
      if (!response.ok) throw new Error("Gagal mengirim instruksi sekuen sekuensial");
    } catch (err) {
      console.error("Error mengontrol sekuensial variasi:", err);
    }
  };

  const handleSwitchBroker = async (index: number) => {
    try {
      const response = await fetch("/api/control/broker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index })
      });
      if (!response.ok) throw new Error("Gagal berpindah broker");
    } catch (err) {
      console.error("Error berpindah broker:", err);
    }
  };

  const handleDisconnectBroker = async () => {
    try {
      const response = await fetch("/api/control/disconnect", { method: "POST" });
      if (!response.ok) throw new Error("Gagal memutus koneksi broker");
    } catch (err) {
      console.error("Error memutus koneksi broker:", err);
    }
  };

  const handleToggleSimulation = async () => {
    try {
      const response = await fetch("/api/control/simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !state.simulationEnabled })
      });
      if (!response.ok) throw new Error("Gagal mendaftar perubahan mode simulasi");
    } catch (err) {
      console.error("Error mengaktifkan simulasi:", err);
    }
  };

  const handleClearLogs = () => {
    setState(prev => ({ ...prev, logs: [] }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans selection:bg-teal-500/35 selection:text-white" id="root-viewport">
      
      {/* Decorative Neon top light rails */}
      <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-teal-500/30 to-transparent pointer-events-none" />
      <div className="absolute top-0 left-1/3 right-1/3 h-[20px] bg-gradient-to-r from-transparent via-teal-500/5 to-transparent blur-xl pointer-events-none" />

      {/* Primary Dashboard Container */}
      <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Navigation / Header Title Section */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-900" id="header-bar">
          <div className="flex items-center gap-3">
            {/* Integrated Animated Microcontroller-like logo design */}
            <div className="p-3 bg-gradient-to-br from-teal-500/10 to-teal-900/20 border border-teal-500/35 rounded-2xl shadow-inner relative group select-none">
              <Cpu className="w-6 h-6 text-teal-400 group-hover:rotate-12 transition-transform duration-300" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-950 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold font-display tracking-tight text-white uppercase">IoT SMART LINK</h1>
                <span className="text-[10px] font-mono font-bold bg-teal-500/10 text-teal-300 border border-teal-500/20 px-2 py-0.5 rounded-full">v2.0</span>
              </div>
              <p className="text-xs text-slate-400 font-medium tracking-wide">ESP32 + DHT11 + 4 Channel Relay + Multi Broker MQTT Hub</p>
            </div>
          </div>

          {/* Clock & Metadata signature block */}
          <div className="flex items-center gap-4 self-stretch sm:self-auto justify-between bg-slate-900/45 px-4 py-2.5 rounded-2xl border border-slate-900 select-none">
            <div className="text-left">
              <span className="block text-[9px] text-slate-500 uppercase font-mono tracking-wider">SYSTEM TIME (LOKAL)</span>
              <span className="font-mono text-sm font-bold text-slate-200 tracking-wider">
                {localTime || "00:00:00"}
              </span>
            </div>
            <div className="h-6 w-[1px] bg-slate-800" />
            <div className="text-right">
              <span className="block text-[9px] text-slate-500 uppercase font-mono tracking-wider">HARDWARE TARGET</span>
              <span className="font-semibold text-xs text-teal-400 flex items-center gap-1 font-display">
                ESP32 (WROOM)
              </span>
            </div>
          </div>
        </header>

        {/* Primary Dashboard Grid (Bento Style) */}
        <main className="space-y-6" id="dashboard-main">

          {/* Row 1: Left metrics Gauges + Right Voice Assistant commander */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            
            {/* Metrik temperature & humidity */}
            <div className="lg:col-span-3 flex flex-col justify-between">
              <MetricCard 
                temperature={state.temperature}
                humidity={state.humidity}
              />
            </div>

            {/* Voice Controller */}
            <div className="lg:col-span-2">
              <VoiceController 
                temperature={state.temperature}
                humidity={state.humidity}
                relays={state.relays}
                brokerIndex={state.brokerIndex}
                onToggleRelay={handleToggleRelay}
                onToggleVariasi={handleToggleVariasi}
                onSwitchBroker={handleSwitchBroker}
                onDisconnectBroker={handleDisconnectBroker}
              />
            </div>
          </div>

          {/* Row 2: Broker Switchers */}
          <section id="broker-section">
            <BrokerSelector 
              brokerIndex={state.brokerIndex}
              connectionStatus={state.connectionStatus}
              statusBrokerMsg={state.statusBrokerMsg}
              onSwitchBroker={handleSwitchBroker}
              onDisconnectBroker={handleDisconnectBroker}
            />
          </section>

          {/* Row 3: Relay Controllers & Variasi */}
          <section id="relay-controls-section">
            <RelayControl 
              relays={state.relays}
              variasi1={state.variasi1}
              variasi2={state.variasi2}
              onToggleRelay={handleToggleRelay}
              onToggleVariasi={handleToggleVariasi}
            />
          </section>

          {/* Row 4: Terminal console logger */}
          <section id="terminal-section">
            <ActivityLogs 
              logs={state.logs}
              simulationEnabled={state.simulationEnabled}
              onToggleSimulation={handleToggleSimulation}
              onClearLogs={handleClearLogs}
            />
          </section>

        </main>

        {/* Informative Hardware Instructions Card */}
        <footer 
          id="hardware-configuration-details"
          className="bg-slate-900/30 border border-slate-900 rounded-2xl p-5 hover:border-slate-800 transition duration-300"
        >
          <div className="flex items-start gap-3.5">
            <span className="p-2 rounded-xl bg-slate-950 text-amber-500 border border-slate-800/60 mt-0.5">
              <Settings2 className="w-4 h-4" />
            </span>
            <div className="text-xs space-y-2 select-text">
              <span className="font-semibold text-slate-200 uppercase tracking-wider block font-display">Panduan Sambungan Pin Fisik ESP32:</span>
              <p className="text-slate-400 leading-relaxed font-sans">
                Guna memfasilitasi pengujian langsung, pastikan kabel jumper tersolder dengan tepat: PIN <strong className="text-white">4</strong> tersambung dengan Data OUT sensor <strong className="text-amber-500">DHT11</strong>, sedangkan output Relay 1 sampai 4 terhubung dengan Pin GPIO <strong className="text-white">23, 19, 18,</strong> dan <strong className="text-white">5</strong> secara berurutan. Semua sakelar relay bekerja dengan skema <strong className="text-teal-400">Low Trigger (Active LOW)</strong>.
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 font-mono text-[10px] text-slate-500">
                <span>Relay 1: GPIO 23</span>
                <span>Relay 2: GPIO 19</span>
                <span>Relay 3: GPIO 18</span>
                <span>Relay 4: GPIO 5</span>
                <span>DATA DHT11: GPIO 4</span>
              </div>
            </div>
          </div>
        </footer>

      </div>

      {/* Visual footer bottom margin credits */}
      <footer className="w-full text-center py-6 border-t border-slate-900 bg-slate-950 select-none">
        <p className="text-[10px] font-mono text-slate-600">
          Crafted for Embedded IoT Control Systems • Standard MQTT Ports 8883 Verified via TLS/SSL Server Proxy
        </p>
      </footer>

    </div>
  );
}
