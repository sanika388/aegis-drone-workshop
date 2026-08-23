'use client';

import { useState } from 'react';
import { IndianRupee, Play, Lock, Archive, Save, ExternalLink, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

interface WorkshopLifecycleProps {
  selectedBatch: string;
  batchData: any;
  onRefresh: () => void;
}

export default function WorkshopLifecycleTab({ selectedBatch, batchData, onRefresh }: WorkshopLifecycleProps) {
  const [formData, setFormData] = useState({
    title: batchData?.title || '',
    fee: Number(batchData?.fee || 300),
    venue: batchData?.venue || '',
    date: batchData?.date || '',
    status: batchData?.status || 'active',
    notice: batchData?.notice || '',
    max_capacity: Number(batchData?.max_capacity || 20),
    whatsapp_group_link: batchData?.whatsapp_group_link || '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handlePricePreset = async (newFee: number) => {
    try {
      setFormData((prev) => ({ ...prev, fee: newFee }));
      const { error } = await supabase.from('workshops').update({ fee: newFee }).eq('id', selectedBatch);
      if (error) throw error;
      onRefresh();
      alert(`Pricing for ${selectedBatch} set to ₹${newFee}!`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      setFormData((prev) => ({ ...prev, status: newStatus }));
      const { error } = await supabase.from('workshops').update({ status: newStatus }).eq('id', selectedBatch);
      if (error) throw error;
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.from('workshops').update({
        title: formData.title,
        fee: Number(formData.fee),
        venue: formData.venue,
        date: formData.date,
        status: formData.status,
        notice: formData.notice,
        max_capacity: Number(formData.max_capacity),
        whatsapp_group_link: formData.whatsapp_group_link,
      }).eq('id', selectedBatch);

      if (error) throw error;
      alert('Track configuration saved successfully!');
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to permanently delete track "${selectedBatch}"?`)) return;
    try {
      const { error } = await supabase.from('workshops').delete().eq('id', selectedBatch);
      if (error) throw error;
      alert(`Track ${selectedBatch} deleted.`);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#121212] border border-[#242424] p-4 rounded-xl">
        <div>
          <div className="text-xs font-mono text-gray-400">ACTIVE TRACK SLUG</div>
          <div className="text-base font-bold text-white font-mono">{selectedBatch}</div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/workshops/${selectedBatch}`}
            target="_blank"
            className="px-3 py-1.5 rounded-lg bg-[#181818] border border-gray-700 text-gray-300 hover:text-neon hover:border-neon font-mono text-xs flex items-center gap-1.5"
          >
            <span>Preview Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={handleDelete}
            className="px-3 py-1.5 rounded-lg bg-red-950/40 border border-red-800 text-red-400 hover:bg-red-900/50 transition-colors text-xs font-mono flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Track</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pricing & Status Module */}
        <div className="bg-[#121212] border border-[#242424] p-6 rounded-xl space-y-6">
          <div className="border-b border-[#1f1f1f] pb-3">
            <h3 className="text-sm font-bold text-white font-mono uppercase flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-neon" /> Dynamic Pricing Controls
            </h3>
            <p className="text-[11px] text-gray-400 font-mono mt-0.5">Select a preset or type a custom fee</p>
          </div>

          <div className="bg-[#0a0a0a] border border-[#1f1f1f] p-4 rounded-xl space-y-3">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-gray-400">Current Live Fee:</span>
              <span className="text-xl font-black text-neon">₹{formData.fee}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[300, 500, 1000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handlePricePreset(preset)}
                  className={`py-2 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer ${
                    formData.fee === preset
                      ? 'bg-neon text-black border-neon'
                      : 'bg-[#181818] text-gray-300 border-[#2b2b2b] hover:border-neon'
                  }`}
                >
                  ₹{preset}
                </button>
              ))}
            </div>
          </div>

          {/* Lifecycle Status */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-white font-mono uppercase">Track Status Switcher</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleStatusChange('active')}
                className={`py-2 rounded-lg border text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  formData.status === 'active'
                    ? 'bg-neon text-black border-neon'
                    : 'bg-[#181818] text-gray-400 border-[#2b2b2b] hover:text-white'
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                <span>Active</span>
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange('full')}
                className={`py-2 rounded-lg border text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  formData.status === 'full'
                    ? 'bg-amber-400 text-black border-amber-400'
                    : 'bg-[#181818] text-gray-400 border-[#2b2b2b] hover:text-white'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Full</span>
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange('completed')}
                className={`py-2 rounded-lg border text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  formData.status === 'completed'
                    ? 'bg-blue-400 text-black border-blue-400'
                    : 'bg-[#181818] text-gray-400 border-[#2b2b2b] hover:text-white'
                }`}
              >
                <Archive className="w-3.5 h-3.5" />
                <span>Completed</span>
              </button>
            </div>
          </div>
        </div>

        {/* Track Metadata & Settings Module */}
        <div className="bg-[#121212] border border-[#242424] p-6 rounded-xl space-y-4">
          <div className="border-b border-[#1f1f1f] pb-3">
            <h3 className="text-sm font-bold text-white font-mono uppercase">Workshop Details & Community</h3>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-gray-400 font-mono">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#242424] text-xs text-white outline-none focus:border-neon"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] text-gray-400 font-mono">Date / Month</label>
              <input
                type="text"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#242424] text-xs text-white outline-none focus:border-neon"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-gray-400 font-mono">Seat Limit</label>
              <input
                type="number"
                value={formData.max_capacity}
                onChange={(e) => setFormData({ ...formData, max_capacity: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#242424] text-xs text-white outline-none focus:border-neon"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-gray-400 font-mono">Venue</label>
            <input
              type="text"
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#242424] text-xs text-white outline-none focus:border-neon"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-gray-400 font-mono">WhatsApp Group Invite Link</label>
            <input
              type="url"
              value={formData.whatsapp_group_link}
              onChange={(e) => setFormData({ ...formData, whatsapp_group_link: e.target.value })}
              placeholder="https://chat.whatsapp.com/..."
              className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#242424] text-xs text-white outline-none focus:border-neon"
            />
          </div>

          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="w-full py-2.5 rounded-lg bg-neon text-black font-bold text-xs hover:bg-[#00cc52] transition-all flex items-center justify-center gap-2 cursor-pointer font-mono uppercase tracking-wider mt-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}