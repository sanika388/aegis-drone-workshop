'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  ExternalLink, 
  MessageSquare, 
  Loader2,
  Settings2,
  AlertOctagon
} from 'lucide-react';
import Link from 'next/link';

export default function WorkshopManager() {
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    badge: '',
    schedule_date: '',
    venue: '',
    fee: 300,
    batch_size_limit: 30,
    fallback_whatsapp_link: '',
    whatsapp_links: [{ batchNumber: 1, url: '' }] as { batchNumber: number; url: string }[],
    syllabusText: '',
  });

  const fetchWorkshops = async () => {
    setLoading(true);
    const { data } = await supabase.from('workshops').select('*').order('created_at', { ascending: true });
    if (data && data.length > 0) {
      setWorkshops(data);
    } else {
      setWorkshops([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWorkshops();
  }, []);

  const handleEdit = (w: any) => {
    setEditingId(w.id);
    setFormData({
      id: w.id,
      title: w.title || '',
      badge: w.badge || '',
      schedule_date: w.schedule_date || '',
      venue: w.venue || '',
      fee: Number(w.fee || 300),
      batch_size_limit: Number(w.batch_size_limit || 30),
      fallback_whatsapp_link: w.fallback_whatsapp_link || '',
      whatsapp_links: Array.isArray(w.whatsapp_links) && w.whatsapp_links.length > 0
        ? w.whatsapp_links
        : [{ batchNumber: 1, url: '' }],
      syllabusText: Array.isArray(w.syllabus) ? w.syllabus.join('\n') : '',
    });
  };

  const handleAddNew = () => {
    setEditingId('NEW');
    setFormData({
      id: `workshop-${Date.now().toString().slice(-4)}`,
      title: 'New Avionics Master Track',
      badge: 'CERTIFIED WORKSHOP ★ 2026 INTAKE',
      schedule_date: 'September 2026 Intake',
      venue: 'Guru Gobind Singh College of Engineering and Research Centre, Nashik',
      fee: 300,
      batch_size_limit: 30,
      fallback_whatsapp_link: '',
      whatsapp_links: [{ batchNumber: 1, url: '' }],
      syllabusText: '01 Module One\n02 Module Two\n03 Module Three\n100% Hands-on Practical',
    });
  };

  const handleDeleteWorkshop = async (workshopId: string, workshopTitle: string) => {
    const isConfirmed = window.confirm(
      `Are you sure you want to permanently delete "${workshopTitle}" (ID: ${workshopId})?\n\nThis will remove it from the catalog and admin control room.`
    );

    if (!isConfirmed) return;

    try {
      setDeletingId(workshopId);

      const { error } = await supabase
        .from('workshops')
        .delete()
        .eq('id', workshopId);

      if (error) throw error;

      await fetchWorkshops();
      if (editingId === workshopId) {
        setEditingId(null);
      }
    } catch (err: any) {
      alert(`Deletion failed: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddBatchLink = () => {
    const nextBatch = formData.whatsapp_links.length + 1;
    setFormData({
      ...formData,
      whatsapp_links: [...formData.whatsapp_links, { batchNumber: nextBatch, url: '' }],
    });
  };

  const handleRemoveBatchLink = (index: number) => {
    const updated = formData.whatsapp_links.filter((_, idx) => idx !== index);
    setFormData({ ...formData, whatsapp_links: updated });
  };

  const handleLinkChange = (index: number, url: string) => {
    const updated = [...formData.whatsapp_links];
    updated[index].url = url;
    setFormData({ ...formData, whatsapp_links: updated });
  };

 const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const syllabusArray = formData.syllabusText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const cleanDate = formData.schedule_date.trim() || 'September 2026 Intake';

    const payload = {
      id: formData.id.trim().toLowerCase().replace(/\s+/g, '-'),
      title: formData.title,
      badge: formData.badge,
      date: cleanDate,                   // Satisfies legacy "date" NOT NULL column
      schedule_date: cleanDate,          // Keeps "schedule_date" aligned
      venue: formData.venue,
      fee: Number(formData.fee),
      batch_size_limit: Number(formData.batch_size_limit),
      fallback_whatsapp_link: formData.fallback_whatsapp_link,
      whatsapp_links: formData.whatsapp_links,
      syllabus: syllabusArray,
    };

    const { error } = await supabase
      .from('workshops')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      alert(`Save Failed: ${error.message}`);
    } else {
      setEditingId(null);
      await fetchWorkshops();
    }
    setSaving(false);
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-lg font-bold font-mono text-white flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-neon" />
            WORKSHOP TRACKS & BATCH CONTROL
          </h2>
          <p className="text-xs text-gray-400 font-mono">
            Create, edit, delete tracks, configure batch capacity, and assign WhatsApp groups.
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="px-3.5 py-2 rounded-lg bg-neon text-black font-mono text-xs font-bold hover:bg-[#00cc52] transition-colors flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(0,255,102,0.2)] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Workshop Track</span>
        </button>
      </div>

      {/* Editor Drawer */}
      {editingId && (
        <div className="bg-[#12141a] border border-neon/50 p-6 rounded-2xl space-y-5 shadow-2xl">
          <div className="flex justify-between items-center border-b border-[#242b3b] pb-3">
            <span className="font-mono text-xs font-bold text-neon uppercase">
              {editingId === 'NEW' ? '✦ Create New Workshop Track' : `✦ Editing Track: ${formData.id}`}
            </span>
            <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs font-sans">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 font-mono text-[11px] block mb-1">Workshop Slug / ID *</label>
                <input
                  type="text"
                  required
                  value={formData.id}
                  disabled={editingId !== 'NEW'}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#0a0c10] border border-[#242b3b] text-white font-mono outline-none focus:border-neon disabled:opacity-60"
                />
              </div>

              <div>
                <label className="text-gray-400 font-mono text-[11px] block mb-1">Track Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#0a0c10] border border-[#242b3b] text-white font-mono outline-none focus:border-neon"
                />
              </div>

              <div>
                <label className="text-gray-400 font-mono text-[11px] block mb-1">Badge Tagline</label>
                <input
                  type="text"
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#0a0c10] border border-[#242b3b] text-white font-mono outline-none focus:border-neon"
                />
              </div>

              <div>
                <label className="text-gray-400 font-mono text-[11px] block mb-1">Schedule Date / Intake</label>
                <input
                  type="text"
                  value={formData.schedule_date}
                  onChange={(e) => setFormData({ ...formData, schedule_date: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#0a0c10] border border-[#242b3b] text-white font-mono outline-none focus:border-neon"
                />
              </div>

              <div>
                <label className="text-gray-400 font-mono text-[11px] block mb-1">Registration Fee (₹) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.fee}
                  onChange={(e) => setFormData({ ...formData, fee: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg bg-[#0a0c10] border border-[#242b3b] text-white font-mono outline-none focus:border-neon"
                />
              </div>

              <div>
                <label className="text-gray-400 font-mono text-[11px] block mb-1">Batch Capacity (Split Limit) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.batch_size_limit}
                  onChange={(e) => setFormData({ ...formData, batch_size_limit: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg bg-[#0a0c10] border border-[#242b3b] text-white font-mono outline-none focus:border-neon"
                />
              </div>
            </div>

            <div>
              <label className="text-gray-400 font-mono text-[11px] block mb-1">Venue Address</label>
              <input
                type="text"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#0a0c10] border border-[#242b3b] text-white font-mono outline-none focus:border-neon"
              />
            </div>

            {/* Batch-wise WhatsApp Group Links Configuration */}
            <div className="bg-[#0c0e14] border border-[#222a3a] p-4 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-mono text-xs font-bold text-neon flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-neon" />
                    Batch-Wise WhatsApp Group Links
                  </span>
                  <p className="text-[10px] text-gray-400 font-mono">
                    Each link handles {formData.batch_size_limit} attendees sequentially.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddBatchLink}
                  className="px-2.5 py-1 rounded bg-[#1c2436] hover:bg-neon hover:text-black font-mono text-[11px] text-gray-200 transition-colors cursor-pointer"
                >
                  + Add Next Batch Group
                </button>
              </div>

              <div className="space-y-2">
                {formData.whatsapp_links.map((linkItem, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-gray-400 w-24 shrink-0">
                      Batch {linkItem.batchNumber || idx + 1}:
                    </span>
                    <input
                      type="url"
                      placeholder="https://chat.whatsapp.com/..."
                      value={linkItem.url}
                      onChange={(e) => handleLinkChange(idx, e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-[#141824] border border-[#2c374d] text-white font-mono text-xs outline-none focus:border-neon"
                    />
                    {formData.whatsapp_links.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveBatchLink(idx)}
                        className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <label className="text-gray-400 font-mono text-[11px] block mb-1">
                  Fallback WhatsApp Group (Used if batch link is empty):
                </label>
                <input
                  type="url"
                  placeholder="https://chat.whatsapp.com/default..."
                  value={formData.fallback_whatsapp_link}
                  onChange={(e) => setFormData({ ...formData, fallback_whatsapp_link: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#141824] border border-[#2c374d] text-white font-mono text-xs outline-none focus:border-neon"
                />
              </div>
            </div>

            <div>
              <label className="text-gray-400 font-mono text-[11px] block mb-1">
                Syllabus & Modules (One module per line)
              </label>
              <textarea
                rows={4}
                value={formData.syllabusText}
                onChange={(e) => setFormData({ ...formData, syllabusText: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#0a0c10] border border-[#242b3b] text-white font-mono text-xs outline-none focus:border-neon"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 font-mono text-xs hover:bg-gray-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-lg bg-neon text-black font-bold font-mono text-xs hover:bg-[#00cc52] flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,255,102,0.2)] cursor-pointer"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save Track Configuration</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Workshop Cards List */}
      {workshops.length === 0 ? (
        <div className="bg-[#10131a] border border-[#202838] rounded-2xl p-8 text-center space-y-3">
          <AlertOctagon className="w-8 h-8 text-gray-500 mx-auto" />
          <p className="text-xs text-gray-400 font-mono">No workshop tracks found. Click "New Workshop Track" to create one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workshops.map((w) => (
            <div
              key={w.id}
              className="bg-[#10131a] border border-[#202838] hover:border-neon/40 rounded-2xl p-5 space-y-4 transition-all relative overflow-hidden"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-neon/10 text-neon font-mono text-[10px] font-bold border border-neon/30">
                    {w.badge || 'ACTIVE TRACK'}
                  </span>
                  <h3 className="text-base font-bold text-white font-mono mt-1.5">{w.title}</h3>
                  <p className="text-xs text-gray-400 font-mono">ID: <code className="text-gray-300">{w.id}</code></p>
                </div>
                <div className="text-right font-mono">
                  <span className="text-xl font-black text-neon">₹{w.fee}</span>
                  <span className="text-[10px] text-gray-400 block">{w.batch_size_limit || 30} seats/batch</span>
                </div>
              </div>

              <div className="bg-[#0b0e14] p-3 rounded-xl border border-[#1b2333] space-y-1.5 text-[11px] font-mono text-gray-400">
                <div>📍 {w.venue || 'GCOERC Nashik'}</div>
                <div>📅 {w.schedule_date || 'Upcoming'}</div>
                <div className="text-neon flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  <span>{(w.whatsapp_links || []).length} Batch WhatsApp Link(s)</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#1e2636]">
                <Link
                  href={`/workshops/${w.id}`}
                  target="_blank"
                  className="text-gray-400 hover:text-neon font-mono text-xs flex items-center gap-1 transition-colors"
                >
                  <span>Public View</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeleteWorkshop(w.id, w.title)}
                    disabled={deletingId === w.id}
                    className="px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 font-mono text-xs flex items-center gap-1 transition-colors cursor-pointer border border-red-500/30 disabled:opacity-50"
                    title="Delete Workshop Track"
                  >
                    {deletingId === w.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    <span>Delete</span>
                  </button>

                  <button
                    onClick={() => handleEdit(w)}
                    className="px-3 py-1.5 rounded-lg bg-[#182030] hover:bg-neon hover:text-black text-gray-200 font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}