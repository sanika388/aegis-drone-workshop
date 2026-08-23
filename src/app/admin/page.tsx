'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, IndianRupee, Layers, Plus, LogOut, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import WorkshopLifecycleTab from './components/WorkshopLifecycleTab';
import AttendeeRegistryTab from './components/AttendeeRegistryTab';
import MediaShowcaseTab from './components/MediaShowcaseTab';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'manage' | 'registrations' | 'gallery'>('manage');
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [registrations, setRegistrations] = useState<any[]>([]);

  useEffect(() => {
    const adminSession = localStorage.getItem('aegis_admin_auth');
    if (adminSession !== 'true') {
      router.replace('/auth?role=admin');
    } else {
      setIsAuthenticated(true);
      fetchData();
    }
  }, [router]);

  const fetchData = async () => {
    // Fetch Batches
    const { data: batchData } = await supabase.from('workshops').select('*').order('created_at', { ascending: true });
    if (batchData && batchData.length > 0) {
      setBatches(batchData);
      setSelectedBatch((prev) => (batchData.some((b) => b.id === prev) ? prev : batchData[0].id));
    } else {
      setBatches([]);
      setSelectedBatch('');
    }

    // Fetch Registrations
    const { data: regData } = await supabase.from('registrations').select('*').order('registered_at', { ascending: false });
    if (regData) {
      setRegistrations(
        regData.map((r) => ({
          id: r.id,
          name: r.full_name,
          email: r.email,
          phone: r.phone,
          college: r.college,
          year: r.academic_year,
          batch: r.workshop_id,
          amount: Number(r.amount_paid || 0),
          status: r.payment_status || 'pending',
          registeredAt: r.registered_at ? new Date(r.registered_at).toLocaleDateString('en-IN') : 'Recent',
        }))
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('aegis_admin_auth');
    router.replace('/auth?role=admin');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 border-2 border-neon border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-mono text-gray-400">Verifying administrative access...</p>
      </div>
    );
  }

  const activeBatchData = batches.find((b) => b.id === selectedBatch) || null;
  const currentBatchRegs = registrations.filter((r) => r.batch === selectedBatch);
  const currentBatchConfirmed = currentBatchRegs.filter((r) => r.status === 'confirmed');
  const currentBatchPending = currentBatchRegs.filter((r) => r.status === 'pending');
  const currentBatchRevenue = currentBatchConfirmed.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[#242424] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white font-mono uppercase">Aegis Flight Command Center</h1>
            <span className="px-2 py-0.5 rounded bg-neon/10 border border-neon/30 text-neon font-bold text-[10px] uppercase font-mono">
              Root Admin
            </span>
          </div>
          <p className="text-xs text-gray-400 font-mono mt-1">
            MODULAR WORKSHOP LIFECYCLES, DYNAMIC PRICING & ATTENDEE VERIFICATIONS
          </p>
        </div>

        <div className="flex items-center gap-3">
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
            <span className="text-[11px] font-medium uppercase font-mono">Confirmed Seats</span>
            <Users className="w-3.5 h-3.5 text-neon" />
          </div>
          <p className="text-xl font-black text-white font-mono">
            {currentBatchConfirmed.length} / {activeBatchData?.max_capacity || 20}
          </p>
        </div>

        <div className="bg-[#121212] border border-[#242424] p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-medium uppercase font-mono">Gross Collections</span>
            <IndianRupee className="w-3.5 h-3.5 text-neon" />
          </div>
          <p className="text-xl font-black text-neon font-mono">₹{currentBatchRevenue.toLocaleString('en-IN')}</p>
        </div>

        <div className="bg-[#121212] border border-[#242424] p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-medium uppercase font-mono">Awaiting Review</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <p className="text-xl font-black text-amber-400 font-mono">{currentBatchPending.length} Pending</p>
        </div>

        <div className="bg-[#121212] border border-[#242424] p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-medium uppercase font-mono">Active Tracks</span>
            <Layers className="w-3.5 h-3.5 text-neon" />
          </div>
          <p className="text-xl font-black text-white font-mono">{batches.length} Live</p>
        </div>
      </div>

      {/* Track Selector Bar */}
      <div className="flex flex-wrap items-center gap-2 bg-[#121212] p-3 rounded-xl border border-[#242424]">
        {batches.map((b) => (
          <button
            key={b.id}
            onClick={() => setSelectedBatch(b.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border cursor-pointer ${
              selectedBatch === b.id
                ? 'bg-[#181818] border-neon text-neon shadow-[0_0_10px_rgba(0,255,102,0.2)]'
                : 'bg-[#0a0a0a] border-[#2e2e2e] text-gray-400 hover:text-white'
            }`}
          >
            {b.id} — ₹{b.fee}
          </button>
        ))}
      </div>

      {/* Modular Tab Routing */}
      {activeTab === 'manage' && activeBatchData && (
        <WorkshopLifecycleTab
          selectedBatch={selectedBatch}
          batchData={activeBatchData}
          onRefresh={fetchData}
        />
      )}

      {activeTab === 'registrations' && (
        <AttendeeRegistryTab
          registrations={registrations}
          selectedBatch={selectedBatch}
          onRefresh={fetchData}
        />
      )}

      {activeTab === 'gallery' && (
        <MediaShowcaseTab
          selectedBatch={selectedBatch}
          images={activeBatchData?.gallery_images || []}
          onRefresh={fetchData}
        />
      )}
    </div>
  );
}