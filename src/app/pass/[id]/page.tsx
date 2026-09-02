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
  Lock,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

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
        let cleanId = decodeURIComponent(passId).trim();
        console.log("Looking up pass for identifier:", cleanId);

        // 1. Normalize short clearance IDs (e.g., AEGIS-B1-01 -> AEGIS-B1-001)
        const match = cleanId.match(/^(AEGIS-B(\d+)-)(\d+)$/i);
        if (match) {
          const [, , batchNum, serialStr] = match;
          cleanId = `AEGIS-B${batchNum}-${String(parseInt(serialStr, 10)).padStart(3, '0')}`;
        }
let reg = null;

        // 1. Safe query using .limit(1) to avoid multiple-row errors across workshops
        const { data: regList } = await supabase
          .from('registrations')
          .select('*')
          .ilike('clearance_id', cleanId)
          .limit(1);

        if (regList && regList.length > 0) {
          reg = regList[0];
        } else {
          // 2. Fallback: Try partial / suffix match
          const { data: regLike } = await supabase
            .from('registrations')
            .select('*')
            .ilike('clearance_id', `%${cleanId}%`)
            .limit(1);
          
          if (regLike && regLike.length > 0) {
            reg = regLike[0];
          } else if (cleanId.length >= 6) {
            // 3. Fallback: Try lookup by partial UUID
            const { data: regByUuid } = await supabase
              .from('registrations')
              .select('*')
              .ilike('id', `%${cleanId}%`)
              .limit(1);
            
            if (regByUuid && regByUuid.length > 0) reg = regByUuid[0];
          }
        }

        if (reg) {
          setRegistration(reg);
          const targetWorkshopId = reg.workshop_id || 'workshop-9585';
          const { data: ws } = await supabase
            .from('workshops')
            .select('*')
            .eq('id', targetWorkshopId)
            .maybeSingle();

          if (ws) setWorkshop(ws);
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
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#00ff66', '#00e5ff', '#ffffff'],
    });
  };

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', color: '#00ff66', gap: '12px' }}>
        <Loader2 className="w-8 h-8 animate-spin" />
        <span style={{ fontSize: '12px', letterSpacing: '2px' }}>DECRYPTING CLEARANCE PASS...</span>
      </div>
    );
  }

  if (!registration) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', fontFamily: 'monospace' }}>
        <div style={{ maxWidth: '420px', width: '100%', backgroundColor: '#0d0f14', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '20px', padding: '32px', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', margin: '0 auto 16px', borderRadius: '50%', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', fontSize: '18px', fontWeight: 'bold' }}>
            ✕
          </div>
          <h1 style={{ color: '#fff', fontSize: '16px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '8px' }}>Pass Record Not Found</h1>
          <p style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '20px' }}>
            No active flight clearance located for identifier: <span style={{ color: '#00ff66' }}>{passId}</span>
          </p>
          <Link
            href="/"
            style={{ display: 'inline-block', padding: '10px 18px', backgroundColor: '#141824', border: '1px solid #232b3d', borderRadius: '10px', color: '#d1d5db', fontSize: '12px', fontWeight: 'bold', textDecoration: 'none' }}
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

  const normalizedStatus = (registration?.payment_status || '').toLowerCase();
  const isApproved = 
    normalizedStatus === 'verified_paid' || 
    normalizedStatus === 'paid' || 
    normalizedStatus === 'confirmed' || 
    normalizedStatus === 'verified';

  const waLink = getBatchWhatsAppUrl(workshop, batchNumber);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    bookingId
  )}&bgcolor=08090d&color=00ff66`;

  return (
    <div style={{ width: '100%', minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', boxSizing: 'border-box' }}>
      
      {/* Centered Pass Card */}
      <div 
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#0d0f14',
          border: '1px solid #1f2430',
          borderRadius: '24px',
          padding: '24px',
          boxShadow: isApproved ? '0 0 50px rgba(0, 255, 102, 0.08)' : '0 0 50px rgba(245, 158, 11, 0.08)',
          fontFamily: 'monospace',
          boxSizing: 'border-box'
        }}
      >
        
        {/* Pass Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #1b202c', paddingBottom: '16px', marginBottom: '20px' }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 8px',
              borderRadius: '999px',
              fontSize: '10px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              backgroundColor: isApproved ? 'rgba(0, 255, 102, 0.1)' : 'rgba(245, 158, 11, 0.1)',
              border: isApproved ? '1px solid rgba(0, 255, 102, 0.3)' : '1px solid rgba(245, 158, 11, 0.4)',
              color: isApproved ? '#00ff66' : '#fbbf24',
              marginBottom: '6px'
            }}>
              <Radio className="w-3 h-3 animate-pulse" />
              <span>{isApproved ? 'Live Telemetry Active' : 'Awaiting Gate Approval'}</span>
            </div>
            <h1 style={{ color: '#ffffff', fontSize: '15px', fontWeight: 900, textTransform: 'uppercase', margin: 0 }}>
              {workshop?.title || 'Aegis Avionics Pass'}
            </h1>
          </div>

          <div style={{ backgroundColor: '#131722', border: '1px solid #272f44', padding: '6px 12px', borderRadius: '12px', textAlign: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: '9px', color: '#6b7280', textTransform: 'uppercase', display: 'block' }}>Cohort</span>
            <span style={{ fontSize: '13px', fontWeight: 900, color: '#00ff66' }}>{cohort}</span>
          </div>
        </div>

        {/* LOCKED STATE */}
        {!isApproved ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ textAlign: 'center', padding: '12px 0 6px' }}>
              <div style={{ width: '56px', height: '56px', margin: '0 auto 12px', borderRadius: '16px', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px dashed rgba(245, 158, 11, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24' }}>
                <Lock className="w-7 h-7" />
              </div>
              <h2 style={{ color: '#ffffff', fontSize: '16px', fontWeight: 800, margin: '0 0 4px', textTransform: 'uppercase' }}>{studentName}</h2>
              <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '6px', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', fontSize: '10px', fontWeight: 'bold', letterSpacing: '1px' }}>
                PAYMENT PENDING APPROVAL
              </span>
              <p style={{ color: '#9ca3af', fontSize: '11px', margin: '8px 0 0', lineHeight: 1.4, fontFamily: 'sans-serif' }}>
                Your boarding QR code unlocks once the desk verifies your payment (UPI / Spot Cash).
              </p>
            </div>

            <div style={{ backgroundColor: '#08090d', border: '1px solid #1e2538', borderRadius: '14px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#6b7280' }}>CLEARANCE ID:</span>
                <span style={{ color: '#fbbf24', fontWeight: 900 }}>{bookingId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#6b7280' }}>ASSIGNED SQUAD:</span>
                <span style={{ color: '#ffffff', fontWeight: 'bold' }}>{cohort}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #1a202c', paddingTop: '8px' }}>
                <span style={{ color: '#6b7280' }}>GATE STATUS:</span>
                <span style={{ color: '#fbbf24', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock className="w-3.5 h-3.5" /> PENDING DESK APPROVAL
                </span>
              </div>
            </div>

            {waLink && (
              <div style={{ backgroundColor: '#181508', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '14px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 'bold', color: '#fbbf24' }}>
                  <MessageSquare className="w-4 h-4" />
                  <span>Official {cohort} WhatsApp Group</span>
                </div>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#fbbf24',
                    borderRadius: '10px',
                    color: '#000000',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    textDecoration: 'none',
                    boxSizing: 'border-box'
                  }}
                >
                  <span>Connect to {cohort} Channel</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            <div style={{ backgroundColor: '#12151d', border: '1px solid #1e2330', borderRadius: '14px', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', color: '#d1d5db' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar className="w-3.5 h-3.5" style={{ color: '#fbbf24', flexShrink: 0 }} />
                <span>{workshop?.schedule_date || '16th, 17th, 18th September 2026 Intake'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin className="w-3.5 h-3.5" style={{ color: '#fbbf24', flexShrink: 0 }} />
                <span>{workshop?.venue || 'Guru Gobind Singh College of Engineering, Nashik'}</span>
              </div>
            </div>
          </div>
        ) : !isUnlocked ? (
          <div style={{ textAlign: 'center', padding: '24px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ width: '64px', height: '64px', margin: '0 auto', borderRadius: '18px', backgroundColor: '#131722', border: '1px solid rgba(0,255,102,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00ff66' }}>
              <ShieldCheck className="w-9 h-9" />
            </div>

            <div>
              <h2 style={{ color: '#ffffff', fontSize: '16px', fontWeight: 800, margin: '0 0 4px' }}>{studentName}</h2>
              <p style={{ color: '#9ca3af', fontSize: '11px', margin: 0 }}>
                Clearance ID: <span style={{ color: '#00ff66', fontWeight: 'bold' }}>{bookingId}</span>
              </p>
            </div>

            <button
              onClick={triggerBlast}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                backgroundColor: '#00ff66',
                color: '#000000',
                fontWeight: 900,
                fontSize: '11px',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 0 25px rgba(0,255,102,0.35)'
              }}
            >
              <Zap className="w-4 h-4 fill-black" />
              <span>Unlock Flight Pass</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ backgroundColor: '#08090d', border: '1px solid #1e2538', borderRadius: '14px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#6b7280' }}>PILOT:</span>
                <span style={{ color: '#ffffff', fontWeight: 'bold' }}>{studentName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#6b7280' }}>CLEARANCE ID:</span>
                <span style={{ color: '#00ff66', fontWeight: 900 }}>{bookingId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#6b7280' }}>ASSIGNED SQUAD:</span>
                <span style={{ color: '#ffffff', fontWeight: 'bold' }}>{cohort}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #1a202c', paddingTop: '8px' }}>
                <span style={{ color: '#6b7280' }}>GATE STATUS:</span>
                <span style={{ color: '#00ff66', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED / CLEARED
                </span>
              </div>
            </div>

            {waLink && (
              <div style={{ backgroundColor: '#0a1f14', border: '1px solid rgba(0, 255, 102, 0.3)', borderRadius: '14px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 'bold', color: '#00ff66' }}>
                  <MessageSquare className="w-4 h-4" />
                  <span>Official {cohort} WhatsApp Group</span>
                </div>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#00ff66',
                    borderRadius: '10px',
                    color: '#000000',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    textDecoration: 'none',
                    boxSizing: 'border-box'
                  }}
                >
                  <span>Connect to {cohort} Channel</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            <div style={{ backgroundColor: '#12151d', border: '1px solid #1e2330', borderRadius: '14px', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', color: '#d1d5db' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar className="w-3.5 h-3.5 text-neon" style={{ flexShrink: 0 }} />
                <span>{workshop?.schedule_date || '16th, 17th, 18th September 2026 Intake'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin className="w-3.5 h-3.5 text-neon" style={{ flexShrink: 0 }} />
                <span>{workshop?.venue || 'Guru Gobind Singh College of Engineering, Nashik'}</span>
              </div>
            </div>

            <div style={{ backgroundColor: '#08090d', border: '1px solid #1b202c', borderRadius: '14px', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '10px', color: '#00ff66', fontWeight: 'bold', display: 'block', textTransform: 'uppercase' }}>● Entry Gate Pass QR</span>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#ffffff' }}>Present at Reception Desk</span>
              </div>
              <img 
                src={qrUrl} 
                alt="Pass QR" 
                style={{ width: '64px', height: '64px', borderRadius: '10px', border: '1px solid rgba(0,255,102,0.4)', marginLeft: '12px', flexShrink: 0 }} 
              />
            </div>
          </div>
        )}

        <div style={{ borderTop: '1px solid #1b202c', paddingTop: '16px', marginTop: '20px', textAlign: 'center' }}>
          <Link href="/" style={{ fontSize: '11px', color: '#6b7280', textDecoration: 'none' }}>
            ← Back to Aegis Command Home
          </Link>
        </div>

      </div>
    </div>
  );
}