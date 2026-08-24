'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Sparkles, ChevronLeft, ChevronRight, Radio } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function HomePage() {
  const [workshop, setWorkshop] = useState<any>(null);
  const [notices, setNotices] = useState<string[]>([]);
  const [posters, setPosters] = useState<string[]>([]);
  const [currentPosterIdx, setCurrentPosterIdx] = useState(0);

  useEffect(() => {
    async function loadMasterData() {
      // 1. Fetch active notices for marquee ticker
      const { data: noticesData } = await supabase
        .from('notices')
        .select('text')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (noticesData && noticesData.length > 0) {
        setNotices(noticesData.map((n) => n.text));
      } else {
        setNotices([
          '⚡ REGISTRATIONS OPEN: AEGIS DRONE AVIONICS MASTER WORKSHOP • LIMITED TO 20 SEATS PER COHORT',
          '📍 VENUE: GCOERC AVIONICS RESEARCH LAB, NASHIK • LIVE FLIGHT SESSIONS & PID CALIBRATION',
        ]);
      }

      // 2. Fetch master workshop & posters
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

  // Auto-cycle carousel if multiple posters exist
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

  const fee = workshop?.fee || 300;
  const workshopSlug = workshop?.id || 'aegis-master-workshop';

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-between selection:bg-neon selection:text-black font-sans">
      
      {/* Dynamic Moving Marquee Ticker */}
      <div className="bg-[#0e1610] border-b border-neon/30 py-2.5 overflow-hidden relative flex items-center shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div className="z-10 bg-[#0e1610] px-4 flex items-center gap-1.5 border-r border-neon/30 shrink-0 text-neon font-mono text-xs font-bold uppercase tracking-wider">
          <Radio className="w-3.5 h-3.5 animate-pulse text-neon" />
          <span>Notice Desk</span>
        </div>

        <div className="flex overflow-hidden whitespace-nowrap w-full">
          <div className="inline-block animate-marquee font-mono text-xs text-gray-300">
            {notices.join('  ✦  ')}
          </div>
          <div className="inline-block animate-marquee2 font-mono text-xs text-gray-300">
            {notices.join('  ✦  ')}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center flex-1">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neon/10 border border-neon/30 text-neon text-xs font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AEGIS DRONE WORKSHOP • REGISTRATIONS OPEN (₹{fee})</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white leading-tight font-mono">
            Gear Up. Code It. <br />
            <span className="text-neon">Build It. Fly It.</span>
          </h1>

          <p className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-xl font-sans">
            Hands-on flight computer assembly, ESP32 sensor telemetry, PID tuning, and live drone flight calibration.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href={`/workshops/${workshopSlug}`}
              className="px-6 py-3.5 rounded-xl bg-neon font-bold flex items-center gap-2 hover:bg-[#00cc52] transition-all text-black text-xs uppercase tracking-wider cursor-pointer shadow-[0_0_25px_rgba(0,255,102,0.3)] font-mono"
            >
              <span>Explore Active Workshops</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/auth?role=admin"
              className="px-6 py-3.5 rounded-xl bg-[#181818] border border-[#2e2e2e] hover:border-neon text-gray-200 hover:text-white transition-all text-xs uppercase tracking-wider font-mono font-semibold"
            >
              Admin Command Desk
            </Link>
          </div>

          <div className="pt-4 flex items-center gap-6 text-xs text-gray-400 font-mono">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-neon" />
              <span>Collaborative Flight Lab Access</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-neon" />
              <span>Verified Flight Certificate</span>
            </div>
          </div>
        </div>

        {/* Dynamic Multiple Poster Carousel */}
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
                No posters configured
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
            Official Aegis Drone Workshop Announcement
          </p>
        </div>
      </div>
    </div>
  );
}