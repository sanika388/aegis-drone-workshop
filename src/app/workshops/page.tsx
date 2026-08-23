'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Lock, Mail, AlertCircle, CheckCircle2, User, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isAdmin, setIsAdmin] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false); // Toggle between Login and Sign Up

  // Participant Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // Admin Form States
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get('role') === 'admin') {
      setIsAdmin(true);
    }
  }, [searchParams]);

  // Handle Participant Sign In / Sign Up
  const handleParticipantAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign Up Flow
        const { data, error: signUpErr } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

        if (signUpErr) throw signUpErr;

        if (data.session) {
          router.push('/workshops');
        } else {
          setSuccess('Account created successfully! You can now sign in.');
          setIsSignUp(false);
        }
      } else {
        // Sign In Flow
        const { data, error: signInErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInErr) throw signInErr;

        if (data.session) {
          router.push('/workshops');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Admin Login
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
        
        {/* Toggle Switch: Participant vs Admin */}
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
            Participant
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

        {/* Alerts */}
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
          <form onSubmit={handleParticipantAuth} className="space-y-4">
            <div className="text-center space-y-1">
              <h1 className="text-xl font-bold text-white">
                {isSignUp ? 'Create Participant Account' : 'Participant Login'}
              </h1>
              <p className="text-xs text-gray-400">
                {isSignUp
                  ? 'Sign up to register and access your workshop passes.'
                  : 'Enter your email and password to log in.'}
              </p>
            </div>

            {isSignUp && (
              <div className="space-y-1">
                <label className="text-xs text-gray-400">Full Name</label>
                <div className="flex items-center gap-2 px-3 py-2 bg-[#0a0a0a] border border-[#242424] rounded-lg">
                  <User className="w-4 h-4 text-neon shrink-0" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Sanika Dusane"
                    className="bg-transparent text-sm text-white outline-none w-full"
                  />
                </div>
              </div>
            )}

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

            <div className="space-y-1">
              <label className="text-xs text-gray-400">Password</label>
              <div className="flex items-center gap-2 px-3 py-2 bg-[#0a0a0a] border border-[#242424] rounded-lg">
                <Lock className="w-4 h-4 text-neon shrink-0" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              {loading
                ? 'Processing...'
                : isSignUp
                ? 'Sign Up & Continue'
                : 'Sign In'}
            </button>

            {/* Switch between Sign In and Sign Up */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                  setSuccess('');
                }}
                className="text-xs text-gray-400 hover:text-neon transition-colors"
              >
                {isSignUp ? (
                  <>Already have an account? <span className="text-neon font-bold">Sign In</span></>
                ) : (
                  <>Don't have an account? <span className="text-neon font-bold">Sign Up</span></>
                )}
              </button>
            </div>
          </form>
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