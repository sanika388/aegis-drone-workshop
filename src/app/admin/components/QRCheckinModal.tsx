'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { supabase } from '@/lib/supabaseClient';
import { X, CheckCircle2, AlertCircle, Scan, Camera, Banknote } from 'lucide-react';
import { toast } from 'sonner';

interface QRCheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export default function QRCheckinModal({ isOpen, onClose, onRefresh }: QRCheckinModalProps) {
  const [lastScanned, setLastScanned] = useState<any>(null);
  const [scanStatus, setScanStatus] = useState<'idle' | 'processing' | 'success' | 'warning' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const qrElementId = 'direct-qr-video';

    const startCamera = async () => {
      try {
        const html5QrCode = new Html5Qrcode(qrElementId);
        html5QrCodeRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 15,
            qrbox: { width: 220, height: 220 },
            aspectRatio: 1.0,
          },
          async (decodedText) => {
            if (scanStatus === 'processing') return;
            await handlePassScan(decodedText.trim());
          },
          () => {}
        );

        if (isMounted) setCameraActive(true);
      } catch (err: any) {
        console.error('Camera activation error:', err);
        setErrorMessage(
          err?.message || 'Unable to access camera. Please check browser camera permissions.'
        );
        setScanStatus('error');
      }
    };

    const timeout = setTimeout(startCamera, 150);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      if (html5QrCodeRef.current) {
        if (html5QrCodeRef.current.isScanning) {
          html5QrCodeRef.current.stop().then(() => html5QrCodeRef.current?.clear()).catch(() => {});
        } else {
          html5QrCodeRef.current.clear();
        }
      }
    };
  }, [isOpen]);

  const handlePassScan = async (scannedPayload: string) => {
    setScanStatus('processing');

    try {
      let lookupId = scannedPayload.trim();

      // 1. Parse JSON payload if available
      try {
        const parsed = JSON.parse(scannedPayload);
        if (parsed.id) {
          lookupId = parsed.id.trim();
        }
      } catch {
        // Fallback: check for URL paths
        if (scannedPayload.includes('/pass/')) {
          const parts = scannedPayload.split('/pass/');
          lookupId = parts[1]?.split('?')[0]?.trim();
        }
      }

      // 2. Query attendee in Supabase
      const { data: attendee, error: fetchErr } = await supabase
        .from('registrations')
        .select('*')
        .or(`clearance_id.eq.${lookupId},id.eq.${lookupId}`)
        .maybeSingle();

      if (fetchErr || !attendee) {
        setScanStatus('error');
        setErrorMessage(`Unknown Clearance Pass: ${lookupId}`);
        toast.error(`Invalid pass: ${lookupId}`);
        setTimeout(() => setScanStatus('idle'), 2200);
        return;
      }

      const wasAlreadyAttended = attendee.attended;
      const isPaid = attendee.payment_status === 'confirmed' || attendee.payment_status === 'paid';

      // 3. Mark attended in database
      const updatePayload: any = { attended: true };
      if (!isPaid && attendee.payment_mode === 'cash') {
        updatePayload.payment_status = 'confirmed'; // Cash collected at desk
      }

      const { error: updateErr } = await supabase
        .from('registrations')
        .update(updatePayload)
        .eq('id', attendee.id);

      if (updateErr) throw updateErr;

      setLastScanned({ ...attendee, ...updatePayload });

      if (!isPaid) {
        setScanStatus('warning');
        toast.warning(`Spot Cash Desk Check-in: ₹${attendee.amount_paid || 300} verified for ${attendee.full_name}`);
      } else {
        setScanStatus('success');
        if (wasAlreadyAttended) {
          toast.info(`Already Checked In: ${attendee.full_name} (${attendee.cohort_label || 'Batch 1'})`);
        } else {
          toast.success(`Verified & Cleared: ${attendee.full_name} (${attendee.cohort_label || 'Batch 1'})`);
        }
      }

      onRefresh();
      setTimeout(() => setScanStatus('idle'), 2200);

    } catch (err: any) {
      setScanStatus('error');
      setErrorMessage(err.message || 'Verification failed');
      setTimeout(() => setScanStatus('idle'), 2200);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 font-mono">
      <div className="bg-[#0e1017] border border-[#242b3d] rounded-2xl w-full max-w-md overflow-hidden shadow-[0_0_50px_rgba(0,255,102,0.15)] flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-[#1f2637] flex items-center justify-between bg-[#08090d]">
          <div className="flex items-center gap-2">
            <Scan className="w-4 h-4 text-neon animate-pulse" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Avionics Gate Scanner
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#141824] text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Camera Feed */}
        <div className="p-6 flex flex-col items-center justify-center space-y-4">
          <div className="w-full max-w-[280px] h-[280px] rounded-2xl overflow-hidden border-2 border-neon/40 bg-[#050608] relative shadow-[0_0_30px_rgba(0,255,102,0.1)] flex items-center justify-center">
            <div id="direct-qr-video" className="w-full h-full object-cover"></div>
            {!cameraActive && scanStatus !== 'error' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#08090d] text-gray-400 text-xs">
                <Camera className="w-6 h-6 animate-pulse text-neon" />
                <span>Initializing camera stream...</span>
              </div>
            )}
          </div>

          {/* Scanned Status */}
          {scanStatus === 'success' && lastScanned && (
            <div className="w-full bg-[#0a1f14] border border-neon/50 rounded-xl p-3.5 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-neon shrink-0" />
              <div className="text-xs">
                <p className="text-white font-bold">{lastScanned.full_name}</p>
                <p className="text-neon text-[11px]">{lastScanned.clearance_id || lastScanned.id} &bull; PRESENT & CLEARED</p>
              </div>
            </div>
          )}

          {scanStatus === 'warning' && lastScanned && (
            <div className="w-full bg-[#241a08] border border-amber-500/50 rounded-xl p-3.5 flex items-center gap-3">
              <Banknote className="w-6 h-6 text-amber-400 shrink-0" />
              <div className="text-xs">
                <p className="text-white font-bold">{lastScanned.full_name}</p>
                <p className="text-amber-400 text-[11px]">₹{lastScanned.amount_paid || 300} Cash Confirmed & Checked In</p>
              </div>
            </div>
          )}

          {scanStatus === 'error' && (
            <div className="w-full bg-[#220e0e] border border-red-500/50 rounded-xl p-3.5 flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <p className="text-xs text-red-200">{errorMessage}</p>
            </div>
          )}

          <p className="text-[11px] text-gray-400 text-center">
            Position flight pass QR code within frame. Attendance records automatically.
          </p>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1f2637] bg-[#08090d] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#161a26] text-gray-300 text-xs font-bold hover:bg-[#1e2436] transition-colors cursor-pointer"
          >
            Close Gate Scanner
          </button>
        </div>

      </div>
    </div>
  );
}