'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Plus, Trash2, Image, Radio, Save, CheckCircle2 } from 'lucide-react';
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
  const [isSaving, setIsSaving] = useState(false);

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

  const handleAddPoster = () => {
    if (!newPosterUrl.trim()) return;
    const updated = [...posters, newPosterUrl.trim()];
    setPosters(updated);
    setNewPosterUrl('');
    savePosters(updated);
  };

  const handleDeletePoster = (index: number) => {
    const updated = posters.filter((_, i) => i !== index);
    setPosters(updated);
    savePosters(updated);
  };

  const savePosters = async (posterList: string[]) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('workshops')
        .update({ poster_images: posterList })
        .eq('id', selectedBatch);

      if (error) throw error;
      toast.success('Posters updated');
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update posters');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      {/* 1. Dynamic Moving Marquee Notices Manager */}
      <div className="bg-[#121212] border border-[#242424] p-6 rounded-2xl space-y-6">
        <div className="flex items-center gap-2 border-b border-[#222] pb-4">
          <Radio className="w-5 h-5 text-neon" />
          <div>
            <h3 className="text-sm font-bold text-white font-mono uppercase">Homepage Marquee Ticker</h3>
            <p className="text-[11px] text-gray-400 font-mono">Live scrolling announcements on the top navbar</p>
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
            <span>Add Notice</span>
          </button>
        </form>

        <div className="space-y-2.5 max-h-[320px] overflow-y-auto">
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

      {/* 2. Multiple Posters Carousel Manager */}
      <div className="bg-[#121212] border border-[#242424] p-6 rounded-2xl space-y-6">
        <div className="flex items-center gap-2 border-b border-[#222] pb-4">
          <Image className="w-5 h-5 text-neon" />
          <div>
            <h3 className="text-sm font-bold text-white font-mono uppercase">Homepage Posters Carousel</h3>
            <p className="text-[11px] text-gray-400 font-mono">Add or remove banner posters (auto-cycles on homepage)</p>
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="url"
            placeholder="Paste poster image URL (https://...)..."
            value={newPosterUrl}
            onChange={(e) => setNewPosterUrl(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg bg-[#08090d] border border-[#242b3d] focus:border-neon outline-none text-white text-xs font-mono"
          />
          <button
            onClick={handleAddPoster}
            disabled={isSaving}
            className="px-4 py-2 rounded-lg bg-neon text-black font-mono text-xs font-bold hover:bg-[#00cc52] transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Poster</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 max-h-[320px] overflow-y-auto">
          {posters.length === 0 ? (
            <p className="text-xs text-gray-500 font-mono py-4 text-center col-span-2">
              No posters configured.
            </p>
          ) : (
            posters.map((url, idx) => (
              <div
                key={idx}
                className="relative group rounded-xl overflow-hidden border border-[#242b3d] bg-black aspect-video"
              >
                <img src={url} alt={`Poster ${idx + 1}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => handleDeletePoster(idx)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/80 text-red-400 hover:bg-red-500 hover:text-white transition-all cursor-pointer opacity-90 group-hover:opacity-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}