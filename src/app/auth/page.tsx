'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Lock, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isAdmin, setIsAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Participant Magic Link States
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get('role') === 'admin') {
      setIsAdmin(true);
    }
  }, [searchParams]);

  // Send Magic Link to Participant Email
  const handleMagicLinkSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const redirectUrl =
        typeof window !== 'undefined'
          ? `${window.location.origin}/workshops`
          : 'https://aegis-drone-workshop-ky4d.vercel.app/workshops';

      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
          shouldCreateUser: true,
        },
      });

      if (otpError) throw otpError;

      setEmailSent(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to send login link. Please check the email address.');
    } finally {
      setLoading(false);
    }
  };

  // Admin Login Handler
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      if (adminEmail === 'admin@aegisdrone.com' && adminPassword === 'admin123') {
        localStorage.setItem('aegis_admin_auth', 'true');
        router.push('/admin');
      } else {
        setError('Invalid admin credentials. Use admin@aegisdrone.com / admin123');
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <div className="bg-[#121212] border border-[#242424] rounded-2xl p-8 space-y-6 shadow-[0_0_25px_rgba(0,0,0,0.5)]">
        {/* Toggle Switch */}
        <div className="flex bg-[#0a0a0a] p-1 rounded-lg border border-[#242424]">
          <button
            type="button"
            onClick={() => {
              setIsAdmin(false);
              setError('');
              setEmailSent(false);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
              !isAdmin ? 'bg-neon text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            Participant Login
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAdmin(true);
              setError('');
              setEmailSent(false);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
              isAdmin ? 'bg-neon text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            Admin Login
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-950/40 border border-red-500/50 rounded-lg text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Participant Flow */}
        {!isAdmin ? (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <h1 className="text-xl font-bold text-white">Participant Portal</h1>
              <p className="text-xs text-gray-400">
                {emailSent
                  ? 'Check your email inbox for the sign-in link.'
                  : 'Enter your email to receive a passwordless sign-in link.'}
              </p>
            </div>

            {!emailSent ? (
              <form onSubmit={handleMagicLinkSignIn} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Email Address</label>
                  <div className="flex items-center gap-2 px-3 py-2 bg-[#0a0a0a] border border-[#242424] rounded-lg">
                    <Mail className="w-4 h-4 text-neon shrink-0" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@example.com"
                      className="bg-transparent text-sm text-white outline-none w-full"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg bg-neon text-black font-bold hover:bg-[#00cc52] transition-all text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Sending Link...' : 'Send Sign-In Link'}
                </button>
              </form>
            ) : (
              <div className="space-y-4 text-center">
                <div className="p-4 bg-[#181818] border border-neon/30 rounded-xl space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-neon mx-auto" />
                  <p className="text-sm font-semibold text-white">Link Sent!</p>
                  <p className="text-xs text-gray-400">
                    We sent a confirmation link to <span className="text-neon">{email}</span>. Click the link in your email to enter.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEmailSent(false);
                    setError('');
                  }}
                  className="text-xs text-gray-400 hover:text-white underline underline-offset-4 cursor-pointer"
                >
                  Try with a different email
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Admin Flow */
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="text-center space-y-1">
              <h1 className="text-xl font-bold text-white flex items-center justify-center gap-2">
                <Shield className="w-5 h-5 text-neon" /> Admin Portal
              </h1>
              <p className="text-xs text-gray-400 font-mono">RESTRICTED ACCESS ONLY</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400">Admin Email</label>
              <div className="flex items-center gap-2 px-3 py-2 bg-[#0a0a0a] border border-[#242424] rounded-lg">
                <Mail className="w-4 h-4 text-neon shrink-0" />
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@aegisdrone.com"
                  className="bg-transparent text-sm text-white outline-none w-full"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400">Password</label>
              <div className="flex items-center gap-2 px-3 py-2 bg-[#0a0a0a] border border-[#242424] rounded-lg">
                <Lock className="w-4 h-4 text-neon shrink-0" />
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-transparent text-sm text-white outline-none w-full"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-neon text-black font-bold hover:bg-[#00cc52] transition-all text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Authenticating...' : 'Sign In to Admin Dashboard'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a]" />}>
      <AuthContent />
    </Suspense>
  );
}