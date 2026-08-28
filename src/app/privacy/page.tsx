import Link from 'next/link';
import { Shield, Lock, Eye, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-[#07090e] text-zinc-300 font-sans selection:bg-[#00ff66]/30 selection:text-white py-16 px-6">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Back Button */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-[#00ff66] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>RETURN TO HOME</span>
        </Link>

        {/* Header */}
        <div className="border-b border-[#1f242d] pb-6 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00ff66]/10 border border-[#00ff66]/30 text-[#00ff66] text-xs font-mono">
            <Shield className="w-3.5 h-3.5" />
            <span>DATA INTEGRITY & SECURITY PROTOCOL</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white uppercase">
            Privacy <span className="text-[#00ff66]">Policy</span>
          </h1>
          <p className="text-xs text-zinc-400 font-mono">
            Last Updated: September 2026 • Effective for all Aegis Workshop Registrations
          </p>
        </div>

        {/* Policy Content */}
        <div className="space-y-8 text-sm leading-relaxed">
          
          <section className="space-y-3 bg-[#0e121a] p-6 rounded-xl border border-[#1f242d]">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#00ff66]" /> 1. Information We Collect
            </h2>
            <p className="text-zinc-400">
              When you enroll in the Aegis Drone Avionics Masterclass or authenticate via Google OAuth, we collect necessary enrollment data including:
            </p>
            <ul className="list-disc list-inside space-y-1 text-zinc-400 text-xs font-mono pl-2">
              <li>Full Name and Contact Details (Email address and WhatsApp phone number).</li>
              <li>College / Educational Institution affiliation and graduation year.</li>
              <li>Unique Clearance Pass IDs and Razorpay transaction settlement references.</li>
            </ul>
          </section>

          <section className="space-y-3 bg-[#0e121a] p-6 rounded-xl border border-[#1f242d]">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#00ff66]" /> 2. Use of Information
            </h2>
            <p className="text-zinc-400">
              Your information is strictly utilized to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-zinc-400 text-xs font-mono pl-2">
              <li>Issue, verify, and validate your physical/digital QR clearance pass at lab check-in.</li>
              <li>Send batch schedule updates, syllabus notes, and emergency logistics notices.</li>
              <li>Print verified workshop certificates bearing unique credential IDs.</li>
              <li>We never sell, rent, or lease participant telemetry or personal records to 3rd-party brokers.</li>
            </ul>
          </section>

          <section className="space-y-3 bg-[#0e121a] p-6 rounded-xl border border-[#1f242d]">
            <h2 className="text-lg font-bold text-white">3. Payment Gateway Security</h2>
            <p className="text-zinc-400">
              Payment processing is handled through secure, PCI-DSS compliant third-party gateways (Razorpay). Aegis Drones never stores credit/debit card numbers, UPI PINs, or CVVs on its private database instances.
            </p>
          </section>

          <section className="space-y-3 bg-[#0e121a] p-6 rounded-xl border border-[#1f242d]">
            <h2 className="text-lg font-bold text-white">4. Data Retention & Queries</h2>
            <p className="text-zinc-400">
              Participant data is preserved for post-event certificate validation. If you wish to request record modifications, contact our operations desk at{' '}
              <a href="mailto:aegisdrones.officials@gmail.com" className="text-[#00ff66] underline">
                aegisdrones.officials@gmail.com
              </a>.
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}