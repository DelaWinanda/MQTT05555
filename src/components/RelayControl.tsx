import React from "react";
import { Power, Activity, Zap, Play, Square, Settings } from "lucide-react";

interface RelayControlProps {
  relays: boolean[];
  variasi1: boolean;
  variasi2: boolean;
  onToggleRelay: (index: number, state: "ON" | "OFF") => void;
  onToggleVariasi: (index: number, state: "START" | "STOP") => void;
}

const APPLIANCES = [
  { name: "Relay 1", tag: "Kipas Ruangan", type: "Fan", power: 45, icon: "💨" },
  { name: "Relay 2", tag: "Sistem Pompa", type: "Water Pump", power: 120, icon: "🚰" },
  { name: "Relay 3", tag: "Lampu Utama", type: "Main Lamp", power: 15, icon: "💡" },
  { name: "Relay 4", tag: "Solenoid Valve", type: "Gas Valve", power: 12, icon: "⚙️" }
];

export default function RelayControl({
  relays,
  variasi1,
  variasi2,
  onToggleRelay,
  onToggleVariasi
}: RelayControlProps) {

  // Calculate total active load
  const totalPower = relays.reduce((sum, active, idx) => {
    return sum + (active ? APPLIANCES[idx].power : 0);
  }, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="relay-controls-container">
      {/* 4 Relay Matrix Controls */}
      <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold font-display text-white mb-1 flex items-center gap-2">
              <Zap className="text-teal-400 w-5 h-5" />
              Kontrol Daya Relay Manual
            </h2>
            <p className="text-xs text-slate-400">
              Sakelar kontrol manual berkepastian tinggi. Memancarkan publish payload <code className="text-teal-400 font-mono">"ON"</code> atau <code className="text-teal-400 font-mono">"OFF"</code> ke topik relay masing-masing.
            </p>
          </div>

          {/* Load Wattmeter Widget */}
          <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800/80">
            <div className="text-right">
              <span className="block text-[10px] text-slate-500 font-mono">TOTAL ESTIMASI BEBAN</span>
              <span className="font-mono text-md font-bold text-teal-400">{totalPower} <span className="text-[10px] text-slate-400">W</span></span>
            </div>
            <span className={`p-2 rounded-lg ${totalPower > 0 ? 'bg-teal-500/10 text-teal-400 animate-pulse' : 'bg-slate-800 text-slate-500'}`}>
              <Zap className="w-4 h-4" />
            </span>
          </div>
        </div>

        {/* 4 Relay card grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="relays-grid">
          {APPLIANCES.map((app, idx) => {
            const isActive = relays[idx];
            
            return (
              <div
                key={app.name}
                id={`relay-box-${idx}`}
                className={`relative border rounded-xl p-4 transition-all duration-300 flex flex-col justify-between ${
                  isActive 
                    ? "bg-slate-900 border-teal-500/40 shadow-md shadow-teal-950/20" 
                    : "bg-slate-950/60 border-slate-800/80 hover:border-slate-800/90"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-sm font-bold font-display text-white">{app.name}</span>
                      <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono">{app.type}</span>
                    </div>
                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                      <span className="text-base leading-none mr-0.5">{app.icon}</span>
                      {app.tag}
                    </span>
                  </div>

                  {/* Indicator Light */}
                  <span 
                    id={`relay-light-${idx}`}
                    className={`w-3.5 h-3.5 rounded-full border transition-all duration-300 ${
                      isActive 
                        ? 'bg-teal-400 border-teal-300 shadow-[0_0_10px_rgba(45,212,191,0.6)]' 
                        : 'bg-slate-800 border-slate-700'
                    }`} 
                  />
                </div>

                {/* Switch Actions */}
                <div className="flex items-center justify-between gap-4 pt-3 border-t border-slate-800/60">
                  <div className="font-mono text-[10px] text-slate-500">
                    {isActive ? (
                      <span className="text-teal-400 font-semibold animate-pulse">Running ({app.power}W)</span>
                    ) : (
                      <span>Idle (0W)</span>
                    )}
                  </div>

                  <button
                    id={`btn-relay-${idx + 1}`}
                    onClick={() => onToggleRelay(idx, isActive ? "OFF" : "ON")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20' 
                        : 'bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 border border-teal-500/20'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    {isActive ? "Matikan" : "Nyalakan"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* sequence controls card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Activity className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold font-display text-white">Mode Sekuensial</h2>
              <p className="text-[11px] text-slate-500">Blink Berurutan (Interval 50ms)</p>
            </div>
          </div>

          <p className="text-xs text-slate-400 mb-5 leading-relaxed">
            Menjalankan siklus lampu LED otomatis. Pemicu mematikan semua relay aktif sebelumnya untuk menghindari benturan beban sekuensial.
          </p>

          {/* Sequence 1 Control */}
          <div className="bg-slate-950 p-4 border border-slate-800/80 rounded-xl mb-4">
            <div className="flex items-center justify-between gap-4 mb-2">
              <div>
                <span className="text-xs font-semibold text-white block">Variasi 1 (Maju)</span>
                <span className="text-[10px] text-slate-500 font-mono">Relay 1 → 2 → 3 → 4</span>
              </div>

              <button
                id="btn-variasi-1"
                onClick={() => onToggleVariasi(1, variasi1 ? "STOP" : "START")}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold font-display flex items-center gap-1.5 transition-all cursor-pointer ${
                  variasi1 
                    ? "bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20" 
                    : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                }`}
              >
                {variasi1 ? (
                  <>
                    <Square className="w-3.5 h-3.5 text-center fill-current" /> STOP
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-center fill-current" /> START
                  </>
                )}
              </button>
            </div>

            {/* LED Flow Visualiser 1 */}
            <div className="flex items-center justify-between gap-1 mt-3 px-2">
              {[0, 1, 2, 3].map((step) => {
                const isLit = variasi1 && relays[step];
                return (
                  <React.Fragment key={step}>
                    {step > 0 && (
                      <div className={`flex-1 h-0.5 transition-all duration-300 ${isLit ? "bg-emerald-400" : "bg-slate-800"}`} />
                    )}
                    <span 
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center font-mono text-[8px] font-bold transition-all duration-300 ${
                        isLit 
                          ? "bg-emerald-400 text-slate-950 scale-110 shadow-[0_0_8px_rgba(52,211,153,0.8)]" 
                          : "bg-slate-900 text-slate-500 border border-slate-800"
                      }`}
                    >
                      {step + 1}
                    </span>
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Sequence 2 Control */}
          <div className="bg-slate-950 p-4 border border-slate-800/80 rounded-xl">
            <div className="flex items-center justify-between gap-4 mb-2">
              <div>
                <span className="text-xs font-semibold text-white block">Variasi 2 (Mundur)</span>
                <span className="text-[10px] text-slate-500 font-mono">Relay 4 → 3 → 2 → 1</span>
              </div>

              <button
                id="btn-variasi-2"
                onClick={() => onToggleVariasi(2, variasi2 ? "STOP" : "START")}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold font-display flex items-center gap-1.5 transition-all cursor-pointer ${
                  variasi2 
                    ? "bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20" 
                    : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20"
                }`}
              >
                {variasi2 ? (
                  <>
                    <Square className="w-3.5 h-3.5 text-center fill-current" /> STOP
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-center fill-current" /> START
                  </>
                )}
              </button>
            </div>

            {/* LED Flow Visualiser 2 */}
            <div className="flex items-center justify-between gap-1 mt-3 px-2">
              {[0, 1, 2, 3].map((step) => {
                const realIndex = 3 - step; // mundur
                const isLit = variasi2 && relays[realIndex];
                return (
                  <React.Fragment key={step}>
                    {step > 0 && (
                      <div className={`flex-1 h-0.5 transition-all duration-300 ${isLit ? "bg-indigo-400" : "bg-slate-800"}`} />
                    )}
                    <span 
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center font-mono text-[8px] font-bold transition-all duration-300 ${
                        isLit 
                          ? "bg-indigo-400 text-slate-950 scale-110 shadow-[0_0_8px_rgba(129,140,248,0.8)]" 
                          : "bg-slate-900 text-slate-500 border border-slate-800"
                      }`}
                    >
                      {realIndex + 1}
                    </span>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-5 text-[10px] text-slate-500 text-center flex items-center justify-center gap-1 font-mono">
          <Settings className="w-3 h-3 text-slate-600 animate-spin" />
          Active Sequence Sync Latency: &lt;50ms
        </div>
      </div>
    </div>
  );
}
