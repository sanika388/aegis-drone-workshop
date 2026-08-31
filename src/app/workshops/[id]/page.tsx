'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowLeft, 
  CheckCircle2, 
  UserCheck, 
  Calendar, 
  MapPin, 
  AlertTriangle, 
  Banknote, 
  QrCode, 
  Loader2,
  MessageSquare,
  ExternalLink,
  Ticket,
  Copy,
  ShieldCheck,
  Users
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import AuthGuard from '@/components/AuthGuard';
import { toast } from 'sonner';

// Configurable UPI Payment Settings
const UPI_CONFIG = {
  vpa: 'aegisdrones.officials@oksbi', // Replace with your primary UPI ID (e.g., yourname@okaxis / phonepe)
  payeeName: 'Aegis Drone Avionics Lab',
  defaultAmount: 300,
};

const DEFAULT_BATCH_LIMIT = 30;

// Helper to resolve the WhatsApp group link for the assigned batch
function getBatchWhatsAppUrl(workshop: any, batchStrOrNum: string | number): string {
  const batchNum = typeof batchStrOrNum === 'number' 
    ? batchStrOrNum 
    : Number(String(batchStrOrNum).replace(/\D/g, '') || 1);

  const batchKey = `Batch ${batchNum}`;

  if (workshop?.cohort_whatsapp_links && workshop.cohort_whatsapp_links[batchKey]) {
    return workshop.cohort_whatsapp_links[batchKey];
  }

  if (Array.isArray(workshop?.whatsapp_links)) {
    const matched = workshop.whatsapp_links.find(
      (item: any) => Number(item.batchNumber) === batchNum
    );
    if (matched?.url && matched.url.trim() !== '') return matched.url;
  }

  return workshop?.fallback_whatsapp_link || 'https://chat.whatsapp.com/default-aegis-community';
}

