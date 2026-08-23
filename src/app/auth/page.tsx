'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Lock, Mail, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isAdmin, setIsAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  
  // Participant OTP States
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get('role') === 'admin') {
      setIsAdmin(true);
    }
  }, [searchParams]);

  // Step 1: Send OTP to participant email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      });

      if (otpError) throw otpError;

      setOtpSent(true);
      setSuccess('A 6-digit verification code has been sent to your email.');
    } catch (err: any) {
      setError(err?.message || 'Failed to send OTP. Please check the email address.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify the OTP token entered by participant
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      });

      if (verifyError) throw verifyError;

      if (data.session) {
        router.push('/workshops');
      }
    } catch (err: any) {
      setError(err?.message || 'Invalid or expired OTP. Please try again.');
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
              setSuccess('');
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
              setSuccess('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
              isAdmin ? 'bg-neon text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            Admin Login
          </button>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-950/40 border border-red-500/50 rounded-lg text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-950/40 border border-green-500/50 rounded-lg text-green-300 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-green-400" />
            <span>{success}</span>
          </div>
        )}

        {/* Participant Flow */}
        {!isAdmin ? (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <h1 className="text-xl font-bold text-white">Participant Portal</h1>
              <p className="text-xs text-gray-400">
                {!otpSent ? 'Sign in with a one-time passcode sent to your email.' : 'Enter the code from your inbox.'}
              </p>
            </div>

            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
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
                  className="w-full py-2.5 rounded-lg bg-neon text-black font-bold hover:bg-[#00cc52] transition-all text-xs uppercase tracking-wider disabled:opacity-50"
                >
                  {loading ? 'Sending Code...' : 'Send Login Code'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">6-Digit Code</label>
                  <div className="flex items-center gap-2 px-3 py-2 bg-[#0a0a0a] border border-[#242424] rounded-lg">
                    <KeyRound className="w-4 h-4 text-neon shrink-0" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="123456"
                      className="bg-transparent text-sm text-white outline-none w-full tracking-widest font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg bg-neon text-black font-bold hover:bg-[#00cc52] transition-all text-xs uppercase tracking-wider disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Confirm & Sign In'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setToken('');
                    setError('');
                  }}
                  className="w-full text-center text-xs text-gray-400 hover:text-white"
                >
                  Use a different email
                </button>
              </form>
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
              className="w-full py-2.5 rounded-lg bg-neon text-black font-bold hover:bg-[#00cc52] transition-all text-xs uppercase tracking-wider disabled:opacity-50"
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