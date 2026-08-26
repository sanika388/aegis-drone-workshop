'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

const ADMIN_EMAILS = [
  'admin@aegisdrone.com',
  'dusanesanika9@gmail.com',
];

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAdmin() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session || !ADMIN_EMAILS.includes(session.user.email?.toLowerCase().trim() || '')) {
        setAuthorized(false);
      } else {
        setAuthorized(true);
      }
    }

    checkAdmin();
  }, [router]);

  if (authorized === null) {
    return (
      <div className="min-h-screen bg-[#07090f] flex flex-col items-center justify-center space-y-3 font-mono text-neon">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-xs">Verifying Command Clearances...</p>
      </div>
    );
  }

  if (authorized === false) {
    return (
      <div className="min-h-screen bg-[#07090f] flex flex-col items-center justify-center p-6 text-center font-mono space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-white uppercase tracking-wider">
          RESTRICTED ADMIN ACCESS
        </h2>
        <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
          Your current session does not hold administrative clearance to access the Command Control Room.
        </p>
        <Link
          href="/auth"
          className="px-5 py-2.5 rounded-xl bg-neon text-black font-bold text-xs uppercase hover:bg-[#00cc52] transition-all shadow-[0_0_15px_rgba(0,255,102,0.25)]"
        >
          Authenticate as Admin
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}