'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  Cpu, 
  Shield, 
  Radio, 
  Layers, 
  Sparkles, 
  Image as ImageIcon, 
  X, 
  Maximize2,
  CheckCircle2,
  Flame,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function AboutShowcasePage() {
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadShowcase = async () => {
    try {
      // 1. Fetch gallery_images across all workshops
      const { data } = await supabase
        .from('workshops')
        .select('gallery_images')
        .not('gallery_images', 'is', null);

      if (data && data.length > 0) {
        // Flatten arrays, remove null/empty items, deduplicate
        const allImages = Array.from(
          new Set(
            data
              .flatMap((w) => w.gallery_images || [])
              .filter((url) => typeof url === 'string' && url.trim().length > 0)
          )
        );
        setGalleryImages(allImages);
      }
    } catch (err) {
      console.error('Failed to load showcase gallery:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShowcase();

    // 2. Real-time subscription to auto-reflect photos uploaded via Admin Showcase Tab
    const channel = supabase
      .channel('about_gallery_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'workshops' },
        () => {
          loadShowcase();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 space-y-16">
      {/* Header Section */}
      <div className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neon/10 border border-neon/30 text-neon font-mono text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AEGIS AUTONOMOUS FLIGHT LAB</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white font-mono uppercase tracking-tight">
          Avionics & Lab Engineering
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 font-mono max-w-3xl leading-relaxed">
          Indigenous hardware-in-the-loop firmware programming, high-discharge ESC telemetry calibration, and heavy-payload modular airframe assembly at Guru Gobind Singh College of Engineering and Research Centre, Nashik.
        </p>
      </div>

      {/* Core Engineering Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-[#0e1017] border border-[#21283a] space-y-3.5 hover:border-neon/40 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-neon/10 border border-neon/30 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-neon" />
          </div>
          <h3 className="text-base font-bold text-white font-mono uppercase">ESP32 Avionics Core</h3>
          <p className="text-xs text-gray-300 font-mono leading-relaxed">
            Dual-core 240MHz telemetry processing, sub-millisecond gyro loop feedback, and real-time WiFi/BLE command bridge without pre-made black boxes.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#0e1017] border border-[#21283a] space-y-3.5 hover:border-neon/40 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-neon/10 border border-neon/30 flex items-center justify-center">
            <Radio className="w-5 h-5 text-neon" />
          </div>
          <h3 className="text-base font-bold text-white font-mono uppercase">Sensor Fusion & PID</h3>
          <p className="text-xs text-gray-300 font-mono leading-relaxed">
            MPU6050 6-DOF complementary and Kalman filtering with closed-loop proportional-integral-derivative thrust modulation.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#0e1017] border border-[#21283a] space-y-3.5 hover:border-neon/40 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-neon/10 border border-neon/30 flex items-center justify-center">
            <Shield className="w-5 h-5 text-neon" />
          </div>
          <h3 className="text-base font-bold text-white font-mono uppercase">3kg+ Heavy Airframe</h3>
          <p className="text-xs text-gray-300 font-mono leading-relaxed">
            Custom engineered aerodynamic quadcopter geometry capable of carrying specialized sensors, cameras, or relief delivery payloads.
          </p>
        </div>
      </div>

      {/* Dynamic Lab Showcase Gallery */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-[#202738] pb-4">
          <div>
            <h2 className="text-xl font-bold text-white font-mono uppercase flex items-center gap-2">
              <Layers className="w-5 h-5 text-neon" />
              <span>Live Lab Showcase & Flight Hardware</span>
            </h2>
            <p className="text-xs text-gray-400 font-mono mt-1">
              Field testing, component builds, and flight testing records managed directly from Command Room.
            </p>
          </div>
          <span className="font-mono text-xs text-neon font-semibold self-start sm:self-auto">
            {galleryImages.length} Asset{galleryImages.length === 1 ? '' : 's'} Deployed
          </span>
        </div>

        {galleryImages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {galleryImages.map((src, index) => (
              <div
                key={index}
                onClick={() => setActiveImage(src)}
                className="group relative aspect-video rounded-2xl overflow-hidden border border-[#242c3f] bg-[#0c0e14] cursor-pointer hover:border-neon/60 transition-all shadow-lg hover:shadow-[0_0_20px_rgba(0,255,102,0.15)]"
              >
                <img
                  src={src}
                  alt={`Lab Asset ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 justify-between">
                  <span className="font-mono text-[10px] text-neon uppercase font-bold">Inspect Hardware</span>
                  <Maximize2 className="w-4 h-4 text-white" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#0e1017] border border-[#21283a] rounded-2xl p-10 text-center space-y-3">
            <ImageIcon className="w-8 h-8 text-gray-500 mx-auto" />
            <p className="text-xs text-gray-400 font-mono">
              No showcase photos published yet. Upload images inside the <strong>Admin Control Room &gt; Showcase</strong> tab to display them here live.
            </p>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {activeImage && (
        <div
          onClick={() => setActiveImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-[#10131a] border border-neon/40 rounded-2xl overflow-hidden shadow-2xl p-2"
          >
            <button
              onClick={() => setActiveImage(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:text-neon hover:bg-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={activeImage}
              alt="Expanded Hardware Preview"
              className="w-full max-h-[80vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      {/* Call to Action Bar */}
      <div className="bg-gradient-to-r from-[#0c1410] to-[#0e1017] border border-neon/30 p-8 rounded-3xl flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-xl font-bold font-mono text-white">Join the Flight Cohort</h3>
          <p className="text-xs text-gray-400 font-mono">
            Seats are strictly capped per batch for hands-on workbench mentoring.
          </p>
        </div>
        <Link
          href="/workshops"
          className="px-6 py-3 rounded-xl bg-neon text-black font-mono font-bold text-xs uppercase tracking-wider hover:bg-[#00cc52] transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(0,255,102,0.3)] shrink-0"
        >
          <span>Explore Workshop Tracks</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}