'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, IndianRupee, Layers, LogOut, Clock, ExternalLink, Radio } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import WorkshopLifecycleTab from './components/WorkshopLifecycleTab';
import AttendeeRegistryTab from './components/AttendeeRegistryTab';
import MediaShowcaseTab from './components/MediaShowcaseTab';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'manage' | 'registrations' | 'gallery'>('manage');
  const [masterWorkshop, setMasterWorkshop] = useState<any>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);

  useEffect(() => {
    const adminSession = localStorage.getItem('aegis_admin_auth');
    if (adminSession !== 'true') {
      router.replace('/auth?role=admin');
    } else {
      setIsAuthenticated(true);
      fetchMasterData();
    }
  }, [router]);

  // Realtime subscription setup
  useEffect(() => {
    if (!isAuthenticated) return;

    const channel = supabase
      .channel('realtime_registrations')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'registrations' },
        () => {
          fetchMasterData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated]);

  const fetchMasterData = async () => {
    // 1. Fetch master pitch
    const { data: workshopData } = await supabase
      .from('workshops')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (workshopData) {
      setMasterWorkshop(workshopData);
    }

    // 2. Fetch all registrations with attendance & kit status
    const { data: regData } = await supabase
      .from('registrations')
      .select('*')
      .order('registered_at', { ascending: false });

    if (regData) {
      setRegistrations(
        regData.map((r) => ({
          id: r.id,
          name: r.full_name,
          email: r.email,
          phone: r.phone,
          college: r.college,
          year: r.academic_year,
          batch_number: r.batch_number || 1,
          cohort_label: r.cohort_label || `Batch ${r.batch_number || 1}`,
          amount: Number(r.amount_paid || 0),
          status: r.payment_status || 'pending',
          attended: !!r.attended,
          kit_issued: !!r.kit_issued,
          registeredAt: r.registered_at ? new Date(r.registered_at).toLocaleDateString('en-IN') : 'Recent',
        }))
      );
    }
  };

  const handleLogout = () => {
    document.cookie = 'aegis_admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    localStorage.removeItem('aegis_admin_auth');
    router.replace('/auth?role=admin');
  };

  if (!isAuthenticated || !masterWorkshop) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 border-2 border-neon border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-mono text-gray-400">Loading Master Flight Lab Control Center...</p>
      </div>
    );
  }

  const batchCap = masterWorkshop.batch_size_limit || 20;
  const confirmedRegs = registrations.filter((r) => r.status === 'confirmed');
  const pendingRegs = registrations.filter((r) => r.status === 'pending');
  const grossRevenue = confirmedRegs.reduce((acc, curr) => acc + curr.amount, 0);
  const activeCohortsCount = Math.max(1, Math.ceil(registrations.length / batchCap));

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[#242424] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white font-mono uppercase">Aegis Flight Command Center</h1>
            <span className="px-2 py-0.5 rounded bg-neon/10 border border-neon/30 text-neon font-bold text-[10px] uppercase font-mono flex items-center gap-1">
              <Radio className="w-3 h-3 animate-pulse" /> Live Telemetry
            </span>
          </div>
          <p className="text-xs text-gray-400 font-mono mt-1">
            CORE WORKSHOP INTAKE • AUTO-PARTITIONED COHORTS • DYNAMIC PRICING & PASS DISPATCH
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/workshops/${masterWorkshop.id}`}
            target="_blank"
            className="px-3.5 py-2 rounded-lg bg-[#181818] border border-gray-700 hover:border-neon text-gray-300 hover:text-neon font-bold font-mono text-xs flex items-center gap-1.5 transition-all"
          >
            <span>Live Registration Pitch</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <div className="flex bg-[#121212] p-1 rounded-lg border border-[#242424]">
            <button
              onClick={() => setActiveTab('manage')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md font-mono transition-all cursor-pointer ${
                activeTab === 'manage' ? 'bg-neon text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              Control Room
            </button>
            <button
              onClick={() => setActiveTab('registrations')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md font-mono transition-all cursor-pointer ${
                activeTab === 'registrations' ? 'bg-neon text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              Registry ({registrations.length})
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md font-mono transition-all cursor-pointer ${
                activeTab === 'gallery' ? 'bg-neon text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              About Showcase
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 rounded-lg bg-[#181818] border border-[#2e2e2e] hover:border-red-500 text-gray-400 hover:text-red-400 transition-all cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Global Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#121212] border border-[#242424] p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-medium uppercase font-mono">Total Registrations</span>
            <Users className="w-3.5 h-3.5 text-neon" />
          </div>
          <p className="text-xl font-black text-white font-mono">{registrations.length} Students</p>
        </div>

        <div className="bg-[#121212] border border-[#242424] p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-medium uppercase font-mono">Gross Collections</span>
            <IndianRupee className="w-3.5 h-3.5 text-neon" />
          </div>
          <p className="text-xl font-black text-neon font-mono">₹{grossRevenue.toLocaleString('en-IN')}</p>
        </div>

        <div className="bg-[#121212] border border-[#242424] p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-medium uppercase font-mono">Pending Verifications</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <p className="text-xl font-black text-amber-400 font-mono">{pendingRegs.length} Awaiting</p>
        </div>

        <div className="bg-[#121212] border border-[#242424] p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-medium uppercase font-mono">Active Cohorts Formed</span>
            <Layers className="w-3.5 h-3.5 text-neon" />
          </div>
          <p className="text-xl font-black text-white font-mono">{activeCohortsCount} Batches</p>
        </div>
      </div>

      {/* Tab Content Routing */}
      {activeTab === 'manage' && (
        <WorkshopLifecycleTab
          selectedBatch={masterWorkshop.id}
          batchData={masterWorkshop}
          onRefresh={fetchMasterData}
        />
      )}

      {activeTab === 'registrations' && (
        <AttendeeRegistryTab
          registrations={registrations}
          batchSizeLimit={batchCap}
          onRefresh={fetchMasterData}
        />
      )}

      {activeTab === 'gallery' && (
        <MediaShowcaseTab
          selectedBatch={masterWorkshop.id}
          images={masterWorkshop.gallery_images || []}
          onRefresh={fetchMasterData}
        />
      )}
    </div>
  );
}