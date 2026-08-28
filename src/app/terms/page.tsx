import Link from 'next/link';
import { FileText, AlertTriangle, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function TermsAndConditions() {
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
            <FileText className="w-3.5 h-3.5" />
            <span> WORKSHOP CODE OF CONDUCT</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white uppercase">
            Terms & <span className="text-[#00ff66]">Conditions</span>
          </h1>
           
        </div>

        {/* Terms Content */}
        <div className="space-y-8 text-sm leading-relaxed">
          
          <section className="space-y-3 bg-[#0e121a] p-6 rounded-xl border border-[#1f242d]">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00ff66]" /> 1. Registration & Clearance Passes
            </h2>
            <ul className="list-disc list-inside space-y-1 text-zinc-400 text-xs font-mono pl-2">
              <li>Early Bird passes (₹300) are strictly limited to the first 10 confirmed registrations.</li>
              <li>Standard passes are priced at ₹500 thereafter.</li>
              <li>Each digital pass QR is unique to the registered individual and is non-transferable.</li>
            </ul>
          </section>

          <section className="space-y-3 bg-[#0e121a] p-6 rounded-xl border border-[#1f242d]">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> 2. Hardware Lab Policy (No Take-Home)
            </h2>
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs leading-relaxed">
              <strong>MANDATORY LAB NOTICE:</strong> Drones, flight controllers, ESP32 chips, motors, and ESC testing rigs are workshop workbench property and will <strong>NOT</strong> be given to participants to take home. All flight testing and assembly tasks are executed on-site.
            </div>
          </section>

          <section className="space-y-3 bg-[#0e121a] p-6 rounded-xl border border-[#1f242d]">
            <h2 className="text-lg font-bold text-white">3. Attendance & Certification</h2>
            <p className="text-zinc-400">
              100% attendance across all scheduled technical modules is required to receive the verified Aegis Drone Avionics Certificate.
            </p>
          </section>

          <section className="space-y-3 bg-[#0e121a] p-6 rounded-xl border border-[#1f242d]">
            <h2 className="text-lg font-bold text-white">4. Refund & Cancellation Policy</h2>
            <p className="text-zinc-400">
              Once an enrollment pass has been generated, registration fees are non-refundable. In the unlikely event that a session is rescheduled by the organizing committee, the pass will automatically remain valid for the next allocated cohort.
            </p>
          </section>

          <section className="space-y-3 bg-[#0e121a] p-6 rounded-xl border border-[#1f242d]">
            <h2 className="text-lg font-bold text-white">5. Lab Safety & Discipline</h2>
            <p className="text-zinc-400">
              Participants must strictly adhere to workbench safety procedures during motor spinning, soldering, and battery connection. Organizers reserve the right to revoke clearance passes in cases of misconduct or safety violations.
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}