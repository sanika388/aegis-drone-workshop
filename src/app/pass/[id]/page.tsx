'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import confetti from 'canvas-confetti';
import { supabase } from '@/lib/supabaseClient';
import { ShieldCheck, Zap, Radio, CheckCircle, MapPin, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function InteractivePassPage() {
  const params = useParams();
  const passId = typeof params?.id === 'string' ? params.id : '';
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    async function fetchRegistration() {
      if (!passId) return;
      const { data: reg } = await supabase
        .from('registrations')
        .select('*')
        .eq('id', passId)
        .single();

      if (reg) {
        setData(reg);
      }
      setLoading(false);
    }
    fetchRegistration();
  }, [passId]);

  const triggerBlast = () => {
    setIsUnlocked(true);

    // 1. Center burst
    confetti({
      particleCount: 130,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#00ff66', '#00e5ff', '#ffffff', '#7000ff'],
    });

    // 2. Dual Side Cannons
    setTimeout(() => {
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 60,
        origin: { x: 0 },
        colors: ['#00ff66', '#ffffff'],
      });
      confetti({
        particleCount: 80,
        angle: 120,
        spread: 60,
        origin: { x: 1 },
        colors: ['#00ff66', '#ffffff'],
      });
    }, 200);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center font-mono text-neon text-sm">
        <div className="w-8 h-8 border-2 border-neon border-t-transparent rounded-full animate-spin mr-3"></div>
        DECRYPTING CLEARANCE PASS...
      </div>
    );
  }

  const studentName = data?.full_name || 'Pilot Attendee';
  const cohort = data?.cohort_label || 'Batch 1';
  const bookingId = data?.id || passId || 'AEGIS-B1-001';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    typeof window !== 'undefined' ? window.location.href : bookingId
  )}&bgcolor=08090d&color=00ff66`;

  return (
    <div className="min-h-screen bg-[#06070a] text-white flex flex-col items-center justify-center p-4 selection:bg-neon selection:text-black font-sans relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Card */}
      <div className="relative z-10 max-w-md w-full bg-[#0d0f14] border border-[#1f2430] rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-xl">
        
        {/* Top Header */}
        <div className="flex justify-between items-start border-b border-[#1b202c] pb-5">
          <div>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neon/10 border border-neon/30 text-neon font-mono text-[10px] font-bold w-fit uppercase">
              <Radio className="w-3 h-3 animate-pulse" /> Live Telemetry
            </div>
            <h1 className="text-xl font-black mt-2 tracking-tight text-white uppercase font-mono">
              Aegis Avionics Pass
            </h1>
          </div>
          <div className="bg-[#131722] border border-[#272f44] px-3 py-1.5 rounded-xl text-center">
            <span className="text-[9px] font-mono text-gray-500 uppercase block">Squad</span>
            <span className="text-sm font-black font-mono text-neon">{cohort}</span>
          </div>
        </div>

        {/* State: Locked vs Unlocked */}
        {!isUnlocked ? (
          <div className="py-10 text-center space-y-4">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-[#131722] border border-dashed border-neon/50 flex items-center justify-center text-neon shadow-[0_0_30px_rgba(0,255,102,0.15)] animate-pulse">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-mono">{studentName}</h2>
              <p className="text-xs text-gray-400 font-mono mt-1">Pass ID: <span className="text-neon font-bold">{bookingId}</span></p>
            </div>
            <button
              onClick={triggerBlast}
              className="w-full py-4 rounded-xl bg-neon text-black font-black text-xs uppercase tracking-widest font-mono hover:bg-[#00cc52] transition-all transform active:scale-95 shadow-[0_0_30px_rgba(0,255,102,0.4)] cursor-pointer flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-black" />
              <span>Unlock Clearance & Launch Blast</span>
            </button>
          </div>
        ) : (
          <div className="py-6 space-y-5 animate-in fade-in zoom-in-95 duration-500">
            {/* Telemetry Box */}
            <div className="bg-[#08090d] border border-neon/30 rounded-2xl p-4 space-y-3 font-mono">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">PILOT:</span>
                <span className="text-white font-bold">{studentName}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">CLEARANCE ID:</span>
                <span className="text-neon font-black">{bookingId}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">LAB ACCESS:</span>
                <span className="text-neon font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> CONFIRMED
                </span>
              </div>
            </div>

            {/* Event Info */}
            <div className="space-y-2 text-xs font-mono text-gray-400 bg-[#12151d] p-3.5 rounded-xl border border-[#1e2330]">
              <div className="flex items-center gap-2 text-gray-300">
                <Calendar className="w-4 h-4 text-neon shrink-0" />
                <span>September Month Intake</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <MapPin className="w-4 h-4 text-neon shrink-0" />
                <span>GCOERC Avionics Lab, Nashik</span>
              </div>
            </div>

            {/* Real Dynamic QR Image Box */}
            <div className="bg-[#08090d] border border-[#1b202c] p-4 rounded-xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-neon block uppercase font-bold">● Desk Telemetry QR</span>
                <span className="text-xs font-bold font-mono text-white">Present at Lab Entry</span>
              </div>
              <img src={qrUrl} alt="Pass QR" className="w-16 h-16 rounded-lg border border-neon/40 shadow-[0_0_15px_rgba(0,255,102,0.2)]" />
            </div>

            {/* Retrigger */}
            <button
              onClick={triggerBlast}
              className="w-full py-2.5 rounded-lg bg-[#141822] hover:bg-[#1a202e] border border-[#272f44] text-gray-300 hover:text-neon font-mono text-[11px] font-bold transition-all cursor-pointer"
            >
              ⚡ Re-fire Particles
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-[#1b202c] pt-4 text-center">
          <Link
            href="/"
            className="text-[10px] font-mono text-gray-500 hover:text-neon transition-colors"
          >
            ← Back to Aegis Command Home
          </Link>
        </div>
      </div>
    </div>
  );
}