import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, HelpCircle, CornerDownRight, CheckCircle2 } from "lucide-react";

interface VoiceControllerProps {
  temperature: string;
  humidity: string;
  relays: boolean[];
  brokerIndex: number;
  onToggleRelay: (index: number, state: "ON" | "OFF") => void;
  onToggleVariasi: (index: number, state: "START" | "STOP") => void;
  onSwitchBroker: (index: number) => void;
}

export default function VoiceController({
  temperature,
  humidity,
  relays,
  brokerIndex,
  onToggleRelay,
  onToggleVariasi,
  onSwitchBroker
}: VoiceControllerProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [voiceLogs, setVoiceLogs] = useState<string[]>([]);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  // Suggested commands for user to say
  const COMMAND_SUGGESTIONS = [
    { text: '"Nyalakan relay 1"', desc: 'Menghidupkan Kipas Ruangan' },
    { text: '"Matikan semua relay"', desc: 'Menonaktifkan semua perangkat beban' },
    { text: '"Sebutkan kondisi suhu"', desc: 'Asisten menyuarakan data sensor DHT11' },
    { text: '"Mulai variasi 1"', desc: 'Menjalankan sekuensial maju (1→2→3→4)' },
    { text: '"Pindah ke broker dua"', desc: 'Beralih ke broker Cedalo secara otomatis' }
  ];

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = 
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "id-ID"; // Default to Indonesian

    rec.onstart = () => {
      setIsListening(true);
      setTranscript("Mendengarkan ucapan...");
    };

    rec.onresult = (event: any) => {
      const resultText = event.results[0][0].transcript || "";
      setTranscript(resultText);
      addVoiceLog(`Anda: "${resultText}"`);
      processVoiceCommand(resultText);
    };

    rec.onerror = (event: any) => {
      if (event.error !== "no-speech") {
        setTranscript(`Error mikrofon: ${event.error}`);
        addVoiceLog(`Error: ${event.error}`);
      }
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = rec;
  }, [temperature, humidity, relays, brokerIndex]); // Refresh hooks when hardware state changes to ensure values are updated!

  const startListening = () => {
    if (!isSupported) return;
    try {
      if (isListening) {
        recognitionRef.current?.stop();
      } else {
        recognitionRef.current?.start();
      }
    } catch (e: any) {
      console.error(e);
    }
  };

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    
    // Stop any currently speaking voice to avoid overlap
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "id-ID"; // Indonesian voice feedback
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    // Attempt to pick an Indonesian voice if available
    const voices = window.speechSynthesis.getVoices();
    const idVoice = voices.find(v => v.lang.includes("id") || v.name.includes("Indonesian"));
    if (idVoice) utterance.voice = idVoice;

    window.speechSynthesis.speak(utterance);
    addVoiceLog(`Asisten: "${text}"`);
  };

  const addVoiceLog = (msg: string) => {
    const time = new Date().toLocaleTimeString("id-ID", { hour12: false });
    setVoiceLogs(prev => [`[${time}] ${msg}`, ...prev].slice(0, 15));
  };

  // The actual natural language command parser
  const processVoiceCommand = (cmd: string) => {
    const textClean = cmd.toLowerCase().trim();

    // 1. Temperature and Humidity Reading Command
    if (
      textClean.includes("suhu") || 
      textClean.includes("kelembaban") || 
      textClean.includes("sensor") || 
      textClean.includes("kondisi") ||
      textClean.includes("cuaca") ||
      textClean.includes("baca data")
    ) {
      const responseSpeech = `Laporan sensor DHT sebelas saat ini. Suhu ruangan adalah ${temperature} derajat Celcius, dengan tingkat kelembapan udara ${humidity} persen. Kondisi terpantau stabil.`;
      speakText(responseSpeech);
      return;
    }

    // 2. Relay Control Commands

    // RELAY 1
    if (textClean.includes("nyalakan relay 1") || textClean.includes("nyalakan relay satu") || textClean.includes("hidupkan relay 1") || textClean.includes("kipas") && (textClean.includes("hidup") || textClean.includes("nyala"))) {
      onToggleRelay(0, "ON");
      speakText("Baik, menyalakan Kipas Ruangan pada relay satu.");
      return;
    }
    if (textClean.includes("matikan relay 1") || textClean.includes("matikan relay satu") || textClean.includes("kipas") && (textClean.includes("mati") || textClean.includes("padam"))) {
      onToggleRelay(0, "OFF");
      speakText("Baik, mematikan Kipas Ruangan pada relay satu.");
      return;
    }

    // RELAY 2
    if (textClean.includes("nyalakan relay 2") || textClean.includes("nyalakan relay dua") || textClean.includes("hidupkan relay 2") || textClean.includes("pompa") && (textClean.includes("hidup") || textClean.includes("nyala"))) {
      onToggleRelay(1, "ON");
      speakText("Baik, mengaktifkan Sistem Pompa Air pada relay dua.");
      return;
    }
    if (textClean.includes("matikan relay 2") || textClean.includes("matikan relay dua") || textClean.includes("pompa") && (textClean.includes("mati") || textClean.includes("padam"))) {
      onToggleRelay(1, "OFF");
      speakText("Baik, mematikan Sistem Pompa Air pada relay dua.");
      return;
    }

    // RELAY 3
    if (textClean.includes("nyalakan relay 3") || textClean.includes("nyalakan relay tiga") || textClean.includes("hidupkan relay 3") || textClean.includes("lampu") && (textClean.includes("hidup") || textClean.includes("nyala"))) {
      onToggleRelay(2, "ON");
      speakText("Baik, menyalakan Lampu Utama pada relay tiga.");
      return;
    }
    if (textClean.includes("matikan relay 3") || textClean.includes("matikan relay tiga") || textClean.includes("lampu") && (textClean.includes("mati") || textClean.includes("padam"))) {
      onToggleRelay(2, "OFF");
      speakText("Baik, memadamkan Lampu Utama pada relay tiga.");
      return;
    }

    // RELAY 4
    if (textClean.includes("nyalakan relay 4") || textClean.includes("nyalakan relay empat") || textClean.includes("hidupkan relay 4") || textClean.includes("valve") && (textClean.includes("hidup") || textClean.includes("nyala") || textClean.includes("buka"))) {
      onToggleRelay(3, "ON");
      speakText("Baik, membuka Solenoid Valve pada relay empat.");
      return;
    }
    if (textClean.includes("matikan relay 4") || textClean.includes("matikan relay empat") || textClean.includes("valve") && (textClean.includes("mati") || textClean.includes("padam") || textClean.includes("tutup"))) {
      onToggleRelay(3, "OFF");
      speakText("Baik, menutup Solenoid Valve pada relay empat.");
      return;
    }

    // ALL RELAYS ON/OFF
    if (textClean.includes("nyalakan semua") || textClean.includes("hidupkan semua") || textClean.includes("nyalakan seluruh")) {
      [0, 1, 2, 3].forEach(idx => onToggleRelay(idx, "ON"));
      speakText("Siap, menyalakan keempat relay secara serentak.");
      return;
    }
    if (textClean.includes("matikan semua") || textClean.includes("padamkan semua") || textClean.includes("hentikan seluruh")) {
      [0, 1, 2, 3].forEach(idx => onToggleRelay(idx, "OFF"));
      onToggleVariasi(1, "STOP");
      onToggleVariasi(2, "STOP");
      speakText("Siap, mematikan semua relay dan menghentikan pengurutan sekuen.");
      return;
    }

    // 3. Variations (Sequences) Commands

    // VARIASI 1
    if (textClean.includes("mulai variasi 1") || textClean.includes("mulai variasi satu") || textClean.includes("jalankan variasi satu") || textClean.includes("sekuen satu")) {
      onToggleVariasi(1, "START");
      speakText("Siap, memulai pengurutan Variasi Satu sekuensial maju.");
      return;
    }
    if (textClean.includes("hentikan variasi 1") || textClean.includes("stop variasi 1") || textClean.includes("matikan variasi satu") || textClean.includes("stop variasi satu")) {
      onToggleVariasi(1, "STOP");
      speakText("Menghentikan sekuen Variasi Satu.");
      return;
    }

    // VARIASI 2
    if (textClean.includes("mulai variasi 2") || textClean.includes("mulai variasi dua") || textClean.includes("jalankan variasi dua") || textClean.includes("sekuen dua")) {
      onToggleVariasi(2, "START");
      speakText("Siap, merilis pengurutan Variasi Dua sekuensial mundur.");
      return;
    }
    if (textClean.includes("hentikan variasi 2") || textClean.includes("stop variasi 2") || textClean.includes("matikan variasi dua") || textClean.includes("stop variasi dua")) {
      onToggleVariasi(2, "STOP");
      speakText("Menghentikan sekuen Variasi Dua.");
      return;
    }

    // 4. Broker Switch Commands
    if (textClean.includes("pindah") && (textClean.includes("broker 1") || textClean.includes("broker satu") || textClean.includes("cloudamqp") || textClean.includes("cloud amqp"))) {
      onSwitchBroker(0);
      speakText("Memproses perpindahan koneksi ke Broker Satu Cloud AMQP.");
      return;
    }
    if (textClean.includes("pindah") && (textClean.includes("broker 2") || textClean.includes("broker dua") || textClean.includes("cedalo"))) {
      onSwitchBroker(1);
      speakText("Memproses perpindahan koneksi ke Broker Dua Cedalo Cloud.");
      return;
    }
    if (textClean.includes("pindah") && (textClean.includes("broker 3") || textClean.includes("broker tiga") || textClean.includes("flespi"))) {
      onSwitchBroker(2);
      speakText("Memproses perpindahan koneksi ke Broker Tiga Flespi.");
      return;
    }

    // Fallback if voice command is recognized but doesn't trigger anything
    speakText(`Perintah "${cmd}" diterima, namun asisten belum mengenali pola tersebut.`);
  };

  return (
    <div 
      id="voice-command-section"
      className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center gap-3 mb-6">
        <span className={`p-2 rounded-xl flex items-center justify-center ${isListening ? 'bg-rose-500/10 text-rose-400' : 'bg-teal-500/10 text-teal-400'}`}>
          <Volume2 className="w-5 h-5" />
        </span>
        <div>
          <h2 className="text-lg font-bold font-display text-white">Kendali Suara Interaktif</h2>
          <p className="text-xs text-slate-400">Teknologi WebSpeech AI. Berbicara dalam bahasa Indonesia untuk memberi instruksi.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Side: Mic Trigger & Transcription */}
        <div className="flex flex-col justify-between bg-slate-950 p-4 rounded-xl border border-slate-800/80">
          <div className="flex flex-col items-center justify-center py-6 text-center">
            {/* Listening Waveform representation */}
            {isListening ? (
              <div className="flex items-end justify-center gap-1.5 h-10 mb-4 px-8">
                <div className="w-1.5 bg-rose-400 rounded-full h-4 wave-bar" style={{ animationDelay: "0.1s" }} />
                <div className="w-1.5 bg-rose-400 rounded-full h-8 wave-bar" style={{ animationDelay: "0.3s" }} />
                <div className="w-1.5 bg-rose-500 rounded-full h-10 wave-bar" style={{ animationDelay: "0.5s" }} />
                <div className="w-1.5 bg-rose-400 rounded-full h-6 wave-bar" style={{ animationDelay: "0.2s" }} />
                <div className="w-1.5 bg-rose-400 rounded-full h-3 wave-bar" style={{ animationDelay: "0s" }} />
              </div>
            ) : (
              <div className="h-10 mb-4 flex items-center justify-center text-slate-500 text-xs">
                Mikrofon Idle
              </div>
            )}

            {/* Mic Button */}
            <button
              id="voice-mic-trigger"
              onClick={startListening}
              disabled={!isSupported}
              className={`w-16 h-16 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ${
                !isSupported 
                  ? 'bg-slate-850 text-slate-600 border border-slate-800 cursor-not-allowed'
                  : isListening 
                    ? 'bg-rose-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse border border-rose-400' 
                    : 'bg-teal-500 text-slate-950 hover:bg-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.2)] border border-teal-300/40'
              }`}
            >
              {!isSupported ? (
                <MicOff className="w-6 h-6" />
              ) : isListening ? (
                <Mic className="w-6 h-6" />
              ) : (
                <Mic className="w-6 h-6" />
              )}
            </button>

            <span className="text-xs font-semibold mt-4 text-slate-300">
              {isListening ? "Asisten Sedang Mendengarkan..." : "Klik untuk Berbicara"}
            </span>

            <p 
              className={`text-xs mt-3 px-3 py-1.5 rounded-lg border text-center font-mono select-all ${
                isListening 
                  ? 'bg-slate-900 border-rose-500/20 text-rose-300' 
                  : 'bg-slate-900 text-slate-400 border-slate-800/60'
              }`}
              id="speech-transcript-box"
            >
              {transcript || 'Menunggu perintah suara...'}
            </p>
          </div>

          {!isSupported && (
            <div className="mt-2 text-[10px] text-amber-500 font-medium bg-amber-500/5 p-2 rounded-lg border border-amber-500/15">
              ⚠️ Web Speech API tidak didukung browser ini. Coba gunakan Google Chrome atau Microsoft Edge untuk fungsionalitas asisten suara.
            </div>
          )}
        </div>

        {/* Right Side: Command suggestions & Feedlogs */}
        <div className="flex flex-col justify-between">
          {/* Suggestions Accordion view */}
          <div className="mb-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-slate-500" /> Contoh Kalimat Perintah:
            </span>
            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {COMMAND_SUGGESTIONS.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => isSupported && processVoiceCommand(sug.text.replaceAll('"', ''))}
                  disabled={!isSupported}
                  className="w-full text-left bg-slate-950/60 hover:bg-slate-950 border border-slate-850 hover:border-slate-800 px-3 py-1 rounded-lg transition-all flex items-center justify-between text-xs cursor-pointer group"
                >
                  <span className="font-mono text-teal-400 group-hover:text-teal-300">{sug.text}</span>
                  <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                    <CornerDownRight className="w-2.5 h-2.5 text-slate-600" /> {sug.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Assistant Speech logs */}
          <div className="bg-slate-950 rounded-xl p-3 border border-slate-800/80">
            <span className="text-[10px] font-mono text-slate-500 block mb-1.5">SPEECH TERMINAL FEEDBACK LOGS</span>
            <div className="space-y-1 max-h-24 overflow-y-auto pr-1 text-[10px] font-mono">
              {voiceLogs.length === 0 ? (
                <div className="text-slate-600 italic py-1">Belum ada pertukaran pesan suara.</div>
              ) : (
                voiceLogs.map((log, i) => (
                  <div key={i} className="text-slate-300 border-l border-slate-800 pl-2 py-0.5 flex items-start gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5 mt-0.5 text-slate-500 flex-shrink-0" />
                    <span>{log}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
