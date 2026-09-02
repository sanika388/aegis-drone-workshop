'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight, 
  Radio, 
  Cpu, 
  Compass, 
  Zap, 
  CheckCircle2, 
  HelpCircle,
  Code2,
  Weight
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function HomePage() {
  const [workshop, setWorkshop] = useState<any>(null);
  const [notices, setNotices] = useState<string[]>([]);
  const [posters, setPosters] = useState<string[]>([]);
  const [currentPosterIdx, setCurrentPosterIdx] = useState(0);

  useEffect(() => {
    async function loadMasterData() {
      // 1. Fetch active ticker notices from Supabase
      const { data: noticesData } = await supabase
        .from('notices')
        .select('text')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (noticesData && noticesData.length > 0) {
        setNotices(noticesData.map((n) => n.text));
      } else {
        setNotices([
          '⚡ INTAKE OPEN: SEPTEMBER 2026 SCHEDULE • FIRST 10 SEATS ₹300 (70% EARLY BIRD)',
          '🇮🇳 MAKE IN INDIA: 100% SCRATCH-BUILT FC + NATIVE FIRMWARE + 3D PRINTED HEAVY-LIFT CHASSIS (3KG+ PAYLOAD)',
          '📍 VENUE: GURU GOBIND SINGH COLLEGE OF ENGINEERING AND RESEARCH CENTRE, NASHIK',
          '🛸 TELEMETRY: ESP32 + MPU6050 GYRO + GPS NAVIGATION + HIGH-TORQUE BLDC PROPULSION',
          '📞 HELP DESK COORDINATOR: SANIKA DUSANE (+91 7620350524)',
        ]);
      }

      // 2. Fetch master workshop details & posters
      const { data: wsData } = await supabase
        .from('workshops')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (wsData) {
        setWorkshop(wsData);
        if (wsData.poster_images && wsData.poster_images.length > 0) {
          setPosters(wsData.poster_images);
        } else if (wsData.homepage_poster_url) {
          setPosters([wsData.homepage_poster_url]);
        }
      }
    }

    loadMasterData();
  }, []);

  // Auto-cycle poster carousel every 5s if multiple exist
  useEffect(() => {
    if (posters.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentPosterIdx((prev) => (prev + 1) % posters.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [posters]);

  const prevPoster = () => {
    setCurrentPosterIdx((prev) => (prev === 0 ? posters.length - 1 : prev - 1));
  };

  const nextPoster = () => {
    setCurrentPosterIdx((prev) => (prev + 1) % posters.length);
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white flex flex-col justify-between selection:bg-neon selection:text-black font-sans">
      
      {/* 1. Dynamic Continuous Marquee Notice Ticker */}
      <div className="bg-[#0e1610] border-b border-neon/30 py-2.5 overflow-hidden relative flex items-center shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div className="z-20 bg-[#0e1610] px-4 flex items-center gap-1.5 border-r border-neon/30 shrink-0 text-neon font-mono text-xs font-bold uppercase tracking-wider shadow-[10px_0_15px_#0e1610]">
          <Radio className="w-3.5 h-3.5 animate-pulse text-neon" />
          <span>Notice Desk</span>
        </div>

        <div className="overflow-hidden flex flex-1">
          <div className="animate-marquee-track font-mono text-xs text-gray-300">
            <span className="mx-4">{notices.join('  ✦  ')}</span>
            <span className="mx-4">✦</span>
            <span className="mx-4">{notices.join('  ✦  ')}</span>
            <span className="mx-4">✦</span>
          </div>
          <div className="animate-marquee-track font-mono text-xs text-gray-300" aria-hidden="true">
            <span className="mx-4">{notices.join('  ✦  ')}</span>
            <span className="mx-4">✦</span>
            <span className="mx-4">{notices.join('  ✦  ')}</span>
            <span className="mx-4">✦</span>
          </div>
        </div>
      </div>

      {/* 2. Hero Section */}
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          
          <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight font-mono tracking-tight">
            Build The Brain. <br />
            Assemble The Frame. <br />
            <span className="text-neon">Master The Flight.</span>
          </h1>

          <p className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-xl font-sans">
            A comprehensive, practical avionics workshop. Wire ESP32 flight controllers, calibrate 6-axis gyro sensors, configure brushless motors, and understand PID stability curves in a hands-on flight lab.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/workshops"
              className="px-6 py-3.5 rounded-xl bg-neon font-bold flex items-center gap-2 hover:bg-[#00cc52] transition-all text-black text-xs uppercase tracking-wider cursor-pointer shadow-[0_0_25px_rgba(0,255,102,0.3)] font-mono"
            >
              <span>Register Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/auth?role=admin"
              className="px-6 py-3.5 rounded-xl bg-[#141824] border border-[#2c364e] hover:border-neon text-gray-200 hover:text-white transition-all text-xs uppercase tracking-wider font-mono font-semibold"
            >
              Flight Desk Login
            </Link>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-gray-400 font-mono">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-neon" />
              <span>Open to All Branches & Academic Years</span>
            </div>
          </div>
        </div>

        {/* Dynamic Multi-Poster Showcase */}
        <div className="lg:col-span-5 bg-[#121212] border border-[#242424] rounded-3xl p-3 sm:p-4 relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col items-center justify-center transform-gpu">
          <div className="relative w-full rounded-2xl overflow-hidden bg-[#0a0a0a] flex items-center justify-center min-h-[480px] max-h-[720px] group border border-[#1e2330] transform-gpu will-change-transform">
            
            {posters.length > 0 ? (
              posters.map((posterUrl, idx) => (
                <img
                  key={idx}
                  src={posterUrl}
                  alt={`Aegis Workshop Poster ${idx + 1}`}
                  loading="eager"
                  decoding="sync"
                  className={`w-full h-auto max-h-[700px] object-contain rounded-xl transform-gpu transition-opacity duration-300 ${
                    currentPosterIdx === idx ? 'opacity-100 relative' : 'opacity-0 absolute inset-0 pointer-events-none'
                  }`}
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                  }}
                />
              ))
            ) : (
              <div className="w-full h-80 flex items-center justify-center text-xs font-mono text-gray-500">
                Aegis Drone Avionics Poster
              </div>
            )}

            {posters.length > 1 && (
              <>
                <button
                  onClick={prevPoster}
                  aria-label="Previous Poster"
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/80 border border-white/20 text-white hover:bg-neon hover:text-black transition-colors cursor-pointer backdrop-blur-md shadow-lg z-10"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextPoster}
                  aria-label="Next Poster"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/80 border border-white/20 text-white hover:bg-neon hover:text-black transition-colors cursor-pointer backdrop-blur-md shadow-lg z-10"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/60 px-3 py-1 rounded-full backdrop-blur-md border border-white/10 z-10">
                  {posters.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentPosterIdx(idx)}
                      aria-label={`Go to slide ${idx + 1}`}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        currentPosterIdx === idx ? 'w-5 bg-neon' : 'w-1.5 bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
          <p className="text-xs text-center text-gray-400 mt-3 font-mono">
            Official Aegis Avionics Workshop Intake Bulletin
          </p>
        </div>
      </div>

      {/* 3. Real-World Flight Hardware & Lab Telemetry Stack */}
      <div className="border-t border-[#1a1f2c] bg-[#08090e] py-16">
        <div className="max-w-7xl mx-auto px-6 space-y-10">
          <div className="text-center space-y-2 max-w-3xl mx-auto">
            <span className="text-neon font-mono text-xs font-bold uppercase tracking-widest">
              HARDWARE ARCHITECTURE
            </span>
            <h2 className="text-3xl font-black text-white font-mono uppercase">
              Scratch-Built Avionics & 3kg+ Payload Structure
            </h2>
            <p className="text-xs text-gray-400 font-sans">
              Promoting Indian engineering self-reliance. Learn how flight computers are fabricated from ground-up electronic components and high-thrust airframes are engineered to carry functional multi-kilogram payloads.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            
            {/* 1. Scratch Flight Controller */}
            <div className="bg-[#10131d] border border-[#202738] p-5 rounded-2xl space-y-3">
              <div className="w-9 h-9 rounded-xl bg-neon/10 border border-neon/30 flex items-center justify-center text-neon">
                <Cpu className="w-4 h-4" />
              </div>
              <h3 className="font-mono text-sm font-bold text-white uppercase">Scratch-Built Flight Controller</h3>
              <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
                ESP32 dual-core flight computer built from discrete components. No pre-assembled board.
              </p>
            </div>

            {/* 2. Self-Built Firmware */}
            <div className="bg-[#10131d] border border-[#202738] p-5 rounded-2xl space-y-3">
              <div className="w-9 h-9 rounded-xl bg-neon/10 border border-neon/30 flex items-center justify-center text-neon">
                <Code2 className="w-4 h-4" />
              </div>
              <h3 className="font-mono text-sm font-bold text-white uppercase">Self-Built Native Firmware</h3>
              <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
                Write line-by-line flight logic, interrupt timers, and custom PWM registers from scratch.
              </p>
            </div>

            {/* 3. 3D Printed 3kg+ Heavy-Lift Chassis */}
            <div className="bg-[#10131d] border border-neon/30 p-5 rounded-2xl space-y-3 shadow-[0_0_20px_rgba(0,255,102,0.06)]">
              <div className="w-9 h-9 rounded-xl bg-neon/10 border border-neon/30 flex items-center justify-center text-neon">
                <Weight className="w-4 h-4" />
              </div>
              <h3 className="font-mono text-sm font-bold text-white uppercase">3kg+ Heavy-Lift 3D Chassis</h3>
              <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
                High-stress reinforced 3D printed airframe designed for 3kg+ heavy payload capacity, vibration damping, and dynamic structural equilibrium.
              </p>
            </div>

            {/* 4. MPU6050 Gyro */}
            <div className="bg-[#10131d] border border-[#202738] p-5 rounded-2xl space-y-3">
              <div className="w-9 h-9 rounded-xl bg-neon/10 border border-neon/30 flex items-center justify-center text-neon">
                <Compass className="w-4 h-4" />
              </div>
              <h3 className="font-mono text-sm font-bold text-white uppercase">6-Axis IMU Fusion (MPU6050)</h3>
              <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
                Real-time pitch, roll, and yaw calculation using accelerometer & gyro sensor fusion via I2C bus communications.
              </p>
            </div>

            {/* 5. High-Torque BLDC & ESCs */}
            <div className="bg-[#10131d] border border-[#202738] p-5 rounded-2xl space-y-3 md:col-span-2 lg:col-span-1">
              <div className="w-9 h-9 rounded-xl bg-neon/10 border border-neon/30 flex items-center justify-center text-neon">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="font-mono text-sm font-bold text-white uppercase">High-Torque BLDC Motors & ESCs</h3>
              <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
                High-thrust brushless propulsion matching heavy payload demands, fast throttle response, and LiPo power regulation.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* 4. 3-Stage Engineering Curriculum Breakdown */}
      <div className="py-16 max-w-7xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-neon font-mono text-xs font-bold uppercase tracking-widest">
            WORKSHOP ROADMAP
          </span>
          <h2 className="text-3xl font-black text-white font-mono uppercase">
            From Bare Components To Heavy-Lift Flight
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stage 1 */}
          <div className="bg-[#0e1017] border border-[#1f2638] rounded-2xl p-7 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#1b2233] pb-3">
                <span className="font-mono text-xs font-bold text-neon uppercase tracking-wider">MODULE 01</span>
              </div>
              <h3 className="text-xl font-bold text-white font-mono uppercase">Build The Brain From Scratch</h3>
              <ul className="space-y-2.5 text-xs text-gray-400 font-sans">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-neon shrink-0 mt-0.5" />
                  <span>Wiring & assembling the ESP32 flight controller board manually.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-neon shrink-0 mt-0.5" />
                  <span>Developing proprietary firmware, no ready-made flight stacks.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-neon shrink-0 mt-0.5" />
                  <span>Interfacing MPU6050 Gyro + GPS modules via I2C / UART registers.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Stage 2 */}
          <div className="bg-[#0e1017] border border-[#1f2638] rounded-2xl p-7 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#1b2233] pb-3">
                <span className="font-mono text-xs font-bold text-neon uppercase tracking-wider">MODULE 02</span>
              </div>
              <h3 className="text-xl font-bold text-white font-mono uppercase">Heavy-Lift Chassis & Body</h3>
              <ul className="space-y-2.5 text-xs text-gray-400 font-sans">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-neon shrink-0 mt-0.5" />
                  <span>3D printed quadcopter chassis engineered to lift 3kg+ functional payload.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-neon shrink-0 mt-0.5" />
                  <span>Mounting high-torque brushless motors & tuned ESC speed controllers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-neon shrink-0 mt-0.5" />
                  <span>Center of gravity (CoG) balancing under heavy dynamic loading.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Stage 3 */}
          <div className="bg-[#0e1017] border border-[#1f2638] rounded-2xl p-7 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#1b2233] pb-3">
                <span className="font-mono text-xs font-bold text-neon uppercase tracking-wider">MODULE 03</span>
              </div>
              <h3 className="text-xl font-bold text-white font-mono uppercase">Test, Tune & Fly</h3>
              <ul className="space-y-2.5 text-xs text-gray-400 font-sans">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-neon shrink-0 mt-0.5" />
                  <span>PID loop tuning calibrated for high-inertia stability and hover control.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-neon shrink-0 mt-0.5" />
                  <span>ESC calibration, gyro dampening, failsafe cutoffs & dynamic thrust optimization.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-neon shrink-0 mt-0.5" />
                  <span>Live flight demonstration with flight data calibration and telemetry verification.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Frequently Asked Questions */}
      <div className="py-16 max-w-5xl mx-auto px-6 space-y-10">
        <div className="text-center space-y-2">
          <span className="text-neon font-mono text-xs font-bold uppercase tracking-widest">
            BRIEFING
          </span>
          <h2 className="text-3xl font-black text-white font-mono uppercase">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#0e1017] border border-[#1f2638] p-6 rounded-2xl space-y-2">
            <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-neon shrink-0" />
              Do I need prior coding or drone experience?
            </h4>
            <p className="text-xs text-gray-400 font-sans leading-relaxed pl-6">
              No prior experience is necessary. Everything is taught hands-on from scratch, starting from basic electronics and firmware logic to flight stabilization.
            </p>
          </div>

          <div className="bg-[#0e1017] border border-[#1f2638] p-6 rounded-2xl space-y-2">
            <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-neon shrink-0" />
              Are we using ready-made flight controllers?
            </h4>
            <p className="text-xs text-gray-400 font-sans leading-relaxed pl-6">
              No. In alignment with Make in India, you will build the flight computer board from discrete components, write custom firmware, and assemble a 3D printed chassis capable of 3kg+ heavy payloads.
            </p>
          </div>

          <div className="bg-[#0e1017] border border-[#1f2638] p-6 rounded-2xl space-y-2">
            <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-neon shrink-0" />
              Do I need to bring a laptop or tools?
            </h4>
            <p className="text-xs text-gray-400 font-sans leading-relaxed pl-6">
              Bringing a laptop is completely optional, you may carry one if you wish to configure software, take notes, or save code directly on your machine. All drone frames, flight controller components, sensors, tools, and testing rigs are provided in the lab, so a laptop is not compulsory to participate.
            </p>
          </div>

          <div className="bg-[#0e1017] border border-[#1f2638] p-6 rounded-2xl space-y-2">
            <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-neon shrink-0" />
              How do I receive my workshop clearance pass?
            </h4>
            <p className="text-xs text-gray-400 font-sans leading-relaxed pl-6">
              Immediately after registering (via online payment or spot cash reservation), a digital pass containing your unique QR Clearance ID is generated on your profile dashboard and dispatched directly to your registered email.
            </p>
          </div>

          <div className="bg-[#0e1017] border border-[#1f2638] p-6 rounded-2xl space-y-2">
            <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-neon shrink-0" />
              Will I receive an official certificate?
            </h4>
            <p className="text-xs text-gray-400 font-sans leading-relaxed pl-6">
              Yes. Every attendee who completes the hands-on hardware assembly and flight testing tracks receives an official Aegis Certified Drone Avionics Credential.
            </p>
          </div>

          <div className="bg-[#0e1017] border border-[#1f2638] p-6 rounded-2xl space-y-2">
            <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-neon shrink-0" />
              How does Spot Cash reservation work?
            </h4>
            <p className="text-xs text-gray-400 font-sans leading-relaxed pl-6">
              Selecting Spot Cash reserves your seat in your assigned cohort immediately. You will receive a provisional Clearance ID and simply settle the registration fee in cash at the registration desk upon arriving at the lab.
            </p>
          </div>

          <div className="bg-[#0e1017] border border-[#1f2638] p-6 rounded-2xl space-y-2">
            <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-neon shrink-0" />
              Do we get to take the drone kit home?
            </h4>
            <p className="text-xs text-gray-400 font-sans leading-relaxed pl-6">
              This is an intensive hands-on training workshop where all high-grade flight controllers, sensor arrays, tools, and demonstration test rigs are provided for in-lab assembly and flight calibration. Drone kits are not takeaway items.
            </p>
          </div>

          <div className="bg-[#0e1017] border border-[#1f2638] p-6 rounded-2xl space-y-2">
            <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-neon shrink-0" />
              Who can participate in this intake?
            </h4>
            <p className="text-xs text-gray-400 font-sans leading-relaxed pl-6">
              The workshop is open to all engineering branches (FE to BE), polytechnic diploma students, and school students with a curiosity for robotics and aviation.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}