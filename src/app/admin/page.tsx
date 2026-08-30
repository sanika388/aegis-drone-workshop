'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  IndianRupee, 
  Layers, 
  LogOut, 
  Clock, 
  ExternalLink, 
  Radio, 
  QrCode,
  Settings2,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import WorkshopLifecycleTab from './components/WorkshopLifecycleTab';
import AttendeeRegistryTab from './components/AttendeeRegistryTab';
import MediaShowcaseTab from './components/MediaShowcaseTab';
import QRCheckinModal from './components/QRCheckinModal';
import WorkshopManager from './components/WorkshopManager';
import AdminGuard from '@/components/AdminGuard';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'workshops' | 'manage' | 'registrations' | 'gallery'>('workshops');
  const [workshopsList, setWorkshopsList] = useState<any[]>([]);
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string>('');
  const [masterWorkshop, setMasterWorkshop] = useState<any>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMasterData();
  }, [selectedWorkshopId]);

  // Realtime subscription setup
  useEffect(() => {
    const channel = supabase
      .channel('realtime_admin_sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'registrations' },
        () => {
          fetchMasterData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'workshops' },
        () => {
          fetchMasterData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedWorkshopId]);

  const fetchMasterData = async () => {
    try {
      // 1. Fetch all workshops
      const { data: allWorkshops } = await supabase
        .from('workshops')
        .select('*')
        .order('created_at', { ascending: true });

      let activeSelectedWorkshop = null;

      if (allWorkshops && allWorkshops.length > 0) {
        setWorkshopsList(allWorkshops);
        const targetId = selectedWorkshopId || allWorkshops[0].id;
        activeSelectedWorkshop = allWorkshops.find((w) => w.id === targetId) || allWorkshops[0];
        setSelectedWorkshopId(activeSelectedWorkshop.id);
        setMasterWorkshop(activeSelectedWorkshop);
      } else {
        const defaultWorkshop = {
          id: 'aegis-master-workshop',
          title: 'Aegis Drone Avionics Master Workshop',
          badge: 'CERTIFIED WORKSHOP ★ DESIGN. BUILD. TEST. FLY. MASTER.',
          schedule_date: 'September 2026 Intake',
          venue: 'Guru Gobind Singh College of Engineering and Research Centre, Nashik',
          fee: 300,
          batch_size_limit: 30,
          fallback_whatsapp_link: '',
          whatsapp_links: [{ batchNumber: 1, url: '' }],
          syllabus: [
            '01 BUILD THE BRAIN: ESP32 Flight Controller, Gyro & Sensors (MPU6050), Firmware & Motors Wiring',
            '02 BUILD THE BODY: Quadcopter Chassis Geometry, Aerodynamics & Modular Assembly',
            '03 TEST. TUNE. TRUST: PID Tuning, Thrust Control, Hover & Flight Optimization',
            '100% Hands-on Practical with Live Demonstration Drone',
          ],
        };
        setWorkshopsList([defaultWorkshop]);
        setSelectedWorkshopId(defaultWorkshop.id);
        setMasterWorkshop(defaultWorkshop);
        activeSelectedWorkshop = defaultWorkshop;
      }

      // 2. Fetch registrations for the selected workshop
      const currentWorkshopId = activeSelectedWorkshop ? activeSelectedWorkshop.id : selectedWorkshopId;
      let query = supabase.from('registrations').select('*').order('created_at', { ascending: false });
      
      if (currentWorkshopId) {
        query = query.eq('workshop_id', currentWorkshopId);
      }

      const { data: regData } = await query;
if (regData) {
        setRegistrations(
          regData.map((r) => {
            const rawNum = r.clearance_id ? parseInt(r.clearance_id.replace(/\D/g, ''), 10) : null;
            const rawBatchStr = r.batch || r.assigned_batch || '';
            const parsedBatchNum = rawBatchStr
              ? parseInt(rawBatchStr.replace(/\D/g, ''), 10)
              : (rawNum ? Math.floor((rawNum - 1) / (activeSelectedWorkshop?.batch_size_limit || 30)) + 1 : 1);
            
            return {
              id: r.id,
              clearance_id: r.clearance_id || null,
              workshop_id: r.workshop_id,
              name: r.full_name,
              email: r.email,
              phone: r.phone,
              college: r.college,
              year: r.academic_year,
              batch_number: parsedBatchNum || 1,
              cohort_label: r.batch || r.assigned_batch || `Batch ${parsedBatchNum || 1}`,
              amount: Number(r.amount_paid || 0),
              status: r.payment_status === 'paid' || r.payment_status === 'confirmed' ? 'confirmed' : 'pending',
              payment_mode: r.payment_mode || (r.razorpay_payment_id ? 'online' : 'cash'),
              transaction_id: r.razorpay_payment_id || null,
              attended: !!r.attended,
              is_deleted: !!r.is_deleted,
              registeredAt: r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN') : 'Recent',
            };
          })
        );
      }
    } catch (err) {
      console.error('Failed fetching master data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkshopSwitch = (workshopId: string) => {
    setSelectedWorkshopId(workshopId);
    const target = workshopsList.find((w) => w.id === workshopId);
    if (target) {
      setMasterWorkshop(target);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    document.cookie = 'aegis_admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    localStorage.removeItem('aegis_admin_auth');
    router.replace('/auth?role=admin');
  };

  // Active records calculations
  const activeRegistrations = registrations.filter((r) => !r.is_deleted);
  const batchCap = masterWorkshop?.batch_size_limit || 30;
  const confirmedRegs = activeRegistrations.filter((r) => r.status === 'confirmed');
  const pendingRegs = activeRegistrations.filter((r) => r.status === 'pending');
  const grossRevenue = confirmedRegs.reduce((acc, curr) => acc + curr.amount, 0);
  const activeCohortsCount = Math.max(1, Math.ceil(activeRegistrations.length / batchCap));

  return (
    <AdminGuard>
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8 font-mono text-white">
        
        {loading || !masterWorkshop ? (
          <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 border-2 border-neon border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-gray-400">Loading Master Flight Lab Control Center...</p>
          </div>
        ) : (
          <>
            {/* Header Bar */}
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 border-b border-[#242424] pb-6">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-white uppercase">Aegis Flight Command Center</h1>
                   
                </div>
                 
              </div>

              {/* Action Controls & Tab Navigation */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Active Workshop Selector */}
                <div className="relative">
                  <select
                    value={selectedWorkshopId}
                    onChange={(e) => handleWorkshopSwitch(e.target.value)}
                    className="appearance-none bg-[#12141a] border border-[#2c374d] text-neon text-xs font-bold py-2 pl-3 pr-8 rounded-lg outline-none focus:border-neon cursor-pointer"
                  >
                    {workshopsList.map((w) => (
                      <option key={w.id} value={w.id}>
                        Track: {w.title.length > 25 ? `${w.title.slice(0, 25)}...` : w.title} (₹{w.fee})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <button
                  onClick={() => setIsScannerOpen(true)}
                  className="px-3.5 py-2 rounded-lg bg-neon/10 border border-neon/40 hover:bg-neon hover:text-black text-neon font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,255,102,0.15)]"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Desk Gate Scanner</span>
                </button>

                <Link
                  href={`/workshops/${masterWorkshop.id}`}
                  target="_blank"
                  className="px-3.5 py-2 rounded-lg bg-[#181818] border border-gray-700 hover:border-neon text-gray-300 hover:text-neon font-bold text-xs flex items-center gap-1.5 transition-all"
                >
                  <span>Live Pitch</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>

                {/* Navigation Tabs */}
                <div className="flex bg-[#121212] p-1 rounded-lg border border-[#242424]">
                  <button
                    onClick={() => setActiveTab('workshops')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'workshops' ? 'bg-neon text-black' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                    <span>Workshop Tracks</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('manage')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                      activeTab === 'manage' ? 'bg-neon text-black' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Control Room
                  </button>
                  <button
                    onClick={() => setActiveTab('registrations')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                      activeTab === 'registrations' ? 'bg-neon text-black' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Registry ({activeRegistrations.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('gallery')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                      activeTab === 'gallery' ? 'bg-neon text-black' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Showcase
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
                  <span className="text-[11px] font-medium uppercase">Active Registrations</span>
                  <Users className="w-3.5 h-3.5 text-neon" />
                </div>
                <p className="text-xl font-black text-white">{activeRegistrations.length} Pilots</p>
              </div>

              <div className="bg-[#121212] border border-[#242424] p-4 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-gray-400">
                  <span className="text-[11px] font-medium uppercase">Gross Collections</span>
                  <IndianRupee className="w-3.5 h-3.5 text-neon" />
                </div>
                <p className="text-xl font-black text-neon">₹{grossRevenue.toLocaleString('en-IN')}</p>
              </div>

              <div className="bg-[#121212] border border-[#242424] p-4 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-gray-400">
                  <span className="text-[11px] font-medium uppercase">Pending Desk Cash</span>
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <p className="text-xl font-black text-amber-400">{pendingRegs.length} Awaiting</p>
              </div>

              <div className="bg-[#121212] border border-[#242424] p-4 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-gray-400">
                  <span className="text-[11px] font-medium uppercase">Active Cohorts Formed</span>
                  <Layers className="w-3.5 h-3.5 text-neon" />
                </div>
                <p className="text-xl font-black text-white">{activeCohortsCount} Batches ({batchCap}/batch)</p>
              </div>
            </div>

            {/* Tab Content Routing */}
            {activeTab === 'workshops' && <WorkshopManager />}

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

            {/* Optical QR Scanner Modal */}
            <QRCheckinModal
              isOpen={isScannerOpen}
              onClose={() => setIsScannerOpen(false)}
              onRefresh={fetchMasterData}
            />
          </>
        )}

      </div>
    </AdminGuard>
  );
}