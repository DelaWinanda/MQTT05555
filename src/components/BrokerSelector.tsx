import React from "react";
import { Server, ShieldCheck, ShieldAlert, Wifi, RefreshCw } from "lucide-react";

interface BrokerSelectorProps {
  brokerIndex: number;
  connectionStatus: "disconnected" | "connecting" | "connected" | "error";
  statusBrokerMsg: string;
  onSwitchBroker: (index: number) => void;
  onDisconnectBroker: () => void;
}

const BROKERS = [
  {
    name: "CloudAMQP",
    url: "kingfisher.lmq.cloudamqp.com",
    port: 8883,
    tls: "TLS/SSL (Secure)",
    username: "azfrfvzw...",
    desc: "Instance klaster RabbitMQ performa tinggi dengan proteksi penuh."
  },
  {
    name: "Cedalo",
    url: "pf-ja6x4lxt1n...cedalo.cloud",
    port: 8883,
    tls: "TLS/SSL (Secure)",
    username: "Esp1",
    desc: "Broker Eclipse Mosquitto modern dengan arsitektur latency ultra kecil."
  },
  {
    name: "Flespi",
    url: "mqtt.flespi.io",
    port: 8883,
    tls: "TLS/SSL (Secure)",
    username: "Token Flespi...",
    desc: "Layanan industrial telemetry cloud ideal untuk pelacakan performa IoT."
  }
];

export default function BrokerSelector({ 
  brokerIndex, 
  connectionStatus, 
  statusBrokerMsg, 
  onSwitchBroker,
  onDisconnectBroker
}: BrokerSelectorProps) {

  // Color mappings
  const statusColors = {
    connected: "bg-emerald-500 text-emerald-950 border-emerald-400/50 shadow-emerald-500/20",
    connecting: "bg-amber-500 text-amber-950 border-amber-400/50 shadow-amber-500/20 animate-pulse",
    disconnected: "bg-slate-700 text-slate-100 border-slate-500/50 shadow-slate-500/10",
    error: "bg-rose-500 text-rose-950 border-rose-400/50 shadow-rose-500/20"
  };

  const statusLabels = {
    connected: "TERHUBUNG (SECURE)",
    connecting: "MENGHUBUNGKAN...",
    disconnected: "TERPUTUS",
    error: "ERROR KONEKSI"
  };

  return (
    <div 
      id="broker-selector-section"
      className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold font-display text-white mb-1 flex items-center gap-2">
            <Server className="w-5 h-5 text-amber-400" />
            Integrasi Multi-Broker MQTT
          </h2>
          <p className="text-xs text-slate-400">
            Pindah saluran broker seketika. ESP32 otomatis mengikuti subskripsi broker aktif via topik <code className="text-amber-400 font-mono">kontrol/broker</code>.
          </p>
        </div>

        {/* Global Connection Status Badge & Disconnect */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          {connectionStatus === "connected" && (
            <button
              onClick={onDisconnectBroker}
              title="Putus Koneksi Broker Server"
              className="text-[10px] font-bold px-3 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer font-mono"
            >
              DISCONNECT
            </button>
          )}
          <span 
            className={`text-xs font-bold font-mono px-3 py-1.5 rounded-full border flex items-center gap-1.5 shadow-sm ${statusColors[connectionStatus]}`}
          >
            <span className={`w-2 h-2 rounded-full bg-current ${connectionStatus === "connecting" ? "animate-ping" : ""}`} />
            {statusLabels[connectionStatus]}
          </span>
        </div>
      </div>

      {/* Network Alert Message */}
      <div 
        id="broker-status-feedback"
        className="mb-6 p-3 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center gap-3 font-mono text-xs text-slate-300"
      >
        <span className="p-1 rounded bg-slate-900 text-amber-400 flex-shrink-0">
          <Wifi className="w-3.5 h-3.5" />
        </span>
        <div className="overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="text-slate-500 mr-1">Feedback:</span>
          <span className="text-emerald-400 font-semibold">{statusBrokerMsg}</span>
        </div>
      </div>

      {/* Grid of the 3 Brokers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="mqtt-broker-grid">
        {BROKERS.map((broker, idx) => {
          const isActive = brokerIndex === idx;
          const isPending = connectionStatus === "connecting" && isActive;

          return (
            <div 
              key={broker.name}
              id={`broker-card-${idx}`}
              className={`relative border rounded-xl p-4 transition-all duration-300 flex flex-col justify-between ${
                isActive 
                  ? "bg-slate-900 border-amber-500/50 shadow-md shadow-amber-950/20" 
                  : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/40"
              }`}
            >
              {/* Highlight ribbon for active */}
              {isActive && (
                <div className="absolute top-0 right-4 transform -translate-y-1/2 bg-amber-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md font-mono select-none">
                  ACTIVE
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                    isActive ? "bg-amber-400/10 text-amber-400" : "bg-slate-800 text-slate-400"
                  }`}>
                    BROKER 0{idx + 1}
                  </span>
                  <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                    {broker.port === 8883 ? (
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                    )}
                    {broker.tls}
                  </span>
                </div>

                <h3 className="text-md font-bold font-display text-white mb-1 flex items-baseline gap-1.5">
                  {broker.name}
                </h3>
                <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                  {broker.desc}
                </p>

                {/* Technical Coordinates block */}
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/60 font-mono text-[10px] space-y-1 mb-4 select-all">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Host:</span>
                    <span className="text-slate-300 max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap">{broker.url}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">User:</span>
                    <span className="text-slate-300">{broker.username}</span>
                  </div>
                </div>
              </div>

              {/* Action trigger button */}
              <button
                id={`btn-connect-broker-${idx + 1}`}
                onClick={() => onSwitchBroker(idx)}
                disabled={isActive || connectionStatus === "connecting"}
                className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isActive 
                    ? "bg-amber-400/10 text-amber-300 border border-amber-500/20 cursor-default"
                    : "bg-slate-800 text-white hover:bg-slate-700 border border-slate-700"
                } disabled:opacity-50`}
              >
                {isPending && <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />}
                {isActive ? "Telah Terkoneksi" : "Hubungkan Broker"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
