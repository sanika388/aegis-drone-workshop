import Link from 'next/link';
import { FileText, AlertTriangle, CheckCircle2, ArrowLeft, ShieldAlert, Award } from 'lucide-react';

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
           
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white uppercase">
            Terms & <span className="text-[#00ff66]">Conditions</span>
          </h1>
          <p className="text-xs text-zinc-400 font-mono">
            Last Updated: September 2026 • Governing all Aegis Drone Avionics Workshop Intakes
          </p>
        </div>

        {/* Terms Content */}
        <div className="space-y-8 text-sm leading-relaxed">
          
          <section className="space-y-3 bg-[#0e121a] p-6 rounded-xl border border-[#1f242d]">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00ff66]" /> 1. Registration, Passes & Spot Cash Policy
            </h2>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-400 text-xs font-mono pl-2">
              <li>Each digital pass QR and clearance ID is strictly unique to the registered individual and is non-transferable.</li>
              <li>Selecting <strong className="text-white">Spot Cash</strong> provisionally reserves your workbench slot; payment must be settled in cash at the venue registration desk upon arrival to activate full clearance.</li>
            </ul>
          </section>

          <section className="space-y-3 bg-[#0e121a] p-6 rounded-xl border border-[#1f242d]">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> 2. Hardware Lab Policy (No Take-Home Kit)
            </h2>
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs leading-relaxed">
              <strong>MANDATORY LAB NOTICE:</strong> Drones, flight controllers, ESP32 development boards, MPU6050 sensors, motors, and ESC testing rigs are specialized workshop property and will <strong>NOT</strong> be given to participants to take home. All hardware assembly, soldering, calibration, and flight testing tasks are executed strictly on-site.
            </div>
          </section>

          <section className="space-y-3 bg-[#0e121a] p-6 rounded-xl border border-[#1f242d]">
            <h2 className="text-lg font-bold text-white">3. Attendance & Official Certification</h2>
            <p className="text-zinc-400">
              100% active attendance across all scheduled theoretical and practical hardware modules is mandatory to qualify for the official Aegis Certified Drone Avionics Credential.
            </p>
          </section>

          <section className="space-y-3 bg-[#0e121a] p-6 rounded-xl border border-[#1f242d]">
            <h2 className="text-lg font-bold text-white">4. Refund & Rescheduling Policy</h2>
            <p className="text-zinc-400">
              Once an enrollment pass or provisional clearance ID has been generated, registration fees are strictly non-refundable. In the event of unforeseen schedule adjustments by the organizing committee, your pass remains automatically valid for the newly allocated cohort window.
            </p>
          </section>

          <section className="space-y-3 bg-[#0e121a] p-6 rounded-xl border border-[#1f242d]">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" /> 5. Lab Safety, Conduct & Disqualification
            </h2>
            <p className="text-zinc-400">
              Participants must strictly adhere to workbench safety rules during power distribution, motor arming, and battery handling. The organizing committee reserves the absolute right to revoke clearance passes and expel participants without refund in cases of safety violations, recklessness, or misconduct.
            </p>
          </section>

          <section className="space-y-3 bg-[#0e121a] p-6 rounded-xl border border-[#1f242d]">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-[#00ff66]" /> 6. Evaluation Test & Winner Prize
            </h2>
            <p className="text-zinc-400">
            Participants will undergo a technical evaluation test assessing assembly knowledge, firmware logic, and PID stability concepts. The participant scoring the highest marks will be awarded the official winner prize as determined by the organizing committee. In case of ties, practical execution speed and safety protocols during lab tests will serve as the deciding criteria.
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}