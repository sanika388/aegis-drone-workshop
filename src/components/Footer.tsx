import Link from 'next/link';
import Image from 'next/image';
import { Mail, MessageSquare, Phone } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#07090f] border-t border-[#1e2538] text-gray-400 text-sm font-sans">
      
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-12 gap-10">
        
        {/* Startup Info */}
        <div className="md:col-span-5 space-y-4">
          <div className="flex items-center gap-4">
            {/* Scaled Responsive Logo Container */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="Aegis Drone Logo"
                fill
                sizes="(max-width: 640px) 64px, 80px"
                className="object-contain drop-shadow-[0_0_20px_rgba(0,255,102,0.4)]"
                priority
                unoptimized
              />
            </div>

            {/* Aligned Typography */}
            <div className="flex flex-col justify-center">
              <span className="text-neon font-black text-2xl sm:text-3xl tracking-wider leading-tight font-mono">
                AEGIS<span className="text-white font-light">DRONES</span>
              </span>
              <span className="text-[11px] text-gray-400 font-mono tracking-widest uppercase">
                Avionics Master Workshop
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
            Gear Up. Code It. Build It. Fly It. Hands-on aerospace training, flight mechanics, firmware programming, and quadcopter aerodynamics.
          </p>
        </div>

        {/* Quick Links */}
        <div className="md:col-span-3 space-y-3 font-mono">
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
                Contact Flight Desk
              </Link>
            </li>
            <li>
              <Link href="/auth" className="hover:text-neon transition-colors">
                Participant Portal & Login
              </Link>
            </li>
          </ul>
        </div>

        {/* Direct Contact & Support */}
        <div className="md:col-span-4 space-y-3 font-mono">
          <h3 className="text-white font-bold text-xs uppercase tracking-wider">Support & Flight Desk</h3>
          <div className="space-y-2.5 text-xs text-gray-300">
            <a
              href="mailto:aegisdrones.official@gmail.com?subject=Aegis%20Workshop%20Inquiry"
              className="flex items-center gap-2 hover:text-neon transition-colors"
            >
              <Mail className="w-4 h-4 text-neon shrink-0" />
              <span>aegisdrones.official@gmail.com</span>
            </a>
            <a
              href="tel:+917620350524"
              className="flex items-center gap-2 hover:text-neon transition-colors"
            >
              <Phone className="w-4 h-4 text-neon shrink-0" />
              <span>+91 7620350524 (Sanika Dusane)</span>
            </a>
          </div>
        </div>
      </div>

      {/* Irisforge Ownership & Engineering Banner */}
      <div className="border-t border-[#161c2c] bg-[#05070c] py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="relative w-9 h-9 shrink-0 flex items-center justify-center">
              <Image
                src="/irisforge-logo.png"
                alt="Irisforge"
                fill
                className="object-contain drop-shadow-[0_0_10px_rgba(0,255,102,0.3)]"
              />
            </div>
            
            <div className="text-left space-y-0.5">
              <p className="text-xs text-gray-300 font-medium tracking-tight">
                Architected & Engineered by <span className="text-neon font-bold tracking-wide">Irisforge</span>
              </p>
              <p className="text-[11px] text-gray-400 font-mono">
                Want to build high-performance systems or web platforms?{' '}
                <a 
                  href="https://wa.me/917620350524?text=Hi%20Irisforge,%20I%20saw%20the%20Aegis%20Drone%20Workshop%20portal%20and%20would%20like%20to%20discuss%20a%20project."
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-neon hover:underline font-semibold"
                >
                  Contact Irisforge →
                </a>
              </p>
            </div>
          </div>

          {/* Irisforge Direct Actions */}
          <div className="flex items-center gap-2.5">
            <a
              href="tel:+917620350524"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0e121c] hover:bg-[#151b2a] text-[11px] text-gray-300 hover:text-white border border-[#232b3d] hover:border-neon transition-colors font-mono"
            >
              <Phone className="w-3 h-3 text-neon" />
              <span>+91 76203 50524</span>
            </a>

            <a
              href="https://wa.me/917620350524?text=Hi%20Irisforge,%20I%20saw%20the%20Aegis%20Drone%20Workshop%20portal%20and%20would%20like%20to%20discuss%20a%20project."
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neon/10 hover:bg-neon/20 text-[11px] text-neon font-bold border border-neon/30 transition-colors font-mono"
            >
              <MessageSquare className="w-3 h-3 text-neon" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* Copyright & Legal Bar */}
      <div className="border-t border-[#121622] py-3.5 bg-[#030407]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-gray-500 font-mono">
          <p>© {currentYear} Aegis Drones Workshop. All rights reserved.</p>
          
          <div className="flex items-center gap-4 text-gray-400">
            <Link href="/privacy" className="hover:text-neon transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-neon transition-colors">
              Terms & Conditions
            </Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-neon transition-colors">
              Inquiry Desk
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}