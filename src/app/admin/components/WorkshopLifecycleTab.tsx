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
  CheckCircle2,
  Edit3,
  Layers,
  PlusCircle,
  X
} from 'lucide-react';
import { toast } from 'sonner';

interface WorkshopLifecycleTabProps {
  selectedBatch: string;
  batchData: any;
  allWorkshops?: any[];
  onSelectWorkshop?: (id: string) => void;
  onRefresh: () => void;
}

export default function WorkshopLifecycleTab({
  selectedBatch,
  batchData,
  allWorkshops = [],
  onSelectWorkshop,
  onRefresh,
}: WorkshopLifecycleTabProps) {
  const [notices, setNotices] = useState<any[]>([]);
  const [newNoticeText, setNewNoticeText] = useState('');
  
  // Workshop-Specific Core Details
  const [title, setTitle] = useState(batchData?.title || '');
  const [subtitle, setSubtitle] = useState(batchData?.subtitle || '');
  const [badge, setBadge] = useState(batchData?.badge || 'CERTIFIED WORKSHOP');
  const [scheduleDate, setScheduleDate] = useState(batchData?.schedule_date || 'September 2026 Intake');
  const [venue, setVenue] = useState(batchData?.venue || 'Guru Gobind Singh College of Engineering and Research Centre, Nashik');
  const [fee, setFee] = useState<number>(batchData?.fee || 300);
  
  // Workshop-Specific Squad Cap Limit
  const [batchLimit, setBatchLimit] = useState<number>(batchData?.batch_size_limit || 20);

  // Workshop-Specific Posters
  const [posters, setPosters] = useState<string[]>(batchData?.poster_images || []);
  const [newPosterUrl, setNewPosterUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingWorkshop, setIsSavingWorkshop] = useState(false);
  const [isSavingLinks, setIsSavingLinks] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Workshop-Specific WhatsApp Squad Links
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

  // Modal State for Deploying Brand New Workshop
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newWs, setNewWs] = useState({
    id: '',
    title: '',
    subtitle: '',
    badge: 'CERTIFIED WORKSHOP',
    schedule_date: 'October 2026 Intake',
    venue: 'Guru Gobind Singh College of Engineering and Research Centre, Nashik',
    fee: 300,
    batch_size_limit: 20,
    fallback_whatsapp_link: 'https://chat.whatsapp.com/default-aegis-community',
  });
  const [isCreating, setIsCreating] = useState(false);

  // Synchronize state whenever a different workshop is picked from dropdown
  useEffect(() => {
    if (batchData) {
      setTitle(batchData.title || '');
      setSubtitle(batchData.subtitle || '');
      setBadge(batchData.badge || 'CERTIFIED WORKSHOP');
      setScheduleDate(batchData.schedule_date || 'September 2026 Intake');
      setVenue(batchData.venue || 'Guru Gobind Singh College of Engineering and Research Centre, Nashik');
      setFee(batchData.fee || 300);
      setBatchLimit(batchData.batch_size_limit || 20);
      setPosters(batchData.poster_images || []);
      setCohortLinks(batchData.cohort_whatsapp_links || { 'Batch 1': '', 'Batch 2': '' });
      setFallbackLink(batchData.fallback_whatsapp_link || 'https://chat.whatsapp.com/default-aegis-community');
    }
  }, [batchData, selectedBatch]);

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

  // 1. Save Workshop Core Details (Including Squad Partition Cap)
  const handleSaveWorkshopDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingWorkshop(true);
    try {
      const { error } = await supabase
        .from('workshops')
        .update({
          title: title.trim(),
          subtitle: subtitle.trim(),
          badge: badge.trim(),
          schedule_date: scheduleDate.trim(),
          venue: venue.trim(),
          fee: Number(fee),
          batch_size_limit: Number(batchLimit),
        })
        .eq('id', selectedBatch);

      if (error) throw error;
      toast.success(`Workshop configuration & squad limit (${batchLimit}) saved!`);
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update workshop');
    } finally {
      setIsSavingWorkshop(false);
    }
  };

  // 2. Save Workshop-Specific Dynamic Cohort WhatsApp Links
  // 2. Save Workshop-Specific Dynamic Cohort WhatsApp Links
  const handleSaveCohortLinks = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingLinks(true);
    try {
      const formattedWhatsappLinks = Object.entries(cohortLinks).map(([batchKey, url]) => ({
        batchNumber: Number(batchKey.replace(/\D/g, '') || 1),
        url: String(url).trim(),
      }));

      const { error } = await supabase
        .from('workshops')
        .update({
          cohort_whatsapp_links: cohortLinks,
          whatsapp_links: formattedWhatsappLinks,
          fallback_whatsapp_link: fallbackLink.trim(),
        })
        .eq('id', selectedBatch);

      if (error) throw error;
      toast.success(`Squad WhatsApp routing saved for ${title || selectedBatch}!`);
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
    const nextBatchNum = Object.keys(cohortLinks).length + 1;
    setCohortLinks((prev) => ({ ...prev, [`Batch ${nextBatchNum}`]: '' }));
  };

  // 3. Create Brand New Workshop
  const handleCreateWorkshop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWs.id.trim() || !newWs.title.trim()) {
      toast.error('Workshop ID and Title are required');
      return;
    }

    const cleanId = newWs.id.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');
    setIsCreating(true);

    try {
      const { error } = await supabase.from('workshops').insert([
        {
          id: cleanId,
          title: newWs.title.trim(),
          subtitle: newWs.subtitle.trim(),
          badge: newWs.badge.trim(),
          schedule_date: newWs.schedule_date.trim(),
          venue: newWs.venue.trim(),
          fee: Number(newWs.fee),
          batch_size_limit: Number(newWs.batch_size_limit),
          fallback_whatsapp_link: newWs.fallback_whatsapp_link.trim(),
          cohort_whatsapp_links: { 'Batch 1': '' },
          poster_images: [],
        },
      ]);

      if (error) throw error;
      toast.success(`Workshop "${newWs.title}" deployed!`);
      setIsCreateModalOpen(false);
      setNewWs({
        id: '',
        title: '',
        subtitle: '',
        badge: 'CERTIFIED WORKSHOP',
        schedule_date: 'October 2026 Intake',
        venue: 'Guru Gobind Singh College of Engineering and Research Centre, Nashik',
        fee: 300,
        batch_size_limit: 20,
        fallback_whatsapp_link: 'https://chat.whatsapp.com/default-aegis-community',
      });
      onRefresh();
      if (onSelectWorkshop) onSelectWorkshop(cleanId);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create workshop');
    } finally {
      setIsCreating(false);
    }
  };

  // 4. Delete Entire Workshop
  const handleDeleteWorkshop = async (id: string, name: string) => {
    if (allWorkshops.length <= 1) {
      toast.error('Cannot delete the only remaining workshop.');
      return;
    }

    if (!confirm(`Are you sure you want to delete "${name}" (${id})?`)) return;

    try {
      const { error } = await supabase.from('workshops').delete().eq('id', id);
      if (error) throw error;
      toast.success('Workshop deleted');
      onRefresh();
      const remaining = allWorkshops.filter((w) => w.id !== id);
      if (remaining.length > 0 && onSelectWorkshop) {
        onSelectWorkshop(remaining[0].id);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete workshop');
    }
  };

  // 5. High-Speed WebP Image Compressor
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const img = new window.Image();
    const reader = new FileReader();

    reader.onload = (event) => {
      img.src = event.target?.result as string;
      img.onload = async () => {
        try {
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Canvas rendering failed');

          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/webp', 0.80);

          const updated = [...posters, compressedDataUrl];
          setPosters(updated);
          await savePosters(updated);
          toast.success('High-speed compressed poster uploaded!');
        } catch (err: any) {
          toast.error(err.message || 'Image processing failed');
        } finally {
          setIsUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
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
        .eq('id', selectedBatch);

      if (error) throw error;
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update poster');
    }
  };

  // Marquee Handlers
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

  return (
    <div className="space-y-8">
      
      {/* 1. Workshop Selector & Track Switcher Bar */}
      <div className="bg-[#121212] border border-[#242424] p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neon/10 border border-neon/30 flex items-center justify-center text-neon shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-mono uppercase block">Active Selected Workshop Track</span>
            <div className="flex items-center gap-2">
              <select
                value={selectedBatch}
                onChange={(e) => onSelectWorkshop && onSelectWorkshop(e.target.value)}
                className="bg-[#08090d] border border-[#242b3d] text-neon font-mono text-sm font-bold px-3 py-1.5 rounded-lg outline-none focus:border-neon cursor-pointer"
              >
                {allWorkshops.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.title} ({w.id})
                  </option>
                ))}
              </select>

              {allWorkshops.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleDeleteWorkshop(selectedBatch, title)}
                  className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                  title="Delete this workshop"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-neon text-black font-mono text-xs font-bold hover:bg-[#00cc52] transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(0,255,102,0.2)]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Add New Workshop Track</span>
        </button>
      </div>

      {/* 2. Workshop-Specific Details & Squad Cap Form */}
      <div className="bg-[#121212] border border-[#242424] p-6 rounded-2xl space-y-6 shadow-lg">
        <div className="flex items-center gap-2 border-b border-[#222] pb-4">
          <Edit3 className="w-5 h-5 text-neon" />
          <div>
            <h3 className="text-sm font-bold text-white font-mono uppercase">
              Workshop Metadata & Specific Squad Partition Cap
            </h3>
            <p className="text-[11px] text-gray-400 font-mono">
              Configuring track: <span className="text-neon">{selectedBatch}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveWorkshopDetails} className="space-y-4 text-xs font-mono">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="space-y-1.5">
              <label className="text-gray-400 font-bold block uppercase">Workshop Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#08090d] border border-[#242b3d] focus:border-neon outline-none text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-gray-400 font-bold block uppercase">Subtitle / Pitch Hook</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#08090d] border border-[#242b3d] focus:border-neon outline-none text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-gray-400 font-bold block uppercase">Schedule / Intake Date</label>
              <input
                type="text"
                required
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                placeholder="e.g. September 2026 Intake"
                className="w-full px-3 py-2 rounded-lg bg-[#08090d] border border-[#242b3d] focus:border-neon outline-none text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-gray-400 font-bold block uppercase">Lab & Campus Venue</label>
              <input
                type="text"
                required
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#08090d] border border-[#242b3d] focus:border-neon outline-none text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-gray-400 font-bold block uppercase">Pass Registration Fee (₹)</label>
              <input
                type="number"
                min="0"
                required
                value={fee}
                onChange={(e) => setFee(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-[#08090d] border border-[#242b3d] focus:border-neon outline-none text-neon font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-neon font-bold flex items-center gap-1.5 uppercase">
                <Sliders className="w-3.5 h-3.5 text-neon" />
                <span>Track Squad Limit (Cap for {selectedBatch})</span>
              </label>
              <input
                type="number"
                min="5"
                max="100"
                required
                value={batchLimit}
                onChange={(e) => setBatchLimit(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-[#08090d] border border-[#242b3d] focus:border-neon outline-none text-neon font-bold"
              />
              <span className="text-[10px] text-gray-500">
                Auto-switches squad when {selectedBatch} reaches this exact seat count.
              </span>
            </div>

          </div>

          <button
            type="submit"
            disabled={isSavingWorkshop}
            className="px-5 py-2.5 rounded-xl bg-neon text-black font-mono font-bold text-xs flex items-center gap-2 hover:bg-[#00cc52] transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSavingWorkshop ? 'Saving...' : `Save ${title || selectedBatch} Details`}</span>
          </button>
        </form>
      </div>

      {/* 3. Workshop-Specific Automated WhatsApp Squad Routing */}
      <div className="bg-[#121212] border border-[#242424] p-6 rounded-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#222] pb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-neon" />
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase">
                Automated WhatsApp Squad Links for {title || selectedBatch}
              </h3>
              <p className="text-[11px] text-gray-400 font-mono">
                Pilots 1–{batchLimit} receive Batch 1 link, {batchLimit + 1}–{batchLimit * 2} receive Batch 2 link in email passes.
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
                  placeholder={`https://chat.whatsapp.com/${selectedBatch}-${batchKey.toLowerCase().replace(' ', '-')}`}
                  value={cohortLinks[batchKey]}
                  onChange={(e) => updateCohortLink(batchKey, e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#11141d] border border-[#242b3d] focus:border-neon outline-none text-white text-[11px]"
                />
              </div>
            ))}
          </div>

          <div className="bg-[#08090d] border border-[#1f2430] p-3.5 rounded-xl space-y-1.5">
            <span className="font-bold text-gray-300 uppercase block">
              Fallback Community WhatsApp Link for {title || selectedBatch}
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
            <span>{isSavingLinks ? 'Saving Links...' : `Save WhatsApp Squads for ${selectedBatch}`}</span>
          </button>
        </form>
      </div>

      {/* 4. Marquee Notices & Posters Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Marquee Notices */}
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

        {/* Workshop Posters Carousel */}
        <div className="bg-[#121212] border border-[#242424] p-6 rounded-2xl space-y-6">
          <div className="flex items-center gap-2 border-b border-[#222] pb-4">
            <ImageIcon className="w-5 h-5 text-neon" />
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase">
                Posters for {title || selectedBatch}
              </h3>
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
                  <span>Compressing & Uploading Poster...</span>
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
                No posters configured for {selectedBatch}.
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

      {/* 5. Create Workshop Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b0d13] border border-[#242b3d] rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto font-mono text-xs">
            
            <div className="flex items-center justify-between border-b border-[#1c2233] pb-4">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-neon" />
                <h3 className="text-base font-black text-white uppercase">Deploy New Workshop Track</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWorkshop} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-gray-400 font-bold block uppercase">URL Slug / Unique ID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. aegis-vtol-oct-2026"
                    value={newWs.id}
                    onChange={(e) => setNewWs({ ...newWs, id: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#08090d] border border-[#242b3d] focus:border-neon outline-none text-neon font-bold"
                  />
                  <span className="text-[10px] text-gray-500">
                    Live pitch will be accessible at: /workshops/{newWs.id || 'slug'}
                  </span>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-gray-400 font-bold block uppercase">Workshop Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aegis Autonomous VTOL & Fixed-Wing Workshop"
                    value={newWs.title}
                    onChange={(e) => setNewWs({ ...newWs, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#08090d] border border-[#242b3d] focus:border-neon outline-none text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-400 font-bold block uppercase">Schedule / Intake Date</label>
                  <input
                    type="text"
                    required
                    value={newWs.schedule_date}
                    onChange={(e) => setNewWs({ ...newWs, schedule_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#08090d] border border-[#242b3d] focus:border-neon outline-none text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-400 font-bold block uppercase">Registration Fee (₹)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newWs.fee}
                    onChange={(e) => setNewWs({ ...newWs, fee: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-[#08090d] border border-[#242b3d] focus:border-neon outline-none text-neon font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-400 font-bold block uppercase">Squad Partition Limit</label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    required
                    value={newWs.batch_size_limit}
                    onChange={(e) => setNewWs({ ...newWs, batch_size_limit: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-[#08090d] border border-[#242b3d] focus:border-neon outline-none text-neon font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-400 font-bold block uppercase">Fallback WhatsApp Link</label>
                  <input
                    type="url"
                    required
                    value={newWs.fallback_whatsapp_link}
                    onChange={(e) => setNewWs({ ...newWs, fallback_whatsapp_link: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#08090d] border border-[#242b3d] focus:border-neon outline-none text-white"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-gray-400 font-bold block uppercase">Campus Venue</label>
                  <input
                    type="text"
                    required
                    value={newWs.venue}
                    onChange={(e) => setNewWs({ ...newWs, venue: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#08090d] border border-[#242b3d] focus:border-neon outline-none text-white"
                  />
                </div>

              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1c2233]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-gray-400 hover:text-white transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2.5 rounded-xl bg-neon text-black font-bold flex items-center gap-1.5 hover:bg-[#00cc52] transition-all cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isCreating ? 'Deploying...' : 'Deploy Workshop Live'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}