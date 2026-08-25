'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { 
  MapPin, 
  Mail, 
  Phone, 
  MessageSquare, 
  CheckCircle2, 
  Send, 
  Loader2, 
  ExternalLink,
  Building,
  Sparkles,
  SunMoon
} from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: 'Workshop & Batch Inquiry',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to transmit inquiry.');

      setIsSubmitted(true);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        subject: 'Workshop & Batch Inquiry',
        message: '',
      });
    } catch (err: any) {
      console.error('Inquiry submission error:', err);
      setErrorMsg(err.message || 'Transmission failed. Please connect via WhatsApp directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 space-y-12">
      
      {/* Header Banner */}
      <div className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neon/10 border border-neon/30 text-neon font-mono text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AVIONICS COMMAND DESK & LAB SUPPORT</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white font-mono uppercase tracking-tight">
          Get in Touch
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 font-mono max-w-3xl leading-relaxed">
          Direct communication desk for batch allocations, spot cash confirmations, hardware kit inquiries, and institutional registrations at GCOERC Nashik.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Direct Coordinator & Desk Details */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Sole Coordinator Direct Line */}
          <div className="bg-[#0b0e14] border-2 border-[#1c2438] hover:border-neon/40 rounded-2xl p-6 space-y-4 transition-all shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-neon font-mono text-xs font-bold uppercase tracking-wider">
                <Phone className="w-4 h-4" />
                <span>Sole Coordinator Desk</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-neon animate-pulse" title="Direct Line Active"></span>
            </div>

            <div className="space-y-1.5 font-mono text-xs">
              <p className="text-lg font-black text-white">Sanika Dusane</p>
              <p className="text-gray-400">Avionics Lead & Flight Workshop Coordinator</p>
              
              <div className="pt-3 flex flex-col gap-2">
                <a 
                  href="tel:+917620350524" 
                  className="px-4 py-2.5 rounded-xl bg-[#121826] border border-[#232f48] hover:border-neon text-white font-bold flex items-center justify-between transition-colors"
                >
                  <span>📞 +91 7620350524</span>
                  <span className="text-[10px] text-neon uppercase">Call Desk</span>
                </a>

                <a 
                  href="https://wa.me/917620350524?text=Hello%20Sanika%2C%20I%20have%20an%20inquiry%20regarding%20the%20Aegis%20Drone%20Avionics%20Workshop" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="px-4 py-2.5 rounded-xl bg-[#00ff66]/10 border border-[#00ff66]/30 hover:bg-[#00ff66]/20 text-[#00ff66] font-bold flex items-center justify-between transition-colors"
                >
                  <span>💬 Instant WhatsApp Chat</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Operational Hours */}
          <div className="bg-[#0b0e14] border border-[#1c2438] rounded-2xl p-6 space-y-3 font-mono text-xs shadow-lg">
            <div className="flex items-center gap-2 text-neon font-bold uppercase tracking-wider">
              <SunMoon className="w-4 h-4" />
              <span>Desk Availability & Calling Hours</span>
            </div>
            <div className="p-3 rounded-xl bg-[#07090e] border border-[#1a2133] space-y-1 text-gray-300">
              <p className="font-bold text-white">Monday – Sunday: 8:00 AM – 9:00 PM IST</p>
              <p className="text-[11px] text-gray-400">
                Direct phone inquiries and WhatsApp assistance active throughout morning and evening intake hours.
              </p>
            </div>
          </div>

          {/* Official Aegis Email & Venue Location */}
         {/* Official Aegis Email & Venue Location */}
<div className="bg-[#0b0e14] border border-[#1c2438] rounded-2xl p-6 space-y-4 font-mono text-xs shadow-lg">
  <div className="space-y-2">
    <div className="flex items-center gap-2 text-neon font-bold uppercase tracking-wider">
      <Mail className="w-4 h-4" />
      <span>Official Support Desk</span>
    </div>
    <p className="text-gray-300">
      <a href="mailto:aegisdrones.official@gmail.com" className="hover:text-neon underline text-white font-bold">
        aegisdrones.officials@gmail.com
      </a>
    </p>
  </div>
 
          </div>

        </div>

        {/* Right Column: Interactive Inquiry Form */}
        <div className="lg:col-span-7 bg-[#0b0d14] border-2 border-[#1c2438] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
          
          <div className="border-b border-[#1b2233] pb-4">
            <h2 className="text-lg font-bold text-white font-mono uppercase flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-neon" />
              <span>Transmit an Official Inquiry</span>
            </h2>
            <p className="text-xs text-gray-400 font-mono mt-1">
              All submissions are logged to the Aegis Command Room and dispatched instantly to the lead coordinator.
            </p>
          </div>

          {isSubmitted ? (
            <div className="bg-[#0c1a12] border border-neon/40 p-8 rounded-2xl text-center space-y-4 shadow-[0_0_30px_rgba(0,255,102,0.15)]">
              <div className="w-14 h-14 mx-auto rounded-full bg-neon/10 border-2 border-neon flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-neon" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white font-mono uppercase">Inquiry Successfully Transmitted</h3>
                <p className="text-xs text-gray-300 font-mono leading-relaxed">
                  Your query has been recorded. Sanika Dusane will respond to your email or reach out on WhatsApp shortly.
                </p>
              </div>
              <button
                onClick={() => setIsSubmitted(false)}
                className="px-5 py-2.5 rounded-xl bg-neon text-black font-mono font-bold text-xs uppercase hover:bg-[#00cc52] transition-all cursor-pointer shadow-[0_0_15px_rgba(0,255,102,0.2)]"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
              
              {errorMsg && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/40 text-red-400 font-mono text-xs">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-gray-400 font-mono text-[11px] block">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-[#212b3e] focus:border-neon outline-none text-white text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-gray-400 font-mono text-[11px] block">Your Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="student@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-[#212b3e] focus:border-neon outline-none text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-gray-400 font-mono text-[11px] block">WhatsApp / Contact Number</label>
                  <input
                    type="tel"
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-[#212b3e] focus:border-neon outline-none text-white text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-gray-400 font-mono text-[11px] block">Inquiry Category</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-[#212b3e] focus:border-neon outline-none text-white text-xs font-mono cursor-pointer"
                  >
                    <option value="Workshop & Batch Inquiry">Workshop & Batch Inquiry</option>
                    <option value="Spot Cash Desk Payment">Spot Cash Desk Payment</option>
                    <option value="Institutional Group Booking">Institutional Group Booking</option>
                    <option value="Hardware Kit Specification">Hardware Kit Specification</option>
                    <option value="Other Query">Other Query</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-400 font-mono text-[11px] block">Your Message / Query *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide details about your query, batch preference, or college squad size..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-[#212b3e] focus:border-neon outline-none text-white text-xs font-mono"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-neon text-black font-mono font-bold text-xs uppercase tracking-wider hover:bg-[#00cc52] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,102,0.25)] disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Transmitting Message...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Official Inquiry</span>
                  </>
                )}
              </button>
            </form>
          )}

        </div>

      </div>

    </div>
  );
}