'use client';

import { useState } from 'react';
import { Search, Download, CheckCircle2, Clock, MessageSquare } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface AttendeeRegistryProps {
  registrations: any[];
  selectedBatch: string;
  onRefresh: () => void;
}

export default function AttendeeRegistryTab({ registrations, selectedBatch, onRefresh }: AttendeeRegistryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = registrations
    .filter((r) => !selectedBatch || r.batch === selectedBatch)
    .filter(
      (r) =>
        r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.phone?.includes(searchTerm)
    );

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
        await fetch('/api/send-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentName: reg.name,
            studentEmail: reg.email,
            bookingId: reg.id,
            workshopTitle: 'Aegis Drone Workshop',
            amount: reg.amount,
            venue: 'GCOERC Campus, Nashik',
            date: 'September Month',
          }),
        });
      }

      onRefresh();
    } catch (err: any) {
      alert('Error updating status: ' + err.message);
    } finally {
      setLoadingId(null);
    }
  };

  const handleWhatsApp = (reg: any) => {
    const cleanPhone = reg.phone.replace(/[^0-9]/g, '');
    const phoneWithCode = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    const message = encodeURIComponent(
      `Hey ${reg.name}! Your registration for Aegis Drone Workshop (${reg.cohort_label || 'Batch 1'} - Booking ID: ${reg.id}) is confirmed. See you at the flight lab!`
    );
    window.open(`https://wa.me/${phoneWithCode}?text=${message}`, '_blank');
  };

  const exportCSV = () => {
    const headers = 'Booking ID,Cohort,Student Name,Email,Phone,College,Year,Amount,Status,Date\n';
    const rows = filtered
      .map((r) => `"${r.id}","${r.cohort_label || `Batch ${r.batch_number || 1}`}","${r.name}","${r.email}","${r.phone}","${r.college}","${r.year}",${r.amount},"${r.status}","${r.registeredAt}"`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Aegis_Attendees_${selectedBatch || 'all'}.csv`;
    a.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by student name, email, phone, or Booking ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#121212] border border-[#242424] text-xs text-white font-mono focus:border-neon outline-none"
          />
        </div>
        <button
          onClick={exportCSV}
          className="px-4 py-2.5 rounded-lg bg-neon text-black font-bold font-mono text-xs flex items-center gap-1.5 hover:bg-[#00cc52] transition-all cursor-pointer shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="bg-[#121212] border border-[#242424] rounded-xl overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#181818] border-b border-[#242424] text-gray-400 font-mono uppercase">
            <tr>
              <th className="p-3.5">Booking / Cohort</th>
              <th className="p-3.5">Student</th>
              <th className="p-3.5">College</th>
              <th className="p-3.5">Fee</th>
              <th className="p-3.5">Status & Verification</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e1e1e] text-gray-300 font-mono">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500 font-mono">
                  No registrations found for {selectedBatch || 'all batches'}.
                </td>
              </tr>
            ) : (
              filtered.map((reg) => (
                <tr key={reg.id} className="hover:bg-[#181818]/60 transition-colors">
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
                      onClick={() => handleWhatsApp(reg)}
                      className="p-2 rounded-lg bg-[#181818] border border-gray-700 hover:border-neon text-gray-300 hover:text-neon transition-all inline-flex items-center gap-1 cursor-pointer"
                      title="Direct WhatsApp"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-mono">Chat</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}