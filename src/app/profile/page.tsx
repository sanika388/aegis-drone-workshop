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
  Ticket,
  Edit3,
  X,
  Save
} from 'lucide-react';
import Link from 'next/link';

export default function ParticipantProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCollege, setEditCollege] = useState('');
  const [saving, setSaving] = useState(false);

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
            
            // Set initial state for editing from latest registration or auth metadata
            const latestReg = regs[0];
            setEditFullName(latestReg?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || '');
            setEditPhone(latestReg?.phone || user.user_metadata?.phone || '');
            setEditCollege(latestReg?.college || user.user_metadata?.college || '');
          } else {
            setEditFullName(user.user_metadata?.full_name || user.user_metadata?.name || '');
            setEditPhone(user.user_metadata?.phone || '');
            setEditCollege(user.user_metadata?.college || '');
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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // 1. Update Supabase Auth user metadata
      const { data: updatedAuth, error: authUpdateError } = await supabase.auth.updateUser({
        data: {
          full_name: editFullName,
          phone: editPhone,
          college: editCollege,
        },
      });

      if (authUpdateError) throw authUpdateError;
      if (updatedAuth.user) setUser(updatedAuth.user);

      // 2. Sync changes across existing registration records
      if (user?.email) {
        await supabase
          .from('registrations')
          .update({
            full_name: editFullName,
            phone: editPhone,
            college: editCollege,
          })
          .eq('email', user.email.toLowerCase().trim());

        // Update local registration view
        setRegistrations((prev) =>
          prev.map((reg) => ({
            ...reg,
            full_name: editFullName,
            phone: editPhone,
            college: editCollege,
          }))
        );
      }

      setIsEditing(false);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      alert('Could not update profile. Please try again.');
    } finally {
      setSaving(false);
    }
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
    'Not provided';

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
            Return to Home
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-13 h-13 rounded-2xl bg-[#161c2c] border border-[#00ff66]/40 flex items-center justify-center text-[#00ff66] font-black text-xl shadow-[0_0_15px_rgba(0,255,102,0.15)] shrink-0">
                  {pilotName[0]?.toUpperCase() || 'P'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white truncate">
                    {pilotName}
                  </p>
                  <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                title="Edit Details"
                className="p-2 rounded-lg bg-[#141824] border border-[#252f45] hover:border-[#00ff66] text-gray-300 hover:text-[#00ff66] transition-all cursor-pointer shrink-0"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 pt-4 border-t border-[#182033] text-xs">
              <div className="flex items-center gap-2.5 text-gray-300">
                <Mail className="w-4 h-4 text-[#00ff66] shrink-0" />
                <span className="truncate">{user?.email}</span>
              </div>
              <div className="flex items-center gap-2.5 text-gray-300">
                <Phone className="w-4 h-4 text-[#00ff66] shrink-0" />
                <span className={userPhone === 'Not provided' ? 'text-amber-400/80 italic' : ''}>
                  {userPhone}
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-gray-300">
                <School className="w-4 h-4 text-[#00ff66] shrink-0" />
                <span className={`truncate ${userCollege === 'Not provided' ? 'text-amber-400/80 italic' : ''}`}>
                  {userCollege}
                </span>
              </div>
            </div>

            {(userPhone === 'Not provided' || userCollege === 'Not provided') && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300/90 leading-relaxed">
                ⚠️ Complete your phone & college info for smooth on-site verification.
              </div>
            )}

            <div className="pt-2 border-t border-[#182033] space-y-2">
              <button
                onClick={() => setIsEditing(true)}
                className="w-full text-center py-2.5 rounded-lg bg-[#161d2d] border border-[#243049] text-gray-300 hover:text-white font-bold text-xs uppercase hover:border-[#00ff66] transition-all cursor-pointer"
              >
                Edit Pilot Profile
              </button>
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

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d111a] border border-[#212b3e] w-full max-w-md rounded-2xl p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#1c2436] pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#00ff66]" />
                Update Pilot Profile
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-gray-400 font-mono block">Full Name</label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-[#212b3e] focus:border-[#00ff66] outline-none text-white font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-400 font-mono block">WhatsApp / Phone Number</label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 flex items-center gap-1.5 pointer-events-none select-none border-r border-[#212b3e] pr-2.5">
                    <span className="text-sm leading-none">🇮🇳</span>
                    <span className="text-gray-300 font-mono text-xs font-semibold">+91</span>
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9876543210"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="w-full pl-20 pr-3.5 py-2.5 rounded-xl bg-[#07090e] border border-[#212b3e] focus:border-[#00ff66] outline-none text-white font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-400 font-mono block">College / Institution / Department</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GCOERC Nashik (Comp Engg)"
                  value={editCollege}
                  onChange={(e) => setEditCollege(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-[#212b3e] focus:border-[#00ff66] outline-none text-white font-mono"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-[#141824] text-gray-300 hover:text-white font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-1/2 py-2.5 rounded-xl bg-[#00ff66] hover:bg-[#00cc52] text-black font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(0,255,102,0.3)] disabled:opacity-50 cursor-pointer"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}