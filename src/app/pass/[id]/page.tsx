'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import confetti from 'canvas-confetti';
import { supabase } from '@/lib/supabaseClient';
import { 
  ShieldCheck, 
  Zap, 
  Radio, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Calendar, 
  MessageSquare, 
  ExternalLink,
  Users,
  QrCode as QrCodeIcon
} from 'lucide-react';
import Link from 'next/link';

// Helper to resolve the WhatsApp group link for the assigned batch
function getBatchWhatsAppUrl(workshop: any, batchStrOrNum: string | number): string {
  const batchNum = typeof batchStrOrNum === 'number' 
    ? batchStrOrNum 
    : Number(String(batchStrOrNum).replace(/\D/g, '') || 1);

  const batchKey = `Batch ${batchNum}`;

  if (workshop?.cohort_whatsapp_links && workshop.cohort_whatsapp_links[batchKey]?.trim()) {
    return workshop.cohort_whatsapp_links[batchKey].trim();
  }

  if (Array.isArray(workshop?.whatsapp_links)) {
    const matched = workshop.whatsapp_links.find(
      (item: any) => Number(item.batchNumber) === batchNum
    );
    if (matched?.url && matched.url.trim() !== '') return matched.url.trim();
  }

  return workshop?.fallback_whatsapp_link || 'https://chat.whatsapp.com/default-aegis-community';
}

