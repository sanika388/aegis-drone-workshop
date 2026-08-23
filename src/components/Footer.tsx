import Link from 'next/link';
import Image from 'next/image';
import { Mail, MapPin, ExternalLink, Cpu, MessageSquare, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-[#242424] text-gray-400 text-sm">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-12 gap-10">
        {/* Startup Info */}
        <div className="md:col-span-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="Aegis Drone Logo"
                width={250}
                height={250}
                className="w-full h-full object-contain drop-shadow-[0_0_24px_rgba(0,255,102,0.7)]"
                priority
                unoptimized
              />
            </div>
            <span className="text-neon font-black text-lg tracking-wider">
              AEGIS<span className="text-white font-light">DRONES</span>
            </span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
            Gear Up. Code It. Build It. Fly It. Hands-on aerospace training, flight mechanics, STM32 firmware programming, and quadcopter aerodynamics.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#121212] border border-[#242424] text-[11px] text-gray-300 font-mono">
            <Cpu className="w-3.5 h-3.5 text-neon" />
            <span>Flight Lab: GCOERC Campus</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="md:col-span-3 space-y-3">
          <h3 className="text-white font-bold text-xs uppercase tracking-wider">Navigation</h3>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/workshops" className="hover:text-neon transition-colors">
                Available Batches & Curriculums
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-neon transition-colors">
                Hardware & Training Framework
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-neon transition-colors">
                Venue & Location Assistance
              </Link>
            </li>
            <li>
              <Link href="/auth" className="hover:text-neon transition-colors">
                Participant Portal & Google Sign In
              </Link>
            </li>
          </ul>
        </div>

        {/* Direct Contact & Terms */}
        <div className="md:col-span-4 space-y-3">
          <h3 className="text-white font-bold text-xs uppercase tracking-wider">Support & Location</h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-neon shrink-0 mt-0.5" />
              <span>Guru Gobind Singh College of Engineering & Research Centre, Nashik</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-neon shrink-0" />
              <span>contact@aegisdrone.com</span>
            </div>
          </div>
          <div className="pt-2">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-[11px] text-gray-500 hover:text-neon transition-colors font-mono"
            >
              <span>Organizers & Instructors Access</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Irisforge Ownership & Engineering Banner */}
      <div className="border-t border-[#1a1a1a] bg-[#070707] py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
         <div className="flex items-center gap-4 text-center md:text-left">
            <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden bg-black/80 border border-[#333333] shadow-lg shadow-black/60 shrink-0">
              <Image
                src="/irisforge-logo.png"
                alt="Irisforge Studio"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            
            <div className="text-left">
              <p className="text-xs text-zinc-300 font-medium tracking-tight">
                Architected & Engineered by <span className="text-white font-bold tracking-wide">Irisforge</span>
              </p>
              <p className="text-[10px] text-zinc-500 font-mono">
                Precision Systems Architecture • Full-Stack Engineering
              </p>
            </div>
          </div>

          {/* Irisforge Direct Actions */}
          <div className="flex items-center gap-2.5">
            <a
              href="tel:+917620350524"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#141414] hover:bg-[#1f1f1f] text-[11px] text-zinc-300 hover:text-white border border-[#262626] transition-colors"
            >
              <Phone className="w-3 h-3 text-cyan-400" />
              <span>+91 76203 50524</span>
            </a>

            <a
              href="https://wa.me/917620350524?text=Hi%20Irisforge,%20I%20saw%20the%20Aegis%20Drone%20Workshop%20portal%20and%20would%20like%20to%20discuss%20a%20project."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#141414] hover:bg-[#1f1f1f] text-[11px] text-zinc-300 hover:text-white border border-[#262626] transition-colors"
            >
              <MessageSquare className="w-3 h-3 text-emerald-400" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-[#141414] py-3.5 bg-black">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] text-gray-500 font-mono">
          <p>© {new Date().getFullYear()} Aegis Drones Workshop. All rights reserved.</p>
          <p className="text-neon/80">Secured Digital Verification & Receipt Access</p>
        </div>
      </div>
    </footer>
  );
}