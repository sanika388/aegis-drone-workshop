'use client';

import { useState } from 'react';
import { IndianRupee, Save, UploadCloud, Users, Image as ImageIcon, MessageSquare, Plus, Trash2, ShieldAlert } from 'lucide-react';
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
    fallback_community_link: batchData?.whatsapp_group_link || '',
    cohort_whatsapp_links: batchData?.cohort_whatsapp_links || {
      '1': '',
      '2': '',
      '3': '',
      '4': '',
      '5': '',
    },
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPoster, setIsUploadingPoster] = useState(false);

  const handleLinkChange = (batchNum: string, url: string) => {
    setFormData((prev) => ({
      ...prev,
      cohort_whatsapp_links: {
        ...prev.cohort_whatsapp_links,
        [batchNum]: url,
      },
    }));
  };

  const handleAddBatchSlot = () => {
    const keys = Object.keys(formData.cohort_whatsapp_links).map(Number);
    const nextBatch = keys.length > 0 ? Math.max(...keys) + 1 : 1;
    handleLinkChange(String(nextBatch), '');
  };

  const handlePrepopulate10 = () => {
    const updated = { ...formData.cohort_whatsapp_links };
    for (let i = 1; i <= 10; i++) {
      if (!updated[String(i)]) {
        updated[String(i)] = '';
      }
    }
    setFormData((prev) => ({ ...prev, cohort_whatsapp_links: updated }));
  };

  const handleRemoveBatchSlot = (batchNum: string) => {
    const updated = { ...formData.cohort_whatsapp_links };
    delete updated[batchNum];
    setFormData((prev) => ({ ...prev, cohort_whatsapp_links: updated }));
  };

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
        whatsapp_group_link: formData.fallback_community_link,
        cohort_whatsapp_links: formData.cohort_whatsapp_links,
      }).eq('id', selectedBatch);

      if (error) throw error;
      alert('Workshop settings, fallback community, and cohort links saved!');
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
        
        {/* Left Column: Pricing, Batch Limits & Notice */}
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

          <div className="space-y-1">
            <label className="text-xs font-mono text-gray-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-neon" /> Capacity Limit Per Batch (Auto-Spillover)
            </label>
            <input
              type="number"
              value={formData.batch_size_limit}
              onChange={(e) => setFormData({ ...formData, batch_size_limit: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#242424] text-xs text-white font-mono outline-none focus:border-neon"
            />
          </div>

          {/* Master Fallback Community Link */}
          <div className="space-y-1 bg-[#161208] border border-amber-900/40 p-3 rounded-lg">
            <label className="text-xs font-mono text-amber-400 flex items-center gap-1.5 font-bold">
              <ShieldAlert className="w-3.5 h-3.5" /> Fail-Safe / Master Community Link (Fallback)
            </label>
            <input
              type="url"
              value={formData.fallback_community_link}
              onChange={(e) => setFormData({ ...formData, fallback_community_link: e.target.value })}
              placeholder="https://chat.whatsapp.com/main-aegis-community"
              className="w-full px-3 py-1.5 rounded bg-[#0a0a0a] border border-amber-900/60 text-xs text-white font-mono outline-none focus:border-amber-400"
            />
            <p className="text-[10px] text-gray-400 font-mono">
              Used automatically if a student registers into a new batch (e.g. Batch 8) before you paste its specific link.
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-gray-400">Live Registration Notice</label>
            <textarea
              rows={2}
              value={formData.notice}
              onChange={(e) => setFormData({ ...formData, notice: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#242424] text-xs text-white font-mono outline-none focus:border-neon"
            />
          </div>
        </div>

        {/* Right Column: Pre-Configured Batch Links & Poster */}
        <div className="bg-[#121212] border border-[#242424] p-6 rounded-xl space-y-5">
          <div className="border-b border-[#1f1f1f] pb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-neon" /> Pre-Configured Cohort Links
              </h3>
              <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                Paste invites for upcoming batches in advance.
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrepopulate10}
                className="px-2 py-1 rounded bg-[#181818] border border-gray-700 hover:border-gray-500 text-gray-300 text-[10px] font-mono cursor-pointer"
              >
                1–10 Slots
              </button>
              <button
                type="button"
                onClick={handleAddBatchSlot}
                className="px-2 py-1 rounded bg-[#181818] border border-gray-700 hover:border-neon text-neon text-[10px] font-mono flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Slot</span>
              </button>
            </div>
          </div>

          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {Object.keys(formData.cohort_whatsapp_links || {})
              .sort((a, b) => Number(a) - Number(b))
              .map((batchNum) => (
                <div key={batchNum} className="flex items-center gap-2">
                  <span className="w-16 shrink-0 text-xs font-mono text-neon font-bold">Batch {batchNum}:</span>
                  <input
                    type="url"
                    placeholder={`https://chat.whatsapp.com/batch-${batchNum}-link`}
                    value={formData.cohort_whatsapp_links[batchNum] || ''}
                    onChange={(e) => handleLinkChange(batchNum, e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-[#0a0a0a] border border-[#242424] text-xs text-white font-mono outline-none focus:border-neon"
                  />
                  {Number(batchNum) > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveBatchSlot(batchNum)}
                      className="p-1.5 text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
          </div>

          {/* Poster Upload Slot */}
          <div className="border-t border-[#1f1f1f] pt-3 space-y-2">
            <label className="border-2 border-dashed border-[#2b2b2b] hover:border-neon rounded-xl p-3 text-center space-y-1 cursor-pointer transition-all bg-[#0a0a0a] block">
              <UploadCloud className="w-4 h-4 text-neon mx-auto" />
              <p className="text-xs text-white font-mono font-bold">
                {isUploadingPoster ? 'Uploading poster...' : 'Select Event Poster / Circular'}
              </p>
              <input type="file" accept="image/*" onChange={handlePosterUpload} className="hidden" disabled={isUploadingPoster} />
            </label>
          </div>

          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="w-full py-2.5 rounded-lg bg-neon text-black font-bold text-xs hover:bg-[#00cc52] transition-all flex items-center justify-center gap-2 cursor-pointer font-mono uppercase tracking-wider mt-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save All Settings & Batch Links'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}