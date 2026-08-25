'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  RotateCcw, 
  Wind, 
  Cpu, 
  Activity, 
  Radio, 
  Gauge, 
  AlertTriangle, 
  Sliders, 
  Terminal,
  ShieldAlert,
  Flame
} from 'lucide-react';

interface TelemetryPoint {
  t: number;
  altitude: number;
  setpoint: number;
  motorAvg: number;
  rollAngle: number;
}

export default function DroneSimulator() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const graphCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Flight State Vectors
  const [isRunning, setIsRunning] = useState(false);
  const [throttle, setThrottle] = useState(52); // PWM Target %
  const [targetAltitude, setTargetAltitude] = useState(15.0); // Meters
  const [rollTrim, setRollTrim] = useState(0); // Degrees

  // PID Loop Tuning Knobs
  const [kp, setKp] = useState(2.4);
  const [ki, setKi] = useState(0.08);
  const [kd, setKd] = useState(1.6);
  const [windActive, setWindActive] = useState(false);

  // Live Avionics Telemetry (Read-only sensors)
  const [telemetry, setTelemetry] = useState({
    alt: 0.0,
    velY: 0.0,
    roll: 0.0,
    omega: 0.0,
    accZ: 0.0,
    m1: 0,
    m2: 0,
    m3: 0,
    m4: 0,
    loopHz: 500,
    batteryV: 16.6,
    currentA: 0.0,
    state: 'DISARMED' as 'DISARMED' | 'FLIGHT_ACTIVE' | 'ESTOP_CRASH' | 'HOVER_LOCKED',
  });

  // Physics Simulation Vector Refs
  const simState = useRef({
    y: 0.0,        // Altitude in meters (0 to 30)
    vy: 0.0,       // Vertical velocity (m/s)
    roll: 0.0,     // Angle in degrees (-45 to +45)
    rollRate: 0.0, // deg/s
    integral: 0.0,
    lastError: 0.0,
    time: 0,
    history: [] as TelemetryPoint[],
  });

  const animFrameId = useRef<number | null>(null);

  const handleReset = () => {
    setIsRunning(false);
    simState.current = {
      y: 0.0,
      vy: 0.0,
      roll: 0.0,
      rollRate: 0.0,
      integral: 0.0,
      lastError: 0.0,
      time: 0,
      history: [],
    };
    setTelemetry({
      alt: 0.0,
      velY: 0.0,
      roll: 0.0,
      omega: 0.0,
      accZ: 0.0,
      m1: 0,
      m2: 0,
      m3: 0,
      m4: 0,
      loopHz: 500,
      batteryV: 16.6,
      currentA: 0.0,
      state: 'DISARMED',
    });
  };

  useEffect(() => {
    let lastTimestamp = performance.now();

    const physicsStep = (now: number) => {
      const dt = Math.min((now - lastTimestamp) / 1000, 0.05); // Fixed time delta (max 50ms)
      lastTimestamp = now;

      if (isRunning) {
        const s = simState.current;
        s.time += dt;

        // 1. Environmental Forces & Atmospheric Wind Gusts
        const mass = 1.35; // kg (Aegis Quadrotor mass)
        const gravity = 9.80665; // m/s^2
        const dragCoeff = 0.32;
        const windGust = windActive 
          ? (Math.sin(s.time * 2.5) * 4.5 + Math.cos(s.time * 6.2) * 2.8 + (Math.random() - 0.5) * 3.0) 
          : 0.0;

        // 2. Discrete PID Altitude & Attitude Controller
        const error = targetAltitude - s.y;
        s.integral = Math.max(-15, Math.min(15, s.integral + error * dt)); // Anti-windup
        const derivative = (error - s.lastError) / dt;
        s.lastError = error;

        // Baseline hover throttle equilibrium + PID output
        const pidOutput = kp * error + ki * s.integral + kd * derivative;
        const basePwm = Math.max(0, Math.min(100, (throttle * 0.7) + (pidOutput * 2.5)));

        // 3. 4-Motor ESC Quad-X Differential Thrust Allocation
        const rollError = rollTrim - (s.roll + windGust * 0.4);
        const rollCorrection = rollError * 0.8;

        const m1 = Math.max(0, Math.min(100, basePwm - rollCorrection)); // Front-Right (CCW)
        const m2 = Math.max(0, Math.min(100, basePwm + rollCorrection)); // Rear-Right (CW)
        const m3 = Math.max(0, Math.min(100, basePwm + rollCorrection)); // Rear-Left (CCW)
        const m4 = Math.max(0, Math.min(100, basePwm - rollCorrection)); // Front-Left (CW)

        // 4. Aerodynamic Lift & Vertical Acceleration Integration
        const totalThrustKg = ((m1 + m2 + m3 + m4) / 400) * 3.4; // Max 3.4kg combined thrust
        const thrustForceN = totalThrustKg * gravity * Math.cos((s.roll * Math.PI) / 180);
        const dragForceN = 0.5 * dragCoeff * s.vy * Math.abs(s.vy);
        const netAccY = (thrustForceN - dragForceN) / mass - gravity;

        s.vy += netAccY * dt;
        s.y += s.vy * dt;

        // Roll Dynamics Integration
        s.rollRate += (rollCorrection * 12 - s.rollRate * 3.2 + windGust * 8) * dt;
        s.roll += s.rollRate * dt;

        // 5. Boundary Condition Collisions & Ground Contact
        let currentState: 'FLIGHT_ACTIVE' | 'ESTOP_CRASH' | 'HOVER_LOCKED' = 'FLIGHT_ACTIVE';

        if (s.y <= 0) {
          s.y = 0;
          s.vy = 0;
          s.roll = 0;
          s.rollRate = 0;
          if (basePwm < 15) {
            currentState = 'FLIGHT_ACTIVE';
          }
        } else if (s.y >= 28) {
          s.y = 28;
          s.vy = 0;
          currentState = 'ESTOP_CRASH';
          setIsRunning(false);
        }

        if (Math.abs(s.roll) > 42) {
          currentState = 'ESTOP_CRASH';
          setIsRunning(false);
        } else if (Math.abs(error) < 0.35 && Math.abs(s.vy) < 0.25 && s.y > 1.0) {
          currentState = 'HOVER_LOCKED';
        }

        // Electrical Sensor Telemetry
        const currentDrawA = 3.2 + ((m1 + m2 + m3 + m4) / 400) * 28.5;
        const battDrop = 16.6 - (currentDrawA * 0.015);

        // Record history for oscilloscope trace
        s.history.push({
          t: s.time,
          altitude: s.y,
          setpoint: targetAltitude,
          motorAvg: (m1 + m2 + m3 + m4) / 4,
          rollAngle: s.roll,
        });
        if (s.history.length > 100) s.history.shift();

        setTelemetry({
          alt: s.y,
          velY: s.vy,
          roll: s.roll,
          omega: s.rollRate,
          accZ: netAccY,
          m1: Math.round(m1),
          m2: Math.round(m2),
          m3: Math.round(m3),
          m4: Math.round(m4),
          loopHz: Math.round(1 / dt),
          batteryV: Number(battDrop.toFixed(2)),
          currentA: Number(currentDrawA.toFixed(1)),
          state: currentState,
        });
      }

      // 6. High-Precision HUD & Visual Canvas Render
      renderCanvas();
      renderOscilloscope();

      animFrameId.current = requestAnimationFrame(physicsStep);
    };

    animFrameId.current = requestAnimationFrame(physicsStep);
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isRunning, throttle, targetAltitude, rollTrim, kp, ki, kd, windActive]);

  // 2D Flight Arena Canvas
  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Grid Matrix Background
    ctx.strokeStyle = '#141c2c';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Target Setpoint Altitude Guideline
    const maxMeters = 25.0;
    const setpointPx = h - 25 - (targetAltitude / maxMeters) * (h - 60);
    ctx.strokeStyle = 'rgba(0, 255, 102, 0.4)';
    ctx.setLineDash([6, 6]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(40, setpointPx);
    ctx.lineTo(w - 20, setpointPx);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#00ff66';
    ctx.font = '10px monospace';
    ctx.fillText(`TARGET ALTITUDE: ${targetAltitude.toFixed(1)}m`, 45, setpointPx - 5);

    // Altitude Elevation Scale (Left Rail)
    ctx.fillStyle = '#4b5563';
    ctx.font = '9px monospace';
    for (let altMark = 0; altMark <= 25; altMark += 5) {
      const markY = h - 25 - (altMark / maxMeters) * (h - 60);
      ctx.fillText(`${altMark}m`, 10, markY + 3);
      ctx.fillRect(30, markY, 6, 1);
    }

    // Ground Platform
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(30, h - 25, w - 50, 4);
    ctx.fillStyle = '#00ff66';
    ctx.fillRect(w / 2 - 40, h - 25, 80, 2);

    // Compute Drone Visual Translation
    const droneYPx = h - 25 - (simState.current.y / maxMeters) * (h - 60);
    const droneXPx = w / 2;
    const rollRad = (simState.current.roll * Math.PI) / 180;

    ctx.save();
    ctx.translate(droneXPx, droneYPx);
    ctx.rotate(rollRad);

    // Thrust Plumes
    if (isRunning && simState.current.y > 0.05) {
      const avgMotor = (telemetry.m1 + telemetry.m2 + telemetry.m3 + telemetry.m4) / 4;
      ctx.fillStyle = 'rgba(0, 255, 102, 0.25)';
      ctx.beginPath();
      ctx.moveTo(-35, 6);
      ctx.lineTo(-30, 6 + avgMotor * 0.35);
      ctx.lineTo(-25, 6);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(25, 6);
      ctx.lineTo(30, 6 + avgMotor * 0.35);
      ctx.lineTo(35, 6);
      ctx.fill();
    }

    // Quadrotor Chassis Body
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#00ff66';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-42, -5, 84, 10, 4);
    ctx.fill();
    ctx.stroke();

    // Central Avionics Core
    ctx.fillStyle = '#020617';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.fillRect(-12, -10, 24, 10);
    ctx.strokeRect(-12, -10, 24, 10);

    // LED Status Beacon
    ctx.fillStyle = telemetry.state === 'ESTOP_CRASH' ? '#ef4444' : '#00ff66';
    ctx.beginPath();
    ctx.arc(0, -5, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Rotors
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-45, -6);
    ctx.lineTo(-15, -6);
    ctx.moveTo(15, -6);
    ctx.lineTo(45, -6);
    ctx.stroke();

    ctx.restore();
  };

  // Live Oscilloscope Telemetry Trace
  const renderOscilloscope = () => {
    const canvas = graphCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Graph Backdrop
    ctx.fillStyle = '#05070c';
    ctx.fillRect(0, 0, w, h);

    const history = simState.current.history;
    if (history.length < 2) return;

    // Grid center line
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();

    // Draw Altitude Signal (Neon Green)
    ctx.strokeStyle = '#00ff66';
    ctx.lineWidth = 2;
    ctx.beginPath();
    history.forEach((pt, i) => {
      const x = (i / 100) * w;
      const y = h - (pt.altitude / 25) * h;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw Setpoint Line (Blue dashed)
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    history.forEach((pt, i) => {
      const x = (i / 100) * w;
      const y = h - (pt.setpoint / 25) * h;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);
  };

  return (
    <div className="bg-[#080b11] border-2 border-[#1c2438] hover:border-neon/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] transition-all">
      
      {/* Top Telemetry Flight Ribbon */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 border-b border-[#1b2336] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-neon/10 border border-neon/30 text-neon font-mono text-[10px] font-bold uppercase tracking-wider">
              HIL Avionics Flight Simulator
            </span>
            <span className="px-2.5 py-0.5 rounded bg-[#131b2c] border border-[#212f4d] text-cyan-400 font-mono text-[10px] font-bold">
              Xtensa 500Hz Loop
            </span>
          </div>
          <h3 className="text-xl font-black text-white font-mono uppercase tracking-tight mt-1 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-neon" />
            ESP32 6-DOF Closed-Loop Flight Dynamics Bench
          </h3>
        </div>

        {/* Status Indicator Pill */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 font-bold ${
            telemetry.state === 'HOVER_LOCKED' 
              ? 'bg-neon/10 border-neon text-neon shadow-[0_0_15px_rgba(0,255,102,0.2)]'
              : telemetry.state === 'FLIGHT_ACTIVE'
              ? 'bg-sky-500/10 border-sky-500 text-sky-400 animate-pulse'
              : telemetry.state === 'ESTOP_CRASH'
              ? 'bg-red-500/10 border-red-500 text-red-400'
              : 'bg-gray-800/40 border-gray-700 text-gray-400'
          }`}>
            <span className="w-2 h-2 rounded-full bg-current"></span>
            <span>{telemetry.state.replace('_', ' ')}</span>
          </div>
        </div>
      </div>

      {/* Primary Simulator Workbench Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Col: Visual Arena + Oscilloscope (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Visual Flight Cage */}
          <div className="relative rounded-2xl overflow-hidden border border-[#1d273d] bg-[#05070d]">
            <canvas 
              ref={canvasRef} 
              width={560} 
              height={260} 
              className="w-full h-64 block"
            />
            {/* Realtime HUD Altitude Readout */}
            <div className="absolute top-3 right-3 bg-[#0a0f1d]/90 border border-[#202d47] p-2.5 rounded-xl font-mono text-[11px] space-y-1 backdrop-blur-sm">
              <div className="text-gray-400 flex justify-between gap-3">
                <span>IMU Altitude:</span>
                <strong className="text-white">{telemetry.alt.toFixed(2)} m</strong>
              </div>
              <div className="text-gray-400 flex justify-between gap-3">
                <span>Vertical Vel:</span>
                <strong className="text-neon">{telemetry.velY.toFixed(2)} m/s</strong>
              </div>
              <div className="text-gray-400 flex justify-between gap-3">
                <span>Roll Axis:</span>
                <strong className={Math.abs(telemetry.roll) > 20 ? 'text-amber-400' : 'text-cyan-400'}>
                  {telemetry.roll.toFixed(1)}°
                </strong>
              </div>
            </div>
          </div>

          {/* Real-time Oscilloscope Telemetry Trace */}
          <div className="bg-[#070a12] border border-[#1b2438] p-3 rounded-2xl space-y-2">
            <div className="flex justify-between items-center text-[10px] font-mono text-gray-400">
              <span className="flex items-center gap-1.5 text-neon font-bold">
                <Activity className="w-3.5 h-3.5" /> LIVE TELEMETRY OSCILLOSCOPE (Z-ALTITUDE vs TARGET)
              </span>
              <span>100 Samples / 50ms Step</span>
            </div>
            <canvas 
              ref={graphCanvasRef} 
              width={540} 
              height={70} 
              className="w-full h-16 rounded-lg block border border-[#141b2b]"
            />
          </div>

          {/* 4-Motor Quad-X ESC Commutation Ribbon */}
          <div className="grid grid-cols-4 gap-2 font-mono text-center">
            {[
              { label: 'M1 (FR)', pwm: telemetry.m1 },
              { label: 'M2 (RR)', pwm: telemetry.m2 },
              { label: 'M3 (RL)', pwm: telemetry.m3 },
              { label: 'M4 (FL)', pwm: telemetry.m4 },
            ].map((m, i) => (
              <div key={i} className="bg-[#0b0f19] border border-[#1c263d] p-2.5 rounded-xl space-y-1">
                <span className="text-[10px] text-gray-400 block">{m.label}</span>
                <span className="text-xs font-black text-neon">{m.pwm}%</span>
                <div className="w-full h-1.5 bg-[#141c2c] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-neon transition-all" 
                    style={{ width: `${m.pwm}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Cockpit Controller Knobs (5 Cols) */}
        <div className="lg:col-span-5 bg-[#090d16] border border-[#1e2840] p-5 rounded-2xl space-y-4 font-mono text-xs">
          
          <div className="flex justify-between items-center border-b border-[#1b253b] pb-2">
            <span className="font-bold text-white flex items-center gap-1.5 uppercase text-[11px]">
              <Sliders className="w-4 h-4 text-neon" /> Attitude PID Control Loop
            </span>
            <button
              onClick={() => { setKp(2.4); setKi(0.08); setKd(1.6); setTargetAltitude(15.0); }}
              className="text-[10px] text-gray-400 hover:text-neon flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Reset Gains
            </button>
          </div>

          {/* Target Altitude Setpoint */}
          <div className="space-y-1 bg-[#06080f] p-3 rounded-xl border border-[#182136]">
            <div className="flex justify-between text-gray-300">
              <span>Target Altitude Setpoint:</span>
              <span className="text-neon font-bold">{targetAltitude.toFixed(1)} m</span>
            </div>
            <input
              type="range"
              min="2.0"
              max="24.0"
              step="0.5"
              value={targetAltitude}
              onChange={(e) => setTargetAltitude(Number(e.target.value))}
              className="w-full accent-neon cursor-pointer"
            />
          </div>

          {/* PID Gains Sliders */}
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-gray-400 text-[11px]">
                <span>Proportional Gain ($K_p$):</span>
                <span className="text-cyan-400 font-bold">{kp.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="6.0"
                step="0.1"
                value={kp}
                onChange={(e) => setKp(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-gray-400 text-[11px]">
                <span>Integral Gain ($K_i$):</span>
                <span className="text-cyan-400 font-bold">{ki.toFixed(3)}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="0.3"
                step="0.01"
                value={ki}
                onChange={(e) => setKi(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-gray-400 text-[11px]">
                <span>Derivative Gain ($K_d$):</span>
                <span className="text-cyan-400 font-bold">{kd.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="4.0"
                step="0.1"
                value={kd}
                onChange={(e) => setKd(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Turbulence & Trim Injection */}
          <div className="pt-2 border-t border-[#1a2338] space-y-2">
            <button
              onClick={() => setWindActive(!windActive)}
              className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                windActive
                  ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                  : 'bg-[#121929] hover:bg-[#1a233a] text-gray-300 border border-[#243352]'
              }`}
            >
              <Wind className="w-4 h-4" />
              <span>{windActive ? 'Disable Cross-Wind Gusts' : 'Inject Atmospheric Wind Disturbance'}</span>
            </button>
          </div>

          {/* Master Arm / Disarm Engine Buttons */}
          <div className="pt-2 flex gap-2">
            {!isRunning ? (
              <button
                onClick={() => setIsRunning(true)}
                className="flex-1 py-3 rounded-xl bg-neon text-black font-bold text-xs uppercase hover:bg-[#00cc52] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,102,0.25)] cursor-pointer"
              >
                <Play className="w-4 h-4 fill-black" />
                <span>Arm FC & Launch</span>
              </button>
            ) : (
              <button
                onClick={() => setIsRunning(false)}
                className="flex-1 py-3 rounded-xl bg-amber-500 text-black font-bold text-xs uppercase hover:bg-amber-400 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Disarm Motors</span>
              </button>
            )}

            <button
              onClick={handleReset}
              className="px-4 py-3 rounded-xl bg-[#141c2c] hover:bg-[#1e2940] text-gray-300 transition-colors cursor-pointer border border-[#243352]"
              title="Full Hardware Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Engineering Workshop Boundary Notice (The "Why the Lab Workshop is Still Needed" Section) */}
      <div className="bg-[#0b101c] border border-cyan-500/30 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-cyan-400 font-bold">
            <Terminal className="w-4 h-4" />
            <span>Simulation vs Real-World Hardware Boundary</span>
          </div>
          <p className="text-[11px] text-gray-400 max-w-3xl leading-relaxed">
            In-browser math validates discrete PID loops in ideal conditions. In the physical workshop at GCOERC, attendees master non-ideal physics: <strong>soldering high-discharge ESCs, eliminating DMA bus contention on ESP32 silicon, and zeroing MPU6050 vibration harmonics on carbon-fiber frames.</strong>
          </p>
        </div>
      </div>

    </div>
  );
}