'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from 'react';
import { 
  Cpu, 
  Activity, 
  Zap, 
  RotateCcw, 
  Wind, 
  Gauge, 
  Sparkles, 
  Sliders,
  Play,
  Crosshair,
  AlertTriangle,
  Gamepad2
} from 'lucide-react';

export default function AvionicsLabPage() {
  const [activeLab, setActiveLab] = useState<'pid' | 'filter' | 'thrust' | 'game'>('game');

  // --- 1. PID LAB STATES ---
  const [kp, setKp] = useState(1.8);
  const [ki, setKi] = useState(0.05);
  const [kd, setKd] = useState(0.9);
  const [setpoint, setSetpoint] = useState(0);
  const [currentAngle, setCurrentAngle] = useState(0);
  const [windActive, setWindActive] = useState(false);
  const [pidHistory, setPidHistory] = useState<number[]>([]);

  // --- 2. SENSOR FUSION STATES ---
  const [filterAlpha, setFilterAlpha] = useState(0.96);
  const [rawAcc, setRawAcc] = useState(0);
  const [rawGyro, setRawGyro] = useState(0);
  const [fusedAngle, setFusedAngle] = useState(0);

  // --- 3. THRUST / PAYLOAD STATES ---
  const [motorKv, setMotorKv] = useState(1000);
  const [batteryCells, setBatteryCells] = useState(4);
  const [propSize, setPropSize] = useState(10);
  const [droneDryWeight, setDroneDryWeight] = useState(1200);

  // --- 4. FLIGHT GAME / HOVER SIMULATOR STATES ---
  const [gameThrottle, setGameThrottle] = useState(50);
  const [gameBalance, setGameBalance] = useState(0);
  const [gameAltitude, setGameAltitude] = useState(40);
  const [gameAngle, setGameAngle] = useState(0);
  const [gameScore, setGameScore] = useState(0);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [gameStatus, setGameStatus] = useState<'IDLE' | 'HOVERING' | 'CRASHED'>('IDLE');

  const animRef = useRef<number | null>(null);
  const gameAnimRef = useRef<number | null>(null);
  const integralRef = useRef(0);
  const lastErrorRef = useRef(0);

  // Simulation Loop for PID & Sensor Fusion
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      if (activeLab === 'pid') {
        const windDisturbance = windActive ? (Math.sin(time * 0.005) * 12 + (Math.random() - 0.5) * 6) : 0;
        const error = setpoint - (currentAngle + windDisturbance * 0.1);
        
        integralRef.current += error * dt;
        integralRef.current = Math.max(-20, Math.min(20, integralRef.current));
        
        const derivative = (error - lastErrorRef.current) / dt;
        lastErrorRef.current = error;

        const output = kp * error + ki * integralRef.current + kd * derivative;

        setCurrentAngle((prev) => prev + (output - prev * 0.5 + windDisturbance) * dt * 8);
        setPidHistory((h) => [...h.slice(-40), Math.round(currentAngle)]);
      }

      if (activeLab === 'filter') {
        const trueAngle = Math.sin(time * 0.002) * 20;
        const noisyAcc = trueAngle + (Math.random() - 0.5) * 15;
        const gyroRate = Math.cos(time * 0.002) * 20 * 0.002 + 0.08;
        
        setRawAcc(noisyAcc);
        setRawGyro((g) => g + gyroRate);
        setFusedAngle((prev) => filterAlpha * (prev + gyroRate) + (1 - filterAlpha) * noisyAcc);
      }

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [activeLab, kp, ki, kd, setpoint, windActive, currentAngle, filterAlpha]);

  // Game / Hover Simulator Physics Loop
  useEffect(() => {
    if (!isGameRunning || activeLab !== 'game') return;

    const gravity = 0.45;
    const targetZoneMin = 45;
    const targetZoneMax = 75;

    const updateGamePhysics = () => {
      setGameAltitude((prevAlt) => {
        const lift = (gameThrottle - 48) * 0.08;
        const newAlt = Math.max(0, Math.min(100, prevAlt + lift - gravity));

        if (newAlt <= 2 || newAlt >= 98) {
          setGameStatus('CRASHED');
          setIsGameRunning(false);
          return newAlt <= 2 ? 0 : 100;
        }

        if (newAlt >= targetZoneMin && newAlt <= targetZoneMax && Math.abs(gameBalance) < 15) {
          setGameStatus('HOVERING');
          setGameScore((s) => s + 1);
        } else {
          setGameStatus('HOVERING');
        }

        return newAlt;
      });

      setGameAngle((prevAngle) => {
        const drift = gameBalance * 0.4;
        const newAngle = prevAngle * 0.85 + drift * 0.15;
        if (Math.abs(newAngle) > 40) {
          setGameStatus('CRASHED');
          setIsGameRunning(false);
        }
        return newAngle;
      });

      gameAnimRef.current = requestAnimationFrame(updateGamePhysics);
    };

    gameAnimRef.current = requestAnimationFrame(updateGamePhysics);
    return () => {
      if (gameAnimRef.current) cancelAnimationFrame(gameAnimRef.current);
    };
  }, [isGameRunning, gameThrottle, gameBalance, activeLab]);

  const resetGameSim = () => {
    setGameThrottle(50);
    setGameBalance(0);
    setGameAltitude(40);
    setGameAngle(0);
    setGameScore(0);
    setGameStatus('IDLE');
    setIsGameRunning(false);
    if (gameAnimRef.current) cancelAnimationFrame(gameAnimRef.current);
  };

  // Thrust Calculations
  const nominalVoltage = batteryCells * 3.7;
  const maxRpm = motorKv * nominalVoltage * 0.8;
  const staticThrustPerMotor = Math.round((Math.pow(propSize, 3) * Math.pow(maxRpm / 1000, 2) * 0.022));
  const totalThrust = staticThrustPerMotor * 4;
  const twr = (totalThrust / droneDryWeight).toFixed(2);
  const maxPayload = Math.max(0, totalThrust * 0.5 - droneDryWeight);

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 space-y-12">
      {/* Header */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neon/10 border border-neon/30 text-neon font-mono text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AEGIS INTERACTIVE AVIONICS SIMULATION & FLIGHT LAB</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white font-mono uppercase tracking-tight">
          Interactive Concept Labs
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 font-mono max-w-3xl leading-relaxed">
          Interactive flight dynamics, mathematical control test benches, and live telemetry simulators.
        </p>
      </div>

      {/* Lab Module Selector */}
      <div className="flex flex-wrap gap-3 border-b border-[#202738] pb-4">
        <button
          onClick={() => setActiveLab('game')}
          className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeLab === 'game'
              ? 'bg-neon text-black shadow-[0_0_20px_rgba(0,255,102,0.25)]'
              : 'bg-[#10131d] text-gray-400 hover:text-white border border-[#212b3e]'
          }`}
        >
          <Gamepad2 className="w-4 h-4" />
          <span>01. PID Hover & Balance Game</span>
        </button>

        <button
          onClick={() => setActiveLab('pid')}
          className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeLab === 'pid'
              ? 'bg-neon text-black shadow-[0_0_20px_rgba(0,255,102,0.25)]'
              : 'bg-[#10131d] text-gray-400 hover:text-white border border-[#212b3e]'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>02. PID Loop Gain Tuner</span>
        </button>

        <button
          onClick={() => setActiveLab('filter')}
          className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeLab === 'filter'
              ? 'bg-neon text-black shadow-[0_0_20px_rgba(0,255,102,0.25)]'
              : 'bg-[#10131d] text-gray-400 hover:text-white border border-[#212b3e]'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>03. Sensor Fusion Bench</span>
        </button>

        <button
          onClick={() => setActiveLab('thrust')}
          className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeLab === 'thrust'
              ? 'bg-neon text-black shadow-[0_0_20px_rgba(0,255,102,0.25)]'
              : 'bg-[#10131d] text-gray-400 hover:text-white border border-[#212b3e]'
          }`}
        >
          <Gauge className="w-4 h-4" />
          <span>04. Propulsion & TWR Matrix</span>
        </button>
      </div>

      {/* --- MODULE 01: PID HOVER SIMULATOR GAME --- */}
      {activeLab === 'game' && (
        <div className="bg-[#0b0d13] border-2 border-[#1f2638] rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden shadow-2xl">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-[#1b2233] pb-4">
            <div>
              <span className="px-2.5 py-0.5 rounded-md bg-neon/10 border border-neon/30 text-neon font-mono text-[10px] font-bold uppercase">
                Interactive Telemetry Simulator
              </span>
              <h3 className="text-lg font-bold text-white font-mono uppercase mt-1 flex items-center gap-2">
                <Zap className="w-4 h-4 text-neon" />
                ESP32 PID Hover & Thrust Flight Simulator
              </h3>
            </div>
            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="text-gray-400">Stable Airtime:</span>
              <span className="text-neon font-black text-sm">{gameScore} ms</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Visual Flight Cage */}
            <div className="lg:col-span-7 bg-[#07090e] border border-[#1b2333] rounded-2xl h-64 relative flex flex-col justify-between p-4 overflow-hidden select-none">
              <div className="absolute left-0 right-0 top-[25%] bottom-[25%] bg-neon/5 border-y border-dashed border-neon/30 flex items-center justify-between px-3 pointer-events-none">
                <span className="font-mono text-[9px] text-neon/60 uppercase">Optimal PID Altitude Zone (45% - 75%)</span>
                <Crosshair className="w-3.5 h-3.5 text-neon/40 animate-pulse" />
              </div>

              {/* Drone Asset */}
              <div
                className="absolute left-1/2 -translate-x-1/2 transition-transform duration-75 ease-out"
                style={{
                  bottom: `${gameAltitude}%`,
                  transform: `translateX(-50%) rotate(${gameAngle}deg)`,
                }}
              >
                <div className="relative flex flex-col items-center">
                  {isGameRunning && (
                    <div className="flex justify-between w-24 mb-0.5">
                      <span className="w-8 h-1 rounded-full bg-neon/80 animate-ping"></span>
                      <span className="w-8 h-1 rounded-full bg-neon/80 animate-ping"></span>
                    </div>
                  )}
                  <div className="w-20 h-4 bg-[#1e2738] border border-neon rounded-md flex items-center justify-between px-1.5 shadow-[0_0_15px_rgba(0,255,102,0.3)]">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    <span className="text-[8px] font-mono text-white font-bold">AEGIS-FC</span>
                    <span className="w-2 h-2 rounded-full bg-neon"></span>
                  </div>
                  {isGameRunning && (
                    <div className="w-1.5 bg-gradient-to-b from-neon to-transparent rounded-full mt-0.5" style={{ height: `${gameThrottle * 0.3}px` }}></div>
                  )}
                </div>
              </div>

              <div className="z-10 flex justify-between items-end font-mono text-[11px]">
                <span className="text-gray-500">Altitude: <strong className="text-white">{Math.round(gameAltitude)}%</strong></span>
                {gameStatus === 'CRASHED' && (
                  <span className="text-red-400 font-bold flex items-center gap-1 bg-red-950/40 px-2 py-0.5 rounded border border-red-500/40">
                    <AlertTriangle className="w-3 h-3" /> FLIGHT DISRUPTED • RESET FLIGHT BENCH
                  </span>
                )}
                {gameStatus === 'HOVERING' && (
                  <span className="text-neon font-bold">✓ PID LOCK STABLE</span>
                )}
              </div>
            </div>

            {/* Flight Controls */}
            <div className="lg:col-span-5 space-y-4 bg-[#0e111a] border border-[#1f283d] p-5 rounded-2xl">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-gray-300">Motor Throttle (PWM Duty):</span>
                  <span className="text-neon font-bold">{gameThrottle}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={gameThrottle}
                  disabled={!isGameRunning}
                  onChange={(e) => setGameThrottle(Number(e.target.value))}
                  className="w-full accent-neon cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-gray-300">Gyro Roll / Tilt Trim:</span>
                  <span className="text-neon font-bold">{gameBalance > 0 ? `+${gameBalance}` : gameBalance}°</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={gameBalance}
                  disabled={!isGameRunning}
                  onChange={(e) => setGameBalance(Number(e.target.value))}
                  className="w-full accent-neon cursor-pointer"
                />
              </div>

              <div className="pt-2 flex gap-3">
                {!isGameRunning ? (
                  <button
                    onClick={() => {
                      if (gameStatus === 'CRASHED') resetGameSim();
                      setIsGameRunning(true);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-neon text-black font-mono font-bold text-xs uppercase hover:bg-[#00cc52] transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(0,255,102,0.2)] cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Arm Motors & Fly</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsGameRunning(false)}
                    className="flex-1 py-2.5 rounded-xl bg-amber-500 text-black font-mono font-bold text-xs uppercase hover:bg-amber-400 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Disarm Motors</span>
                  </button>
                )}

                <button
                  onClick={resetGameSim}
                  className="px-4 py-2.5 rounded-xl bg-[#182030] hover:bg-[#222c42] text-gray-300 font-mono text-xs flex items-center gap-1 transition-colors cursor-pointer border border-[#2b3752]"
                  title="Reset Simulator"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODULE 02: PID ATTITUDE LOOP --- */}
      {activeLab === 'pid' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-[#0b0d14] border-2 border-[#1c2333] rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-[#1b2233] pb-3 font-mono text-xs">
              <span className="text-white font-bold uppercase">Dynamic Quadrotor Roll Axis</span>
              <span className="text-neon">Angle: {currentAngle.toFixed(1)}° (Setpoint: {setpoint}°)</span>
            </div>

            <div className="h-60 bg-[#07090e] border border-[#1a2030] rounded-2xl relative flex items-center justify-center overflow-hidden select-none">
              <div 
                className="absolute w-48 h-0.5 border-t border-dashed border-neon/50 transition-transform duration-100"
                style={{ transform: `rotate(${setpoint}deg)` }}
              ></div>

              <div 
                className="relative w-56 h-3 bg-[#1e2738] border border-neon rounded-full flex items-center justify-between px-2 shadow-[0_0_20px_rgba(0,255,102,0.2)] transition-transform duration-75"
                style={{ transform: `rotate(${currentAngle}deg)` }}
              >
                <div className="w-6 h-1 bg-neon/80 animate-ping rounded-full -mt-4"></div>
                <div className="w-4 h-4 rounded-full bg-neon/20 border border-neon flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-neon"></div>
                </div>
                <div className="w-6 h-1 bg-neon/80 animate-ping rounded-full -mt-4"></div>
              </div>

              {windActive && (
                <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 animate-pulse">
                  <Wind className="w-3 h-3" />
                  <span>Turbulence Injected</span>
                </div>
              )}
            </div>

            <div className="space-y-1.5 font-mono text-[11px]">
              <span className="text-gray-400">Step Response Telemetry:</span>
              <div className="h-10 bg-[#07090e] rounded-lg border border-[#1a2030] flex items-end px-1 gap-1">
                {pidHistory.map((val, idx) => (
                  <div
                    key={idx}
                    className="flex-1 bg-neon/60 rounded-t"
                    style={{ height: `${Math.min(100, Math.max(5, Math.abs(val) * 2 + 10))}%` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#0e111a] border border-[#1f283d] p-6 rounded-3xl space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold font-mono text-white uppercase">Control Loop Gains</h3>
              <button
                onClick={() => { setKp(1.8); setKi(0.05); setKd(0.9); setSetpoint(0); }}
                className="text-gray-400 hover:text-neon text-xs font-mono flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="space-y-1">
                <div className="flex justify-between text-gray-300">
                  <span>Proportional Gain ($K_p$):</span>
                  <span className="text-neon font-bold">{kp.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.1"
                  value={kp}
                  onChange={(e) => setKp(Number(e.target.value))}
                  className="w-full accent-neon cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-gray-300">
                  <span>Integral Gain ($K_i$):</span>
                  <span className="text-neon font-bold">{ki.toFixed(3)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.5"
                  step="0.01"
                  value={ki}
                  onChange={(e) => setKi(Number(e.target.value))}
                  className="w-full accent-neon cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-gray-300">
                  <span>Derivative Gain ($K_d$):</span>
                  <span className="text-neon font-bold">{kd.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="3"
                  step="0.05"
                  value={kd}
                  onChange={(e) => setKd(Number(e.target.value))}
                  className="w-full accent-neon cursor-pointer"
                />
              </div>

              <div className="space-y-1 pt-2 border-t border-[#1f283d]">
                <div className="flex justify-between text-gray-300">
                  <span>Target Setpoint Angle:</span>
                  <span className="text-neon font-bold">{setpoint}°</span>
                </div>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  value={setpoint}
                  onChange={(e) => setSetpoint(Number(e.target.value))}
                  className="w-full accent-neon cursor-pointer"
                />
              </div>
            </div>

            <button
              onClick={() => setWindActive(!windActive)}
              className={`w-full py-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                windActive
                  ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                  : 'bg-[#182030] text-gray-300 hover:text-white border border-[#2b3752]'
              }`}
            >
              <Wind className="w-4 h-4" />
              <span>{windActive ? 'Disable Cross-Wind Disturbance' : 'Inject Cross-Wind Turbulence'}</span>
            </button>
          </div>
        </div>
      )}

      {/* --- MODULE 03: SENSOR FUSION BENCH --- */}
      {activeLab === 'filter' && (
        <div className="bg-[#0b0d14] border-2 border-[#1c2333] rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-[#1b2233] pb-3">
            <h3 className="text-base font-bold font-mono text-white uppercase">
              6-Axis IMU (MPU6050) Complementary Angle Estimator
            </h3>
            <p className="text-xs text-gray-400 font-mono mt-1">
              $$\theta_{fused} = \alpha \cdot (\theta + \omega_{gyro} \cdot \Delta t) + (1 - \alpha) \cdot \theta_{acc}$$
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#080a0f] p-4 rounded-xl border border-red-500/20 space-y-1">
              <span className="font-mono text-[10px] text-red-400 uppercase">Raw Accelerometer (Noisy)</span>
              <p className="text-2xl font-black text-red-400 font-mono">{rawAcc.toFixed(1)}°</p>
              <span className="text-[10px] text-gray-500 font-mono block">Sensitive to motor acoustic vibrations</span>
            </div>

            <div className="bg-[#080a0f] p-4 rounded-xl border border-amber-500/20 space-y-1">
              <span className="font-mono text-[10px] text-amber-400 uppercase">Raw Gyro Integration (Drift)</span>
              <p className="text-2xl font-black text-amber-400 font-mono">{rawGyro.toFixed(1)}°</p>
              <span className="text-[10px] text-gray-500 font-mono block">Accumulates DC integration drift</span>
            </div>

            <div className="bg-[#080a0f] p-4 rounded-xl border border-neon/40 space-y-1 shadow-[0_0_15px_rgba(0,255,102,0.1)]">
              <span className="font-mono text-[10px] text-neon uppercase font-bold">Filtered Attitude</span>
              <p className="text-2xl font-black text-neon font-mono">{fusedAngle.toFixed(1)}°</p>
              <span className="text-[10px] text-gray-400 font-mono block">Optimal low-pass & high-pass fusion</span>
            </div>
          </div>

          <div className="space-y-2 bg-[#0e111a] p-5 rounded-2xl border border-[#1f283d] font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-gray-300">Filter Coefficient ($\alpha$): <strong>{filterAlpha.toFixed(2)}</strong></span>
              <span className="text-neon">{Math.round(filterAlpha * 100)}% Gyro / {Math.round((1 - filterAlpha) * 100)}% Acc</span>
            </div>
            <input
              type="range"
              min="0.80"
              max="0.99"
              step="0.01"
              value={filterAlpha}
              onChange={(e) => setFilterAlpha(Number(e.target.value))}
              className="w-full accent-neon cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* --- MODULE 04: PROPULSION MATRIX --- */}
      {activeLab === 'thrust' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-[#0b0d14] border-2 border-[#1c2333] rounded-3xl p-6 sm:p-8 space-y-6">
            <h3 className="text-base font-bold font-mono text-white uppercase border-b border-[#1b2233] pb-3">
              Telemetry & Lift Capacity Results
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 font-mono">
              <div className="bg-[#080a0f] p-4 rounded-xl border border-[#1a2030]">
                <span className="text-[10px] text-gray-400 block">Total Quad Thrust</span>
                <span className="text-2xl font-black text-neon mt-1 block">{(totalThrust / 1000).toFixed(2)} kg</span>
              </div>
              <div className="bg-[#080a0f] p-4 rounded-xl border border-[#1a2030]">
                <span className="text-[10px] text-gray-400 block">Thrust-to-Weight (TWR)</span>
                <span className={`text-2xl font-black mt-1 block ${Number(twr) >= 2.0 ? 'text-neon' : 'text-amber-400'}`}>
                  {twr} : 1
                </span>
              </div>
              <div className="bg-[#080a0f] p-4 rounded-xl border border-[#1a2030] col-span-2 sm:col-span-1">
                <span className="text-[10px] text-gray-400 block">Max Safe Payload</span>
                <span className="text-2xl font-black text-white mt-1 block">{(maxPayload / 1000).toFixed(2)} kg</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#080a0f] border border-[#1a2030] text-xs font-mono space-y-1">
              <span className="text-gray-400">Flight Regime Classification:</span>
              <p className="text-neon font-bold">
                {Number(twr) >= 2.2 
                  ? '✓ Heavy-Lift Certified: Capable of stable autonomous waypoint tracking under payload.' 
                  : '⚠ Marginal TWR: Recommended for lightweight testing only, insufficient margin for heavy payloads.'}
              </p>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#0e111a] border border-[#1f283d] p-6 rounded-3xl space-y-4 font-mono text-xs">
            <h4 className="text-sm font-bold text-white uppercase border-b border-[#1f283d] pb-2">Hardware Inputs</h4>

            <div className="space-y-1">
              <label className="text-gray-400">Motor KV Rating: {motorKv} KV</label>
              <select
                value={motorKv}
                onChange={(e) => setMotorKv(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-[#07090e] border border-[#212b3e] text-white"
              >
                <option value={920}>920 KV (Long Endurance)</option>
                <option value={1000}>1000 KV (Standard Avionics)</option>
                <option value={1400}>1400 KV (High Agile Thrust)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-gray-400">Battery Configuration: {batteryCells}S LiPo ({nominalVoltage.toFixed(1)}V)</label>
              <select
                value={batteryCells}
                onChange={(e) => setBatteryCells(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-[#07090e] border border-[#212b3e] text-white"
              >
                <option value={3}>3S LiPo (11.1V Nominal)</option>
                <option value={4}>4S LiPo (14.8V High-Discharge)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-gray-400">Propeller Diameter: {propSize} inches</label>
              <input
                type="range"
                min="8"
                max="12"
                step="1"
                value={propSize}
                onChange={(e) => setPropSize(Number(e.target.value))}
                className="w-full accent-neon cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <label className="text-gray-400">All-Up Dry Airframe Weight: {droneDryWeight}g</label>
              <input
                type="range"
                min="800"
                max="2500"
                step="50"
                value={droneDryWeight}
                onChange={(e) => setDroneDryWeight(Number(e.target.value))}
                className="w-full accent-neon cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}