'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Crosshair, Award, Zap, AlertTriangle } from 'lucide-react';

export default function DroneSimulator() {
  const [throttle, setThrottle] = useState(50);
  const [balance, setBalance] = useState(0); // -50 (Left) to +50 (Right)
  const [altitude, setAltitude] = useState(40);
  const [angle, setAngle] = useState(0);
  const [score, setScore] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState<'IDLE' | 'HOVERING' | 'CRASHED' | 'LOCKED'>('IDLE');

  const animationRef = useRef<number | null>(null);

  const resetSim = () => {
    setThrottle(50);
    setBalance(0);
    setAltitude(40);
    setAngle(0);
    setScore(0);
    setStatus('IDLE');
    setIsRunning(false);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
  };

  useEffect(() => {
    if (!isRunning) return;

    const gravity = 0.45;
    const targetZoneMin = 45;
    const targetZoneMax = 75;

    const updatePhysics = () => {
      setAltitude((prevAlt) => {
        const lift = (throttle - 48) * 0.08;
        const newAlt = Math.max(0, Math.min(100, prevAlt + lift - gravity));

        // Ground crash check
        if (newAlt <= 2) {
          setStatus('CRASHED');
          setIsRunning(false);
          return 0;
        }

        // Ceiling breach
        if (newAlt >= 98) {
          setStatus('CRASHED');
          setIsRunning(false);
          return 100;
        }

        // In stable hover zone check
        if (newAlt >= targetZoneMin && newAlt <= targetZoneMax && Math.abs(balance) < 15) {
          setStatus('HOVERING');
          setScore((s) => s + 1);
        } else {
          setStatus('HOVERING');
        }

        return newAlt;
      });

      // Angular drift based on balance input
      setAngle((prevAngle) => {
        const drift = balance * 0.4;
        const newAngle = prevAngle * 0.85 + drift * 0.15;
        if (Math.abs(newAngle) > 40) {
          setStatus('CRASHED');
          setIsRunning(false);
        }
        return newAngle;
      });

      animationRef.current = requestAnimationFrame(updatePhysics);
    };

    animationRef.current = requestAnimationFrame(updatePhysics);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isRunning, throttle, balance]);

  return (
    <div className="bg-[#0b0d13] border-2 border-[#1f2638] rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-[#1b2233] pb-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-md bg-neon/10 border border-neon/30 text-neon font-mono text-[10px] font-bold uppercase">
            Interactive Telemetry Lab
          </span>
          <h3 className="text-lg font-bold text-white font-mono uppercase mt-1 flex items-center gap-2">
            <Zap className="w-4 h-4 text-neon" />
            ESP32 PID Hover & Thrust Simulator
          </h3>
        </div>
        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="text-gray-400">Telemetry Lock:</span>
          <span className="text-neon font-black text-sm">{score} ms</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Visual Flight Cage */}
        <div className="lg:col-span-7 bg-[#07090e] border border-[#1b2333] rounded-2xl h-64 relative flex flex-col justify-between p-4 overflow-hidden select-none">
          {/* Optimal Green Hover Target Box */}
          <div className="absolute left-0 right-0 top-[25%] bottom-[25%] bg-neon/5 border-y border-dashed border-neon/30 flex items-center justify-between px-3 pointer-events-none">
            <span className="font-mono text-[9px] text-neon/60 uppercase">Optimal PID Stable Altitude Band (45% - 75%)</span>
            <Crosshair className="w-3.5 h-3.5 text-neon/40 animate-pulse" />
          </div>

          {/* Drone Sprite */}
          <div
            className="absolute left-1/2 -translate-x-1/2 transition-transform duration-75 ease-out"
            style={{
              bottom: `${altitude}%`,
              transform: `translateX(-50%) rotate(${angle}deg)`,
            }}
          >
            <div className="relative flex flex-col items-center">
              {/* Rotor Spin Blur Effect */}
              {isRunning && (
                <div className="flex justify-between w-24 mb-0.5">
                  <span className="w-8 h-1 rounded-full bg-neon/80 animate-ping"></span>
                  <span className="w-8 h-1 rounded-full bg-neon/80 animate-ping"></span>
                </div>
              )}
              {/* Drone Body Frame */}
              <div className="w-20 h-4 bg-[#1e2738] border border-neon rounded-md flex items-center justify-between px-1.5 shadow-[0_0_15px_rgba(0,255,102,0.3)]">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                <span className="text-[8px] font-mono text-white font-bold">AEGIS-FC</span>
                <span className="w-2 h-2 rounded-full bg-neon"></span>
              </div>
              {/* Thrust Plume */}
              {isRunning && (
                <div className="w-1.5 bg-gradient-to-b from-neon to-transparent rounded-full mt-0.5" style={{ height: `${throttle * 0.3}px` }}></div>
              )}
            </div>
          </div>

          {/* Status Overlay */}
          <div className="z-10 flex justify-between items-end font-mono text-[11px]">
            <span className="text-gray-500">Altitude: <strong className="text-white">{Math.round(altitude)}%</strong></span>
            {status === 'CRASHED' && (
              <span className="text-red-400 font-bold flex items-center gap-1 bg-red-950/40 px-2 py-0.5 rounded border border-red-500/40">
                <AlertTriangle className="w-3 h-3" /> FLIGHT DISRUPTED • RESET BENCH
              </span>
            )}
            {status === 'HOVERING' && (
              <span className="text-neon font-bold">✓ PID LOCK STABLE</span>
            )}
          </div>
        </div>

        {/* Flight Cockpit Controls */}
        <div className="lg:col-span-5 space-y-4 bg-[#0e111a] border border-[#1f283d] p-5 rounded-2xl">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-gray-300">Motor Throttle (PWM Output):</span>
              <span className="text-neon font-bold">{throttle}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={throttle}
              disabled={!isRunning}
              onChange={(e) => setThrottle(Number(e.target.value))}
              className="w-full accent-neon cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-gray-300">Gyro Balance / Roll Drift:</span>
              <span className="text-neon font-bold">{balance > 0 ? `+${balance}` : balance}°</span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              value={balance}
              disabled={!isRunning}
              onChange={(e) => setBalance(Number(e.target.value))}
              className="w-full accent-neon cursor-pointer"
            />
          </div>

          <div className="pt-2 flex gap-3">
            {!isRunning ? (
              <button
                onClick={() => {
                  if (status === 'CRASHED') resetSim();
                  setIsRunning(true);
                }}
                className="flex-1 py-2.5 rounded-xl bg-neon text-black font-mono font-bold text-xs uppercase hover:bg-[#00cc52] transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(0,255,102,0.2)] cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Arm Motors & Test Fly</span>
              </button>
            ) : (
              <button
                onClick={() => setIsRunning(false)}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 text-black font-mono font-bold text-xs uppercase hover:bg-amber-400 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Disarm Motors</span>
              </button>
            )}

            <button
              onClick={resetSim}
              className="px-4 py-2.5 rounded-xl bg-[#182030] hover:bg-[#222c42] text-gray-300 font-mono text-xs flex items-center gap-1 transition-colors cursor-pointer border border-[#2b3752]"
              title="Reset flight bench"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}