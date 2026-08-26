'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
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
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

// Helper function to resolve the exact WhatsApp group URL for an assigned batch
function getBatchWhatsAppUrl(workshop: any, batchStrOrNum: string | number): string {
  const batchNum = typeof batchStrOrNum === 'number' 
    ? batchStrOrNum 
    : Number(String(batchStrOrNum).replace(/\D/g, '') || 1);

  if (Array.isArray(workshop?.whatsapp_links)) {
    const matched = workshop.whatsapp_links.find(
      (item: any) => Number(item.batchNumber) === batchNum
    );
    if (matched?.url && matched.url.trim() !== '') return matched.url;
  }
  return workshop?.fallback_whatsapp_link || 'https://chat.whatsapp.com/default';
}

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function WorkshopRegistrationPage() {
  const routeParams = useParams();
  const requestedWorkshopId = typeof routeParams?.id === 'string' ? routeParams.id : '';

  const [workshop, setWorkshop] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    college: '',
    academicYear: 'SE - Second Year',
    paymentMode: 'online' as 'cash' | 'online',
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredNotice, setRegisteredNotice] = useState<{
    id: string;
    name: string;
    email: string;
    cohort: string;
    batchNumber: number;
    mode: 'cash' | 'online';
    fee: number;
    paymentId?: string;
    whatsappLink?: string;
  } | null>(null);

  useEffect(() => {
    if (!requestedWorkshopId || requestedWorkshopId === 'undefined') {
      setLoading(false);
      return;
    }

    async function loadData() {
      try {
        const { data: workshopData } = await supabase
          .from('workshops')
          .select('*')
          .eq('id', requestedWorkshopId)
          .single();

        if (workshopData) {
          setWorkshop(workshopData);
        } else {
          // Dynamic fallback if no row found
          setWorkshop({
            id: requestedWorkshopId,
            title: 'Aegis Drone Avionics Master Workshop',
            badge: 'CERTIFIED WORKSHOP ★ DESIGN. BUILD. TEST. FLY. MASTER.',
            schedule_date: 'September 2026 Intake',
            venue: 'Guru Gobind Singh College of Engineering and Research Centre, Nashik',
            fee: 300,
            batch_size_limit: 30,
            whatsapp_links: [{ batchNumber: 1, url: '' }],
            fallback_whatsapp_link: '',
            syllabus: [
              '01 BUILD THE BRAIN: ESP32 Flight Controller, Gyro & Sensors (MPU6050), Firmware & Motors Wiring',
              '02 BUILD THE BODY: Quadcopter Chassis Geometry, Aerodynamics & Modular Assembly',
              '03 TEST. TUNE. TRUST: PID Tuning, Thrust Control, Hover & Flight Optimization',
              '100% Hands-on Practical with Live Demonstration Drone',
            ],
          });
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [requestedWorkshopId]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const workshopFee = Number(workshop?.fee ?? 300);

    try {
      // FLOW A: ONLINE RAZORPAY PAYMENT
      if (formData.paymentMode === 'online') {
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
          throw new Error('Razorpay SDK failed to load. Check your internet connection.');
        }

        const orderRes = await fetch('/api/razorpay/order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: workshopFee }),
        });

        const orderData = await orderRes.json();
        if (!orderRes.ok || !orderData.orderId) {
          throw new Error(orderData.error || 'Failed to initialize payment gateway order.');
        }

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: orderData.amount,
          currency: orderData.currency || 'INR',
          name: 'Aegis Drone Avionics Lab',
          description: `${workshop?.title || 'Workshop'} Clearance Pass`,
          order_id: orderData.orderId,
          handler: async function (paymentResponse: any) {
            try {
              setIsSubmitting(true);
              const verifyRes = await fetch('/api/razorpay/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: paymentResponse.razorpay_order_id,
                  razorpay_payment_id: paymentResponse.razorpay_payment_id,
                  razorpay_signature: paymentResponse.razorpay_signature,
                  registrationData: {
                    workshop_id: requestedWorkshopId || 'aegis-master-workshop',
                    full_name: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    college: formData.college,
                    academic_year: formData.academicYear,
                    amount_paid: workshopFee,
                  },
                }),
              });

              const verifyResult = await verifyRes.json();
              if (!verifyRes.ok || !verifyResult.success) {
                throw new Error(verifyResult.error || 'Payment signature verification failed.');
              }

              const assignedBatchNum = Number(verifyResult.assignedBatch?.replace(/\D/g, '') || 1);
              const waLink = getBatchWhatsAppUrl(workshop, assignedBatchNum);

              setRegisteredNotice({
                id: verifyResult.clearanceId || verifyResult.bookingId,
                name: formData.fullName,
                email: formData.email,
                cohort: verifyResult.assignedBatch || 'Batch 1',
                batchNumber: assignedBatchNum,
                mode: 'online',
                fee: workshopFee,
                paymentId: paymentResponse.razorpay_payment_id,
                whatsappLink: waLink,
              });
            } catch (verErr: any) {
              alert(verErr.message || 'Payment verification failed');
            } finally {
              setIsSubmitting(false);
            }
          },
          prefill: {
            name: formData.fullName,
            email: formData.email,
            contact: formData.phone,
          },
          theme: {
            color: '#00FF66',
          },
          modal: {
            ondismiss: function () {
              setIsSubmitting(false);
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        return;
      }

      // FLOW B: SPOT CASH REGISTRATION
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workshopId: requestedWorkshopId || 'aegis-master-workshop',
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          college: formData.college,
          academicYear: formData.academicYear,
          paymentMode: 'cash',
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Registration failed');

      const assignedBatchNum = Number(result.batchNumber || 1);
      const waLink = getBatchWhatsAppUrl(workshop, assignedBatchNum);

      setRegisteredNotice({
        id: result.bookingId,
        name: formData.fullName,
        email: formData.email,
        cohort: result.assignedBatch || 'Batch 1',
        batchNumber: assignedBatchNum,
        mode: 'cash',
        fee: result.fee || workshopFee,
        whatsappLink: waLink,
      });
    } catch (err: any) {
      alert(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-2 border-neon border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-mono text-gray-400">Loading flight lab track...</p>
      </div>
    );
  }

  // CONFIRMATION SCREEN
  if (registeredNotice) {
    return (
      <div className="max-w-xl mx-auto px-6 py-16">
        <div className="bg-[#121212] border border-neon/50 rounded-3xl p-8 text-center space-y-6 shadow-[0_0_40px_rgba(0,255,102,0.12)]">
          {registeredNotice.mode === 'online' ? (
            <>
              <div className="w-20 h-20 mx-auto rounded-full bg-neon/10 border-2 border-neon flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-neon animate-pulse" />
              </div>

              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full bg-neon/10 text-neon font-mono text-[11px] font-bold border border-neon/30 uppercase tracking-wider">
                  ✓ Payment Confirmed • Allotment Secured
                </span>
                <h2 className="text-2xl font-black text-white font-mono uppercase tracking-tight pt-2">
                  Registration Successful!
                </h2>
                
                <div className="inline-block px-4 py-2 rounded-lg bg-[#181d2a] border border-[#2c364e]">
                  <span className="font-mono text-xs text-gray-400">CLEARANCE ID: </span>
                  <span className="font-mono text-sm font-black text-neon tracking-wide">{registeredNotice.id}</span>
                </div>
                <p className="text-xs text-gray-400 font-mono">Assigned Cohort: {registeredNotice.cohort}</p>
              </div>

              <div className="bg-[#141923] border border-[#28354f] p-5 rounded-2xl text-left space-y-3 font-sans">
                <p className="text-xs text-gray-300 leading-relaxed">
                  Congratulations <strong className="text-white">{registeredNotice.name}</strong>! Your workshop seat is confirmed.
                </p>

                {/* Direct Batch WhatsApp Link Button */}
                {registeredNotice.whatsappLink ? (
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
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#00ff66] text-black font-mono font-bold text-xs hover:bg-[#00cc52] transition-all shadow-[0_0_15px_rgba(0,255,102,0.3)]"
                    >
                      <span>Join {registeredNotice.cohort} WhatsApp Group</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ) : null}

                <div className="bg-[#0a0d14] p-4 rounded-xl border border-neon/30 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-white font-mono">
                    <QrCode className="w-4 h-4 text-neon" />
                    <span>Venue Entry Instructions</span>
                  </div>
                  <p className="text-[11px] text-gray-300 leading-relaxed">
                    An official digital pass with your personalized QR code will be dispatched to <strong className="text-neon">{registeredNotice.email}</strong>. Simply present and scan that QR code at the reception desk on event day.
                  </p>
                </div>

                <div className="pt-2 border-t border-[#242e44] flex flex-col sm:flex-row justify-between text-[11px] text-gray-400 font-mono gap-1">
                  <span>Student: <strong className="text-white">{registeredNotice.name}</strong></span>
                  {registeredNotice.paymentId && (
                    <span>Txn ID: <code className="text-gray-300 font-mono">{registeredNotice.paymentId}</code></span>
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
                <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 font-mono text-[11px] font-bold border border-amber-500/30 uppercase tracking-wider">
                  Spot Cash Reserved
                </span>
                <h2 className="text-2xl font-black text-white font-mono uppercase tracking-tight pt-2">
                  Seat Reserved!
                </h2>
                <div className="inline-block px-4 py-2 rounded-lg bg-[#181d2a] border border-[#2c364e]">
                  <span className="font-mono text-xs text-gray-400">CLEARANCE ID: </span>
                  <span className="font-mono text-sm font-black text-amber-400 tracking-wide">{registeredNotice.id}</span>
                </div>
                <p className="text-xs text-gray-400 font-mono">Assigned Cohort: {registeredNotice.cohort}</p>
              </div>

              <div className="bg-[#1a1a1a] border border-[#333] p-5 rounded-2xl text-left space-y-3 font-sans">
                <p className="text-xs text-gray-300 leading-relaxed">
                  Hello <strong className="text-white">{registeredNotice.name}</strong>, your seat is reserved.
                </p>

                {registeredNotice.whatsappLink ? (
                  <div className="bg-[#191910] border border-amber-500/40 p-3.5 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-400 font-mono">
                      <MessageSquare className="w-4 h-4" />
                      <span>Join {registeredNotice.cohort} WhatsApp Group</span>
                    </div>
                    <a
                      href={registeredNotice.whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-400 text-black font-mono font-bold text-xs hover:bg-amber-300 transition-all"
                    >
                      <span>Join WhatsApp Group</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ) : null}

                <div className="bg-[#111] p-3.5 rounded-xl border border-amber-500/30 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-gray-400">Amount Due at Desk:</span>
                    <span className="text-amber-400 font-black">₹{registeredNotice.fee}</span>
                  </div>
                  <p className="text-[11px] text-amber-300/90 leading-relaxed">
                    ⚡ Please submit ₹{registeredNotice.fee} in cash at the Avionics Lab desk on arrival.
                  </p>
                </div>
              </div>
            </>
          )}

          <div className="pt-2">
            <Link
              href="/"
              className="inline-block px-6 py-2.5 rounded-xl bg-neon text-black font-bold font-mono text-xs uppercase hover:bg-[#00cc52] transition-all shadow-[0_0_20px_rgba(0,255,102,0.25)]"
            >
              ← Return to Command Home
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
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-3">
            <span className="px-3 py-1 rounded-full bg-neon/10 border border-neon/30 text-neon font-bold text-xs font-mono inline-block">
              {workshop?.badge || 'CERTIFIED WORKSHOP ★ SEPTEMBER 2026'}
            </span>
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
              <span>Interactive cohort session: Team-based flight assembly and calibration ({workshop?.batch_size_limit || 30} seats / batch).</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-[#121212] border border-neon/40 rounded-2xl p-6 space-y-6 shadow-[0_0_30px_rgba(0,255,102,0.08)]">
            <div className="border-b border-[#242424] pb-4 flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-white font-mono uppercase">Attendee Registration</h2>
                <p className="text-[10px] text-gray-400 font-mono">SEAT REGISTRY ALLOTMENT</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-neon font-mono">₹{workshop?.fee ?? 300}</span>
              </div>
            </div>

            <form onSubmit={handleRegister} className="space-y-3.5 text-xs font-sans">
              <div className="space-y-1">
                <label className="text-gray-400 font-mono text-[11px]">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sanika Dusane"
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
                  placeholder="+91 7620350524"
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
                  placeholder="e.g. GCOERC Nashik"
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
                      <span className="text-neon font-bold text-xs font-mono">UPI / Instant Online</span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono block mt-0.5">Pay ₹{workshop?.fee ?? 300} via Razorpay</span>
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
                    <span className="text-[10px] text-gray-400 font-mono block mt-0.5">Pay ₹{workshop?.fee ?? 300} at lab desk</span>
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
                    <span>Processing Secure Gateway...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>
                      {formData.paymentMode === 'online' ? 'Proceed to Pay ₹' : 'Confirm Cash Reservation ₹'}
                      {workshop?.fee ?? 300}
                    </span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}