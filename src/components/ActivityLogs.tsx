import React, { useState } from "react";
import { Terminal, Trash2, ShieldCheck, Cpu, PlaySquare } from "lucide-react";

interface ActivityLogsProps {
  logs: string[];
  simulationEnabled: boolean;
  onToggleSimulation: () => void;
  onClearLogs: () => void;
}

export default function ActivityLogs({
  logs,
  simulationEnabled,
  onToggleSimulation,
  onClearLogs
}: ActivityLogsProps) {
  const [filter, setFilter] = useState<string>("all");

  const filteredLogs = logs.filter(log => {
    if (filter === "all") return true;
    if (filter === "sensor") return log.includes("[Sensor]") || log.includes("[Data]");
    if (filter === "relay") return log.includes("[Relay]") || log.includes("Relay");
    if (filter === "broker") return log.includes("[Broker]") || log.includes("[MQTT]") || log.includes("[System]");
    return true;
  });

  return (
    <div 
      id="system-terminal-section"
      className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />

      <div>
        {/* Header toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-lg font-bold font-display text-white mb-1 flex items-center gap-2">
              <Terminal className="text-teal-400 w-5 h-5" />
              Terminal & Transmisi Paket MQTT
            </h2>
            <p className="text-xs text-slate-400">Stream aktivitas packet sniffer MQTT langsung dari middleware server backend.</p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Simulation toggle button */}
            <button
              id="btn-toggle-simulation"
              onClick={onToggleSimulation}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                simulationEnabled 
                  ? "bg-amber-400 text-slate-950 hover:bg-amber-300 font-bold border border-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                  : "bg-slate-950/80 text-amber-400 border border-slate-800 hover:bg-slate-800"
              }`}
              title="Aktifkan simulasi jika hardware fisik ESP32 tidak tersambung"
            >
              <Cpu className={`w-3.5 h-3.5 ${simulationEnabled ? 'animate-bounce' : ''}`} />
              {simulationEnabled ? "Simulasi Aktif" : "Simulasi Hardware"}
            </button>

            {/* Clear logs Button */}
            <button
              id="btn-clear-terminal"
              onClick={onClearLogs}
              className="p-1.5 rounded-lg bg-slate-950 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 transition"
              title="Bersihkan Terminal"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 mb-3 border-b border-slate-800/60 pb-3" id="terminal-filters">
          {[
            { id: "all", label: "SEMUA DATA" },
            { id: "sensor", label: "DHT11 SENSOR" },
            { id: "relay", label: "KONTROL RELAY" },
            { id: "broker", label: "BROKER MQTT" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-2.5 py-1 rounded text-[10px] font-mono tracking-wider transition cursor-pointer ${
                filter === tab.id 
                  ? "bg-slate-800 text-white font-bold border border-slate-700" 
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Real-Time Terminal Output Log Console */}
        <div 
          id="terminal-output"
          className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 font-mono text-[11px] leading-relaxed overflow-y-auto max-h-72 min-h-[160px] flex flex-col-reverse text-slate-300 select-all"
        >
          {filteredLogs.length === 0 ? (
            <div className="text-slate-600 italic select-none py-4 text-center">
              Menunggu transmisi paket data MQTT pertama...
            </div>
          ) : (
            filteredLogs.map((log, i) => {
              // Highlight logging colors elegantly depending on contents
              let textColor = "text-slate-300";
              if (log.includes("[Sensor]")) textColor = "text-teal-400";
              else if (log.includes("[Relay State]") || log.includes("[Relay]")) textColor = "text-sky-400";
              else if (log.includes("[MQTT]") || log.includes("broker")) textColor = "text-amber-400";
              else if (log.includes("Gagal") || log.includes("Error") || log.includes("[MQTT Error]")) {
                textColor = "text-rose-400 font-semibold";
              } else if (log.includes("[Simul]")) textColor = "text-slate-500";

              return (
                <div key={i} className={`border-b border-slate-900/50 py-1 flex items-start gap-1 `}>
                  <span className="text-teal-500/65 flex-shrink-0 select-none">&gt;</span>
                  <p className={textColor}>{log}</p>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 font-mono mt-4 pt-3 border-t border-slate-900 gap-2 select-none">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Active Packet Sniffer Hook: Subscribed</span>
        </div>
        <div>
          <span>ESP32 Multi Broker MQTT Proxy Server (UTC 2026)</span>
        </div>
      </div>
    </div>
  );
}