function WorkshopRegistrationContent() {
  const routeParams = useParams();
  const router = useRouter();
  const requestedWorkshopId = typeof routeParams?.id === 'string' ? routeParams.id : '';

  const [workshop, setWorkshop] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState<'details' | 'upi_qr'>('details');

  const [assignedBatch, setAssignedBatch] = useState<number>(1);
  const [currentCohortCount, setCurrentCohortCount] = useState<number>(0);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    college: '',
    academicYear: 'SE - Second Year',
    paymentMode: 'online' as 'online' | 'cash',
    utrNumber: '',
  });

  const [registeredNotice, setRegisteredNotice] = useState<{
    id: string;
    name: string;
    email: string;
    cohort: string;
    batchNumber: number;
    mode: 'online' | 'cash';
    fee: number;
    utrNumber?: string;
    whatsappLink?: string;
  } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        // 1. Get logged-in user profile
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUser(user);
          setFormData((prev) => ({
            ...prev,
            email: user.email || prev.email,
            fullName: user.user_metadata?.full_name || user.user_metadata?.name || prev.fullName,
            phone: user.user_metadata?.phone || prev.phone,
            college: user.user_metadata?.college || prev.college,
          }));
        }

        if (!requestedWorkshopId || requestedWorkshopId === 'undefined') {
          setLoading(false);
          return;
        }

        // 2. Fetch workshop data
        const { data: workshopData } = await supabase
          .from('workshops')
          .select('*')
          .eq('id', requestedWorkshopId)
          .maybeSingle();

        const ws = workshopData || {
          id: requestedWorkshopId,
          title: 'Aegis Drone Avionics Master Workshop',
          badge: 'CERTIFIED WORKSHOP ★ DESIGN. BUILD. TEST. FLY. MASTER.',
          schedule_date: 'September 2026 Intake',
          venue: 'Guru Gobind Singh College of Engineering and Research Centre, Nashik',
          fee: 300,
          batch_size_limit: DEFAULT_BATCH_LIMIT,
          whatsapp_links: [{ batchNumber: 1, url: '' }],
          fallback_whatsapp_link: '',
          syllabus: [
            '01 BUILD THE BRAIN: ESP32 Flight Controller, Gyro & Sensors (MPU6050), Firmware & Motors Wiring',
            '02 BUILD THE BODY: Quadcopter Chassis Geometry, Aerodynamics & Modular Assembly',
            '03 TEST. TUNE. TRUST: PID Tuning, Thrust Control, Hover & Flight Optimization',
            '100% Hands-on Practical with Live Demonstration Drone',
          ],
        };
        setWorkshop(ws);

        // 3. Compute dynamic batch allocation
        const { count } = await supabase
          .from('registrations')
          .select('id', { count: 'exact', head: true })
          .eq('workshop_id', requestedWorkshopId);

        const totalRegistered = count || 0;
        setCurrentCohortCount(totalRegistered);
        const batchLimit = ws.batch_size_limit || DEFAULT_BATCH_LIMIT;
        const calculatedBatch = Math.floor(totalRegistered / batchLimit) + 1;
        setAssignedBatch(calculatedBatch);
      } catch (err) {
        console.error('Data load error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [requestedWorkshopId]);

  const workshopFee = Number(workshop?.fee ?? UPI_CONFIG.defaultAmount);

  // Construct UPI Deep Link & Visual QR
  const upiUri = `upi://pay?pa=${encodeURIComponent(UPI_CONFIG.vpa)}&pn=${encodeURIComponent(UPI_CONFIG.payeeName)}&am=${workshopFee}&cu=INR&tn=${encodeURIComponent(`Aegis B${assignedBatch}-${formData.fullName.slice(0, 10)}`)}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiUri)}&color=000000&bgcolor=ffffff&margin=10`;

  const copyUPI = () => {
    navigator.clipboard.writeText(UPI_CONFIG.vpa);
    toast.success('UPI ID copied to clipboard!');
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If online UPI is selected and user is in step 1, advance to QR display
    if (formData.paymentMode === 'online' && activeStep === 'details') {
      if (!formData.fullName || !formData.email || !formData.phone) {
        toast.error('Please fill in all required pilot details.');
        return;
      }
      setActiveStep('upi_qr');
      return;
    }

    // Process Final Registration
    setIsSubmitting(true);

    try {
      const cleanUtr = formData.utrNumber.trim();

      // Validate UTR if paying online
      if (formData.paymentMode === 'online') {
        if (cleanUtr.length < 8) {
          throw new Error('Please enter a valid 12-digit UPI UTR / Transaction Reference number.');
        }

        // Duplicate UTR check
        const { data: existingUtr } = await supabase
          .from('registrations')
          .select('id')
          .eq('utr_number', cleanUtr)
          .maybeSingle();

        if (existingUtr) {
          throw new Error('This UPI Reference Number (UTR) has already been submitted.');
        }
      }

      // Generate Clearance ID
      const clearanceId = `AEGIS-B${assignedBatch}-${Math.floor(1000 + Math.random() * 9000)}`;
      const batchLabel = `Batch ${assignedBatch}`;

      // Insert into Supabase
      const { data: reg, error: regError } = await supabase
        .from('registrations')
        .insert({
          workshop_id: requestedWorkshopId || 'aegis-master-workshop',
          user_id: currentUser?.id || null,
          full_name: formData.fullName.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          college: formData.college.trim(),
          academic_year: formData.academicYear,
          clearance_id: clearanceId,
          batch_number: assignedBatch,
          cohort_label: batchLabel,
          amount_paid: workshopFee,
          payment_status: formData.paymentMode === 'online' ? 'pending_verification' : 'pending_desk',
          payment_method: formData.paymentMode === 'online' ? 'upi_qr' : 'cash',
          utr_number: formData.paymentMode === 'online' ? cleanUtr : null,
        })
        .select()
        .single();

      if (regError) throw regError;

      const waLink = getBatchWhatsAppUrl(workshop, assignedBatch);

      toast.success(
        formData.paymentMode === 'online' 
          ? 'UPI payment submitted! Seat reserved for verification.' 
          : 'Spot cash seat reserved successfully!'
      );

      setRegisteredNotice({
        id: reg?.clearance_id || clearanceId,
        name: formData.fullName,
        email: formData.email,
        cohort: batchLabel,
        batchNumber: assignedBatch,
        mode: formData.paymentMode,
        fee: workshopFee,
        utrNumber: cleanUtr || undefined,
        whatsappLink: waLink,
      });
    } catch (err: any) {
      toast.error(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3 font-mono text-neon">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-xs">Loading flight lab track...</p>
      </div>
    );
  }

  // CONFIRMATION NOTICE SCREEN
  if (registeredNotice) {
    return (
      <div className="max-w-xl mx-auto px-6 py-16">
        <div className="bg-[#121212] border border-neon/50 rounded-3xl p-8 text-center space-y-6 shadow-[0_0_40px_rgba(0,255,102,0.12)] font-mono">
          {registeredNotice.mode === 'online' ? (
            <>
              <div className="w-20 h-20 mx-auto rounded-full bg-neon/10 border-2 border-neon flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-neon animate-pulse" />
              </div>

              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full bg-neon/10 text-neon text-[11px] font-bold border border-neon/30 uppercase tracking-wider">
                  ✓ UPI UTR Submitted • Awaiting Clearance Approval
                </span>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight pt-2">
                  Registration Received!
                </h2>
                
                <div className="inline-block px-4 py-2 rounded-lg bg-[#181d2a] border border-[#2c364e]">
                  <span className="text-xs text-gray-400">CLEARANCE ID: </span>
                  <span className="text-sm font-black text-neon tracking-wide">{registeredNotice.id}</span>
                </div>
                <p className="text-xs text-gray-400">Assigned Cohort: {registeredNotice.cohort}</p>
              </div>

              <div className="bg-[#141923] border border-[#28354f] p-5 rounded-2xl text-left space-y-3 font-sans">
                <p className="text-xs text-gray-300 leading-relaxed">
                  Congratulations <strong className="text-white">{registeredNotice.name}</strong>! Your registration and UTR reference have been recorded. Your digital gate pass will activate upon admin verification.
                </p>

                {registeredNotice.whatsappLink && (
                  <div className="bg-[#0b1f14] border border-[#00ff66]/40 p-3.5 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#00ff66] font-mono">
                      <MessageSquare className="w-4 h-4" />
                      <span>Join Your Official Cohort Group</span>
                    </div>
                    <p className="text-[11px] text-gray-300">
                      Connect with fellow engineers and receive kit instructions:
                    </p>
                    <a
                      href={registeredNotice.whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#00ff66] text-black font-mono font-bold text-xs hover:bg-[#00cc52] transition-all shadow-[0_0_15px_rgba(0,255,102,0.3)] cursor-pointer"
                    >
                      <span>Join {registeredNotice.cohort} WhatsApp Group</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}

                <div className="bg-[#0a0d14] p-4 rounded-xl border border-neon/30 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-white font-mono">
                    <QrCode className="w-4 h-4 text-neon" />
                    <span>Venue Entry Instructions</span>
                  </div>
                  <p className="text-[11px] text-gray-300 leading-relaxed">
                    Once verified by the flight desk, your boarding pass QR code will be dispatched to <strong className="text-neon">{registeredNotice.email}</strong> for scanning at the reception desk on event day.
                  </p>
                </div>

                <div className="pt-2 border-t border-[#242e44] flex flex-col sm:flex-row justify-between text-[11px] text-gray-400 font-mono gap-1">
                  <span>Student: <strong className="text-white">{registeredNotice.name}</strong></span>
                  {registeredNotice.utrNumber && (
                    <span>UTR: <code className="text-neon font-mono">{registeredNotice.utrNumber}</code></span>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="w-20 h-20 mx-auto rounded-full bg-amber-500/10 border-2 border-amber-500/40 flex items-center justify-center">
                <Banknote className="w-10 h-10 text-amber-400 animate-pulse" />
              </div>

              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-[11px] font-bold border border-amber-500/30 uppercase tracking-wider">
                  Spot Cash Reserved
                </span>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight pt-2">
                  Seat Reserved!
                </h2>
                <div className="inline-block px-4 py-2 rounded-lg bg-[#181d2a] border border-[#2c364e]">
                  <span className="text-xs text-gray-400">CLEARANCE ID: </span>
                  <span className="text-sm font-black text-amber-400 tracking-wide">{registeredNotice.id}</span>
                </div>
                <p className="text-xs text-gray-400">Assigned Cohort: {registeredNotice.cohort}</p>
              </div>

              <div className="bg-[#1a1a1a] border border-[#333] p-5 rounded-2xl text-left space-y-3 font-sans">
                <p className="text-xs text-gray-300 leading-relaxed">
                  Hello <strong className="text-white">{registeredNotice.name}</strong>, your workshop seat is held in reserve.
                </p>

                {registeredNotice.whatsappLink && (
                  <div className="bg-[#191910] border border-amber-500/40 p-3.5 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-400 font-mono">
                      <MessageSquare className="w-4 h-4" />
                      <span>Join {registeredNotice.cohort} WhatsApp Group</span>
                    </div>
                    <a
                      href={registeredNotice.whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-400 text-black font-mono font-bold text-xs hover:bg-amber-300 transition-all cursor-pointer"
                    >
                      <span>Join WhatsApp Group</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}

                <div className="bg-[#111] p-3.5 rounded-xl border border-amber-500/30 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-gray-400">Amount Due at Desk:</span>
                    <span className="text-amber-400 font-black">₹{registeredNotice.fee}</span>
                  </div>
                  <p className="text-[11px] text-amber-300/90 leading-relaxed">
                    ⚡ Please submit ₹{registeredNotice.fee} in cash at the Avionics Lab desk on arrival to confirm clearance.
                  </p>
                </div>
              </div>
            </>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href={`/pass/${registeredNotice.id}`}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-neon text-black font-bold font-mono text-xs uppercase hover:bg-[#00cc52] transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(0,255,102,0.25)]"
            >
              <Ticket className="w-4 h-4" />
              <span>View Clearance Pass</span>
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#141824] border border-[#232b3d] text-gray-300 hover:text-white font-bold font-mono text-xs uppercase transition-all"
            >
              Command Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
      <div>
        <Link
          href="/workshops"
          className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-neon transition-colors font-mono"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>BACK TO WORKSHOP CATALOG</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Workshop Details */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-neon/10 border border-neon/30 text-neon font-bold text-xs font-mono inline-block">
                {workshop?.badge || 'CERTIFIED WORKSHOP ★ SEPTEMBER 2026'}
              </span>
              <span className="px-3 py-1 rounded-full bg-[#162032] border border-[#2a3854] text-gray-300 font-bold text-xs font-mono inline-flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-neon" />
                Allocated Cohort: Batch {assignedBatch}
              </span>
            </div>

            <h1 className="text-3xl font-black text-white tracking-tight font-mono">
              {workshop?.title || 'Aegis Drone Avionics Master Workshop'}
            </h1>
            <p className="text-sm font-semibold text-neon font-mono">
              BUILD. CODE. FLY. NOT JUST A DRONE, BUT YOUR SKILLS.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 text-xs text-gray-400 pt-2 font-mono">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-neon shrink-0" />
                <span>{workshop?.schedule_date || workshop?.date || 'September 2026 Intake'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-neon shrink-0" />
                <span>{workshop?.venue || 'Guru Gobind Singh College of Engineering and Research Centre, Nashik'}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#121212] border border-[#242424] rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
              Training Modules & Hands-On Engineering
            </h3>
            <ul className="space-y-3 text-xs text-gray-300 font-sans">
              {(workshop?.syllabus || [
                '01 BUILD THE BRAIN: ESP32 Flight Controller, Gyro (MPU6050), ESCs & Firmware',
                '02 BUILD THE BODY: 3D Printed Quadcopter Chassis, Aerodynamics & Assembly',
                '03 TEST. TUNE. TRUST: PID Tuning, Thrust Control, Hover & Live Flight Optimization',
                '100% Hands-on Practical with Live Demonstration Drone',
              ]).map((item: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-neon shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="bg-[#1a1a1a] border border-neon/20 rounded-xl p-3 flex items-center gap-2.5 text-[11px] text-gray-300 font-mono">
              <AlertTriangle className="w-4 h-4 shrink-0 text-neon" />
              <span>Interactive cohort session: Team-based flight assembly and calibration ({workshop?.batch_size_limit || DEFAULT_BATCH_LIMIT} seats / batch).</span>
            </div>
          </div>
        </div>

        {/* Right Column: Registration & Payment Box */}
        <div className="lg:col-span-5">
          <div className="bg-[#121212] border border-neon/40 rounded-2xl p-6 space-y-6 shadow-[0_0_30px_rgba(0,255,102,0.08)]">
            <div className="border-b border-[#242424] pb-4 flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-white font-mono uppercase">
                  {activeStep === 'upi_qr' ? 'UPI QR Payment' : 'Attendee Registration'}
                </h2>
                <p className="text-[10px] text-gray-400 font-mono">
                  {activeStep === 'upi_qr' ? 'STEP 2: SCAN & SUBMIT UTR' : 'STEP 1: SEAT REGISTRY ALLOTMENT'}
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-neon font-mono">₹{workshopFee}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
              
              {/* STEP 1: PILOT DETAILS */}
              {activeStep === 'details' && (
                <>
                  <div className="space-y-1">
                    <label className="text-gray-400 font-mono text-[11px]">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Pilot Name"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#242424] focus:border-neon outline-none text-white text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-gray-400 font-mono text-[11px]">Email Address (For Pass) *</label>
                    <input
                      type="email"
                      required
                      placeholder="student@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#242424] focus:border-neon outline-none text-white text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-gray-400 font-mono text-[11px]">WhatsApp Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 9876543210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#242424] focus:border-neon outline-none text-white text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-gray-400 font-mono text-[11px]">College / Institute / School *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Engineering Institute"
                      value={formData.college}
                      onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#242424] focus:border-neon outline-none text-white text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-gray-400 font-mono text-[11px]">Academic Year *</label>
                    <select
                      value={formData.academicYear}
                      onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#242424] focus:border-neon outline-none text-white text-xs font-mono"
                    >
                      <option value="FE - First Year">FE - First Year</option>
                      <option value="SE - Second Year">SE - Second Year</option>
                      <option value="TE - Third Year">TE - Third Year</option>
                      <option value="BE - Final Year">BE - Final Year</option>
                      <option value="School / Diploma / Other">School / Diploma / Other</option>
                    </select>
                  </div>

                  {/* Payment Mode Selection */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-gray-400 font-mono text-[11px] block uppercase">
                      Payment Mode Selection
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div
                        onClick={() => setFormData({ ...formData, paymentMode: 'online' })}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                          formData.paymentMode === 'online'
                            ? 'bg-[#141824] border-neon shadow-[0_0_15px_rgba(0,255,102,0.15)]'
                            : 'bg-[#0a0c10] border-[#222736] opacity-70'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <QrCode className="w-3.5 h-3.5 text-neon" />
                          <span className="text-neon font-bold text-xs font-mono">UPI QR Scan</span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono block mt-0.5">Pay ₹{workshopFee} via GPay/PhonePe</span>
                      </div>

                      <div
                        onClick={() => setFormData({ ...formData, paymentMode: 'cash' })}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                          formData.paymentMode === 'cash'
                            ? 'bg-[#141824] border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                            : 'bg-[#0a0c10] border-[#222736] opacity-70'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Banknote className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-amber-400 font-bold text-xs font-mono">Spot Cash</span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono block mt-0.5">Pay ₹{workshopFee} at lab desk</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-lg bg-neon text-black font-bold text-xs hover:bg-[#00cc52] transition-all tracking-wider uppercase disabled:opacity-50 mt-4 flex items-center justify-center gap-2 cursor-pointer font-mono shadow-[0_0_20px_rgba(0,255,102,0.25)]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                        <span>Processing Reservation...</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4" />
                        <span>
                          {formData.paymentMode === 'online' ? `Proceed to UPI QR (₹${workshopFee})` : `Confirm Cash Reservation (₹${workshopFee})`}
                        </span>
                      </>
                    )}
                  </button>
                </>
              )}

              {/* STEP 2: UPI QR DISPLAY & UTR INPUT */}
              {activeStep === 'upi_qr' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs text-gray-400 font-mono">Scan QR to pay ₹{workshopFee}</span>
                    <button
                      type="button"
                      onClick={() => setActiveStep('details')}
                      className="text-[11px] text-neon underline hover:text-white font-mono cursor-pointer"
                    >
                      ← Edit Info
                    </button>
                  </div>

                  {/* QR Code Container */}
                  <div className="flex flex-col items-center justify-center p-4 bg-[#08090d] border border-[#1e2538] rounded-2xl space-y-3 text-center">
                    <div className="p-2 bg-white rounded-xl shadow-[0_0_20px_rgba(0,255,102,0.2)]">
                      <Image
                        src={qrImageUrl}
                        alt="Aegis UPI QR Code"
                        width={180}
                        height={180}
                        className="rounded-lg"
                        unoptimized
                      />
                    </div>

                    <div className="space-y-1">
                      <p className="text-[11px] font-bold text-white uppercase tracking-wider font-mono">
                        Scan with GPay / PhonePe / Paytm / BHIM
                      </p>
                      <div className="flex items-center justify-center gap-2 text-xs font-mono">
                        <span className="text-gray-400">UPI ID:</span>
                        <span className="text-neon font-bold">{UPI_CONFIG.vpa}</span>
                        <button
                          type="button"
                          onClick={copyUPI}
                          className="p-1 hover:text-white text-gray-400 transition-colors"
                          title="Copy UPI ID"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* UTR Input */}
                  <div className="space-y-1.5 font-mono">
                    <label className="text-gray-300 font-bold text-[11px] flex justify-between">
                      <span>12-Digit UPI Reference (UTR) *</span>
                      <span className="text-[10px] text-neon">From Payment Receipt</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={24}
                      placeholder="e.g. 423981290384"
                      value={formData.utrNumber}
                      onChange={(e) => setFormData({ ...formData, utrNumber: e.target.value.replace(/[^a-zA-Z0-9]/g, '') })}
                      className="w-full px-3 py-2.5 rounded-lg bg-[#0a0a0a] border border-neon/50 focus:border-neon outline-none text-white text-xs font-mono text-center tracking-widest uppercase"
                    />
                    <p className="text-[10px] text-gray-500 font-sans">
                      Complete payment in your UPI app, then copy the 12-digit UTR/UPI Transaction ID and paste it above.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-lg bg-neon text-black font-bold text-xs hover:bg-[#00cc52] transition-all tracking-wider uppercase disabled:opacity-50 mt-4 flex items-center justify-center gap-2 cursor-pointer font-mono shadow-[0_0_20px_rgba(0,255,102,0.35)]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                        <span>Submitting Verification...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Submit Registration Pass</span>
                      </>
                    )}
                  </button>
                </div>
              )}

            </form>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function WorkshopRegistrationPage() {
  return (
    <AuthGuard>
      <WorkshopRegistrationContent />
    </AuthGuard>
  );
}