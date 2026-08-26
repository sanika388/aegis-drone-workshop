'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { User, Radio, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [sessionUser, setSessionUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionUser(session?.user ?? null);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };

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

          {/* Dynamic Sign In / Logged-in Profile */}
          {sessionUser ? (
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#181818] border border-[#2e2e2e] hover:border-neon text-neon transition-all hover:shadow-[0_0_15px_rgba(0,255,102,0.25)] font-semibold text-xs font-mono"
              >
                <div className="w-5 h-5 rounded-full bg-neon/20 flex items-center justify-center text-neon text-[10px] font-bold">
                  {sessionUser.user_metadata?.full_name?.[0]?.toUpperCase() || sessionUser.email?.[0]?.toUpperCase() || 'P'}
                </div>
                <span className="max-w-[100px] truncate">
                  {sessionUser.user_metadata?.full_name || sessionUser.email?.split('@')[0]}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                title="Log Out"
                className="p-2 rounded-lg bg-[#181818] border border-[#2e2e2e] hover:border-red-500 hover:text-red-400 text-gray-400 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#181818] border border-[#2e2e2e] hover:border-neon text-neon transition-all hover:shadow-[0_0_15px_rgba(0,255,102,0.25)] font-semibold text-xs"
            >
              <User className="w-4 h-4 text-neon" />
              <span>Sign In</span>
            </Link>
          )}
        </nav>

      </div>
    </header>
  );
}