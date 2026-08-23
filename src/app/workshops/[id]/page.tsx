'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2, UserCheck, Calendar, MapPin, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function WorkshopRegistrationPage() {
  const router = useRouter();
  const routeParams = useParams();
  const requestedWorkshopId = typeof routeParams?.id === 'string' ? routeParams.id : '';

  const [workshop, setWorkshop] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    college: '',
    academicYear: 'SE - Second Year',
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          setWorkshop({
            id: requestedWorkshopId,
            title: 'Aegis Drone Workshop',
            badge: 'CERTIFIED WORKSHOP ★ DESIGN. BUILD. TEST. FLY. MASTER.',
            date: 'September Month',
            venue: 'Guru Gobind Singh College of Engineering & Research Centre, Nashik',
            fee: 300,
            max_capacity: 20,
            syllabus: [
              '01 BUILD THE BRAIN: ESP Module (ESP32), Gyro & Sensors (MPU6050/BMI270), Firmware & Motors Wiring',
              '02 BUILD THE BODY: 3D Printed Quadcopter Chassis, Aerodynamics & Modular Assembly',
              '03 TEST. TUNE. TRUST: PID Tuning, Thrust Control, Hover & Flight Optimization',
              '100% Hands-on Practical with Real Components & Connectors',
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

    try {
      const registrationId = 'AEGIS-' + Math.floor(100000 + Math.random() * 900000);
      const entryFee = Number(workshop?.fee || 300);

      const { error: insertErr } = await supabase.from('registrations').insert([
        {
          id: registrationId,
          workshop_id: requestedWorkshopId,
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          college: formData.college,
          academic_year: formData.academicYear,
          custom_data: formData,
          amount_paid: entryFee,
          payment_status: 'confirmed',
          razorpay_payment_id: 'DIRECT_PASS_CONFIRMED',
        },
      ]);

      if (insertErr) console.error('Supabase write notice:', insertErr);

      router.push(
        `/receipt/${registrationId}?workshop=${requestedWorkshopId}&name=${encodeURIComponent(
          formData.fullName
        )}&email=${encodeURIComponent(formData.email)}&amount=${entryFee}`
      );
    } catch (err: any) {
      alert(err.message || 'Registration failed.');
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

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
      <div>
        <Link
          href="/workshops"
          className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-neon transition-colors font-mono"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>ALL WORKSHOPS</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-3">
            <span className="px-3 py-1 rounded-full bg-neon/10 border border-neon/30 text-neon font-bold text-xs font-mono inline-block">
              {workshop?.badge || 'CERTIFIED WORKSHOP'}
            </span>
            <h1 className="text-3xl font-black text-white tracking-tight">{workshop?.title || 'Aegis Drone Workshop'}</h1>
            <p className="text-sm font-semibold text-neon font-mono">BUILD. CODE. FLY. NOT JUST A DRONE, BUT YOUR SKILLS.</p>

            <div className="flex flex-col sm:flex-row gap-4 text-xs text-gray-400 pt-2 font-mono">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-neon shrink-0" />
                <span>{workshop?.date || 'September Month'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-neon shrink-0" />
                <span>{workshop?.venue || 'GCOERC Campus, Nashik'}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#121212] border border-[#242424] rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
              Training Modules & Hands-On Engineering
            </h3>
            <ul className="space-y-3 text-xs text-gray-300 font-sans">
              {(workshop?.syllabus || [
                '01 BUILD THE BRAIN: ESP32 Flight Controller, Gyro (MPU6050/BMI270), ESCs & Firmware',
                '02 BUILD THE BODY: 3D Printed Quadcopter Chassis, Aerodynamics & Assembly',
                '03 TEST. TUNE. TRUST: PID Tuning, Thrust Control, Hover & Live Flight Optimization',
              ]).map((item: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-neon shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="bg-[#1a1a1a] border border-amber-500/30 rounded-xl p-3 flex items-center gap-2.5 text-[11px] text-amber-300 font-mono">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Note: Hands-on practical tasks are performed on dedicated lab hardware (20 seats / batch).</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-[#121212] border border-neon/40 rounded-2xl p-6 space-y-6 shadow-[0_0_30px_rgba(0,255,102,0.08)]">
            <div className="border-b border-[#242424] pb-4 flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-white font-mono uppercase">Attendee Checkout</h2>
                <p className="text-[10px] text-gray-400 font-mono">CONFIRMED SEAT PASS</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-500 font-mono uppercase line-through mr-1.5">₹1000</span>
                <span className="text-2xl font-black text-neon font-mono">₹{workshop?.fee || 300}</span>
              </div>
            </div>

            <form onSubmit={handleRegister} className="space-y-3.5 text-xs font-sans">
              <div className="space-y-1">
                <label className="text-gray-400">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sanika Dusane"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#242424] focus:border-neon outline-none text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="student@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#242424] focus:border-neon outline-none text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400">WhatsApp Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 90287 88532"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#242424] focus:border-neon outline-none text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400">College / Institute *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GCOERC Nashik"
                  value={formData.college}
                  onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#242424] focus:border-neon outline-none text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400">Academic Year *</label>
                <select
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#242424] focus:border-neon outline-none text-white text-xs"
                >
                  <option value="FE - First Year">FE - First Year</option>
                  <option value="SE - Second Year">SE - Second Year</option>
                  <option value="TE - Third Year">TE - Third Year</option>
                  <option value="BE - Final Year">BE - Final Year</option>
                  <option value="School / Diploma / Other">School / Diploma / Other</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-lg bg-neon text-black font-bold text-xs hover:bg-[#00cc52] transition-all tracking-wider uppercase disabled:opacity-50 mt-4 flex items-center justify-center gap-2 cursor-pointer font-mono"
              >
                {isSubmitting ? (
                  <span>Generating Hardware Pass...</span>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Claim Seat Pass (₹{workshop?.fee || 300})</span>
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