'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { 
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
  MapPin,
  ArrowLeft,
  Ticket
} from 'lucide-react';
import Link from 'next/link';

export default function ParticipantProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          router.replace('/auth');
          return;
        }

        setUser(user);

        const userEmail = user.email?.toLowerCase().trim();
        if (userEmail) {
          const { data: regs, error: regError } = await supabase
            .from('registrations')
            .select('*')
            .eq('email', userEmail)
            .eq('is_deleted', false)
            .order('created_at', { ascending: false });

          if (!regError && regs) {
            setRegistrations(regs);
          }
        }
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
    router.replace('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090f] flex flex-col items-center justify-center space-y-3 font-mono text-[#00ff66]">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-xs tracking-wider">LOADING FLIGHT CLEARANCE PROFILES...</p>
      </div>
    );
  }

  const firstReg = registrations[0];
  const pilotName = 
    firstReg?.full_name || 
    user?.user_metadata?.full_name || 
    user?.user_metadata?.name || 
    'Pilot';

  const userPhone = 
    firstReg?.phone || 
    user?.user_metadata?.phone || 
    'Not provided';

  const userCollege = 
    firstReg?.college || 
    user?.user_metadata?.college || 
    'Engineering Department';

  return (
    <div className="min-h-screen bg-[#07090f] text-white p-6 md:p-12 font-mono">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c2336] pb-6">
          <div className="space-y-1">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#00ff66] transition-colors mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Command Home</span>
            </Link>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black tracking-tight text-white uppercase">
                {pilotName}
              </h1>
              <span className="px-2.5 py-0.5 rounded bg-[#00ff66]/10 border border-[#00ff66]/30 text-[#00ff66] text-[10px] font-bold uppercase">
                {registrations.length > 0 ? `${registrations.length} Active Pass${registrations.length > 1 ? 'es' : ''}` : 'Active Pilot'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="px-4 py-2 rounded-xl bg-[#141824] hover:bg-[#1f2638] text-gray-300 hover:text-white text-xs font-bold transition-all border border-[#232b3f]"
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

        {/* Profile Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Pilot Info Sidebar */}
          <div className="md:col-span-4 bg-[#0c0f17] border border-[#1e2538] rounded-2xl p-6 space-y-6 sticky top-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#161c2c] border border-[#00ff66]/40 flex items-center justify-center text-[#00ff66] font-black text-xl shadow-[0_0_15px_rgba(0,255,102,0.15)]">
                {pilotName[0]?.toUpperCase() || 'P'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white truncate">
                  {pilotName}
                </p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-[#182033] text-xs">
              <div className="flex items-center gap-2.5 text-gray-300">
                <Mail className="w-4 h-4 text-[#00ff66] shrink-0" />
                <span className="truncate">{user?.email}</span>
              </div>
              <div className="flex items-center gap-2.5 text-gray-300">
                <Phone className="w-4 h-4 text-[#00ff66] shrink-0" />
                <span>{userPhone}</span>
              </div>
              <div className="flex items-center gap-2.5 text-gray-300">
                <School className="w-4 h-4 text-[#00ff66] shrink-0" />
                <span className="truncate">{userCollege}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#182033]">
              <Link
                href="/workshops"
                className="block text-center py-2.5 rounded-lg bg-[#141a29] border border-[#00ff66]/40 text-[#00ff66] font-bold text-xs uppercase hover:bg-[#00ff66] hover:text-black transition-all"
              >
                + Register New Workshop
              </Link>
            </div>
          </div>

          {/* Workshop Passes Feed */}
          <div className="md:col-span-8 space-y-6">
            {registrations.length > 0 ? (
              registrations.map((reg, idx) => {
                const qrPayload = encodeURIComponent(
                  JSON.stringify({
                    id: reg.clearance_id || 'PENDING',
                    pilot: reg.full_name || pilotName,
                    workshop: reg.workshop_title || reg.track || 'Aegis Drone Workshop',
                    status: reg.payment_status === 'confirmed' || reg.payment_status === 'paid' ? 'VERIFIED_PAID' : 'PENDING_DESK',
                    batch: reg.batch || 'Batch 1',
                  })
                );
                const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${qrPayload}&color=00ff66&bgcolor=0c0f17`;

                return (
                  <div 
                    key={reg.id || idx} 
                    className="bg-[#0c0f17] border border-[#00ff66]/30 rounded-2xl p-6 space-y-6 shadow-[0_0_30px_rgba(0,255,102,0.05)]"
                  >
                    <div className="flex justify-between items-start border-b border-[#182033] pb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Ticket className="w-4 h-4 text-[#00ff66]" />
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                            {reg.workshop_title || reg.track || 'OFFICIAL CLEARANCE PASS'}
                          </span>
                        </div>
                        <span className="text-base font-black text-[#00ff66]">
                          {reg.clearance_id || 'RESERVATION PENDING'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="px-2.5 py-1 rounded-md bg-[#161c2c] border border-[#2b3752] text-xs font-bold text-white">
                          {reg.batch || 'Batch 1'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row items-center gap-6 bg-[#07090f] border border-[#1e2538] p-4 rounded-xl">
                        <img 
                          src={qrCodeUrl} 
                          alt="Security QR" 
                          width={110} 
                          height={110} 
                          className="rounded-lg border border-[#00ff66]/40" 
                        />
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center gap-1.5">
                            {reg.payment_status === 'confirmed' || reg.payment_status === 'paid' ? (
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
                            Present this boarding QR pass at the entrance station for clearance check-in.
                          </p>
                        </div>
                      </div>

                      {/* WhatsApp Cohort Button */}
                      <div className="bg-[#0b1f14] border border-[#00ff66]/40 p-4 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs font-bold text-[#00ff66]">
                            <MessageSquare className="w-4 h-4" />
                            <span>{reg.batch || 'Batch 1'} Official Cohort</span>
                          </div>
                          <a
                            href={reg.whatsapp_link || 'https://chat.whatsapp.com/'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-[#00ff66] text-black font-bold text-[11px] hover:bg-[#00cc52] transition-all flex items-center gap-1"
                          >
                            <span>Join Group</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs text-gray-400 pt-2 border-t border-[#182033]">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#00ff66]" />
                          <span>{reg.event_date || 'September 2026'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#00ff66]" />
                          <span className="truncate">{reg.venue || 'GCOERC Nashik'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-[#0c0f17] border border-[#1e2538] rounded-2xl p-8 text-center space-y-4">
                <p className="text-sm text-gray-400">
                  No active workshop track reserved yet.
                </p>
                <Link
                  href="/workshops"
                  className="inline-block py-2.5 px-6 rounded-lg bg-[#00ff66] text-black font-bold text-xs uppercase hover:bg-[#00cc52] transition-all"
                >
                  Browse & Reserve Tracks
                </Link>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}