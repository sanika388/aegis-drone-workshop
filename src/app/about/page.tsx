'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Cpu, Shield, Radio, Layers } from 'lucide-react';

export default function AboutShowcasePage() {
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadShowcase() {
      const { data } = await supabase
        .from('workshops')
        .select('gallery_images')
        .not('gallery_images', 'is', null)
        .limit(1);

      if (data && data.length > 0 && data[0].gallery_images?.length > 0) {
        setGalleryImages(data[0].gallery_images);
      }
      setLoading(false);
    }
    loadShowcase();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 space-y-12">
      {/* Header */}
      <div className="space-y-3">
        <span className="text-neon font-mono text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-neon/10 border border-neon/30">
          Aegis Autonomous Flight Lab
        </span>
        <h1 className="text-4xl font-extrabold text-white">Avionics & Lab Engineering</h1>
        <p className="text-sm text-gray-400 font-mono max-w-2xl">
          Hardware-in-the-loop firmware programming, ESC telemetry calibration, and rapid chassis assembly at GCOERC.
        </p>
      </div>

      {/* Dynamic Gallery or Schematics Fallback */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white font-mono uppercase flex items-center gap-2">
          <Layers className="w-4 h-4 text-neon" /> Lab Showcase & Flight Hardware
        </h2>

        {galleryImages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {galleryImages.map((src, index) => (
              <div key={index} className="aspect-video rounded-2xl overflow-hidden border border-[#242424] bg-[#121212]">
                <img src={src} alt={`Lab asset ${index + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#121212] border border-[#242424] space-y-3">
              <Cpu className="w-8 h-8 text-neon" />
              <h3 className="text-base font-bold text-white">ESP32 Avionics Core</h3>
              <p className="text-xs text-gray-400 font-mono">
                Dual-core telemetry processing, real-time gyro loop calculations, and wireless command bridge.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-[#121212] border border-[#242424] space-y-3">
              <Radio className="w-8 h-8 text-neon" />
              <h3 className="text-base font-bold text-white">9-DOF Sensor Fusion</h3>
              <p className="text-xs text-gray-400 font-mono">
                MPU6050 & BMI270 accelerometer/gyro filtering for stable indoor hover stabilization.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-[#121212] border border-[#242424] space-y-3">
              <Shield className="w-8 h-8 text-neon" />
              <h3 className="text-base font-bold text-white">Quadcopter Airframe</h3>
              <p className="text-xs text-gray-400 font-mono">
                Carbon-reinforced modular chassis designed for impact resilience and rapid component swaps.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}