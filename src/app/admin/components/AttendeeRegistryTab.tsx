'use client';

import { useState } from 'react';
import { 
  Search, 
  Download, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  CheckSquare, 
  Square, 
  Send, 
  Radio, 
  CheckCheck,
  ShieldCheck 
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';

interface AttendeeRegistryProps {
  registrations: any[];
  batchSizeLimit: number;
  onRefresh: () => void;
}

export default function AttendeeRegistryTab({ registrations, batchSizeLimit = 20, onRefresh }: AttendeeRegistryProps) {
  const [selectedCohort, setSelectedCohort] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  // Dynamic Batch Count
  const totalCount = registrations.length;
  const totalBatchesNeeded = Math.max(1, Math.ceil(totalCount / batchSizeLimit));
  const batchTabs = Array.from({ length: totalBatchesNeeded }, (_, i) => `Batch ${i + 1}`);

  // Filtered dataset
  const filtered = registrations
    .filter((r) => {
      if (selectedCohort === 'all') return true;
      const assigned = r.cohort_label || `Batch ${r.batch_number || 1}`;
      return assigned === selectedCohort;
    })
    .filter(
      (r) =>
        r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.phone?.includes(searchTerm) ||
        r.college?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Toggle Single Selection
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Select All in Filtered View
  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length && filtered.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((r) => r.id));
    }
  };

  // Single Status Toggle & Dispatch
  const handleToggleStatus = async (reg: any) => {
    const nextStatus = reg.status === 'confirmed' ? 'pending' : 'confirmed';
    setLoadingId(reg.id);

    try {
      const { error } = await supabase
        .from('registrations')
        .update({ payment_status: nextStatus, email_sent: nextStatus === 'confirmed' })
        .eq('id', reg.id);

      if (error) throw error;

      if (nextStatus === 'confirmed') {
        const { data: workshopData } = await supabase
          .from('workshops')
          .select('title, venue, date, whatsapp_group_link, cohort_whatsapp_links')
          .limit(1)
          .single();

        const assignedBatchNum = String(reg.batch_number || 1);
        const cohortMap = workshopData?.cohort_whatsapp_links || {};
        const fallbackCommunity = workshopData?.whatsapp_group_link || '';
        const targetWhatsappLink = cohortMap[assignedBatchNum] || fallbackCommunity;

        await fetch('/api/send-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentName: reg.name,
            studentEmail: reg.email,
            bookingId: reg.id,
            workshopTitle: `${workshopData?.title || 'Aegis Drone Workshop'} (${reg.cohort_label || 'Batch 1'})`,
            amount: reg.amount,
            venue: workshopData?.venue || 'GCOERC Avionics Lab, Nashik',
            date: workshopData?.date || 'September Month',
            whatsappLink: targetWhatsappLink,
          }),
        });

        toast.success(`Confirmed & Boarding Pass emailed to ${reg.name}`);
      } else {
        toast.info(`Status reset to Pending for ${reg.name}`);
      }

      onRefresh();
    } catch (err: any) {
      toast.error('Failed to update: ' + err.message);
    } finally {
      setLoadingId(null);
    }
  };

  // Bulk Confirmation & Batch Email Dispatch
  const handleBulkConfirm = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkProcessing(true);

    try {
      const { error } = await supabase
        .from('registrations')
        .update({ payment_status: 'confirmed', email_sent: true })
        .in('id', selectedIds);

      if (error) throw error;

      const { data: workshopData } = await supabase
        .from('workshops')
        .select('title, venue, date, whatsapp_group_link, cohort_whatsapp_links')
        .limit(1)
        .single();

      const selectedAttendees = registrations.filter((r) => selectedIds.includes(r.id));
      const cohortMap = workshopData?.cohort_whatsapp_links || {};
      const fallbackCommunity = workshopData?.whatsapp_group_link || '';

      // Concurrent Email Dispatch
      await Promise.all(
        selectedAttendees.map((reg) => {
          const assignedBatchNum = String(reg.batch_number || 1);
          const targetWhatsappLink = cohortMap[assignedBatchNum] || fallbackCommunity;

          return fetch('/api/send-confirmation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              studentName: reg.name,
              studentEmail: reg.email,
              bookingId: reg.id,
              workshopTitle: `${workshopData?.title || 'Aegis Drone Workshop'} (${reg.cohort_label || 'Batch 1'})`,
              amount: reg.amount,
              venue: workshopData?.venue || 'GCOERC Avionics Lab, Nashik',
              date: workshopData?.date || 'September Month',
              whatsappLink: targetWhatsappLink,
            }),
          });
        })
      );

      toast.success(`Bulk Verified & Sent Passes to ${selectedIds.length} students!`);
      setSelectedIds([]);
      onRefresh();
    } catch (err: any) {
      toast.error('Bulk operation failed: ' + err.message);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleWhatsApp = (reg: any) => {
    const cleanPhone = reg.phone.replace(/[^0-9]/g, '');
    const phoneWithCode = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    const cohort = reg.cohort_label || `Batch ${reg.batch_number || 1}`;
    const message = encodeURIComponent(
      `Hey ${reg.name}! Your seat for Aegis Drone Workshop (${cohort} - Booking ID: ${reg.id}) is officially confirmed. See you in the lab!`
    );
    window.open(`https://wa.me/${phoneWithCode}?text=${message}`, '_blank');
  };

  const exportCSV = () => {
    const headers = 'Booking ID,Assigned Cohort,Student Name,Email,Phone,College,Year,Amount (INR),Payment Status,Registration Date\n';
    const rows = filtered
      .map(
        (r) =>
          `"${r.id}","${r.cohort_label || `Batch ${r.batch_number || 1}`}","${r.name}","${r.email}","${r.phone}","${r.college}","${r.year}",${r.amount},"${r.status}","${r.registeredAt}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Aegis_Attendance_${selectedCohort.replace(/\s+/g, '_')}.csv`;
    a.click();
    toast.success(`Exported ${filtered.length} attendees to CSV`);
  };

  return (
    <div className="space-y-6">
      {/* Visual Cohort Meters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {batchTabs.map((cohortName) => {
          const cohortRegs = registrations.filter((r) => (r.cohort_label || `Batch ${r.batch_number || 1}`) === cohortName);
          const isFull = cohortRegs.length >= batchSizeLimit;
          const percentage = Math.min(100, Math.round((cohortRegs.length / batchSizeLimit) * 100));

          return (
            <button
              key={cohortName}
              type="button"
              onClick={() => {
                setSelectedCohort(cohortName);
                setSelectedIds([]);
              }}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                selectedCohort === cohortName
                  ? 'bg-[#141416] border-neon shadow-[0_0_20px_rgba(0,255,102,0.12)]'
                  : 'bg-[#0e0e10] border-[#1e1e24] hover:border-gray-700'
              }`}
            >
              <div className="flex justify-between items-center text-xs font-mono mb-2">
                <span className="font-bold text-white uppercase">{cohortName}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                  isFull ? 'bg-red-950/60 text-red-400 border border-red-800/60' : 'bg-neon/10 text-neon border border-neon/30'
                }`}>
                  {isFull ? 'LOCKED (FULL)' : 'INTAKE ACTIVE'}
                </span>
              </div>

              <div className="text-xl font-black text-white font-mono">
                {cohortRegs.length} <span className="text-xs text-gray-500 font-normal font-sans">/ {batchSizeLimit} Seats</span>
              </div>

              <div className="w-full bg-[#1e1e24] h-1.5 rounded-full mt-3 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${isFull ? 'bg-red-500' : 'bg-neon'}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Bulk Operational Floating Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-[#121612] border border-neon/50 p-3 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2 text-xs font-mono text-neon font-bold">
            <CheckCheck className="w-4 h-4" />
            <span>{selectedIds.length} Attendees Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 rounded-lg bg-[#181818] border border-gray-700 text-gray-300 text-xs font-mono hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleBulkConfirm}
              disabled={isBulkProcessing}
              className="px-3.5 py-1.5 rounded-lg bg-neon text-black font-bold font-mono text-xs flex items-center gap-1.5 hover:bg-[#00cc52] transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isBulkProcessing ? 'Verifying...' : 'Bulk Confirm & Dispatch Passes'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Cohort Tabs & Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              setSelectedCohort('all');
              setSelectedIds([]);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border cursor-pointer ${
              selectedCohort === 'all' ? 'bg-neon text-black border-neon' : 'bg-[#111114] border-[#222228] text-gray-400 hover:text-white'
            }`}
          >
            All Registrations ({registrations.length})
          </button>
          {batchTabs.map((cohortName) => (
            <button
              key={cohortName}
              type="button"
              onClick={() => {
                setSelectedCohort(cohortName);
                setSelectedIds([]);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border cursor-pointer whitespace-nowrap ${
                selectedCohort === cohortName ? 'bg-neon text-black border-neon' : 'bg-[#111114] border-[#222228] text-gray-400 hover:text-white'
              }`}
            >
              {cohortName}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={exportCSV}
          className="px-4 py-2 rounded-lg bg-neon text-black font-bold font-mono text-xs flex items-center gap-1.5 hover:bg-[#00cc52] transition-all cursor-pointer shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export {selectedCohort.toUpperCase()} Sheet</span>
        </button>
      </div>

      {/* Search Filter Bar */}
      <div className="relative w-full">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder={`Search ${selectedCohort === 'all' ? 'all attendees' : selectedCohort} by name, email, phone, or Booking ID...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#0e0e11] border border-[#222228] text-xs text-white font-mono focus:border-neon outline-none"
        />
      </div>

      {/* Attendance Registry Table */}
      <div className="bg-[#0e0e11] border border-[#1e1e24] rounded-xl overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#141418] border-b border-[#1e1e24] text-gray-400 font-mono uppercase">
            <tr>
              <th className="p-3.5 w-10 text-center">
                <button type="button" onClick={toggleSelectAll} className="text-gray-400 hover:text-neon">
                  {selectedIds.length === filtered.length && filtered.length > 0 ? (
                    <CheckSquare className="w-4 h-4 text-neon" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="p-3.5">Booking / Cohort</th>
              <th className="p-3.5">Student</th>
              <th className="p-3.5">College</th>
              <th className="p-3.5">Fee</th>
              <th className="p-3.5">Status & Verification</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#18181f] text-gray-300 font-mono">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500 font-mono">
                  No attendees matching this filter in {selectedCohort}.
                </td>
              </tr>
            ) : (
              filtered.map((reg) => {
                const isSelected = selectedIds.includes(reg.id);
                return (
                  <tr key={reg.id} className={`transition-colors ${isSelected ? 'bg-neon/5' : 'hover:bg-[#14141a]'}`}>
                    <td className="p-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => toggleSelect(reg.id)}
                        className="text-gray-500 hover:text-neon cursor-pointer"
                      >
                        {isSelected ? <CheckSquare className="w-4 h-4 text-neon" /> : <Square className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="p-3.5 font-bold text-neon font-mono space-y-1">
                      <div>{reg.id}</div>
                      <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-neon/10 border border-neon/30 text-neon uppercase">
                        {reg.cohort_label || `Batch ${reg.batch_number || 1}`}
                      </span>
                    </td>
                    <td className="p-3.5 font-sans">
                      <div className="font-semibold text-white">{reg.name}</div>
                      <div className="text-[11px] text-gray-500 font-mono">{reg.email}</div>
                    </td>
                    <td className="p-3.5 font-sans">{reg.college}</td>
                    <td className="p-3.5 font-bold text-white">₹{reg.amount}</td>
                    <td className="p-3.5">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(reg)}
                        disabled={loadingId === reg.id}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                          reg.status === 'confirmed'
                            ? 'bg-neon/10 border border-neon/40 text-neon'
                            : 'bg-amber-400/10 border border-amber-400/40 text-amber-400'
                        }`}
                      >
                        {reg.status === 'confirmed' ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Confirmed</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5" />
                            <span>Pending (Click to Verify)</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleWhatsApp(reg)}
                        className="p-2 rounded-lg bg-[#141418] border border-gray-700 hover:border-neon text-gray-300 hover:text-neon transition-all inline-flex items-center gap-1 cursor-pointer"
                        title="Direct WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-mono">Chat</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}