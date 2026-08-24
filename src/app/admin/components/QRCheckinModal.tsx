'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { supabase } from '@/lib/supabaseClient';
import { X, CheckCircle2, AlertCircle, Scan, Volume2 } from 'lucide-react';
import { toast } from 'sonner';

interface QRCheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export default function QRCheckinModal({ isOpen, onClose, onRefresh }: QRCheckinModalProps) {
  const [lastScanned, setLastScanned] = useState<any>(null);
  const [scanStatus, setScanStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Initialize camera scanner instance
    const scanner = new Html5QrcodeScanner(
      'qr-reader-container',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      false
    );

    scannerRef.current = scanner;

    scanner.render(
      async (decodedText) => {
        // Prevent duplicate spam scans while processing
        if (scanStatus === 'processing') return;
        
        await handlePassScan(decodedText.trim());
      },
      (error) => {
        // Scan frame miss (normal during continuous feed)
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((err) => console.error('Scanner cleanup err:', err));
      }
    };
  }, [isOpen]);

  const handlePassScan = async (scannedPayload: string) => {
    setScanStatus('processing');

    try {
      // 1. Extract clean Booking ID if a URL was scanned (e.g., https://site.com/pass/AEGIS-B1-001)
      let bookingId = scannedPayload;
      if (scannedPayload.includes('/pass/')) {
        const parts = scannedPayload.split('/pass/');
        bookingId = parts[1]?.split('?')[0]?.trim();
      }

      // 2. Fetch attendee record
      const { data: attendee, error: fetchErr } = await supabase
        .from('registrations')
        .select('*')
        .eq('id', bookingId)
        .single();

      if (fetchErr || !attendee) {
        setScanStatus('error');
        setErrorMessage(`Unknown Clearance Pass ID: ${bookingId}`);
        toast.error(`Invalid pass: ${bookingId}`);
        setTimeout(() => setScanStatus('idle'), 2500);
        return;
      }

      // 3. Mark as Attended in Supabase
      const { error: updateErr } = await supabase
        .from('registrations')
        .update({ attended: true, payment_status: 'confirmed' })
        .eq('id', attendee.id);

      if (updateErr) throw updateErr;

      // 4. Trigger Success Audio & Visuals
      setLastScanned(attendee);
      setScanStatus('success');
      toast.success(`Check-in verified: ${attendee.full_name} (${attendee.cohort_label || 'Batch 1'})`);
      
      onRefresh();

      // Reset scanner back to idle ready for next student after 2 seconds
      setTimeout(() => {
        setScanStatus('idle');
      }, 2200);

    } catch (err: any) {
      setScanStatus('error');
      setErrorMessage(err.message || 'Verification failed');
      setTimeout(() => setScanStatus('idle'), 2500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0e1017] border border-[#242b3d] rounded-2xl w-full max-w-lg overflow-hidden shadow-[0_0_50px_rgba(0,255,102,0.15)] flex flex-col max-h-[90vh]">
        
        {/* Header Bar */}
        <div className="p-4 border-b border-[#1f2637] flex items-center justify-between bg-[#08090d]">
          <div className="flex items-center gap-2">
            <Scan className="w-4 h-4 text-neon animate-pulse" />
            <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
              Avionics Lab Gate Telemetry &bull; Optical Check-In
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#141824] text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Scanner Area */}
        <div className="p-6 flex flex-col items-center justify-center space-y-4">
          <div className="w-full max-w-sm rounded-xl overflow-hidden border border-[#272f44] bg-[#050608] [&_video]:rounded-lg [&_button]:bg-neon [&_button]:text-black [&_button]:font-mono [&_button]:text-xs [&_button]:font-bold [&_button]:px-3 [&_button]:py-1.5 [&_button]:rounded-md [&_select]:bg-[#141824] [&_select]:text-white [&_select]:p-1.5 [&_select]:rounded-md [&_select]:text-xs">
            <div id="qr-reader-container" className="w-full"></div>
          </div>

          {/* Feedback Overlay */}
          {scanStatus === 'success' && lastScanned && (
            <div className="w-full bg-[#0a1f14] border border-neon/50 rounded-xl p-4 flex items-center gap-3 animate-in fade-in zoom-in-95">
              <CheckCircle2 className="w-7 h-7 text-neon shrink-0" />
              <div className="font-mono text-xs">
                <p className="text-white font-bold text-sm">{lastScanned.full_name}</p>
                <p className="text-neon text-[11px]">
                  {lastScanned.cohort_label || 'Batch 1'} &bull; {lastScanned.id} &bull; MARKED PRESENT
                </p>
              </div>
            </div>
          )}

          {scanStatus === 'error' && (
            <div className="w-full bg-[#220e0e] border border-red-500/50 rounded-xl p-4 flex items-center gap-3 animate-in fade-in">
              <AlertCircle className="w-6 h-6 text-red-400 shrink-0" />
              <p className="font-mono text-xs text-red-200">{errorMessage}</p>
            </div>
          )}

          <p className="text-[11px] font-mono text-gray-400 text-center">
            Point camera at attendee's email pass or digital phone screen. Auto-marks attendance instantly.
          </p>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-[#1f2637] bg-[#08090d] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#161a26] text-gray-300 font-mono text-xs font-bold hover:bg-[#1e2436] transition-colors cursor-pointer"
          >
            Close Gate Scanner
          </button>
        </div>

      </div>
    </div>
  );
}