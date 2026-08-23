'use client';

import { useState } from 'react';
import { IndianRupee, Play, Lock, Archive, Save, ExternalLink, Trash2, UploadCloud, Users, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { uploadAegisAsset } from '@/lib/uploadHelper';

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
    batch_size_limit: Number(batchData?.batch_size_limit || 20),
    homepage_poster_url: batchData?.homepage_poster_url || '',
    whatsapp_group_link: batchData?.whatsapp_group_link || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPoster, setIsUploadingPoster] = useState(false);

  const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedBatch) return;

    setIsUploadingPoster(true);
    try {
      const publicUrl = await uploadAegisAsset(file, 'circulars');
      setFormData((prev) => ({ ...prev, homepage_poster_url: publicUrl }));
      await supabase.from('workshops').update({ homepage_poster_url: publicUrl }).eq('id', selectedBatch);
      alert('Homepage notice/poster uploaded successfully!');
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUploadingPoster(false);
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
        batch_size_limit: Number(formData.batch_size_limit),
        homepage_poster_url: formData.homepage_poster_url,
        whatsapp_group_link: formData.whatsapp_group_link,
      }).eq('id', selectedBatch);

      if (error) throw error;
      alert('Workshop parameters saved!');
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Column: Pricing, Batch Size Limit & Lifecycle */}
        <div className="bg-[#121212] border border-[#242424] p-6 rounded-xl space-y-6">
          <div className="border-b border-[#1f1f1f] pb-3">
            <h3 className="text-sm font-bold text-white font-mono uppercase flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-neon" /> Dynamic Pricing & Auto-Batch Limits
            </h3>
          </div>

          <div className="bg-[#0a0a0a] border border-[#1f1f1f] p-4 rounded-xl space-y-3">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-gray-400">Current Fee:</span>
              <span className="text-xl font-black text-neon">₹{formData.fee}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[300, 500, 1000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setFormData({ ...formData, fee: preset })}
                  className={`py-2 rounded-lg border text-xs font-mono font-bold transition-all ${
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

          <div className="space-y-1">
            <label className="text-xs font-mono text-gray-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-neon" /> Students Per Batch Limit (Auto-Division)
            </label>
            <input
              type="number"
              value={formData.batch_size_limit}
              onChange={(e) => setFormData({ ...formData, batch_size_limit: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#242424] text-xs text-white font-mono outline-none focus:border-neon"
            />
            <p className="text-[10px] text-gray-500 font-mono">
              When registrations cross multiples of this number, attendees are automatically assigned into Batch 1, Batch 2, Batch 3, etc.
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-gray-400">Live Notice Banner Text</label>
            <textarea
              rows={2}
              value={formData.notice}
              onChange={(e) => setFormData({ ...formData, notice: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#242424] text-xs text-white font-mono outline-none focus:border-neon"
            />
          </div>
        </div>

        {/* Right Column: Homepage Poster Upload Hub & Details */}
        <div className="bg-[#121212] border border-[#242424] p-6 rounded-xl space-y-5">
          <div className="border-b border-[#1f1f1f] pb-3">
            <h3 className="text-sm font-bold text-white font-mono uppercase flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-neon" /> Homepage Notice Poster
            </h3>
            <p className="text-[11px] text-gray-400 font-mono mt-0.5">
              Upload event poster or circular displayed on the main home screen.
            </p>
          </div>

          <label className="border-2 border-dashed border-[#2b2b2b] hover:border-neon rounded-xl p-6 text-center space-y-2 cursor-pointer transition-all bg-[#0a0a0a] block">
            <UploadCloud className="w-6 h-6 text-neon mx-auto" />
            <p className="text-xs text-white font-mono font-bold">
              {isUploadingPoster ? 'Uploading poster...' : 'Select Event Poster / Circular'}
            </p>
            <p className="text-[10px] text-gray-500 font-mono">PNG, JPG, JPEG or WEBP</p>
            <input type="file" accept="image/*" onChange={handlePosterUpload} className="hidden" disabled={isUploadingPoster} />
          </label>

          {formData.homepage_poster_url && (
            <div className="relative rounded-lg overflow-hidden border border-[#242424] aspect-video bg-[#0a0a0a]">
              <img src={formData.homepage_poster_url} alt="Homepage poster" className="w-full h-full object-cover" />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] text-gray-400 font-mono">WhatsApp Group Link</label>
            <input
              type="url"
              value={formData.whatsapp_group_link}
              onChange={(e) => setFormData({ ...formData, whatsapp_group_link: e.target.value })}
              placeholder="https://chat.whatsapp.com/..."
              className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#242424] text-xs text-white font-mono outline-none focus:border-neon"
            />
          </div>

          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="w-full py-2.5 rounded-lg bg-neon text-black font-bold text-xs hover:bg-[#00cc52] transition-all flex items-center justify-center gap-2 cursor-pointer font-mono uppercase tracking-wider mt-3"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Settings & Poster'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}