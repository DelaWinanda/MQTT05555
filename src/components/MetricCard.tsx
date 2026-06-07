import React from "react";
import { Thermometer, Droplets, AlertCircle, Smile, Flame, Snowflake } from "lucide-react";

interface MetricCardProps {
  temperature: string;
  humidity: string;
}

export default function MetricCard({ temperature, humidity }: MetricCardProps) {
  const temp = parseFloat(temperature) || 0;
  const hum = parseFloat(humidity) || 0;

  // Derive comfort status
  let comfortStatus = "Menghitung...";
  let comfortColor = "text-slate-400";
  let comfortIcon = <Smile className="w-4 h-4 text-slate-400" />;

  if (temp > 0 && hum > 0) {
    if (temp >= 22 && temp <= 29 && hum >= 40 && hum <= 70) {
      comfortStatus = "Kondisi Nyaman (Ideal)";
      comfortColor = "text-emerald-400";
      comfortIcon = <Smile className="w-4 h-4 text-emerald-400" />;
    } else if (temp > 29) {
      comfortStatus = "Suhu Terlalu Panas (Gerah)";
      comfortColor = "text-amber-400 animate-pulse";
      comfortIcon = <Flame className="w-4 h-4 text-amber-400" />;
    } else if (temp < 22 && temp > 10) {
      comfortStatus = "Suhu Dingin";
      comfortColor = "text-sky-400";
      comfortIcon = <Snowflake className="w-4 h-4 text-sky-400" />;
    } else {
      comfortStatus = "Kondisi Kurang Ideal";
      comfortColor = "text-rose-400";
      comfortIcon = <AlertCircle className="w-4 h-4 text-rose-400" />;
    }
  }

  // Calculate percentage for circular gauge
  // Temp comfortable scale: 0 to 50 degC
  const tempPercent = Math.min(100, Math.max(0, (temp / 50) * 100));
  // Humidity: 0 to 100%
  const humPercent = Math.min(100, Math.max(0, hum));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="metrics-panel">
      {/* Temperature Card */}
      <div 
        id="temp-metric-card"
        className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl p-6 transition-all duration-300 hover:border-teal-500/40 hover:shadow-lg hover:shadow-teal-900/10"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
              <Thermometer className="w-5 h-5" />
            </span>
            <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider font-display">Suhu Ruangan</span>
          </div>
          <span className="text-xs font-mono px-2 py-1 bg-slate-800 rounded-lg text-slate-400 border border-slate-700">DHT11 PIN 4</span>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl md:text-6xl font-bold font-display tracking-tight text-white select-all">
                {temperature}
              </span>
              <span className="text-2xl md:text-3xl font-display font-medium text-teal-400">°C</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
              Status Termal: <span className="font-semibold text-white">{temp > 29 ? 'Panas' : temp < 22 ? 'Dingin' : 'Normal'}</span>
            </p>
          </div>

          {/* Radial progress simulator */}
          <div className="relative flex items-center justify-center w-20 h-20">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-teal-400 transition-all duration-1000 ease-out"
                strokeDasharray={`${tempPercent}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute font-mono text-xs text-slate-300 font-semibold">
              {tempPercent.toFixed(0)}%
            </div>
          </div>
        </div>

        {/* Visual progress bar representation */}
        <div className="mt-5 w-full bg-slate-800/80 rounded-full h-2 overflow-hidden border border-slate-700/50">
          <div 
            className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-1000"
            style={{ width: `${Math.min(100, Math.max(0, (temp / 45) * 100))}%` }}
          />
        </div>
      </div>

      {/* Humidity Card */}
      <div 
        id="humidity-metric-card"
        className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl p-6 transition-all duration-300 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-900/10"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Droplets className="w-5 h-5" />
            </span>
            <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider font-display">Kelembaban</span>
          </div>
          <span className="text-xs font-mono px-2 py-1 bg-slate-800 rounded-lg text-slate-400 border border-slate-700">DHT11 %RH</span>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl md:text-6xl font-bold font-display tracking-tight text-white select-all">
                {humidity}
              </span>
              <span className="text-2xl md:text-3xl font-display font-medium text-blue-400">%</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
              Status Udara: <span className="font-semibold text-white">{hum > 75 ? 'Sangat Lembab' : hum < 40 ? 'Kering' : 'Stabil'}</span>
            </p>
          </div>

          {/* Radial progress simulator */}
          <div className="relative flex items-center justify-center w-20 h-20">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-blue-400 transition-all duration-1000 ease-out"
                strokeDasharray={`${humPercent}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute font-mono text-xs text-slate-300 font-semibold">
              {humPercent.toFixed(0)}%
            </div>
          </div>
        </div>

        {/* Visual progress bar representation */}
        <div className="mt-5 w-full bg-slate-800/80 rounded-full h-2 overflow-hidden border border-slate-700/50">
          <div 
            className="bg-gradient-to-r from-blue-500 to-indigo-400 h-full rounded-full transition-all duration-1000"
            style={{ width: `${humPercent}%` }}
          />
        </div>
      </div>

      {/* Global Room Health Bar Status */}
      <div 
        id="room-comfort-indicator"
        className="md:col-span-2 flex items-center justify-between bg-slate-900/60 border border-slate-800/80 rounded-xl px-5 py-3 text-sm"
      >
        <span className="text-slate-400 font-medium">Comfort Index Tracker</span>
        <div className={`flex items-center gap-2 ${comfortColor} font-semibold font-display`}>
          {comfortIcon}
          {comfortStatus}
        </div>
      </div>
    </div>
  );
}
