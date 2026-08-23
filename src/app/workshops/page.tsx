'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { ArrowLeft, CheckCircle2, UserCheck, Calendar, MapPin, Tag } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function WorkshopRegistrationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const requestedWorkshopId = resolvedParams.id;

  const [workshop, setWorkshop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    college: '',
    year: 'TE - Third Year',
  });

  useEffect(() => {
    async function loadDataAndAuth() {
      try {
        // 1. Fetch current authenticated user and prefill email
        const { data: authData } = await supabase.auth.getSession();
        if (authData?.session?.user?.email) {
          setFormData((prev) => ({
            ...prev,
            email: authData.session.user.email || '',
          }));
        }

        // 2. Fetch Workshop Details (Price controlled directly by database)
        const { data: workshopData, error: workshopError } = await supabase
          .from('workshops')
          .select('*')
          .eq('id', requestedWorkshopId)
          .single();

        if (!workshopError && workshopData) {
          setWorkshop(workshopData);
        }
      } catch (err) {
        console.error('Error loading registration page:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDataAndAuth();

    // Listen for auth session changes (Magic link redirects)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        setFormData((prev) => ({ ...prev, email: session.user.email || '' }));
      }
    });

    return () => subscription.unsubscribe();
  }, [requestedWorkshopId]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const entryFee = Number(workshop.fee);
      const registrationId = 'AEGIS-' + Math.floor(100000 + Math.random() * 900000);

      // 1. Create Razorpay Order with the exact manual database price
      const res = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: entryFee,
          receipt: registrationId,
        }),
      });

      const orderData = await res.json();
      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to initialize payment gateway.');
      }

      // 2. Open Razorpay Checkout Popup
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: 'INR',
        name: 'Aegis Drone Workshop',
        description: `${workshop.title} Entry Pass`,
        image: '/logo.png',
        order_id: orderData.order.id,
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#00ff66',
        },
        handler: async function (response: any) {
          // 3. Payment Confirmed -> Save to Supabase
          const { error: insertErr } = await supabase.from('registrations').insert([
            {
              id: registrationId,
              workshop_id: requestedWorkshopId,
              full_name: formData.fullName,
              email: formData.email,
              phone: formData.phone,
              college: formData.college,
              academic_year: formData.year,
              amount_paid: entryFee,
              payment_status: 'paid',
              razorpay_payment_id: response.razorpay_payment_id,
            },
          ]);

          if (insertErr) {
            console.error('Supabase write error:', insertErr);
          }

          // 4. Redirect to digital pass receipt
          router.push(
            `/receipt/${registrationId}?workshop=${requestedWorkshopId}&name=${encodeURIComponent(
              formData.fullName
            )}&email=${encodeURIComponent(formData.email)}&amount=${entryFee}`
          );
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (err: any) {
      console.error('Registration failed:', err);
      alert(err.message || 'Registration failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-2 border-neon border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-mono text-gray-400">Loading terminal...</p>
      </div>
    );
  }

  if (!workshop) {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Workshop Track Not Found</h2>
        <Link href="/workshops" className="text-neon text-xs hover:underline">
          Return to Workshops
        </Link>
      </div>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
        <Link
          href="/workshops"
          className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-neon transition-colors font-mono"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>BACK TO WORKSHOP TRACKS</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Workshop Details */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <span className="px-3 py-1 rounded-full bg-neon/10 border border-neon/30 text-neon font-bold text-xs font-mono inline-block">
                {workshop.badge || 'AEGIS WORKSHOP'}
              </span>
              <h1 className="text-3xl font-black text-white">{workshop.title}</h1>
              <div className="flex flex-col sm:flex-row gap-4 text-xs text-gray-400 pt-2">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-neon" />
                  <span>{workshop.date || 'Upcoming Batch'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-neon" />
                  <span>{workshop.venue || 'GCOERC Campus'}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#121212] border border-[#242424] rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                Training Modules & Kit Details
              </h3>
              <ul className="space-y-2.5 text-xs text-gray-300">
                {workshop.syllabus?.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-neon shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Checkout Box */}
          <div className="lg:col-span-5">
            <div className="bg-[#121212] border border-neon/40 rounded-2xl p-6 space-y-6 shadow-[0_0_30px_rgba(0,255,102,0.08)]">
              <div className="border-b border-[#242424] pb-4 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-white">Attendee Checkout</h2>
                  <p className="text-[11px] text-gray-400 font-mono">UPI • CARDS • NETBANKING</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-500 font-mono uppercase line-through mr-1">
                    ₹1000
                  </span>
                  <span className="text-xl font-black text-neon font-mono">₹{workshop.fee}</span>
                </div>
              </div>

              <form onSubmit={handleRegister} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-gray-400">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Sanika Dusane"
                    className="w-full px-3 py-2.5 rounded-lg bg-[#0a0a0a] border border-[#242424] focus:border-neon outline-none text-white text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-400">Email Address (Registered Account)</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="student@example.com"
                    className="w-full px-3 py-2.5 rounded-lg bg-[#0a0a0a] border border-[#242424] focus:border-neon outline-none text-white text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-400">Phone Number (WhatsApp)</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2.5 rounded-lg bg-[#0a0a0a] border border-[#242424] focus:border-neon outline-none text-white text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-400">College / Organization</label>
                  <input
                    type="text"
                    required
                    value={formData.college}
                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                    placeholder="GCOERC Nashik"
                    className="w-full px-3 py-2.5 rounded-lg bg-[#0a0a0a] border border-[#242424] focus:border-neon outline-none text-white text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-400">Academic Year</label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg bg-[#0a0a0a] border border-[#242424] focus:border-neon outline-none text-white text-xs"
                  >
                    <option value="FE - First Year">FE - First Year</option>
                    <option value="SE - Second Year">SE - Second Year</option>
                    <option value="TE - Third Year">TE - Third Year</option>
                    <option value="BE - Final Year">BE - Final Year</option>
                    <option value="Professional / Faculty">Professional / Faculty</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-lg bg-neon text-black font-bold text-xs hover:bg-[#00cc52] transition-all tracking-wider uppercase disabled:opacity-50 mt-4 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Opening Payment Gateway...</span>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>Pay ₹{workshop.fee} & Generate Pass</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}