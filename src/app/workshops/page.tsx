'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  MapPin, 
  ArrowRight, 
  Cpu, 
  Layers, 
  Weight, 
  Code2,
  Phone,
  AlertOctagon,
  Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

export default function WorkshopsCatalogPage() {
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [regCounts, setRegCounts] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);

  const fetchCatalogData = async () => {
    try {
      // 1. Fetch all active workshops from Supabase
      const { data: wsData } = await supabase
        .from('workshops')
        .select('*')
        .order('created_at', { ascending: true });

      if (wsData && wsData.length > 0) {
        setWorkshops(wsData);
      } else {
        // Dynamic fallback
        setWorkshops([
          {
            id: 'aegis-master-workshop',
            title: 'Aegis Drone Avionics Master Workshop',
            badge: 'CERTIFIED 3-STAGE WORKSHOP',
            schedule_date: 'September 2026 Intake',
            venue: 'Guru Gobind Singh College of Engineering & Research Centre, Nashik',
            fee: 300,
            batch_size_limit: 30,
            is_registration_open: true,
            syllabus: [
              '01 BUILD THE BRAIN: ESP32 Flight Controller & Gyro Wiring',
              '02 BUILD THE BODY: Quadcopter Chassis & 3kg+ Aero Dynamics',
              '03 TEST. TUNE. TRUST: PID Control & Live Flight Demonstration',
            ],
          },
        ]);
      }

      // 2. Fetch active registration counts
      const { data: regData } = await supabase
        .from('registrations')
        .select('workshop_id')
        .eq('is_deleted', false);

      if (regData) {
        const counts: { [key: string]: number } = {};
        regData.forEach((r) => {
          const wId = r.workshop_id || 'aegis-master-workshop';
          counts[wId] = (counts[wId] || 0) + 1;
        });
        setRegCounts(counts);
      }
    } catch (err) {
      console.error('Catalog load failure:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogData();

    // Real-time listener for updates when someone registers or admin updates workshop
    const channel = supabase
      .channel('catalog_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'registrations' },
        () => {
          fetchCatalogData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'workshops' },
        () => {
          fetchCatalogData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3 font-mono text-neon">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-xs text-gray-400">Loading Aegis Avionics Flight Tracks...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-14 space-y-10">
      {/* Page Header */}
      <div className="space-y-3 text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl font-black text-white font-mono uppercase tracking-tight">
          Aegis Drone Avionics Catalog
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 font-mono max-w-2xl leading-relaxed">
          Select an avionics track to secure your workbench allocation and access official squad materials.
        </p>
      </div>

      {/* Dynamic Workshop Cards Mapping */}
      {workshops.length === 0 ? (
        <div className="bg-[#0b0d13] border border-[#1f2638] rounded-3xl p-12 text-center space-y-3 font-mono">
          <AlertOctagon className="w-8 h-8 text-gray-500 mx-auto" />
          <p className="text-xs text-gray-400">No active workshop tracks open for enrollment at this time.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {workshops.map((workshop) => {
            const activeCount = regCounts[workshop.id] || 0;
            const batchCap = workshop.batch_size_limit || 30;
            const currentBatchNum = Math.floor(activeCount / batchCap) + 1;
            const fee = Number(workshop.fee ?? 300);
            const isOpen = workshop.is_registration_open !== false;

            return (
              <div
                key={workshop.id}
                className="bg-[#0b0d13] border-2 border-[#1f2638] hover:border-neon/50 transition-all rounded-3xl p-6 sm:p-10 space-y-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden"
              >
                {/* Glowing Corner Accent */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-neon/5 rounded-full blur-3xl pointer-events-none"></div>

                {/* Top Badges & Dynamic Cohort Status */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1b2233] pb-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-md bg-neon/10 border border-neon/30 text-neon font-bold text-xs font-mono uppercase">
                      {workshop.badge || 'CERTIFIED WORKSHOP'}
                    </span>
                    {/* Registration Status Badge */}
                    <span className={`px-3 py-1 rounded-md font-bold text-xs font-mono uppercase border ${
                      isOpen ? 'bg-neon/10 border-neon/30 text-neon' : 'bg-red-500/10 border-red-500/30 text-red-400'
                    }`}>
                      {isOpen ? '● REGISTRATION OPEN' : '■ REGISTRATION PAUSED'}
                    </span>
                  </div>

                  {/* Dynamic Batch Status Indicator based on Admin Capacity */}
                  <div className="bg-[#121622] border border-[#242b3d] px-3.5 py-1.5 rounded-xl font-mono text-xs flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-neon animate-ping' : 'bg-red-500'}`}></span>
                    {isOpen ? (
                      currentBatchNum === 1 ? (
                        <span className="text-neon font-bold">Batch 1 Active (Enrolling Now)</span>
                      ) : (
                        <span className="text-neon font-bold">
                          Batch {currentBatchNum - 1} Full • Batch {currentBatchNum} Enrolling
                        </span>
                      )
                    ) : (
                      <span className="text-red-400 font-bold">Registrations Paused by Admin</span>
                    )}
                  </div>
                </div>

                {/* Workshop Title & Description */}
                <div className="space-y-3">
                  <h2 className="text-2xl sm:text-3xl font-black text-white font-mono uppercase tracking-tight">
                    {workshop.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-sans max-w-3xl">
                    Design, assemble, solder, calibrate, and fly. You build the flight controller board from bare silicon, develop native stabilization firmware, and engineer a 3D printed chassis capable of lifting 3kg+ functional payload.
                  </p>
                </div>

                {/* Hardware Telemetry Spec Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="bg-[#10131d] border border-[#1e2536] p-3 rounded-xl flex items-center gap-2 text-gray-300 font-mono text-xs">
                    <Cpu className="w-4 h-4 text-neon shrink-0" />
                    <span className="truncate">ESP32 Scratch FC</span>
                  </div>
                  <div className="bg-[#10131d] border border-[#1e2536] p-3 rounded-xl flex items-center gap-2 text-gray-300 font-mono text-xs">
                    <Code2 className="w-4 h-4 text-neon shrink-0" />
                    <span className="truncate">Self-Built Firmware</span>
                  </div>
                  <div className="bg-[#10131d] border border-[#1e2536] p-3 rounded-xl flex items-center gap-2 text-gray-300 font-mono text-xs">
                    <Weight className="w-4 h-4 text-neon shrink-0" />
                    <span className="truncate">3kg+ Heavy Lift</span>
                  </div>
                  <div className="bg-[#10131d] border border-[#1e2536] p-3 rounded-xl flex items-center gap-2 text-gray-300 font-mono text-xs">
                    <Layers className="w-4 h-4 text-neon shrink-0" />
                    <span className="truncate">3D Print Chassis</span>
                  </div>
                </div>

                {/* Syllabus / Modules Display */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  {(workshop.syllabus && workshop.syllabus.length > 0 ? workshop.syllabus.slice(0, 3) : [
                    '01 Build The Brain: ESP32 & Gyro Fusion',
                    '02 3D Chassis & 3kg+ Aerodynamics',
                    '03 Tuning, Waypoints & Live Flight',
                  ]).map((moduleStr: string, idx: number) => (
                    <div key={idx} className="bg-[#08090d] border border-[#1a1f2c] p-4 rounded-xl space-y-1.5">
                      <span className="text-[10px] font-bold text-neon font-mono uppercase">MODULE 0{idx + 1}</span>
                      <p className="text-[11px] text-gray-300 font-sans leading-relaxed">
                        {moduleStr}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Venue, Date & Price Details */}
                <div className="border-t border-[#1b2233] pt-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-7 space-y-2.5 text-xs font-mono text-gray-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-neon shrink-0" />
                      <span>Schedule: <strong>{workshop.schedule_date || '16th, 17th, 18th September 2026 Intake'}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-neon shrink-0" />
                      <span>{workshop.venue || 'Guru Gobind Singh College of Engineering & Research Centre, Nashik'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-neon shrink-0" />
                      <span>Coordinator Desk: <strong>Sanika Dusane (+91 7620350524)</strong></span>
                    </div>
                  </div>

                  {/* Price and Dynamic Pass Action Link */}
                  <div className="md:col-span-5 bg-[#08090d] border border-[#232a3c] p-4 sm:p-5 rounded-2xl flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 font-mono line-through">₹1,000</span>
                        <span className="px-2 py-0.5 rounded bg-neon/10 text-neon font-bold text-[10px] font-mono">
                          DISCOUNT
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-2xl sm:text-3xl font-black text-neon font-mono">₹{fee}</span>
                        <span className="text-[10px] text-gray-400 font-mono">/ Pilot</span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono block mt-0.5">
                        Cohort Limit: {batchCap} seats/batch
                      </span>
                    </div>

                    <Link
                      href={isOpen ? `/workshops/${workshop.id}` : '#'}
                      onClick={(e) => {
                        if (!isOpen) {
                          e.preventDefault();
                          toast.error('Registrations for this workshop are currently paused. Contact admin.');
                        }
                      }}
                      className={`px-5 py-3 rounded-xl font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 ${
                        isOpen 
                          ? 'bg-neon text-black hover:bg-[#00cc52] shadow-[0_0_20px_rgba(0,255,102,0.25)] cursor-pointer' 
                          : 'bg-[#141824] border border-red-500/40 text-red-400 hover:bg-red-500/10 cursor-not-allowed'
                      }`}
                    >
                      <span>{isOpen ? 'Claim Pass' : 'Registrations Paused'}</span>
                      {isOpen && <ArrowRight className="w-4 h-4" />}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}