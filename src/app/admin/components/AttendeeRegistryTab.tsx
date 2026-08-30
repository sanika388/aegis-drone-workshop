'use client';

import { useState, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  Search, 
  Download, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  UserX, 
  Filter,
  RefreshCw,
  Trash2,
  RotateCcw,
  AlertOctagon,
  Users,
  UserPlus,
  Share2,
  X,
  Banknote,
  MessageSquare,
  Copy,
  CreditCard,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

interface Attendee {
  id: string;
  clearance_id?: string | null;
  name: string;
  email: string;
  phone: string;
  college: string;
  year: string;
  batch_number: number;
  cohort_label: string;
  amount: number;
  status: 'pending' | 'confirmed';
  payment_mode: 'online' | 'cash';
  transaction_id?: string | null;
  attended: boolean;
  is_deleted: boolean;
  registeredAt: string;
}

interface AttendeeRegistryTabProps {
  registrations: Attendee[];
  batchSizeLimit: number;
  onRefresh: () => void;
}

export default function AttendeeRegistryTab({
  registrations,
  batchSizeLimit,
  onRefresh,
}: AttendeeRegistryTabProps) {
  const [viewScope, setViewScope] = useState<'active' | 'deleted'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState<'all' | 'present' | 'absent'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'confirmed' | 'pending'>('all');
  const [cohortFilter, setCohortFilter] = useState<string>('all');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Manual Spot Intake Modal State
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);
  const [manualForm, setManualForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    college: '',
    academicYear: 'SE - Second Year',
    customClearanceId: '', // '' represents auto-assign next monotonic seat
    sendPassEmail: true,
  });

  const activeRegistrations = useMemo(() => {
    return registrations.filter((r) => !r.is_deleted);
  }, [registrations]);

  const deletedRegistrations = useMemo(() => {
    return registrations.filter((r) => r.is_deleted);
  }, [registrations]);

  // Compute vacant/deleted slots available for backfilling
  const vacantSlots = useMemo(() => {
    const activeIds = new Set(activeRegistrations.map((r) => r.clearance_id).filter(Boolean));
    const deletedWithIds = deletedRegistrations
      .map((r) => r.clearance_id)
      .filter((cid): cid is string => Boolean(cid && !activeIds.has(cid)));

    return Array.from(new Set(deletedWithIds)).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
      return numA - numB;
    });
  }, [activeRegistrations, deletedRegistrations]);

  const targetDataset = viewScope === 'active' ? activeRegistrations : deletedRegistrations;

  const uniqueCohorts = useMemo(() => {
    const cohorts = Array.from(new Set(activeRegistrations.map((r) => r.cohort_label || `Batch ${r.batch_number || 1}`)));
    return cohorts.sort();
  }, [activeRegistrations]);

  // Real-time filtering logic
  const filteredRegistrations = useMemo(() => {
    return targetDataset.filter((attendee) => {
      const displayId = attendee.clearance_id || attendee.id || '';
      const txId = attendee.transaction_id || '';
      const matchesSearch =
        attendee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        displayId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        txId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        attendee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        attendee.phone.includes(searchQuery) ||
        attendee.college.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesAttendance =
        attendanceFilter === 'all' ||
        (attendanceFilter === 'present' && attendee.attended) ||
        (attendanceFilter === 'absent' && !attendee.attended);

      const matchesPayment =
        paymentFilter === 'all' || attendee.status === paymentFilter;

      const matchesCohort =
        cohortFilter === 'all' || attendee.cohort_label === cohortFilter;

      return matchesSearch && matchesAttendance && matchesPayment && matchesCohort;
    });
  }, [targetDataset, searchQuery, attendanceFilter, paymentFilter, cohortFilter]);

  // Copy Transaction ID Helper
  const copyTransactionId = (txId: string) => {
    navigator.clipboard.writeText(txId);
    toast.success(`Copied TxID: ${txId}`);
  };

  // Toggle Attendance
  const toggleAttendance = async (attendee: Attendee) => {
    setIsUpdating(attendee.id);
    try {
      const nextStatus = !attendee.attended;
      const { error } = await supabase
        .from('registrations')
        .update({ attended: nextStatus })
        .eq('id', attendee.id);

      if (error) throw error;
      toast.success(`${attendee.name} marked as ${nextStatus ? 'PRESENT' : 'ABSENT'}`);
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update attendance');
    } finally {
      setIsUpdating(null);
    }
  };

  // Toggle Payment & Dispatch Confirmation Email
  const togglePaymentStatus = async (attendee: Attendee) => {
    setIsUpdating(attendee.id);
    try {
      const nextStatus = attendee.status === 'confirmed' ? 'pending' : 'confirmed';
      const { error } = await supabase
        .from('registrations')
        .update({ payment_status: nextStatus })
        .eq('id', attendee.id);

      if (error) throw error;

      if (nextStatus === 'confirmed') {
        await fetch('/api/send-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: attendee.name,
            email: attendee.email,
            clearanceId: attendee.clearance_id || attendee.id,
            workshopTitle: 'Aegis Drone Avionics Master Workshop',
            amount: attendee.amount || 300,
            venue: 'GCOERC Nashik',
            batchSchedule: 'September Intake',
            paymentMethod: attendee.payment_mode,
            workshopId: 'aegis-master-workshop',
            assignedBatch: attendee.cohort_label || `Batch ${attendee.batch_number || 1}`,
            batchNumber: attendee.batch_number || 1,
          }),
        });
        toast.success(`Verified & Pass emailed to ${attendee.email}`);
      
      } else {
        toast.success(`${attendee.name} set to Pending`);
      }
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update payment');
    } finally {
      setIsUpdating(null);
    }
  };

  // Soft Delete
  const softDeleteAttendee = async (attendee: Attendee) => {
    const displayId = attendee.clearance_id || attendee.id;
    const confirmDelete = window.confirm(`Move ${attendee.name} (${displayId}) to Deleted Vault?`);
    if (!confirmDelete) return;

    setIsUpdating(attendee.id);
    try {
      const { error } = await supabase
        .from('registrations')
        .update({ is_deleted: true })
        .eq('id', attendee.id);

      if (error) throw error;
      toast.success(`Moved ${attendee.name} to Deleted Vault`);
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete attendee');
    } finally {
      setIsUpdating(null);
    }
  };

  // Restore
  const restoreAttendee = async (attendee: Attendee) => {
    setIsUpdating(attendee.id);
    try {
      const { error } = await supabase
        .from('registrations')
        .update({ is_deleted: false })
        .eq('id', attendee.id);

      if (error) throw error;
      toast.success(`Restored ${attendee.name} to Active Registry`);
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to restore attendee');
    } finally {
      setIsUpdating(null);
    }
  };

  // Permanent Purge
  const permanentPurgeAttendee = async (attendee: Attendee) => {
    const confirmPurge = window.confirm(
      `⚠️ PERMANENT PURGE: Delete ${attendee.name} permanently? This cannot be undone.`
    );
    if (!confirmPurge) return;

    setIsUpdating(attendee.id);
    try {
      const { error } = await supabase
        .from('registrations')
        .delete()
        .eq('id', attendee.id);

      if (error) throw error;
      toast.success(`Permanently deleted ${attendee.name}`);
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Purge failed');
    } finally {
      setIsUpdating(null);
    }
  };

  // CSV Export
  const exportToCSV = () => {
    if (filteredRegistrations.length === 0) {
      toast.error('No records available to export');
      return;
    }

    const headers = [
      'Clearance ID / Status',
      'Pilot Name',
      'Email',
      'Phone',
      'College',
      'Academic Year',
      'Cohort',
      'Payment Mode',
      'Transaction ID',
      'Amount (INR)',
      'Payment Status',
      'Attendance',
      'Registered Date',
    ];

    const rows = filteredRegistrations.map((r) => [
      `"${r.clearance_id || (r.is_deleted ? 'ARCHIVED' : r.id)}"`,
      `"${r.name.replace(/"/g, '""')}"`,
      `"${r.email}"`,
      `"${r.phone}"`,
      `"${r.college.replace(/"/g, '""')}"`,
      `"${r.year}"`,
      `"${r.cohort_label}"`,
      `"${r.payment_mode.toUpperCase()}"`,
      `"${r.transaction_id || (r.payment_mode === 'cash' ? 'SPOT_CASH' : 'N/A')}"`,
      r.amount,
      r.status.toUpperCase(),
      r.attended ? 'PRESENT' : 'ABSENT',
      r.registeredAt,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.setAttribute('href', url);
    link.setAttribute('download', `Aegis_Avionics_${viewScope}_Registry_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${filteredRegistrations.length} attendees to CSV`);
  };

  // WhatsApp Broadcast Bulk Number Copier
  const copyCohortPhoneNumbers = () => {
    const phones = filteredRegistrations
      .map((r) => r.phone.replace(/[^0-9+]/g, ''))
      .filter(Boolean)
      .join(', ');

    if (!phones) {
      toast.error('No phone numbers found in active view');
      return;
    }

    navigator.clipboard.writeText(phones);
    toast.success(`Copied ${filteredRegistrations.length} phone numbers for WhatsApp broadcast`);
  };

  // 1-Click Individual WhatsApp Message Dispatch
  const sendIndividualWhatsApp = (attendee: Attendee) => {
    const rawPhone = attendee.phone.replace(/[^0-9]/g, '');
    const cleanPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const displayId = attendee.clearance_id || (attendee.is_deleted ? '[ARCHIVED]' : attendee.id);

    const messageText = `⚡ *AEGIS DRONE AVIONICS MASTER WORKSHOP* ⚡\n\nHello *${attendee.name}*,\n\nHere are your official flight lab pass details:\n- *Clearance ID:* ${displayId}\n- *Assigned Cohort:* ${attendee.cohort_label}\n- *Payment Mode:* ${attendee.payment_mode === 'online' ? `UPI / Online (TxID: ${attendee.transaction_id || 'VERIFIED'})` : 'SPOT CASH'}\n- *Payment Status:* ${attendee.status === 'confirmed' ? 'PAID (₹300)' : 'PENDING AT DESK'}\n- *Venue:* GCOERC Avionics Research Lab, Nashik\n\nPlease arrive on time and present your Clearance ID at the entrance gate scanner!`;

    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;
    window.open(waUrl, '_blank');
  };

  // Manual Spot Intake Submit
  const handleManualSpotIntake = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingManual(true);

    try {
      const payload: any = {
        workshop_id: 'aegis-master-workshop',
        full_name: manualForm.fullName.trim(),
        email: manualForm.email.trim().toLowerCase(),
        phone: manualForm.phone.trim(),
        college: manualForm.college.trim(),
        academic_year: manualForm.academicYear,
        payment_mode: 'cash',
        payment_status: 'confirmed',
        amount_paid: 300,
        attended: true,
        is_deleted: false,
      };

      // If admin selected a specific vacant slot to backfill, inject it
      if (manualForm.customClearanceId && manualForm.customClearanceId.trim() !== '') {
        payload.clearance_id = manualForm.customClearanceId.trim();
      }

      const { data: newEntry, error: insertErr } = await supabase
        .from('registrations')
        .insert([payload])
        .select('id')
        .single();

      if (insertErr) throw insertErr;

      // Query re-indexed record
      const { data: savedRecord } = await supabase
        .from('registrations')
        .select('*')
        .eq('id', newEntry.id)
        .single();

      const clearanceId = savedRecord?.clearance_id || savedRecord?.id;

      if (manualForm.sendPassEmail) {
        const rawNum = clearanceId ? parseInt(String(clearanceId).replace(/\D/g, ''), 10) : 1;
        const assignedBatchNumber = Math.floor((rawNum - 1) / (batchSizeLimit || 30)) + 1;

        await fetch('/api/send-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: manualForm.fullName,
            email: manualForm.email,
            clearanceId: clearanceId,
            workshopTitle: 'Aegis Drone Avionics Master Workshop',
            amount: 300,
            venue: 'GCOERC Nashik',
            batchSchedule: 'September Intake',
            paymentMethod: 'cash',
            workshopId: 'aegis-master-workshop',
            assignedBatch: `Batch ${assignedBatchNumber}`,
            batchNumber: assignedBatchNumber,
          }),
        });
      }
      toast.success(`Manual Intake Added: ${clearanceId} (Cash Confirmed)`);
      setManualForm({
        fullName: '',
        email: '',
        phone: '',
        college: '',
        academicYear: 'SE - Second Year',
        customClearanceId: '',
        sendPassEmail: true,
      });
      setIsManualModalOpen(false);
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Spot registration failed');
    } finally {
      setIsSubmittingManual(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Scope Switcher & Header Actions */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-[#0a0c10] border border-[#1f2430] p-2.5 rounded-2xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewScope('active')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
              viewScope === 'active'
                ? 'bg-neon text-black shadow-[0_0_20px_rgba(0,255,102,0.25)]'
                : 'text-gray-400 hover:text-white hover:bg-[#141824]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Active Registry ({activeRegistrations.length})</span>
          </button>

          <button
            onClick={() => setViewScope('deleted')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
              viewScope === 'deleted'
                ? 'bg-red-500/20 border border-red-500/50 text-red-400'
                : 'text-gray-400 hover:text-red-400 hover:bg-[#141824]'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>Deleted Vault ({deletedRegistrations.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsManualModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-neon text-black font-mono text-xs font-bold hover:bg-[#00cc52] transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(0,255,102,0.2)]"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Manual Spot Intake</span>
          </button>

          <button
            onClick={copyCohortPhoneNumbers}
            className="px-3.5 py-2 rounded-xl bg-[#0a1f14] border border-green-500/40 hover:bg-green-500 hover:text-black text-green-400 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,255,102,0.1)]"
            title="Copy cohort phone numbers for WhatsApp group broadcast"
          >
            <Share2 className="w-4 h-4 text-green-400" />
            <span>Copy WhatsApp ({filteredRegistrations.length})</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Header */}
      <div className="bg-[#121212] border border-[#242424] p-5 rounded-2xl space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 justify-between lg:items-center">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={`Search in ${viewScope} registry (ID, TxID, Name, Email, Phone)...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#08090d] border border-[#242b3d] focus:border-neon outline-none text-white text-xs font-mono placeholder:text-gray-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={exportToCSV}
              className="px-4 py-2.5 rounded-xl bg-[#161a26] border border-[#2a344d] hover:border-neon text-white hover:text-neon text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-neon" />
              <span>Export CSV ({filteredRegistrations.length})</span>
            </button>

            <button
              onClick={onRefresh}
              className="p-2.5 rounded-xl bg-[#161a26] border border-[#2a344d] hover:border-gray-500 text-gray-400 hover:text-white transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#1f2430]">
          <div className="flex items-center gap-2 bg-[#08090d] border border-[#1f2430] p-2 rounded-xl">
            <span className="text-[11px] font-mono text-gray-400 pl-1 flex items-center gap-1 shrink-0">
              <Filter className="w-3 h-3 text-neon" /> Attendance:
            </span>
            <select
              value={attendanceFilter}
              onChange={(e) => setAttendanceFilter(e.target.value as any)}
              className="w-full bg-transparent text-xs font-mono font-bold text-neon outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#0e1017] text-white">All Attendees</option>
              <option value="present" className="bg-[#0e1017] text-green-400">● Present Only</option>
              <option value="absent" className="bg-[#0e1017] text-gray-400">○ Absent Only</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-[#08090d] border border-[#1f2430] p-2 rounded-xl">
            <span className="text-[11px] font-mono text-gray-400 pl-1 flex items-center gap-1 shrink-0">
              <Filter className="w-3 h-3 text-neon" /> Payment:
            </span>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as any)}
              className="w-full bg-transparent text-xs font-mono font-bold text-neon outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#0e1017] text-white">All Payments</option>
              <option value="confirmed" className="bg-[#0e1017] text-green-400">● Paid / Confirmed</option>
              <option value="pending" className="bg-[#0e1017] text-amber-400">○ Pending Cash</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-[#08090d] border border-[#1f2430] p-2 rounded-xl">
            <span className="text-[11px] font-mono text-gray-400 pl-1 flex items-center gap-1 shrink-0">
              <Filter className="w-3 h-3 text-neon" /> Cohort:
            </span>
            <select
              value={cohortFilter}
              onChange={(e) => setCohortFilter(e.target.value)}
              className="w-full bg-transparent text-xs font-mono font-bold text-neon outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#0e1017] text-white">All Cohorts</option>
              {uniqueCohorts.map((cohort) => (
                <option key={cohort} value={cohort} className="bg-[#0e1017] text-white">
                  {cohort}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Registry Table */}
      <div className="bg-[#121212] border border-[#242424] rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#08090d] text-gray-400 border-b border-[#242424] text-[11px] uppercase tracking-wider">
              <tr>
                <th className="p-4">Clearance ID</th>
                <th className="p-4">Pilot & Contact</th>
                <th className="p-4">College & Year</th>
                <th className="p-4">Cohort</th>
                <th className="p-4">Transaction / Mode</th>
                <th className="p-4 text-center">Payment</th>
                <th className="p-4 text-center">Attendance</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2330]">
              {filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-gray-500 font-mono">
                    {viewScope === 'active' ? 'No active attendee records matching filters.' : 'Deleted vault is empty.'}
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((attendee) => {
                  return (
                    <tr key={attendee.id} className="hover:bg-[#161a24]/50 transition-colors">
                      
                      {/* Column 1: Clearance ID / [ARCHIVED] */}
                      <td className="p-4 whitespace-nowrap">
                        {viewScope === 'deleted' ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/10 border border-red-500/40 text-red-400 font-bold text-xs">
                            <span>[ARCHIVED]</span>
                          </div>
                        ) : (
                          <span className="font-bold text-neon text-sm">
                            {attendee.clearance_id || attendee.id}
                          </span>
                        )}
                        <span className="block text-[10px] text-gray-500 font-normal mt-0.5">
                          {attendee.registeredAt}
                        </span>
                      </td>

                      {/* Column 2: Pilot & Contact */}
                      <td className="p-4 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-white text-sm font-sans">{attendee.name}</p>
                          <button
                            onClick={() => sendIndividualWhatsApp(attendee)}
                            className="px-2 py-0.5 rounded-md bg-[#0a2416] border border-green-500/40 text-green-400 hover:bg-green-500 hover:text-black transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                            title={`Send official flight pass info to ${attendee.name} on WhatsApp`}
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>WA</span>
                          </button>
                        </div>
                        <p className="text-[11px] text-gray-400">{attendee.email}</p>
                        <p className="text-[11px] text-gray-500">{attendee.phone}</p>
                      </td>

                      {/* Column 3: College & Year */}
                      <td className="p-4 text-gray-300 font-sans">
                        <p className="font-semibold text-xs text-white">{attendee.college}</p>
                        <p className="text-[11px] text-gray-400 font-mono mt-0.5">{attendee.year}</p>
                      </td>

                      {/* Column 4: Cohort */}
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-md bg-[#181d2a] border border-[#2c364e] text-neon text-[11px] font-bold inline-block">
                          {attendee.cohort_label}
                        </span>
                      </td>

                      {/* Column 5: Dedicated Transaction / Payment Mode Column */}
                      <td className="p-4 whitespace-nowrap">
                        {attendee.payment_mode === 'online' || attendee.transaction_id ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-blue-400 text-[11px] font-bold">
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>UPI / Online</span>
                            </div>
                            {attendee.transaction_id ? (
                              <div className="flex items-center gap-1 bg-[#09111e] border border-blue-500/30 px-2 py-0.5 rounded text-[10px] text-blue-300 w-fit">
                                <span className="font-mono">{attendee.transaction_id.slice(0, 14)}...</span>
                                <button
                                  onClick={() => copyTransactionId(attendee.transaction_id!)}
                                  className="hover:text-white transition-colors cursor-pointer"
                                  title="Copy Transaction ID"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-gray-500">Gateway Verified</span>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-amber-400 text-[11px] font-bold">
                              <Banknote className="w-3.5 h-3.5" />
                              <span>Spot Cash</span>
                            </div>
                            <span className="inline-block text-[10px] text-gray-400 bg-[#161a22] border border-[#262f42] px-2 py-0.5 rounded">
                              {attendee.status === 'confirmed' ? 'Desk Verified' : 'Pay at Desk'}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Column 6: Payment Status Toggle */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => togglePaymentStatus(attendee)}
                          disabled={isUpdating === attendee.id || viewScope === 'deleted'}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                            attendee.status === 'confirmed'
                              ? 'bg-neon/10 border-neon text-neon hover:bg-neon/20'
                              : 'bg-amber-500/10 border-amber-500/40 text-amber-400 hover:bg-amber-500/20'
                          } disabled:opacity-50`}
                        >
                          {attendee.status === 'confirmed' ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-neon" />
                              <span>Paid (₹{attendee.amount || 300})</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5 text-amber-400" />
                              <span>Pending Cash</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Column 7: Attendance Status Toggle */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => toggleAttendance(attendee)}
                          disabled={isUpdating === attendee.id || viewScope === 'deleted'}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                            attendee.attended
                              ? 'bg-green-500/20 border-green-500 text-green-300 hover:bg-green-500/30'
                              : 'bg-[#181a20] border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white'
                          } disabled:opacity-50`}
                        >
                          {attendee.attended ? (
                            <>
                              <UserCheck className="w-3.5 h-3.5 text-green-400" />
                              <span>PRESENT</span>
                            </>
                          ) : (
                            <>
                              <UserX className="w-3.5 h-3.5 text-gray-500" />
                              <span>ABSENT</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Column 8: Actions */}
                      <td className="p-4 text-right">
                        {viewScope === 'active' ? (
                          <button
                            onClick={() => softDeleteAttendee(attendee)}
                            disabled={isUpdating === attendee.id}
                            className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                            title="Move to Deleted Vault"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => restoreAttendee(attendee)}
                              disabled={isUpdating === attendee.id}
                              className="p-2 rounded-lg bg-neon/10 border border-neon/40 text-neon hover:bg-neon hover:text-black transition-all cursor-pointer"
                              title="Restore Attendee"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => permanentPurgeAttendee(attendee)}
                              disabled={isUpdating === attendee.id}
                              className="p-2 rounded-lg bg-red-950 border border-red-600 text-red-300 hover:bg-red-600 hover:text-white transition-all cursor-pointer"
                              title="Permanent Purge"
                            >
                              <AlertOctagon className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Spot Intake Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0e1017] border border-[#242b3d] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 border-b border-[#1f2637] flex items-center justify-between bg-[#08090d]">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-neon" />
                <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                  Direct Spot Intake &bull; Cash
                </span>
              </div>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="p-1.5 rounded-lg bg-[#141824] text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleManualSpotIntake} className="p-6 space-y-3.5 text-xs font-mono">
              <div className="bg-[#12151e] border border-[#1e2536] p-3 rounded-xl flex items-center justify-between text-gray-300">
                <div className="flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-neon" />
                  <span>Cash Payment Mode:</span>
                </div>
                <span className="text-neon font-black text-sm">₹300 Received</span>
              </div>

              {/* Seat Assignment / Vacant Slot Backfill Dropdown */}
              <div className="space-y-1">
                <label className="text-gray-400 flex items-center justify-between">
                  <span>Seat Allocation Policy</span>
                  {vacantSlots.length > 0 && (
                    <span className="text-[10px] text-amber-400 font-bold">
                      {vacantSlots.length} Vacant Slot{vacantSlots.length > 1 ? 's' : ''} Available
                    </span>
                  )}
                </label>
                <div className="relative">
                  <select
                    value={manualForm.customClearanceId || 'auto'}
                    onChange={(e) =>
                      setManualForm({
                        ...manualForm,
                        customClearanceId: e.target.value === 'auto' ? '' : e.target.value,
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-lg bg-[#08090d] border border-[#242b3d] focus:border-neon outline-none text-neon text-xs font-mono cursor-pointer"
                  >
                    <option value="auto">⚡ Auto-Assign Next Sequential Seat</option>
                    {vacantSlots.map((slot) => (
                      <option key={slot} value={slot} className="bg-[#0e1017] text-amber-300 font-bold">
                        ♻️ Backfill Vacant Slot: {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-400">Pilot Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sanika Dusane"
                  value={manualForm.fullName}
                  onChange={(e) => setManualForm({ ...manualForm, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#08090d] border border-[#242b3d] focus:border-neon outline-none text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400">Email Address (Pass Dispatch) *</label>
                <input
                  type="email"
                  required
                  placeholder="student@example.com"
                  value={manualForm.email}
                  onChange={(e) => setManualForm({ ...manualForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#08090d] border border-[#242b3d] focus:border-neon outline-none text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400">WhatsApp Phone *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 7620350524"
                  value={manualForm.phone}
                  onChange={(e) => setManualForm({ ...manualForm, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#08090d] border border-[#242b3d] focus:border-neon outline-none text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400">College / Institute *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GCOERC Nashik"
                  value={manualForm.college}
                  onChange={(e) => setManualForm({ ...manualForm, college: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#08090d] border border-[#242b3d] focus:border-neon outline-none text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400">Academic Year *</label>
                <select
                  value={manualForm.academicYear}
                  onChange={(e) => setManualForm({ ...manualForm, academicYear: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#08090d] border border-[#242b3d] focus:border-neon outline-none text-white text-xs"
                >
                  <option value="FE - First Year">FE - First Year</option>
                  <option value="SE - Second Year">SE - Second Year</option>
                  <option value="TE - Third Year">TE - Third Year</option>
                  <option value="BE - Final Year">BE - Final Year</option>
                  <option value="School / Diploma / Other">School / Diploma / Other</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="sendPassCheck"
                  checked={manualForm.sendPassEmail}
                  onChange={(e) => setManualForm({ ...manualForm, sendPassEmail: e.target.checked })}
                  className="accent-neon w-4 h-4 cursor-pointer"
                />
                <label htmlFor="sendPassCheck" className="text-gray-300 text-[11px] cursor-pointer">
                  Email official pass & QR code immediately
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmittingManual}
                className="w-full py-3 rounded-lg bg-neon text-black font-bold text-xs uppercase hover:bg-[#00cc52] transition-all tracking-wider disabled:opacity-50 mt-2 flex items-center justify-center gap-2 cursor-pointer font-mono"
              >
                {isSubmittingManual ? (
                  <span>Generating Sequential Pass...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Spot Payment & Check In</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}