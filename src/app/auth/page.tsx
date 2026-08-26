'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Shield, User, Lock, Mail, ArrowRight, Loader2, Plane, Phone, School } from 'lucide-react';
import { toast } from 'sonner';

export default function AuthPage() {
  const router = useRouter();
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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (role === 'admin') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email.trim(),
          password: formData.password,
        });

        if (error) throw error;
        toast.success('Admin authorization verified.');
        router.push('/admin');
        return;
      }

      // Participant Flow
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: formData.email.trim(),
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
        toast.success('Account created! Welcome to Aegis Command.');
        router.push('/');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email.trim(),
          password: formData.password,
        });

        if (error) throw error;
        toast.success('Logged in successfully!');
        router.push('/');
      }
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090f] text-white flex items-center justify-center p-6 relative overflow-hidden font-mono">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-neon/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#0c0f17] border border-[#1e2538] rounded-3xl p-8 space-y-6 relative z-10 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-neon/10 border border-neon/30 flex items-center justify-center text-neon shadow-[0_0_20px_rgba(0,255,102,0.2)]">
            <Plane className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black tracking-wider uppercase pt-2">
            AEGIS FLIGHT COMMAND
          </h1>
          <p className="text-xs text-gray-400">
            Avionics Master Workshop Portal
          </p>
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

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-3.5 text-xs font-sans">
          
          {role === 'participant' && isSignUp && (
            <>
              <div className="space-y-1 font-mono">
                <label className="text-gray-400 text-[11px]">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sanika Dusane"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#07090f] border border-[#1e2538] focus:border-neon outline-none text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1 font-mono">
                <label className="text-gray-400 text-[11px]">WhatsApp Phone Number *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="tel"
                    required
                    placeholder="+91 7620350524"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#07090f] border border-[#1e2538] focus:border-neon outline-none text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1 font-mono">
                <label className="text-gray-400 text-[11px]">College / Institute *</label>
                <div className="relative">
                  <School className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. GCOERC Nashik"
                    value={formData.college}
                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#07090f] border border-[#1e2538] focus:border-neon outline-none text-white text-xs font-mono"
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-1 font-mono">
            <label className="text-gray-400 text-[11px]">Email Address *</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="email"
                required
                placeholder="pilot@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#07090f] border border-[#1e2538] focus:border-neon outline-none text-white text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-1 font-mono">
            <label className="text-gray-400 text-[11px]">Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
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
            } disabled:opacity-50`}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>
                  {role === 'admin'
                    ? 'Verify Admin Access'
                    : isSignUp
                    ? 'Create Pilot Account'
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
                <>Already have an account? <span className="text-neon font-bold">Log in</span></>
              ) : (
                <>New pilot? <span className="text-neon font-bold">Create an account</span></>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}