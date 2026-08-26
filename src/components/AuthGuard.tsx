'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verify() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
          toast.error('Authentication required. Please sign in to continue.');
          const returnUrl = typeof window !== 'undefined' ? window.location.pathname : '';
          router.replace(`/auth?redirect=${encodeURIComponent(returnUrl)}`);
        } else {
          setAuthenticated(true);
        }
      } catch (err) {
        console.error('Auth verification error:', err);
        router.replace('/auth');
      } finally {
        setLoading(false);
      }
    }

    verify();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3 font-mono text-[#00ff66]">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-xs tracking-wider">VERIFYING PILOT CLEARANCE...</p>
      </div>
    );
  }

  return authenticated ? <>{children}</> : null;
}