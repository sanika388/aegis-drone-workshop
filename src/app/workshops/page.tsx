'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  MapPin, 
  ArrowRight, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  Navigation, 
  Flag, 
  Weight, 
  Sparkles, 
  CheckCircle2,
  Phone,
  Code2
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function WorkshopsCatalogPage() {
  const [workshop, setWorkshop] = useState<any>(null);
  const [activeRegCount, setActiveRegCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWorkshopData() {
      try {
        // 1. Fetch Master Workshop
        const { data: wsData } = await supabase
          .from('workshops')
          .select('*')
          .order('created_at', { ascending: true })
          .limit(1)
          .single();

        if (wsData) {
          setWorkshop(wsData);
        }

        // 2. Fetch Active Registration Count to determine current batch status
        const { count } = await supabase
          .from('registrations')
          .select('id', { count: 'exact', head: true })
          .eq('is_deleted', false);

        if (count !== null) {
          setActiveRegCount(count);
        }
      } catch (err) {
        console.error('Catalog load failure:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchWorkshopData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-2 border-neon border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-mono text-gray-400">Loading Aegis Avionics Flight Tracks...</p>
      </div>
    );
  }

  const batchCap = workshop?.batch_size_limit || 20;
  const currentBatchNum = Math.floor(activeRegCount / batchCap) + 1;
  const workshopSlug = workshop?.id || 'aegis-master-workshop';

  return (
    <div className="max-w-5xl mx-auto px-6 py-14 space-y-10">
      
      {/* Page Header */}
      <div className="space-y-3 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neon/10 border border-neon/30 text-neon font-mono text-xs font-bold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>OFFICIAL GCOERC AVIONICS FLIGHT INTAKE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white font-mono uppercase tracking-tight">
          Aegis Drone Avionics Master Workshop
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 font-mono">
          Indigenous Make in India hardware architecture • 100% scratch-built FC & firmware • 3kg+ heavy payload chassis
        </p>
      </div>

      {/* Main Single Master Workshop Showcase Card */}
      <div className="bg-[#0b0d13] border-2 border-[#1f2638] hover:border-neon/50 transition-all rounded-3xl p-6 sm:p-10 space-y-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
        
        {/* Glowing Ambient Corner Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-neon/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Badges & Dynamic Cohort Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1b2233] pb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-md bg-neon/10 border border-neon/30 text-neon font-bold text-xs font-mono uppercase">
              CERTIFIED 3-STAGE WORKSHOP
            </span>
            <span className="px-3 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-xs font-mono uppercase flex items-center gap-1.5">
              <Flag className="w-3 h-3" /> Make In India
            </span>
          </div>

          {/* Simple Batch Status Indicator */}
          <div className="bg-[#121622] border border-[#242b3d] px-3.5 py-1.5 rounded-xl font-mono text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-neon animate-ping"></span>
            {currentBatchNum === 1 ? (
              <span className="text-neon font-bold">Batch 1 Active (Enrolling Now)</span>
            ) : (
              <span className="text-neon font-bold">
                Batch {currentBatchNum - 1} Full • Batch {currentBatchNum} Enrolling
              </span>
            )}
          </div>
        </div>

        {/* Workshop Title & Overview */}
        <div className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-white font-mono uppercase tracking-tight">
            Comprehensive Drone Avionics & 3kg+ Heavy Flight Masterclass
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-sans max-w-3xl">
            Design, assemble, solder, calibrate, and fly. You build the flight controller board from bare silicon, develop native stabilization firmware, engineer a 3D printed chassis capable of lifting 3kg+ functional payload, and interface GPS navigation.
          </p>
        </div>

        {/* Hardware Telemetry Spec Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
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
            <Navigation className="w-4 h-4 text-neon shrink-0" />
            <span className="truncate">GPS Navigation</span>
          </div>
          <div className="bg-[#10131d] border border-[#1e2536] p-3 rounded-xl flex items-center gap-2 text-gray-300 font-mono text-xs col-span-2 sm:col-span-1">
            <Layers className="w-4 h-4 text-neon shrink-0" />
            <span className="truncate">3D Print Chassis</span>
          </div>
        </div>

        {/* Curriculum Modules Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="bg-[#08090d] border border-[#1a1f2c] p-4 rounded-xl space-y-2">
            <span className="text-[10px] font-bold text-neon font-mono uppercase">MODULE 01</span>
            <h4 className="text-xs font-bold text-white font-mono uppercase">Build The Brain</h4>
            <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
              ESP32 board wiring, MPU6050 gyro fusion & native line-by-line flight logic.
            </p>
          </div>

          <div className="bg-[#08090d] border border-[#1a1f2c] p-4 rounded-xl space-y-2">
            <span className="text-[10px] font-bold text-neon font-mono uppercase">MODULE 02</span>
            <h4 className="text-xs font-bold text-white font-mono uppercase">3D Chassis & 3kg+ Aero</h4>
            <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
              Heavy-lift quadcopter chassis, brushless motor matching & CoG dynamic equilibrium.
            </p>
          </div>

          <div className="bg-[#08090d] border border-[#1a1f2c] p-4 rounded-xl space-y-2">
            <span className="text-[10px] font-bold text-neon font-mono uppercase">MODULE 03</span>
            <h4 className="text-xs font-bold text-white font-mono uppercase">Tuning & Flight</h4>
            <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
              PID stabilization loops, GPS waypoint tracking & live hover demonstration.
            </p>
          </div>
        </div>

        {/* Venue, Schedule, and Pricing Row */}
        <div className="border-t border-[#1b2233] pt-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          <div className="md:col-span-7 space-y-2.5 text-xs font-mono text-gray-300">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-neon shrink-0" />
              <span>Schedule: <strong>September 2026 Intake</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-neon shrink-0" />
              <span>Guru Gobind Singh College of Engineering & Research Centre, Nashik</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-neon shrink-0" />
              <span>Coordinator Desk: <strong>Sanika Dusane (+91 7620350524)</strong></span>
            </div>
          </div>

          {/* Pricing & CTA */}
          <div className="md:col-span-5 bg-[#08090d] border border-[#232a3c] p-4 sm:p-5 rounded-2xl flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-mono line-through">₹1,000</span>
                <span className="px-2 py-0.5 rounded bg-neon/10 text-neon font-bold text-[10px] font-mono">
                  70% OFF
                </span>
              </div>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl sm:text-3xl font-black text-neon font-mono">₹300</span>
                <span className="text-[10px] text-gray-400 font-mono">/ Pilot</span>
              </div>
              <span className="text-[10px] text-neon font-mono block mt-0.5 font-semibold">
                ★ Early Bird (First 10 Seats)
              </span>
            </div>

            <Link
              href={`/workshops/${workshopSlug}`}
              className="px-5 py-3 rounded-xl bg-neon text-black font-mono font-bold text-xs uppercase tracking-wider hover:bg-[#00cc52] transition-all flex items-center gap-1.5 shadow-[0_0_20px_rgba(0,255,102,0.25)] shrink-0 cursor-pointer"
            >
              <span>Claim Pass</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}