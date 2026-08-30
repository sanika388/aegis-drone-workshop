'use client';

export const dynamic = 'force-dynamic';

import { use, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  CheckCircle, 
  Printer, 
  Calendar, 
  ArrowRight,
  MessageSquare,
  MapPin,
  Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function ReceiptPage({
  params,
}: {
  params: Promise<{ registrationId: string }>;
}) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();

  const regId = resolvedParams.registrationId;
  const urlBatchId = searchParams.get('workshop') || 'aegis-master-workshop';
  const urlName = searchParams.get('name') || 'Registered Candidate';
  const urlEmail = searchParams.get('email') || '';
  const urlAmount = searchParams.get('amount') || '300';

  const [regData, setRegData] = useState<any>(null);
  const [workshopInfo, setWorkshopInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReceiptDetails() {
      try {
        // 1. Fetch Registration Details
        const { data: reg } = await supabase
          .from('registrations')
          .select('*')
          .or(`clearance_id.eq.${regId},id.eq.${regId}`)
          .maybeSingle();

        if (reg) {
          setRegData(reg);
        }

        // 2. Fetch Workshop Details
        const targetWorkshopId = reg?.workshop_id || urlBatchId;
        const { data: ws } = await supabase
          .from('workshops')
          .select('*')
          .eq('id', targetWorkshopId)
          .maybeSingle();

        if (ws) {
          setWorkshopInfo(ws);
        }
      } catch (err) {
        console.error('Failed to load receipt information:', err);
      } finally {
        setLoading(false);
      }
    }

    loadReceiptDetails();
  }, [regId, urlBatchId]);

  const studentName = regData?.full_name || urlName;
  const studentEmail = regData?.email || urlEmail;
  const clearanceId = regData?.clearance_id || regData?.id || regId;
  const paidAmount = regData?.amount_paid || regData?.amount || urlAmount;
  const cohortLabel = regData?.cohort_label || (regData?.batch_number ? `Batch ${regData.batch_number}` : 'Batch 1');
  const workshopTitle = workshopInfo?.title || 'Aegis Drone Avionics Master Workshop';
  const venueLocation = workshopInfo?.venue || 'Guru Gobind Singh College of Engineering, Nashik';
  const scheduleDate = workshopInfo?.schedule_date || 'September 2026 Intake';

  // Dynamic WhatsApp Cohort Routing Resolution
  const batchNumber = regData?.batch_number || 1;
  const cohortKey = `Batch ${batchNumber}`;
  const whatsappUrl = 
    workshopInfo?.cohort_whatsapp_links?.[cohortKey] || 
    (Array.isArray(workshopInfo?.whatsapp_links) 
      ? workshopInfo.whatsapp_links.find((l: any) => l.batchNumber === batchNumber)?.url 
      : null) ||
    workshopInfo?.fallback_whatsapp_link ||
    'https://chat.whatsapp.com/default-aegis-community';

  const paymentDate = regData?.created_at 
    ? new Date(regData.created_at).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

  // Standardized QR Code for Gate Scanner
  const qrPayload = JSON.stringify({
    id: clearanceId,
    pilot: studentName,
    batch: cohortLabel,
    status: regData?.payment_status === 'confirmed' ? 'VERIFIED_PAID' : 'PAID',
    org: 'AEGIS_FLIGHT_LAB',
  });

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    qrPayload
  )}&bgcolor=08090d&color=00ff66`;

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center font-mono text-neon text-xs space-y-3">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p>GENERATING VERIFIED FLIGHT PASS RECEIPT...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-8 font-mono">
      
      {/* Success Notice */}
      <div className="bg-[#121212] border border-[#242424] rounded-2xl p-6 text-center space-y-3">
        <div className="inline-flex p-3 rounded-full bg-neon/10 text-neon border border-neon/30">
          <CheckCircle className="w-8 h-8 text-neon" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
          Pass Verified & Seat Confirmed!
        </h1>
        <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
          Your seat allocation is confirmed. Join your assigned squad cohort below to receive lab prep materials and hardware schematics.
        </p>
      </div>

      {/* WhatsApp Community Card */}
      <div className="bg-[#0b1710] border border-neon/40 rounded-2xl p-6 space-y-4 shadow-[0_0_20px_rgba(0,255,102,0.12)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-neon animate-pulse" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              {cohortLabel} Official Flight Squad
            </span>
          </div>
          <span className="text-[10px] text-neon bg-neon/10 border border-neon/30 px-2 py-0.5 rounded">
            Assigned Cohort
          </span>
        </div>
        <p className="text-xs text-gray-300">
          Connect with lab mentors and receive firmware downloads and schedule updates.
        </p>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3.5 rounded-xl bg-neon hover:bg-[#00cc52] text-black font-black text-xs flex items-center justify-center gap-2 transition-all tracking-wider uppercase shadow-[0_0_15px_rgba(0,255,102,0.3)] cursor-pointer"
        >
          <MessageSquare className="w-4 h-4 fill-current" />
          <span>Join {cohortLabel} WhatsApp Community</span>
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>

      {/* Printable Digital Pass */}
      <div 
        id="printable-receipt"
        className="bg-[#0e1017] border border-neon/40 rounded-2xl p-8 space-y-6 relative overflow-hidden shadow-[0_0_30px_rgba(0,255,102,0.1)]"
      >
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[#242b3d] pb-6">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-full overflow-hidden border border-neon/30 bg-[#07090f] flex items-center justify-center shrink-0">
              <Image
                src="/logo.png"
                alt="Aegis Drone Logo"
                width={48}
                height={48}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <div className="text-neon font-black text-xl tracking-wider">
                AEGIS<span className="text-white font-light">DRONES</span>
              </div>
              <p className="text-[10px] text-gray-400">OFFICIAL FLIGHT PASS & RECEIPT</p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-[10px] text-gray-500 uppercase block">Clearance ID</span>
            <p className="text-neon font-black text-lg">{clearanceId}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-500 uppercase">Participant Name</span>
            <p className="font-bold text-white text-sm">{studentName}</p>
            {studentEmail && <p className="text-[11px] text-gray-400">{studentEmail}</p>}
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-gray-500 uppercase">Payment Verification</span>
            <p className="text-neon font-bold flex items-center gap-1.5 text-sm">
              <span className="w-2 h-2 rounded-full bg-neon"></span> PAID • ₹{paidAmount}
            </p>
            <p className="text-[11px] text-gray-400">Date: {paymentDate}</p>
          </div>

          <div className="sm:col-span-2 space-y-1 border-t border-[#1a2133] pt-4">
            <span className="text-[10px] text-gray-500 uppercase">Assigned Workshop & Cohort</span>
            <p className="font-bold text-white text-sm">
              {workshopTitle} — <span className="text-neon">{cohortLabel}</span>
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-gray-500 uppercase flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-neon" /> Schedule Intake
            </span>
            <p className="text-gray-300">{scheduleDate}</p>
            <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-neon" /> {venueLocation}
            </p>
          </div>

          <div className="flex items-center justify-start sm:justify-end">
            <div className="p-3 bg-[#07090f] border border-[#242b3d] rounded-xl flex items-center gap-3">
              <img 
                src={qrUrl} 
                alt="Gate Pass QR" 
                className="w-14 h-14 rounded-lg border border-neon/40 shadow-[0_0_10px_rgba(0,255,102,0.2)] shrink-0" 
              />
              <div className="text-[10px] text-gray-400">
                <span>GATE PASS</span><br />
                <span className="text-neon font-bold">VERIFIED</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="flex flex-wrap gap-4 justify-between items-center pt-2">
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-neon transition-colors"
        >
          <span>View in Pilot Profile</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        <button
          onClick={handlePrint}
          className="px-5 py-2.5 rounded-xl bg-[#141824] border border-[#26334d] hover:border-neon text-white font-bold flex items-center gap-2 transition-all text-xs cursor-pointer shadow-lg"
        >
          <Printer className="w-4 h-4 text-neon" />
          <span>Print Pass / Save PDF</span>
        </button>
      </div>
    </div>
  );
}