'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import { Shield, User, Lock, Mail, ArrowRight, Loader2, Phone, School } from 'lucide-react';
import { toast } from 'sonner';

const ADMIN_EMAILS = [
  'admin@aegisdrone.com',
  'dusanesanika9@gmail.com',
];

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<'participant' | 'admin'>('participant');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    college: '',
  });

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'admin') {
      setRole('admin');
    }

    // Auto-redirect if session is active
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        router.replace('/profile');
      }
    });

    const errorParam = searchParams.get('error');
    if (errorParam === 'auth-code-error') {
      toast.error('Sign-in session interrupted. Please try again.');
    }
  }, [searchParams, router]);

  const handleGoogleSignIn = async () => {
    try {
      const origin = typeof window !== 'undefined'
        ? window.location.origin
        : 'https://aegis-drone-workshop-ky4d.vercel.app';

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err.message || 'Failed to initiate Google sign-in.');
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const emailClean = formData.email.trim().toLowerCase();

    try {
      if (role === 'admin') {
        if (!ADMIN_EMAILS.includes(emailClean)) {
          throw new Error('Access denied. This account is not an authorized administrator.');
        }

        const { error } = await supabase.auth.signInWithPassword({
          email: emailClean,
          password: formData.password,
        });

        if (error) throw error;

        document.cookie = 'aegis_admin_session=authenticated; path=/; max-age=86400; SameSite=Lax; Secure';
        localStorage.setItem('aegis_admin_auth', 'true');

        toast.success('Admin authorization verified.');
        router.push('/admin');
        return;
      }

      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: emailClean,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName.trim(),
              phone: formData.phone.trim(),
              college: formData.college.trim(),
              role: 'participant',
            },
          },
        });

        if (error) throw error;

        if (data?.session) {
          toast.success('Account created! Entering flight profile...');
          router.push('/profile');
        } else {
          toast.success('Account created successfully! Please log in.');
          setIsSignUp(false);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: emailClean,
          password: formData.password,
        });

        if (error) throw error;

        toast.success('Authenticated successfully!');
        router.push('/profile');
      }
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-[#0c0f17] border border-[#1e2538] rounded-3xl p-8 space-y-6 relative z-10 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center items-center py-2">
          <Image 
            src="/logo.png" 
            alt="Aegis Logo" 
            width={160} 
            height={160} 
            className="object-contain drop-shadow-[0_0_20px_rgba(0,255,102,0.35)]" 
            priority
          />
        </div>
        <h1 className="text-xl font-black tracking-wider uppercase pt-2">
          AEGIS DRONES WORKSHOP
        </h1>
         
      </div>

      {/* Role Switcher */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-[#06080d] border border-[#1a2030] rounded-xl text-xs font-bold">
        <button
          type="button"
          onClick={() => setRole('participant')}
          className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            role === 'participant'
              ? 'bg-neon text-black shadow-[0_0_15px_rgba(0,255,102,0.3)]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Participant</span>
        </button>
        <button
          type="button"
          onClick={() => { setRole('admin'); setIsSignUp(false); }}
          className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            role === 'admin'
              ? 'bg-amber-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.3)]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Admin Control</span>
        </button>
      </div>

      {/* 1-Click Google Sign-In */}
      {role === 'participant' && (
        <>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-gray-100 text-black font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-md cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="flex items-center gap-3 text-[10px] text-gray-500 uppercase tracking-widest my-2">
            <div className="h-px bg-[#1c2336] flex-1" />
            <span>or email</span>
            <div className="h-px bg-[#1c2336] flex-1" />
          </div>
        </>
      )}

      {/* Email & Password Form */}
      <form onSubmit={handleAuth} className="space-y-3.5 text-xs">
        {role === 'participant' && isSignUp && (
          <>
            <div className="space-y-1">
              <label className="text-gray-400 text-[11px]">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  required
                  placeholder="Name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#07090f] border border-[#1e2538] focus:border-neon outline-none text-white text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-gray-400 text-[11px]">WhatsApp Contact *</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="tel"
                  required
                  placeholder="+91 **********"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#07090f] border border-[#1e2538] focus:border-neon outline-none text-white text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-gray-400 text-[11px]">College / Organization *</label>
              <div className="relative">
                <School className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  required
                  placeholder="Engineering Institute"
                  value={formData.college}
                  onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#07090f] border border-[#1e2538] focus:border-neon outline-none text-white text-xs font-mono"
                />
              </div>
            </div>
          </>
        )}

        <div className="space-y-1">
          <label className="text-gray-400 text-[11px]">Email Address *</label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="email"
              required
              placeholder={role === 'admin' ? 'Enter admin email' : 'participant@example.com'}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#07090f] border border-[#1e2538] focus:border-neon outline-none text-white text-xs font-mono"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-gray-400 text-[11px]">Password *</label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="password"
              required
              placeholder="•••••••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#07090f] border border-[#1e2538] focus:border-neon outline-none text-white text-xs font-mono"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-xl font-bold font-mono text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 ${
            role === 'admin'
              ? 'bg-amber-400 hover:bg-amber-300 text-black shadow-[0_0_20px_rgba(251,191,36,0.3)]'
              : 'bg-neon hover:bg-[#00cc52] text-black shadow-[0_0_20px_rgba(0,255,102,0.3)]'
          }`}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>
                {role === 'admin'
                  ? 'Verify Admin Access'
                  : isSignUp
                  ? 'Create Account'
                  : 'Log In to Profile'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {role === 'participant' && (
        <div className="text-center pt-2 border-t border-[#1a2030]">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-gray-400 hover:text-neon transition-colors cursor-pointer"
          >
            {isSignUp ? (
              <>Already registered? <span className="text-neon font-bold">Log in</span></>
            ) : (
              <>Need an account? <span className="text-neon font-bold">Sign up with email</span></>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default function AuthPage() {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#07090f] text-white flex items-center justify-center p-6 relative overflow-hidden font-mono">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-neon/10 rounded-full blur-[120px] pointer-events-none" />
      <Suspense
        fallback={
          <div className="w-full max-w-md bg-[#0c0f17] border border-[#1e2538] rounded-3xl p-8 flex flex-col items-center justify-center space-y-3 font-mono text-neon min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-xs">Loading Flight Command Auth...</p>
          </div>
        }
      >
        <AuthForm />
      </Suspense>
    </div>
  );
}