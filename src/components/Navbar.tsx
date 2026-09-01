'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { User, Radio, LogOut, Menu, X, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

const ADMIN_EMAILS = [
  'admin@aegisdrone.com',
  'dusanesanika9@gmail.com',
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const verifyAdmin = (user: any) => {
    const emailClean = user?.email?.toLowerCase().trim();
    const hasAdminCookie = typeof document !== 'undefined' && document.cookie.includes('aegis_admin_session=authenticated');
    const hasAdminStorage = typeof window !== 'undefined' && localStorage.getItem('aegis_admin_auth') === 'true';

    if ((emailClean && ADMIN_EMAILS.includes(emailClean)) || (hasAdminCookie && hasAdminStorage)) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setSessionUser(user ?? null);
      verifyAdmin(user);
    }
    loadUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setSessionUser(user);
      verifyAdmin(user);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    document.cookie = 'aegis_admin_session=; path=/; max-age=0;';
    localStorage.removeItem('aegis_admin_auth');
    setSessionUser(null);
    setIsAdmin(false);
    setMobileMenuOpen(false);
    toast.success('Logged out successfully');
    router.push('/auth');
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Workshops', href: '/workshops' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#07090f]/95 border-b border-[#1e2538]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Brand Logo & Title */}
          <Link href="/" className="flex items-center gap-3.5 sm:gap-4 group py-1">
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 shrink-0 transition-transform duration-300 group-hover:scale-105 flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="Aegis Drone Workshop Logo"
                fill
                sizes="(max-width: 640px) 56px, (max-width: 768px) 64px, 80px"
                className="object-contain drop-shadow-[0_0_14px_rgba(0,255,102,0.4)]"
                priority
                unoptimized
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-neon font-black text-xl sm:text-2xl md:text-3xl tracking-wider leading-none font-mono">
                AEGIS<span className="text-white font-light">DRONES</span>
              </span>
              <span className="text-[10px] sm:text-xs text-gray-400 font-mono tracking-widest uppercase mt-0.5">
                Avionics Master Workshop
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`transition-colors flex items-center gap-1.5 font-mono text-xs ${
                    isActive ? 'text-neon font-semibold' : 'text-gray-300 hover:text-neon'
                  }`}
                >
                  {isActive && <Radio className="w-2.5 h-2.5 text-neon animate-pulse" />}
                  {link.name}
                </Link>
              );
            })}

            {/* DYNAMIC ADMIN BUTTON (Desktop: Visible only for Logged-In Admin) */}
            {isAdmin && (
              <Link
                href="/admin"
                className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-mono text-xs font-bold transition-all ${
                  pathname.startsWith('/admin')
                    ? 'bg-amber-400 text-black border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.35)]'
                    : 'bg-amber-400/10 border-amber-400/40 text-amber-400 hover:bg-amber-400 hover:text-black shadow-[0_0_15px_rgba(251,191,36,0.15)]'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Center</span>
              </Link>
            )}

            {/* Dynamic Sign In / Logged-in Profile (Desktop) */}
            {sessionUser ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/profile"
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0e121c] border transition-all font-semibold text-xs font-mono ${
                    pathname === '/profile'
                      ? 'border-neon text-neon shadow-[0_0_15px_rgba(0,255,102,0.25)]'
                      : 'border-[#232b3d] hover:border-neon text-neon hover:shadow-[0_0_15px_rgba(0,255,102,0.2)]'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-neon/20 flex items-center justify-center text-neon text-[10px] font-bold">
                    {sessionUser.user_metadata?.full_name?.[0]?.toUpperCase() || sessionUser.email?.[0]?.toUpperCase() || 'P'}
                  </div>
                  <span className="max-w-[110px] truncate">
                    {sessionUser.user_metadata?.full_name || sessionUser.email?.split('@')[0]}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Log Out"
                  className="p-2 rounded-xl bg-[#0e121c] border border-[#232b3d] hover:border-red-500 hover:text-red-400 text-gray-400 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/auth"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0e121c] border border-[#232b3d] hover:border-neon text-neon transition-all hover:shadow-[0_0_15px_rgba(0,255,102,0.25)] font-semibold text-xs font-mono uppercase"
              >
                <User className="w-4 h-4 text-neon" />
                <span>Sign In</span>
              </Link>
            )}
          </nav>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
            aria-expanded={mobileMenuOpen}
            className="md:hidden p-2 rounded-xl bg-[#0e121c] border border-[#232b3d] text-gray-300 hover:text-neon transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

        </div>
      </header>

      {/* Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden transition-opacity duration-300"
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-[280px] bg-[#0c0f17] border-l border-[#1e2538] p-6 flex flex-col justify-between transform transition-transform duration-300 ease-in-out md:hidden shadow-[-10px_0_30px_rgba(0,0,0,0.8)] ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="space-y-6">
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-[#1c2336] pb-4">
            <span className="text-xs font-mono font-bold text-gray-400 tracking-wider">
              NAVIGATION
            </span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 rounded-lg bg-[#141824] text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Links */}
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl font-mono text-sm flex items-center justify-between transition-all ${
                    isActive
                      ? 'bg-neon/10 border border-neon/30 text-neon font-bold'
                      : 'text-gray-300 hover:bg-[#141824] hover:text-white'
                  }`}
                >
                  <span>{link.name}</span>
                  {isActive && <Radio className="w-3 h-3 text-neon animate-pulse" />}
                </Link>
              );
            })}

            {/* Admin Command Link for Mobile Drawer */}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-xl font-mono text-sm flex items-center justify-between transition-all mt-2 ${
                  pathname.startsWith('/admin')
                    ? 'bg-amber-400 text-black font-bold shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                    : 'bg-amber-400/10 border border-amber-400/30 text-amber-400 font-bold'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>Admin</span>
                </div>
                <span className="text-[10px] bg-amber-400/20 px-2 py-0.5 rounded text-amber-300">HUB</span>
              </Link>
            )}
          </nav>
        </div>

        {/* Drawer Bottom Auth Section */}
        <div className="border-t border-[#1c2336] pt-5 space-y-3 font-mono">
          {sessionUser ? (
            <>
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#141824] border border-neon/30 text-neon font-bold text-xs"
              >
                <div className="w-6 h-6 rounded-full bg-neon/20 flex items-center justify-center text-neon text-xs">
                  {sessionUser.user_metadata?.full_name?.[0]?.toUpperCase() || sessionUser.email?.[0]?.toUpperCase() || 'P'}
                </div>
                <span className="truncate">
                  {sessionUser.user_metadata?.full_name || sessionUser.email?.split('@')[0]}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full py-2.5 px-4 rounded-xl border border-red-500/40 bg-red-500/10 text-red-400 font-bold text-xs flex items-center justify-center gap-2 hover:bg-red-500/20 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </>
          ) : (
            <Link
              href="/auth"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 px-4 rounded-xl bg-neon text-black font-black text-xs uppercase flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,102,0.3)] hover:bg-[#00cc52] transition-all"
            >
              <User className="w-4 h-4" />
              <span>Pilot Sign In</span>
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}