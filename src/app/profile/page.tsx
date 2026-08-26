'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { 
  User, 
  Mail, 
  Phone, 
  School, 
  CheckCircle2, 
  Clock, 
  LogOut, 
  MessageSquare, 
  ExternalLink,
  Loader2,
  Calendar,
  MapPin
} from 'lucide-react';
import Link from 'next/link';

export default function ParticipantProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [registration, setRegistration] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/auth');
          return;
        }

        setUser(session.user);

        // Match user registration in PostgreSQL
        const { data: reg } = await supabase
          .from('registrations')
          .select('*')
          .eq('email', session.user.email?.toLowerCase().trim())
          .eq('is_deleted', false)
          .maybeSingle();

        setRegistration(reg);
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090f] flex flex-col items-center justify-center space-y-3 font-mono text-neon">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-xs">Verifying flight authorization...</p>
      </div>
    );
  }

  const qrPayload = encodeURIComponent(
    JSON.stringify({
      id: registration?.clearance_id || 'PENDING',
      pilot: registration?.full_name || user?.user_metadata?.full_name || user?.email,
      status: registration?.payment_status === 'confirmed' ? 'VERIFIED_PAID' : 'PENDING_DESK',
    })
  );
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${qrPayload}&color=00ff66&bgcolor=07090f`;

  return (
    <div className="min-h-screen bg-[#07090f] text-white p-6 md:p-12 font-mono">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#1c2336] pb-6">
          <div>
            <span className="px-3 py-1 rounded-full bg-neon/10 border border-neon/30 text-neon text-[10px] font-bold uppercase tracking-wider">
              PILOT VERIFICATION PORTAL
            </span>
            <h1 className="text-2xl font-black tracking-tight pt-2">
              {user?.user_metadata?.full_name || registration?.full_name || 'Flight Pilot'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="px-4 py-2 rounded-xl bg-[#141824] hover:bg-[#1f2638] text-gray-300 text-xs font-bold transition-all"
            >
              Command Home
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 hover:bg-red-500 hover:text-white text-red-400 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Profile & Boarding Pass */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Left Column: Account Details */}
          <div className="md:col-span-5 bg-[#0c0f17] border border-[#1e2538] rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#161c2c] border border-neon/40 flex items-center justify-center text-neon font-black text-xl">
                {user?.user_metadata?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'P'}
              </div>
              <div>
                <p className="text-sm font-bold text-white font-sans">
                  {user?.user_metadata?.full_name || registration?.full_name || 'Pilot'}
                </p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-[#182033] text-xs">
              <div className="flex items-center gap-2 text-gray-300">
                <Mail className="w-4 h-4 text-neon" />
                <span className="truncate">{user?.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Phone className="w-4 h-4 text-neon" />
                <span>{registration?.phone || user?.user_metadata?.phone || 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <School className="w-4 h-4 text-neon" />
                <span>{registration?.college || user?.user_metadata?.college || 'Engineering Department'}</span>
              </div>
            </div>

            {!registration && (
              <div className="bg-[#141a29] border border-amber-500/40 p-4 rounded-xl space-y-3">
                <p className="text-xs text-amber-300 font-bold">No active seat reserved yet.</p>
                <Link
                  href="/workshops"
                  className="block text-center py-2.5 rounded-lg bg-neon text-black font-bold text-xs uppercase hover:bg-[#00cc52] transition-all"
                >
                  Reserve Seat Pass
                </Link>
              </div>
            )}
          </div>

          {/* Right Column: Pass & QR Code */}
          <div className="md:col-span-7 bg-[#0c0f17] border border-neon/40 rounded-2xl p-6 space-y-6 shadow-[0_0_30px_rgba(0,255,102,0.06)]">
            
            <div className="flex justify-between items-start border-b border-[#182033] pb-4">
              <div>
                <span className="text-[10px] text-gray-400 block">OFFICIAL CLEARANCE PASS</span>
                <span className="text-base font-black text-neon">
                  {registration?.clearance_id || 'RESERVATION PENDING'}
                </span>
              </div>
              <div className="text-right">
                <span className="px-2.5 py-1 rounded-md bg-[#161c2c] border border-[#2b3752] text-xs font-bold text-white">
                  {registration?.batch || 'Batch 1'}
                </span>
              </div>
            </div>

            {registration ? (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-6 bg-[#07090f] border border-[#1e2538] p-4 rounded-xl">
                  <img src={qrCodeUrl} alt="Security QR" width={110} height={110} className="rounded-lg border border-neon/40" />
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      {registration.payment_status === 'confirmed' ? (
                        <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 font-bold flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Seat Verified & Confirmed
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold flex items-center gap-1 text-[11px]">
                          <Clock className="w-3.5 h-3.5" /> Spot Cash Pending at Desk
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      Present this QR pass at the entrance scanner on event day for rapid check-in.
                    </p>
                  </div>
                </div>

                <div className="bg-[#0b1f14] border border-[#00ff66]/40 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#00ff66]">
                      <MessageSquare className="w-4 h-4" />
                      <span>{registration.batch || 'Batch 1'} WhatsApp Cohort</span>
                    </div>
                    <a
                      href={registration?.whatsapp_link || 'https://chat.whatsapp.com/'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-[#00ff66] text-black font-bold text-[11px] hover:bg-[#00cc52] transition-all flex items-center gap-1"
                    >
                      <span>Join Cohort</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs text-gray-400 pt-2">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-neon" />
                    <span>September 2026</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-neon" />
                    <span>GCOERC Nashik</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400 py-6 text-center leading-relaxed">
                You haven't enrolled in a workshop cohort yet. Book your pass to receive your clearance ID and hardware station allotment.
              </p>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}