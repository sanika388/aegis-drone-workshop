'use client';

import { useState } from 'react';
import { X, Plus, Layers, IndianRupee, MapPin, Calendar, Users } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface CreateTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newSlug: string) => void;
}

export default function CreateTrackModal({ isOpen, onClose, onCreated }: CreateTrackModalProps) {
  const [formData, setFormData] = useState({
    id: '',
    title: 'Aegis Drone Workshop Batch 2',
    badge: 'CERTIFIED WORKSHOP ★ DESIGN. BUILD. TEST. FLY. MASTER.',
    date: 'September Month',
    venue: 'Guru Gobind Singh College of Engineering & Research Centre, Nashik',
    fee: 300,
    max_capacity: 20,
    status: 'active',
    notice: 'First 20 seats per batch. Hands-on flight hardware provided in lab.',
    whatsapp_group_name: 'Aegis Flight Cohort',
    whatsapp_group_link: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const cleanSlug = formData.id.toLowerCase().trim().replace(/\s+/g, '-');
      const payload = {
        ...formData,
        id: cleanSlug,
        syllabus: [
          '01 BUILD THE BRAIN: ESP Module (ESP32), Gyro & Sensors (MPU6050/BMI270), Firmware & Motors Wiring',
          '02 BUILD THE BODY: 3D Printed Quadcopter Chassis, Aerodynamics & Modular Assembly',
          '03 TEST. TUNE. TRUST: PID Tuning, Thrust Control, Hover & Flight Optimization',
          '100% Hands-on Practical with Real Components & Connectors',
        ],
      };

      const { error } = await supabase.from('workshops').insert([payload]);
      if (error) throw error;

      alert(`Workshop track created successfully: /workshops/${cleanSlug}`);
      onCreated(cleanSlug);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to launch track.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#121212] border border-neon/40 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-[0_0_50px_rgba(0,255,102,0.15)]">
        <div className="flex items-center justify-between border-b border-[#242424] pb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-neon" />
            <h2 className="text-base font-bold text-white font-mono uppercase">Launch Workshop Track</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          <div className="space-y-1">
            <label className="text-gray-400 uppercase font-bold text-[10px]">URL Route Slug</label>
            <input
              type="text"
              required
              placeholder="aegis-drone-batch-2"
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg bg-[#0a0a0a] border border-[#242424] focus:border-neon outline-none text-white"
            />
            <p className="text-[10px] text-gray-500">Live URL will be: /workshops/{formData.id || 'slug'}</p>
          </div>

          <div className="space-y-1">
            <label className="text-gray-400 uppercase font-bold text-[10px]">Track Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg bg-[#0a0a0a] border border-[#242424] focus:border-neon outline-none text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-gray-400 uppercase font-bold text-[10px]">Entry Fee (₹)</label>
              <input
                type="number"
                required
                value={formData.fee}
                onChange={(e) => setFormData({ ...formData, fee: Number(e.target.value) })}
                className="w-full px-3 py-2.5 rounded-lg bg-[#0a0a0a] border border-[#242424] focus:border-neon outline-none text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-gray-400 uppercase font-bold text-[10px]">Seat Limit</label>
              <input
                type="number"
                required
                value={formData.max_capacity}
                onChange={(e) => setFormData({ ...formData, max_capacity: Number(e.target.value) })}
                className="w-full px-3 py-2.5 rounded-lg bg-[#0a0a0a] border border-[#242424] focus:border-neon outline-none text-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-gray-400 uppercase font-bold text-[10px]">Venue Location</label>
            <input
              type="text"
              required
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg bg-[#0a0a0a] border border-[#242424] focus:border-neon outline-none text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-gray-400 uppercase font-bold text-[10px]">WhatsApp Group Invite Link</label>
            <input
              type="url"
              placeholder="https://chat.whatsapp.com/..."
              value={formData.whatsapp_group_link}
              onChange={(e) => setFormData({ ...formData, whatsapp_group_link: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg bg-[#0a0a0a] border border-[#242424] focus:border-neon outline-none text-white"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-lg bg-neon text-black font-bold text-xs uppercase tracking-wider hover:bg-[#00cc52] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4 shadow-[0_0_20px_rgba(0,255,102,0.2)]"
          >
            <Plus className="w-4 h-4" />
            <span>{isSubmitting ? 'Deploying Track...' : 'Deploy Workshop Track'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}