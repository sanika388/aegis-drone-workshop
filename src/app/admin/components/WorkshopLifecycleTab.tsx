'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Radio, 
  Upload, 
  Loader2, 
  MessageSquare, 
  Save, 
  Users,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

interface WorkshopLifecycleTabProps {
  selectedBatch: string;
  batchData: any;
  onRefresh: () => void;
}

export default function WorkshopLifecycleTab({
  selectedBatch,
  batchData,
  onRefresh,
}: WorkshopLifecycleTabProps) {
  const [notices, setNotices] = useState<any[]>([]);
  const [newNoticeText, setNewNoticeText] = useState('');
  const [posters, setPosters] = useState<string[]>(batchData?.poster_images || []);
  const [newPosterUrl, setNewPosterUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingLinks, setIsSavingLinks] = useState(false);
  const [isSavingLimit, setIsSavingLimit] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic Batch Size Limit (Default: 20, Editable by Admin)
  const [batchLimit, setBatchLimit] = useState<number>(batchData?.batch_size_limit || 20);

  // Dynamic Multi-Cohort Links State (Batch 1, Batch 2, Batch 3...)
  const [cohortLinks, setCohortLinks] = useState<{ [key: string]: string }>(
    batchData?.cohort_whatsapp_links || {
      'Batch 1': '',
      'Batch 2': '',
      'Batch 3': '',
    }
  );
  const [fallbackLink, setFallbackLink] = useState(
    batchData?.fallback_whatsapp_link || 'https://chat.whatsapp.com/default-aegis-community'
  );

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    const { data } = await supabase
      .from('notices')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setNotices(data);
  };

  // 1. Update Squad Size Limit (Auto-partitioning threshold)
  const handleSaveBatchLimit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingLimit(true);
    try {
      const { error } = await supabase
        .from('workshops')
        .update({ batch_size_limit: Number(batchLimit) })
        .eq('id', selectedBatch || 'aegis-master-workshop');

      if (error) throw error;
      toast.success(`Squad capacity updated to ${batchLimit} pilots per batch!`);
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update squad limit');
    } finally {
      setIsSavingLimit(false);
    }
  };

  // 2. Add Notice to Scrolling Marquee
  const handleAddNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeText.trim()) return;

    try {
      const { error } = await supabase
        .from('notices')
        .insert([{ text: newNoticeText.trim() }]);

      if (error) throw error;
      toast.success('Notice added to Homepage ticker');
      setNewNoticeText('');
      fetchNotices();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add notice');
    }
  };

  // 3. Delete Notice
  const handleDeleteNotice = async (id: string) => {
    try {
      const { error } = await supabase.from('notices').delete().eq('id', id);
      if (error) throw error;
      toast.success('Notice removed');
      fetchNotices();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete notice');
    }
  };

  // Direct Local File Explorer Upload (Converts directly to Data URI - No Bucket Required)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 3MB for database storage)
    if (file.size > 3 * 1024 * 1024) {
      toast.error('Image size must be under 3MB');
      return;
    }

    setIsUploading(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64Url = reader.result as string;
        const updated = [...posters, base64Url];
        setPosters(updated);
        await savePosters(updated);
        toast.success('Poster uploaded directly from device!');
      } catch (err: any) {
        toast.error(err.message || 'Failed to save poster');
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.onerror = () => {
      toast.error('Failed to read file from explorer');
      setIsUploading(false);
    };

    reader.readAsDataURL(file);
  };
  const handleAddPosterUrl = async () => {
    if (!newPosterUrl.trim()) return;
    const updated = [...posters, newPosterUrl.trim()];
    setPosters(updated);
    setNewPosterUrl('');
    await savePosters(updated);
  };

  const handleDeletePoster = async (index: number) => {
    const updated = posters.filter((_, i) => i !== index);
    setPosters(updated);
    await savePosters(updated);
  };

  const savePosters = async (posterList: string[]) => {
    try {
      const { error } = await supabase
        .from('workshops')
        .update({ poster_images: posterList })
        .eq('id', selectedBatch || 'aegis-master-workshop');

      if (error) throw error;
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update database');
    }
  };

  // 5. Save Dynamic Cohort WhatsApp Links
  const handleSaveCohortLinks = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingLinks(true);
    try {
      const { error } = await supabase
        .from('workshops')
        .update({
          cohort_whatsapp_links: cohortLinks,
          fallback_whatsapp_link: fallbackLink.trim(),
        })
        .eq('id', selectedBatch || 'aegis-master-workshop');

      if (error) throw error;
      toast.success('Automated Cohort WhatsApp Routing Saved!');
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save links');
    } finally {
      setIsSavingLinks(false);
    }
  };

  const updateCohortLink = (batchName: string, url: string) => {
    setCohortLinks((prev) => ({ ...prev, [batchName]: url }));
  };

  const addNewBatchField = () => {
    const currentKeys = Object.keys(cohortLinks);
    const nextBatchNum = currentKeys.length + 1;
    setCohortLinks((prev) => ({ ...prev, [`Batch ${nextBatchNum}`]: '' }));
  };

  return (
    <div className="space-y-8">
      
      {/* 1. Dynamic Squad Capacity Threshold (Auto-Switch Limit) */}
      <div className="bg-[#121212] border border-[#242424] p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neon/10 border border-neon/30 flex items-center justify-center text-neon shrink-0">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-mono uppercase">
              Cohort Batch Partition Limit (Squad Cap)
            </h3>
            <p className="text-[11px] text-gray-400 font-mono">
              Auto-allots to the next squad when a batch reaches this limit (Default: 20 pilots per squad).
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveBatchLimit} className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-[#08090d] border border-[#242b3d] px-3 py-1.5 rounded-xl">
            <span className="text-[11px] font-mono text-gray-400">Cap:</span>
            <input
              type="number"
              min="5"
              max="100"
              required
              value={batchLimit}
              onChange={(e) => setBatchLimit(Number(e.target.value))}
              className="w-14 bg-transparent text-neon font-mono text-sm text-center font-black outline-none"
            />
            <span className="text-[10px] font-mono text-gray-500">Pilots</span>
          </div>

          <button
            type="submit"
            disabled={isSavingLimit}
            className="px-4 py-2.5 rounded-xl bg-neon text-black font-mono text-xs font-bold hover:bg-[#00cc52] transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,255,102,0.2)]"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isSavingLimit ? 'Saving...' : 'Update Cap'}</span>
          </button>
        </form>
      </div>

      {/* 2. Automated Cohort WhatsApp Link Routing */}
      <div className="bg-[#121212] border border-[#242424] p-6 rounded-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#222] pb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-neon" />
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase">
                Automated Cohort WhatsApp Squad Links
              </h3>
              <p className="text-[11px] text-gray-400 font-mono">
                Pilots 1–{batchLimit} auto-receive Batch 1 link, {batchLimit + 1}–{batchLimit * 2} receive Batch 2 link in email passes.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={addNewBatchField}
            className="px-3 py-1.5 rounded-lg bg-[#181d2a] border border-[#2c364e] text-neon hover:bg-neon hover:text-black font-mono text-xs font-bold transition-all cursor-pointer"
          >
            + Add Batch Slot
          </button>
        </div>

        <form onSubmit={handleSaveCohortLinks} className="space-y-4 text-xs font-mono">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.keys(cohortLinks).map((batchKey, idx) => (
              <div key={batchKey} className="bg-[#08090d] border border-[#1f2430] p-3.5 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neon uppercase flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> {batchKey}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    Seats {idx * batchLimit + 1}–{(idx + 1) * batchLimit}
                  </span>
                </div>
                <input
                  type="url"
                  placeholder={`https://chat.whatsapp.com/${batchKey.toLowerCase().replace(' ', '-')}`}
                  value={cohortLinks[batchKey]}
                  onChange={(e) => updateCohortLink(batchKey, e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#11141d] border border-[#242b3d] focus:border-neon outline-none text-white text-[11px]"
                />
              </div>
            ))}
          </div>

          {/* Master Fallback Community Link */}
          <div className="bg-[#08090d] border border-[#1f2430] p-3.5 rounded-xl space-y-1.5">
            <span className="font-bold text-gray-300 uppercase block">
              Fallback Community WhatsApp Link (Default If Specific Batch Link Not Provided)
            </span>
            <input
              type="url"
              placeholder="https://chat.whatsapp.com/master-aegis-community"
              value={fallbackLink}
              onChange={(e) => setFallbackLink(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#11141d] border border-[#242b3d] focus:border-neon outline-none text-white text-[11px]"
            />
          </div>

          <button
            type="submit"
            disabled={isSavingLinks}
            className="px-5 py-2.5 rounded-xl bg-neon text-black font-bold text-xs font-mono flex items-center gap-2 hover:bg-[#00cc52] transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSavingLinks ? 'Saving Links...' : 'Save Cohort WhatsApp Routing'}</span>
          </button>
        </form>
      </div>

      {/* 3. Marquee Notices & Poster Carousel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Marquee Notices Manager */}
        <div className="bg-[#121212] border border-[#242424] p-6 rounded-2xl space-y-6">
          <div className="flex items-center gap-2 border-b border-[#222] pb-4">
            <Radio className="w-5 h-5 text-neon" />
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase">Homepage Marquee Ticker</h3>
              <p className="text-[11px] text-gray-400 font-mono">Live scrolling announcements on top navbar</p>
            </div>
          </div>

          <form onSubmit={handleAddNotice} className="flex gap-2">
            <input
              type="text"
              required
              placeholder="Type new scrolling notice..."
              value={newNoticeText}
              onChange={(e) => setNewNoticeText(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg bg-[#08090d] border border-[#242b3d] focus:border-neon outline-none text-white text-xs font-mono"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-neon text-black font-mono text-xs font-bold hover:bg-[#00cc52] transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </form>

          <div className="space-y-2.5 max-h-[300px] overflow-y-auto">
            {notices.length === 0 ? (
              <p className="text-xs text-gray-500 font-mono py-4 text-center">No active notices.</p>
            ) : (
              notices.map((n) => (
                <div
                  key={n.id}
                  className="bg-[#0a0c10] border border-[#1f2430] p-3 rounded-xl flex items-center justify-between gap-3 text-xs font-mono"
                >
                  <span className="text-gray-300 leading-relaxed">{n.text}</span>
                  <button
                    onClick={() => handleDeleteNotice(n.id)}
                    className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Posters Carousel Manager */}
        <div className="bg-[#121212] border border-[#242424] p-6 rounded-2xl space-y-6">
          <div className="flex items-center gap-2 border-b border-[#222] pb-4">
            <ImageIcon className="w-5 h-5 text-neon" />
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase">Homepage Posters Carousel</h3>
              <p className="text-[11px] text-gray-400 font-mono">Upload poster image files directly or paste link</p>
            </div>
          </div>

          <div className="space-y-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full py-3 px-4 rounded-xl bg-[#181d2a] border border-[#2c364e] hover:border-neon text-white hover:text-neon font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-neon" />
                  <span>Uploading Poster to Cloud...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 text-neon" />
                  <span>📁 Click to Upload Poster Image from Device</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-2 pt-1">
              <span className="text-[10px] text-gray-500 font-mono shrink-0">OR URL:</span>
              <input
                type="url"
                placeholder="https://i.imgur.com/your-image.png"
                value={newPosterUrl}
                onChange={(e) => setNewPosterUrl(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg bg-[#08090d] border border-[#242b3d] focus:border-neon outline-none text-white text-xs font-mono"
              />
              <button
                onClick={handleAddPosterUrl}
                className="px-3 py-1.5 rounded-lg bg-[#222] hover:bg-neon hover:text-black text-gray-300 text-xs font-mono font-bold transition-all cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto">
            {posters.length === 0 ? (
              <p className="text-xs text-gray-500 font-mono py-8 text-center col-span-2">
                No posters configured. Upload an image above to display it on the homepage carousel.
              </p>
            ) : (
              posters.map((url, idx) => (
                <div
                  key={idx}
                  className="relative group rounded-xl overflow-hidden border border-[#242b3d] bg-black aspect-video shadow-md"
                >
                  <img src={url} alt={`Poster ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => handleDeletePoster(idx)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/80 text-red-400 hover:bg-red-500 hover:text-white transition-all cursor-pointer opacity-90 group-hover:opacity-100"
                    title="Remove Poster"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}