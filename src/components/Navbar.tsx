'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Plane, User, LogOut, QrCode, Shield } from 'lucide-react';

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

  // Hide global navbar on raw auth page
  if (pathname === '/auth') return null;

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Workshops', href: '/workshops' },
    { name: 'My Pass & QR', href: '/profile' },
    { name: 'About & Contact', href: '/about' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#07090f]/80 backdrop-blur-md border-b border-[#1c2336] font-mono text-xs">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 text-white hover:text-neon transition-colors">
          <div className="w-8 h-8 rounded-lg bg-neon/10 border border-neon/30 flex items-center justify-center text-neon shadow-[0_0_12px_rgba(0,255,102,0.2)]">
            <Plane className="w-4 h-4" />
          </div>
          <span className="font-black text-sm tracking-wider uppercase">AEGIS AVIONICS</span>
        </Link>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-[#0d111a] border border-[#1c2336] p-1 rounded-xl">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  isActive
                    ? 'bg-neon text-black font-bold shadow-[0_0_10px_rgba(0,255,102,0.2)]'
                    : 'text-gray-400 hover:text-white hover:bg-[#151a27]'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* User Account / Auth Actions */}
        <div className="flex items-center gap-2.5">
          {sessionUser ? (
            <div className="flex items-center gap-2 bg-[#0c1018] border border-[#1d263b] p-1.5 rounded-xl">
              <Link
                href="/profile"
                className="flex items-center gap-2 px-2.5 py-1 text-gray-300 hover:text-neon transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-neon/20 border border-neon/40 flex items-center justify-center text-neon text-[10px] font-bold">
                  {sessionUser.user_metadata?.full_name?.[0]?.toUpperCase() || sessionUser.email?.[0]?.toUpperCase() || 'P'}
                </div>
                <span className="max-w-[120px] truncate font-bold text-white text-[11px]">
                  {sessionUser.user_metadata?.full_name || sessionUser.email?.split('@')[0]}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 transition-all cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth"
                className="px-3.5 py-2 rounded-xl bg-neon text-black font-bold hover:bg-[#00cc52] transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,255,102,0.2)]"
              >
                <User className="w-3.5 h-3.5" />
                <span>Pilot Log In</span>
              </Link>
              <Link
                href="/auth"
                className="p-2 rounded-xl bg-[#141824] border border-[#232d44] text-amber-400 hover:text-amber-300 transition-colors"
                title="Admin Control Room"
              >
                <Shield className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}