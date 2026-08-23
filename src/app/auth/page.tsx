'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Lock, Mail, AlertCircle } from 'lucide-react';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isAdmin, setIsAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get('role') === 'admin') {
      setIsAdmin(true);
    }
  }, [searchParams]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Default credentials for testing (Replace with Supabase Auth when connecting live database)
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
            onClick={() => {
              setIsAdmin(false);
              setError('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
              !isAdmin ? 'bg-neon text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            Participant Login
          </button>
          <button
            onClick={() => {
              setIsAdmin(true);
              setError('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
              isAdmin ? 'bg-neon text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            Admin Login
          </button>
        </div>

        {/* Participant Login with Google */}
        {!isAdmin ? (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <h1 className="text-xl font-bold text-white">Participant Portal</h1>
              <p className="text-xs text-gray-400">Continue with Google to register and view receipts.</p>
            </div>

            <button
              onClick={() => alert('Participant Google OAuth will connect with Supabase')}
              className="w-full py-3 rounded-lg bg-[#181818] border border-[#2e2e2e] hover:border-neon text-white font-semibold flex items-center justify-center gap-3 transition-all text-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.5s.7 4.8 1.9 7.2l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 17C3.7 20.7 7.5 24 12 24z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>
        ) : (
          /* Admin Secure Password Login */
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="text-center space-y-1">
              <h1 className="text-xl font-bold text-white flex items-center justify-center gap-2">
                <Shield className="w-5 h-5 text-neon" /> Admin Portal
              </h1>
              <p className="text-xs text-gray-400 font-mono">RESTRICTED ACCESS ONLY</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-950/40 border border-red-500/50 rounded-lg text-red-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

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

            <div className="p-2.5 rounded bg-[#181818] border border-[#242424] text-[11px] text-gray-400 text-center font-mono">
              Demo Admin: <span className="text-neon">admin@aegisdrone.com</span> / <span className="text-neon">admin123</span>
            </div>
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