export default function InteractivePassPage() {
  const params = useParams();
  const passId = typeof params?.id === 'string' ? params.id.trim() : '';

  const [registration, setRegistration] = useState<any>(null);
  const [workshop, setWorkshop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    async function fetchPassDetails() {
      if (!passId) {
        setLoading(false);
        return;
      }

      try {
        // 1. Query registration by clearance_id or id
        const { data: reg, error: regErr } = await supabase
          .from('registrations')
          .select('*')
          .or(`clearance_id.eq.${passId},id.eq.${passId}`)
          .maybeSingle();

        if (reg) {
          setRegistration(reg);

          // 2. Fetch parent workshop data for dynamic links and venue details
          const targetWorkshopId = reg.workshop_id || 'aegis-master-workshop';
          const { data: ws } = await supabase
            .from('workshops')
            .select('*')
            .eq('id', targetWorkshopId)
            .maybeSingle();

          if (ws) {
            setWorkshop(ws);
          }
        }
      } catch (err) {
        console.error('Pass retrieval error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPassDetails();
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

  if (!registration) {
    return (
      <div className="min-h-screen bg-[#06070a] text-white flex flex-col items-center justify-center p-4 font-mono">
        <div className="max-w-md w-full bg-[#0d0f14] border border-red-500/30 rounded-3xl p-8 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 border border-red-500 flex items-center justify-center text-red-400">
            ✕
          </div>
          <h1 className="text-xl font-black uppercase text-white">Pass Record Not Found</h1>
          <p className="text-xs text-gray-400">
            No active flight clearance could be located for identifier: <span className="text-neon">{passId}</span>
          </p>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 rounded-xl bg-[#141824] border border-[#232b3d] text-gray-300 hover:text-white text-xs font-bold uppercase transition-all"
          >
            ← Return to Command Home
          </Link>
        </div>
      </div>
    );
  }

  const studentName = registration?.full_name || 'Pilot Attendee';
  const batchNumber = registration?.batch_number || 1;
  const cohort = registration?.cohort_label || `Batch ${batchNumber}`;
  const bookingId = registration?.clearance_id || registration?.id || passId;
  const isConfirmed = registration?.payment_status === 'confirmed' || registration?.payment_status === 'paid';
  const waLink = getBatchWhatsAppUrl(workshop, batchNumber);

  // Standardized QR payload compatible with Gate Scanner
  const qrPayload = JSON.stringify({
    id: bookingId,
    pilot: studentName,
    batch: cohort,
    status: isConfirmed ? 'VERIFIED_PAID' : 'PENDING',
    org: 'AEGIS_FLIGHT_LAB',
  });

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    qrPayload
  )}&bgcolor=08090d&color=${isConfirmed ? '00ff66' : 'f59e0b'}`;

  return (
    <div className="min-h-screen bg-[#06070a] text-white flex flex-col items-center justify-center p-4 selection:bg-neon selection:text-black font-sans relative overflow-hidden">
      {/* Dynamic Background Glow */}
      <div 
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none transition-all duration-700 ${
          isConfirmed ? 'bg-neon/10' : 'bg-amber-500/10'
        }`} 
      />

      {/* Pass Container */}
      <div className="relative z-10 max-w-md w-full bg-[#0d0f14] border border-[#1f2430] rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-xl space-y-6">
        
        {/* Top Header */}
        <div className="flex justify-between items-start border-b border-[#1b202c] pb-5">
          <div>
            <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold w-fit uppercase border ${
              isConfirmed 
                ? 'bg-neon/10 border-neon/30 text-neon' 
                : 'bg-amber-500/10 border-amber-500/40 text-amber-400'
            }`}>
              <Radio className="w-3 h-3 animate-pulse" />
              <span>{isConfirmed ? 'Live Telemetry Active' : 'Awaiting Gate Verification'}</span>
            </div>
            <h1 className="text-xl font-black mt-2 tracking-tight text-white uppercase font-mono">
              {workshop?.title || 'Aegis Avionics Pass'}
            </h1>
          </div>

          <div className="bg-[#131722] border border-[#272f44] px-3 py-1.5 rounded-xl text-center shrink-0">
            <span className="text-[9px] font-mono text-gray-500 uppercase block">Cohort</span>
            <span className="text-sm font-black font-mono text-neon">{cohort}</span>
          </div>
        </div>

        {/* State: Locked vs Unlocked */}
        {!isUnlocked ? (
          <div className="py-8 text-center space-y-5">
            <div className={`w-20 h-20 mx-auto rounded-2xl bg-[#131722] border border-dashed flex items-center justify-center animate-pulse ${
              isConfirmed ? 'border-neon/50 text-neon shadow-[0_0_30px_rgba(0,255,102,0.15)]' : 'border-amber-500/50 text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.15)]'
            }`}>
              <ShieldCheck className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white font-mono">{studentName}</h2>
              <p className="text-xs text-gray-400 font-mono">
                Clearance ID: <span className="text-neon font-bold">{bookingId}</span>
              </p>
            </div>

            <button
              onClick={triggerBlast}
              className="w-full py-4 rounded-xl bg-neon text-black font-black text-xs uppercase tracking-widest font-mono hover:bg-[#00cc52] transition-all transform active:scale-95 shadow-[0_0_30px_rgba(0,255,102,0.4)] cursor-pointer flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-black" />
              <span>Unlock Pass & Launch Telemetry</span>
            </button>
          </div>
        ) : (
          <div className="space-y-5 animate-in fade-in zoom-in-95 duration-500">
            
            {/* Telemetry Metrics Box */}
            <div className="bg-[#08090d] border border-[#1e2538] rounded-2xl p-4 space-y-2.5 font-mono text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">PILOT:</span>
                <span className="text-white font-bold">{studentName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">CLEARANCE ID:</span>
                <span className="text-neon font-black">{bookingId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">ASSIGNED SQUAD:</span>
                <span className="text-white font-bold">{cohort}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[#1a202c]">
                <span className="text-gray-500">GATE STATUS:</span>
                {isConfirmed ? (
                  <span className="text-neon font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED / CLEARED
                  </span>
                ) : (
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> PENDING VERIFICATION
                  </span>
                )}
              </div>
            </div>

            {/* Official Batch WhatsApp Group Button */}
            {waLink && (
              <div className="bg-[#0a1f14] border border-[#00ff66]/40 p-4 rounded-2xl space-y-2 font-mono">
                <div className="flex items-center gap-2 text-xs font-bold text-[#00ff66]">
                  <MessageSquare className="w-4 h-4" />
                  <span>Official {cohort} WhatsApp Group</span>
                </div>
                <p className="text-[11px] text-gray-300 font-sans leading-relaxed">
                  Join your assigned cohort channel to receive lab schedules, firmware configs, and kit instructions:
                </p>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#00ff66] hover:bg-[#00cc52] text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(0,255,102,0.3)] cursor-pointer"
                >
                  <span>Connect to {cohort} WhatsApp Channel</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {/* Event Venue & Date Info */}
            <div className="space-y-2 text-xs font-mono text-gray-300 bg-[#12151d] p-3.5 rounded-xl border border-[#1e2330]">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-neon shrink-0" />
                <span>{workshop?.schedule_date || '16th, 17th, 18th September 2026 Intake'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-neon shrink-0" />
                <span>{workshop?.venue || 'Guru Gobind Singh College of Engineering and Research Centre, Nashik'}</span>
              </div>
            </div>

            {/* Dynamic Entry QR Code */}
            <div className="bg-[#08090d] border border-[#1b202c] p-4 rounded-xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-neon block uppercase font-bold">● Entry Gate Pass QR</span>
                <span className="text-xs font-bold font-mono text-white">Present at Reception Desk</span>
                <p className="text-[10px] text-gray-500 font-mono">
                  {isConfirmed ? 'Scannable by Desk Terminal' : 'Will activate upon desk payment'}
                </p>
              </div>
              <img 
                src={qrUrl} 
                alt="Pass QR" 
                className="w-16 h-16 rounded-lg border border-neon/40 shadow-[0_0_15px_rgba(0,255,102,0.2)] shrink-0 ml-2" 
              />
            </div>

            {/* Re-trigger Confetti */}
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