'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { User, LayoutDashboard, Radio } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Workshops', href: '/workshops' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0a0a0a]/95 border-b border-[#242424]">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brand Logo & Title */}
       <Link href="/" className="flex items-center gap-4 group">
      <div className="relative w-[68px] h-[68px] shrink-0 transition-transform duration-200 group-hover:scale-105 flex items-center justify-center">
  <Image
    src="/logo.png"
    alt="Aegis Drone Workshop Logo"
    width={140}
    height={140}
    className="w-full h-full object-contain drop-shadow-[0_0_14px_rgba(0,255,102,0.45)]"
    priority
    unoptimized
  />
</div>
          <span className="text-neon font-black text-2xl tracking-wider">
            AEGIS<span className="text-white font-light">DRONES</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`transition-colors flex items-center gap-1.5 ${
                  isActive ? 'text-neon font-semibold' : 'text-gray-300 hover:text-neon'
                }`}
              >
                {isActive && <Radio className="w-2.5 h-2.5 text-neon animate-pulse" />}
                {link.name}
              </Link>
            );
          })}

          {/* Admin Switch */}
          <Link
            href="/admin"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#181818] border border-[#2e2e2e] hover:border-neon text-gray-300 hover:text-white transition-all text-xs font-mono"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-neon" />
            <span>Admin</span>
          </Link>
<Link href="/research" className="text-xs font-mono text-gray-300 hover:text-neon transition-colors">
  RESEARCH
</Link>
          {/* User Sign In */}
          <Link
            href="/auth"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#181818] border border-[#2e2e2e] hover:border-neon text-neon transition-all hover:shadow-[0_0_15px_rgba(0,255,102,0.25)] font-semibold text-xs"
          >
            <User className="w-4 h-4 text-neon" />
            <span>Sign In</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}