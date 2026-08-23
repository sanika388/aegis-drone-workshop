'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function WorkshopsCatalogPage() {
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllWorkshops() {
      try {
        const { data, error } = await supabase
          .from('workshops')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) console.error('Error fetching workshop catalog:', error);

        let list = data && data.length > 0 ? [...data] : [];

        // Always guarantee aegis-drone-feb-2026 is visible as the primary track
        if (!list.some((w) => w.id === 'aegis-drone-feb-2026')) {
          list.unshift({
            id: 'aegis-drone-feb-2026',
            title: 'Aegis Drone Workshop',
            badge: 'CERTIFIED WORKSHOP',
            date: 'September Month',
            venue: 'Guru Gobind Singh College of Engineering & Research Centre, Nashik',
            fee: 300,
            max_capacity: 20,
          });
        }

        setWorkshops(list);
      } catch (err) {
        console.error('Catalog load failure:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAllWorkshops();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-2 border-neon border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-mono text-gray-400">Loading active workshop tracks...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neon/10 border border-neon/30 text-neon font-mono text-xs font-bold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>OFFICIAL GCOERC FLIGHT LAB TRACKS</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Active Workshop Tracks</h1>
        <p className="text-xs text-gray-400 font-mono">
          Select a track below to register for your batch (20 seats capacity per batch).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {workshops.map((ws) => (
          <div
            key={ws.id}
            className="bg-[#121212] border border-[#242424] hover:border-neon/50 transition-all rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-[0_0_20px_rgba(0,0,0,0.4)]"
          >
            <div className="space-y-4">
              <span className="px-3 py-1 rounded-full bg-neon/10 border border-neon/30 text-neon font-bold text-[11px] font-mono inline-block">
                {ws.badge || 'CERTIFIED WORKSHOP'}
              </span>
              <h2 className="text-xl font-bold text-white">{ws.title}</h2>

              <div className="space-y-2 text-xs text-gray-400 font-mono">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-neon shrink-0" />
                  <span>{ws.date || 'September Month'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-neon shrink-0" />
                  <span>{ws.venue || 'GCOERC Campus, Nashik'}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-[#242424] pt-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-500 font-mono uppercase">Entry Pass Fee</span>
                <p className="text-2xl font-black text-neon font-mono">₹{ws.fee || 300}</p>
              </div>

              <Link
                href={`/workshops/${ws.id}`}
                className="px-5 py-2.5 rounded-lg bg-neon text-black font-bold text-xs uppercase tracking-wider hover:bg-[#00cc52] transition-all flex items-center gap-1.5 font-mono cursor-pointer"
              >
                <span>Register Pass</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}