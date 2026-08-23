'use client';

import { use, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  CheckCircle, 
  Printer, 
  Calendar, 
  QrCode,
  ArrowRight,
  MessageSquare
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
  const batchId = searchParams.get('workshop') || 'batch-a';
  const studentName = searchParams.get('name') || 'Registered Candidate';
  const email = searchParams.get('email') || 'registered@gmail.com';
  const amount = searchParams.get('amount') || '1499';

  const [batchInfo, setBatchInfo] = useState<any>(null);

  useEffect(() => {
    async function loadAssignedBatch() {
      const { data } = await supabase
        .from('workshops')
        .select('*')
        .eq('id', batchId)
        .single();

      if (data) setBatchInfo(data);
    }
    loadAssignedBatch();
  }, [batchId]);

  const paymentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const handlePrint = () => {
    window.print();
  };

  const adminPhone = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_NUMBER || '919876543210';
  const fallbackMessage = encodeURIComponent(
    `Hi Aegis Drone Team, I completed registration for ${batchInfo?.title || 'the workshop'} (Booking ID: ${regId}). Please add me to the assigned batch group!`
  );

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
      {/* Success Notice */}
      <div className="bg-[#121212] border border-[#242424] rounded-2xl p-6 text-center space-y-3">
        <div className="inline-flex p-3 rounded-full bg-neon/10 text-neon border border-neon/30">
          <CheckCircle className="w-8 h-8 text-neon" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Pass Verified & Seat Confirmed!</h1>
        <p className="text-sm text-gray-400 max-w-md mx-auto">
          Your seat allocation is confirmed. Join your batch's WhatsApp group below to receive hardware schematics and schedule announcements.
        </p>
      </div>

      {/* WhatsApp Community Card */}
      <div className="bg-[#121212] border border-[#25D366]/40 rounded-2xl p-6 space-y-4 shadow-[0_0_20px_rgba(37,211,102,0.12)]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#25D366] animate-ping" />
          <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            {batchInfo?.whatsapp_group_name || `Aegis Drone Workshop - ${batchId.toUpperCase()}`}
          </span>
        </div>
        <p className="text-xs text-gray-300">
          Click below to connect with your instructors and receive team kit assignments.
        </p>

        {batchInfo?.whatsapp_group_link ? (
          <a
            href={batchInfo.whatsapp_group_link}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-black font-black text-xs flex items-center justify-center gap-2 transition-all tracking-wider uppercase shadow-[0_0_15px_rgba(37,211,102,0.4)]"
          >
            <MessageSquare className="w-4 h-4 fill-current" />
            <span>Join Batch WhatsApp Community</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        ) : (
          <a
            href={`https://wa.me/${adminPhone}?text=${fallbackMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-black font-black text-xs flex items-center justify-center gap-2 transition-all tracking-wider uppercase shadow-[0_0_15px_rgba(37,211,102,0.4)]"
          >
            <MessageSquare className="w-4 h-4 fill-current" />
            <span>Request WhatsApp Group Invite from Admin</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        )}
      </div>

      {/* Printable Digital Pass */}
      <div 
        id="printable-receipt"
        className="bg-[#121212] border border-neon/50 rounded-2xl p-8 space-y-6 relative overflow-hidden shadow-[0_0_30px_rgba(0,255,102,0.12)]"
      >
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[#242424] pb-6">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-full overflow-hidden border border-[#2e2e2e] bg-[#0a0a0a] flex items-center justify-center shrink-0">
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
              <p className="text-xs text-gray-400 font-mono">OFFICIAL ENTRY PASS</p>
            </div>
          </div>
          <div className="text-left sm:text-right font-mono">
            <span className="text-xs text-gray-500 uppercase">Booking ID</span>
            <p className="text-neon font-bold text-lg">{regId}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div className="space-y-1">
            <span className="text-xs text-gray-500 uppercase font-mono">Participant Name</span>
            <p className="font-semibold text-white text-base">{studentName}</p>
            <p className="text-xs text-gray-400">{email}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-gray-500 uppercase font-mono">Payment Status</span>
            <p className="text-neon font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-neon"></span> PAID • ₹{amount}
            </p>
            <p className="text-xs text-gray-400">Date: {paymentDate}</p>
          </div>

          <div className="sm:col-span-2 space-y-1 border-t border-[#1e1e1e] pt-4">
            <span className="text-xs text-gray-500 uppercase font-mono">Assigned Batch Track</span>
            <p className="font-semibold text-white text-base">
              {batchInfo?.title || 'Quadcopter Engineering & Flight Workshop'}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-gray-500 uppercase font-mono flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-neon" /> Venue Verification
            </span>
            <p className="text-xs text-gray-300">GCOERC Nashik Campus</p>
          </div>

          <div className="flex items-center justify-start sm:justify-end">
            <div className="p-3 bg-[#0a0a0a] border border-[#242424] rounded-xl flex items-center gap-3">
              <QrCode className="w-10 h-10 text-neon" />
              <div className="text-[11px] font-mono text-gray-400">
                <span>GATE SCAN</span><br />
                <span className="text-white font-bold">VERIFIED</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <Link
          href="/workshops"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-neon transition-colors"
        >
          <span>Return to Workshops</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

        <button
          onClick={handlePrint}
          className="px-5 py-2.5 rounded-lg bg-[#181818] border border-[#2e2e2e] hover:border-neon text-white font-semibold flex items-center gap-2 transition-all text-sm cursor-pointer"
        >
          <Printer className="w-4 h-4 text-neon" />
          <span>Print Pass / Save PDF</span>
        </button>
      </div>
    </div>
  );
}