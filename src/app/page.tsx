'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Radio, 
  Cpu, 
  Compass, 
  Zap, 
  CheckCircle2, 
  Phone, 
  Calendar, 
  MapPin, 
  Award, 
  HelpCircle,
  Layers
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
          '⚡ INTAKE OPEN: SEPTEMBER 2026 SCHEDULE • EARLY BIRD 70% OFF (₹300 FOR FIRST 10 SEATS)',
          '📍 VENUE: GURU GOBIND SINGH COLLEGE OF ENGINEERING AND RESEARCH CENTRE, NASHIK',
          '🛸 HARDWARE: ESP32 + MPU6050 GYRO + 1000KV BRUSHLESS MOTORS & ESCs',
          '📞 HELP DESK COORDINATOR: SANIKA DUSANE (+91 7620350524)',
        ]);
      }

      // 2. Fetch master workshop details & posters
      const { data: wsData } = await supabase
        .from('workshops')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

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

  const workshopSlug = workshop?.id || 'aegis-master-workshop';

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
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neon/10 border border-neon/30 text-neon text-xs font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SEPTEMBER 2026 INTAKE • FIRST 10 SEATS ₹300 (70% OFF)</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight font-mono tracking-tight">
            Build The Brain. <br />
            Assemble The Frame. <br />
            <span className="text-neon">Master The Flight.</span>
          </h1>

          <p className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-xl font-sans">
            A comprehensive, practical avionics masterclass. Wire ESP32 flight controllers, calibrate 6-axis gyro sensors, configure brushless motors, and understand PID stability curves in a hands-on flight lab.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href={`/workshops/${workshopSlug}`}
              className="px-6 py-3.5 rounded-xl bg-neon font-bold flex items-center gap-2 hover:bg-[#00cc52] transition-all text-black text-xs uppercase tracking-wider cursor-pointer shadow-[0_0_25px_rgba(0,255,102,0.3)] font-mono"
            >
              <span>Register For September Batch</span>
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
              <span>No Prior Coding or Laptop Required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-neon" />
              <span>Open to All Branches & Academic Years</span>
            </div>
          </div>
        </div>

        {/* Dynamic Multi-Poster Carousel */}
        <div className="lg:col-span-5 bg-[#121212] border border-[#242424] rounded-3xl p-4 relative overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.8)]">
          <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-[#0a0a0a] group">
            {posters.length > 0 ? (
              <img
                src={posters[currentPosterIdx]}
                alt={`Aegis Workshop Poster ${currentPosterIdx + 1}`}
                className="w-full h-full object-cover transition-all duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs font-mono text-gray-500">
                Aegis Drone Avionics Poster
              </div>
            )}

            {posters.length > 1 && (
              <>
                <button
                  onClick={prevPoster}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 border border-white/20 text-white hover:bg-neon hover:text-black transition-all cursor-pointer backdrop-blur-md"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextPoster}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 border border-white/20 text-white hover:bg-neon hover:text-black transition-all cursor-pointer backdrop-blur-md"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                  {posters.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentPosterIdx(idx)}
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

      {/* 3. Real-World Flight Hardware & Lab Stack */}
      <div className="border-t border-[#1a1f2c] bg-[#08090e] py-16">
        <div className="max-w-7xl mx-auto px-6 space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-neon font-mono text-xs font-bold uppercase tracking-widest">
              HARDWARE TELEMETRY
            </span>
            <h2 className="text-3xl font-black text-white font-mono uppercase">
              Physical Avionics Hardware Handled In Lab
            </h2>
            <p className="text-xs text-gray-400 font-sans">
              You will not just sit through slides. Every pilot participates in hands-on wiring, sensor calibration, and thrust optimization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-[#10131d] border border-[#202738] p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-neon/10 border border-neon/30 flex items-center justify-center text-neon">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="font-mono text-base font-bold text-white uppercase">ESP32 Core Controller</h3>
              <p className="text-xs text-gray-400 leading-relaxed font-sans">
                Master 32-bit dual-core architecture, GPIO pinouts, flight state algorithms, and high-frequency PWM control loops.
              </p>
            </div>

            <div className="bg-[#10131d] border border-[#202738] p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-neon/10 border border-neon/30 flex items-center justify-center text-neon">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="font-mono text-base font-bold text-white uppercase">MPU6050 6-Axis Gyro</h3>
              <p className="text-xs text-gray-400 leading-relaxed font-sans">
                Real-time pitch, roll, and yaw calculation using 3-axis accelerometer and gyro fusion with I2C bus communications.
              </p>
            </div>

            <div className="bg-[#10131d] border border-[#202738] p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-neon/10 border border-neon/30 flex items-center justify-center text-neon">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-mono text-base font-bold text-white uppercase">1000KV BLDC Motors</h3>
              <p className="text-xs text-gray-400 leading-relaxed font-sans">
                High-torque 3-phase brushless DC motors, dynamic thrust ratio calculations, and propeller aerodynamic matching.
              </p>
            </div>

            <div className="bg-[#10131d] border border-[#202738] p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-neon/10 border border-neon/30 flex items-center justify-center text-neon">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-mono text-base font-bold text-white uppercase">Electronic Speed Control</h3>
              <p className="text-xs text-gray-400 leading-relaxed font-sans">
                30A ESC firmware calibration, battery power distribution breakout, and responsive throttle curve safety cutoffs.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. 3-Stage Engineering Curriculum Breakdown */}
      <div className="py-16 max-w-7xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-neon font-mono text-xs font-bold uppercase tracking-widest">
            SESSION ROADMAP
          </span>
          <h2 className="text-3xl font-black text-white font-mono uppercase">
            From Raw Electronics To Live Flight
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stage 1 */}
          <div className="bg-[#0e1017] border border-[#1f2638] rounded-2xl p-7 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#1b2233] pb-3">
                <span className="font-mono text-xs font-bold text-neon uppercase tracking-wider">MODULE 01</span>
                <span className="px-2 py-0.5 rounded bg-neon/10 text-neon font-mono text-[10px] font-bold">AVIONICS LOGIC</span>
              </div>
              <h3 className="text-xl font-bold text-white font-mono uppercase">Build The Brain</h3>
              <ul className="space-y-2.5 text-xs text-gray-400 font-sans">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-neon shrink-0 mt-0.5" />
                  <span>ESP32 flight microcontroller wiring & power architecture.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-neon shrink-0 mt-0.5" />
                  <span>Interfacing MPU6050 Gyro + Accelerometer via I2C protocol.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-neon shrink-0 mt-0.5" />
                  <span>Reading live sensor telemetry and pitch-roll-yaw orientation.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Stage 2 */}
          <div className="bg-[#0e1017] border border-[#1f2638] rounded-2xl p-7 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#1b2233] pb-3">
                <span className="font-mono text-xs font-bold text-neon uppercase tracking-wider">MODULE 02</span>
                <span className="px-2 py-0.5 rounded bg-neon/10 text-neon font-mono text-[10px] font-bold">AERODYNAMICS</span>
              </div>
              <h3 className="text-xl font-bold text-white font-mono uppercase">Assemble The Body</h3>
              <ul className="space-y-2.5 text-xs text-gray-400 font-sans">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-neon shrink-0 mt-0.5" />
                  <span>Quadcopter airframe geometry, center of gravity (CoG) & balance.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-neon shrink-0 mt-0.5" />
                  <span>Mounting 1000KV brushless motors & 30A ESC speed controllers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-neon shrink-0 mt-0.5" />
                  <span>Power distribution wiring and safe LiPo voltage regulation.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Stage 3 */}
          <div className="bg-[#0e1017] border border-[#1f2638] rounded-2xl p-7 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#1b2233] pb-3">
                <span className="font-mono text-xs font-bold text-neon uppercase tracking-wider">MODULE 03</span>
                <span className="px-2 py-0.5 rounded bg-neon/10 text-neon font-mono text-[10px] font-bold">LIVE STABILIZATION</span>
              </div>
              <h3 className="text-xl font-bold text-white font-mono uppercase">Test, Tune & Fly</h3>
              <ul className="space-y-2.5 text-xs text-gray-400 font-sans">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-neon shrink-0 mt-0.5" />
                  <span>Proportional-Integral-Derivative (PID) tuning for stable hover.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-neon shrink-0 mt-0.5" />
                  <span>Throttle response calibration and fail-safe safety triggers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-neon shrink-0 mt-0.5" />
                  <span>Live demonstration flight with telemetry verification.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Pricing & Intake Logistics Matrix */}
      <div className="border-t border-[#1a1f2c] bg-[#08090e] py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-[#10131d] border-2 border-neon/40 rounded-3xl p-8 sm:p-12 shadow-[0_0_50px_rgba(0,255,102,0.1)] grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            <div className="md:col-span-7 space-y-5">
              <div className="inline-block px-3 py-1 rounded-md bg-neon/10 border border-neon/30 text-neon font-mono text-xs font-bold uppercase">
                LIMITED COHORT CAPACITY
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white font-mono uppercase">
                September 2026 Intake Pass
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 font-sans leading-relaxed">
                To guarantee full hands-on access to test gear and flight benches, each batch is capped strictly at <strong>20 seats</strong>.
              </p>

              <div className="space-y-2.5 text-xs font-mono text-gray-300">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-neon shrink-0" />
                  <span>Intake Schedule: <strong>September 2026</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-neon shrink-0" />
                  <span>Guru Gobind Singh College of Engineering and Research Centre, Nashik</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-neon shrink-0" />
                  <span>Aegis Avionics Certificate Awarded</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-neon shrink-0" />
                  <span>Coordinator Desk: <strong>Sanika Dusane (+91 7620350524)</strong></span>
                </div>
              </div>
            </div>

            <div className="md:col-span-5 bg-[#08090e] border border-[#232a3c] rounded-2xl p-6 text-center space-y-5">
              <div className="space-y-1">
                <span className="text-xs text-gray-500 font-mono line-through uppercase">Standard Fee: ₹1,000</span>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-3xl sm:text-4xl font-black text-neon font-mono">₹300</span>
                  <span className="text-xs text-gray-400 font-mono">/ Pilot</span>
                </div>
                <p className="text-[11px] font-mono text-neon font-bold">
                  ★ 70% Early Bird (First 10 Seats) • Later ₹500
                </p>
              </div>

              <div className="text-left text-[11px] font-mono text-gray-400 bg-[#121622] p-3 rounded-xl space-y-1 border border-[#1e2536]">
                <p>• Spot cash or instant online entry</p>
                <p>• Scannable QR pass to your email</p>
                <p>• Open to all colleges, diploma & schools</p>
              </div>

              <Link
                href={`/workshops/${workshopSlug}`}
                className="w-full py-3.5 rounded-xl bg-neon font-bold flex items-center justify-center gap-2 hover:bg-[#00cc52] transition-all text-black text-xs uppercase tracking-wider cursor-pointer shadow-[0_0_20px_rgba(0,255,102,0.3)] font-mono"
              >
                <span>Claim Clearance Pass</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>
      </div>

      {/* 6. Frequently Asked Questions */}
      <div className="py-16 max-w-5xl mx-auto px-6 space-y-10">
        <div className="text-center space-y-2">
          <span className="text-neon font-mono text-xs font-bold uppercase tracking-widest">
            PILOT BRIEFING
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
              No prior experience is necessary. Everything is taught hands-on from scratch, starting from basic electronics to flight stabilization.
            </p>
          </div>

          <div className="bg-[#0e1017] border border-[#1f2638] p-6 rounded-2xl space-y-2">
            <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-neon shrink-0" />
              Do I need to bring a laptop or tools?
            </h4>
            <p className="text-xs text-gray-400 font-sans leading-relaxed pl-6">
              No tools or laptops are required. All flight controllers, motors, sensors, and testing equipment will be provided inside the lab.
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

          <div className="bg-[#0e1017] border border-[#1f2638] p-6 rounded-2xl space-y-2">
            <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-neon shrink-0" />
              How is attendance and pass verified?
            </h4>
            <p className="text-xs text-gray-400 font-sans leading-relaxed pl-6">
              Once registered, your seat is reserved. On event day, present your Clearance ID or digital QR pass at the entrance gate scanner for check-in.
            </p>
          </div>
        </div>
      </div>

      {/* 7. Footer & Desk Help Line */}
      <footer className="border-t border-[#1a1f2c] bg-[#040507] py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <span className="font-mono text-sm font-black text-white uppercase tracking-wider">
              AEGIS DRONE AVIONICS
            </span>
            <p className="text-xs text-gray-500 font-mono">
              Guru Gobind Singh College of Engineering and Research Centre, Nashik
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-gray-400">
            <a
              href="tel:+917620350524"
              className="flex items-center gap-1.5 hover:text-neon transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-neon" />
              <span>Coordinator: Sanika Dusane (+91 7620350524)</span>
            </a>
            <span className="text-gray-700">|</span>
            <Link
              href="/auth?role=admin"
              className="hover:text-neon transition-colors"
            >
              Admin Desk
            </Link>
          </div>
        </div>
      </footer>

    </div>
  );
}