import Link from 'next/link';
import { Shield, Lock, Eye, ArrowLeft, Cpu, Terminal } from 'lucide-react';

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
            <span>DATA INTEGRITY & INTELLECTUAL PROTOCOL</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white uppercase">
            Privacy <span className="text-[#00ff66]">Policy</span>
          </h1>
          <p className="text-xs text-zinc-400 font-mono">
            Last Updated: September 2026 • Effective for all Aegis Drone Avionics Masterclass Registrations
          </p>
        </div>

        {/* Policy Content */}
        <div className="space-y-8 text-sm leading-relaxed">
          
          <section className="space-y-3 bg-[#0e121a] p-6 rounded-xl border border-[#1f242d]">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#00ff66]" /> 1. Information We Collect
            </h2>
            <p className="text-zinc-400">
              When you enroll in the Aegis Drone Avionics Masterclass or authenticate via secure portal channels, we collect necessary enrollment data including:
            </p>
            <ul className="list-disc list-inside space-y-1 text-zinc-400 text-xs font-mono pl-2">
              <li>Full Name and Contact Details (Email address and active WhatsApp phone number for cohort briefings).</li>
              <li>College / Educational Institution affiliation and current academic year.</li>
              <li>Unique Clearance Pass IDs and transaction settlement references (UPI UTR / Cash verification logs).</li>
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
              <li>Issue, verify, and validate your digital QR clearance pass at lab check-in.</li>
              <li>Send batch schedule updates, syllabus notes, hardware wiring schematics, and emergency logistics notices.</li>
              <li>Print verified workshop certificates bearing unique credential tracking IDs.</li>
              <li>Manage internal cohort rosters. We never sell, rent, or lease participant telemetry or personal records to third-party commercial brokers.</li>
            </ul>
          </section>

          <section className="space-y-3 bg-[#0e121a] p-6 rounded-xl border border-[#1f242d]">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#00ff66]" /> 3. Intellectual Property & Firmware Philosophy
            </h2>
            <p className="text-zinc-400">
              Aegis Drone Avionics operates under an educational and engineering transparency framework. Regarding code, firmware, and proprietary build frameworks:
            </p>
            <ul className="list-disc list-inside space-y-1 text-zinc-400 text-xs font-mono pl-2">
              <li>
                <strong className="text-white">No Pre-packaged Black Boxes:</strong> We do not distribute closed-source, pre-compiled binary firmware bloatware that hides core logic.
              </li>
              <li>
                <strong className="text-white">Complete Architectural Logic:</strong> During the masterclass, you are provided with the absolute entire underlying logic, mathematical models (such as closed-loop PID controllers), and register configurations.
              </li>
              <li>
                <strong className="text-white">Empowering Your Own Skills:</strong> Our mission is to teach you how to build your own skills from scratch. While proprietary core deployment source files remain protected under lab IP rights, you will write, compile, test, and understand every single line of code required to command your hardware independently.
              </li>
            </ul>
          </section>

          <section className="space-y-3 bg-[#0e121a] p-6 rounded-xl border border-[#1f242d]">
            <h2 className="text-lg font-bold text-white">4. Payment Gateway & Transaction Security</h2>
            <p className="text-zinc-400">
              Payment processing is handled through secure channels and verified via manual UTR or designated desk checkpoints. Aegis Drones never stores sensitive banking credentials, UPI PINs, or card data on private database instances.
            </p>
          </section>

          <section className="space-y-3 bg-[#0e121a] p-6 rounded-xl border border-[#1f242d]">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#00ff66]" /> 5. Data Retention & Operational Queries
            </h2>
            <p className="text-zinc-400">
              Participant telemetry and registration logs are preserved securely for post-event certificate validation and alumni network tracking. If you wish to request record modifications or have security inquiries, contact our operations desk at{' '}
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