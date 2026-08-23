import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <div className="lg:col-span-7 space-y-6">
        
        {/* Active Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neon/10 border border-neon/30 text-neon text-xs font-mono font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AEGIS DRONE WORKSHOP • REGISTRATIONS OPEN</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white leading-tight">
          Gear Up. Code It. <br />
          <span className="text-neon">Build It. Fly It.</span>
        </h1>
        
        <p className="text-gray-400 text-lg leading-relaxed max-w-xl">
          The sky is not the limit, it is just the beginning. Join our hands-on drone engineering workshops and master flight controllers, telemetry, and aerodynamic assembly.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap gap-4 pt-4">
          <Link
            href="/workshops"
            className="px-6 py-3.5 rounded-lg bg-neon font-bold flex items-center gap-2 hover:bg-[#00cc52] transition-all text-black text-xs uppercase tracking-wider cursor-pointer shadow-[0_0_20px_rgba(0,255,102,0.3)]"
          >
            <span>Explore Active Workshops</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/auth"
            className="px-6 py-3.5 rounded-lg bg-[#181818] border border-[#2e2e2e] hover:border-neon text-gray-200 hover:text-white transition-all text-xs uppercase tracking-wider font-semibold"
          >
            Participant Sign In
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="pt-4 flex items-center gap-6 text-xs text-gray-400 font-mono">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-neon" />
            <span>Hardware Kits Included</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-neon" />
            <span>Verified Certificate</span>
          </div>
        </div>
      </div>

      {/* Workshop Banner Container */}
      <div className="lg:col-span-5 bg-[#121212] border border-[#242424] rounded-2xl p-4 relative overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.6)]">
        <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-[#0a0a0a]">
          <Image
            src="/poster.png"
            alt="Aegis Drone Workshop Poster"
            fill
            className="object-contain"
            priority
          />
        </div>
        <p className="text-xs text-center text-gray-400 mt-3 font-mono">
          Official Aegis Drone Workshop Announcement
        </p>
      </div>
    </div>
  );
}