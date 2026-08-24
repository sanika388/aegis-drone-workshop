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
  Mail
} from 'lucide-react';
import { toast } from 'sonner';

interface Attendee {
  id: string;
  name: string;
  email: string;
  phone: string;
  college: string;
  year: string;
  batch_number: number;
  cohort_label: string;
  amount: number;
  status: 'pending' | 'confirmed';
  attended: boolean;
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
  const [searchQuery, setSearchQuery] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState<'all' | 'present' | 'absent'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'confirmed' | 'pending'>('all');
  const [cohortFilter, setCohortFilter] = useState<string>('all');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Extract unique cohort labels for the cohort filter dropdown
  const uniqueCohorts = useMemo(() => {
    const cohorts = Array.from(new Set(registrations.map((r) => r.cohort_label || `Batch ${r.batch_number || 1}`)));
    return cohorts.sort();
  }, [registrations]);

  // Combined real-time filtering logic
  const filteredRegistrations = useMemo(() => {
    return registrations.filter((attendee) => {
      // 1. Search Query Filter
      const matchesSearch =
        attendee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        attendee.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        attendee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        attendee.phone.includes(searchQuery) ||
        attendee.college.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Attendance Filter
      const matchesAttendance =
        attendanceFilter === 'all' ||
        (attendanceFilter === 'present' && attendee.attended) ||
        (attendanceFilter === 'absent' && !attendee.attended);

      // 3. Payment Status Filter
      const matchesPayment =
        paymentFilter === 'all' || attendee.status === paymentFilter;

      // 4. Cohort Filter
      const matchesCohort =
        cohortFilter === 'all' || attendee.cohort_label === cohortFilter;

      return matchesSearch && matchesAttendance && matchesPayment && matchesCohort;
    });
  }, [registrations, searchQuery, attendanceFilter, paymentFilter, cohortFilter]);

  // Quick Attendance Toggle (Present / Absent)
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

  // Payment Status Toggle (Pending / Confirmed)
  const togglePaymentStatus = async (attendee: Attendee) => {
    setIsUpdating(attendee.id);
    try {
      const nextStatus = attendee.status === 'confirmed' ? 'pending' : 'confirmed';
      const { error } = await supabase
        .from('registrations')
        .update({ payment_status: nextStatus })
        .eq('id', attendee.id);

      if (error) throw error;

      // If switching to confirmed, trigger the pass email
      if (nextStatus === 'confirmed') {
        await fetch('/api/send-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentName: attendee.name,
            studentEmail: attendee.email,
            bookingId: attendee.id,
            workshopTitle: 'Aegis Drone Avionics Master Workshop',
            amount: attendee.amount || 300,
            venue: 'GCOERC Avionics Research Lab, Nashik',
            date: 'September Month Intake',
            cohortLabel: attendee.cohort_label,
          }),
        });
        toast.success(`Payment verified & boarding pass dispatched to ${attendee.email}`);
      } else {
        toast.success(`${attendee.name} set to Pending payment`);
      }

      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update payment');
    } finally {
      setIsUpdating(null);
    }
  };

  // 1-Click CSV Attendance & Faculty Records Export
  const exportToCSV = () => {
    if (filteredRegistrations.length === 0) {
      toast.error('No records available to export');
      return;
    }

    const headers = [
      'Booking ID',
      'Pilot Name',
      'Email',
      'Phone',
      'College',
      'Academic Year',
      'Assigned Cohort',
      'Amount Paid (INR)',
      'Payment Status',
      'Attendance (Event Day)',
      'Registration Date',
    ];

    const rows = filteredRegistrations.map((r) => [
      `"${r.id}"`,
      `"${r.name.replace(/"/g, '""')}"`,
      `"${r.email}"`,
      `"${r.phone}"`,
      `"${r.college.replace(/"/g, '""')}"`,
      `"${r.year}"`,
      `"${r.cohort_label}"`,
      r.amount,
      r.status.toUpperCase(),
      r.attended ? 'PRESENT' : 'ABSENT',
      r.registeredAt,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const timestamp = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `Aegis_Avionics_Attendance_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${filteredRegistrations.length} attendee records to CSV`);
  };

  const totalFilteredPresent = filteredRegistrations.filter((r) => r.attended).length;
  const totalFilteredConfirmed = filteredRegistrations.filter((r) => r.status === 'confirmed').length;

  return (
    <div className="space-y-6">
      {/* Search and Quick Filters Header */}
      <div className="bg-[#121212] border border-[#242424] p-5 rounded-2xl space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 justify-between lg:items-center">
          
          {/* Realtime Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID (e.g. 001), Pilot Name, Email, Phone or College..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#08090d] border border-[#242b3d] focus:border-neon outline-none text-white text-xs font-mono placeholder:text-gray-500"
            />
          </div>

          {/* Export & Refresh Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={exportToCSV}
              className="px-4 py-2.5 rounded-xl bg-[#161a26] border border-[#2a344d] hover:border-neon text-white hover:text-neon text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,0,0,0.5)]"
              title="Download filtered attendees as Excel / CSV"
            >
              <Download className="w-4 h-4 text-neon" />
              <span>Export CSV ({filteredRegistrations.length})</span>
            </button>

            <button
              onClick={onRefresh}
              className="p-2.5 rounded-xl bg-[#161a26] border border-[#2a344d] hover:border-gray-500 text-gray-400 hover:text-white transition-all cursor-pointer"
              title="Refresh Registry"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Multi-Filter Dropdown Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#1f2430]">
          
          {/* Attendance Filter */}
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
              <option value="present" className="bg-[#0e1017] text-green-400">● Present Only ({registrations.filter(r => r.attended).length})</option>
              <option value="absent" className="bg-[#0e1017] text-gray-400">○ Absent Only ({registrations.filter(r => !r.attended).length})</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div className="flex items-center gap-2 bg-[#08090d] border border-[#1f2430] p-2 rounded-xl">
            <span className="text-[11px] font-mono text-gray-400 pl-1 flex items-center gap-1 shrink-0">
              <Filter className="w-3 h-3 text-neon" /> Payment:
            </span>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as any)}
              className="w-full bg-transparent text-xs font-mono font-bold text-neon outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#0e1017] text-white">All Payment Types</option>
              <option value="confirmed" className="bg-[#0e1017] text-green-400">● Paid / Confirmed</option>
              <option value="pending" className="bg-[#0e1017] text-amber-400">○ Pending Cash</option>
            </select>
          </div>

          {/* Cohort / Batch Filter */}
          <div className="flex items-center gap-2 bg-[#08090d] border border-[#1f2430] p-2 rounded-xl">
            <span className="text-[11px] font-mono text-gray-400 pl-1 flex items-center gap-1 shrink-0">
              <Filter className="w-3 h-3 text-neon" /> Cohort:
            </span>
            <select
              value={cohortFilter}
              onChange={(e) => setCohortFilter(e.target.value)}
              className="w-full bg-transparent text-xs font-mono font-bold text-neon outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#0e1017] text-white">All Cohorts ({registrations.length})</option>
              {uniqueCohorts.map((cohort) => (
                <option key={cohort} value={cohort} className="bg-[#0e1017] text-white">
                  {cohort} ({registrations.filter(r => r.cohort_label === cohort).length} seats)
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Live Filter Telemetry Bar */}
        <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 pt-1">
          <span>
            Displaying <strong className="text-white">{filteredRegistrations.length}</strong> of {registrations.length} registered pilots
          </span>
          <div className="flex items-center gap-4">
            <span className="text-green-400">Present: <strong>{totalFilteredPresent}</strong></span>
            <span className="text-neon">Paid: <strong>{totalFilteredConfirmed}</strong></span>
          </div>
        </div>
      </div>

      {/* Main Registry Table */}
      <div className="bg-[#121212] border border-[#242424] rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#08090d] text-gray-400 border-b border-[#242424] text-[11px] uppercase tracking-wider">
              <tr>
                <th className="p-4">Clearance ID</th>
                <th className="p-4">Pilot & Contact</th>
                <th className="p-4">College & Year</th>
                <th className="p-4">Cohort</th>
                <th className="p-4 text-center">Payment</th>
                <th className="p-4 text-center">Lab Attendance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2330]">
              {filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-500 font-mono">
                    No attendee records matching active filters.
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((attendee) => (
                  <tr key={attendee.id} className="hover:bg-[#161a24]/50 transition-colors">
                    
                    {/* Booking ID */}
                    <td className="p-4 font-bold text-neon whitespace-nowrap">
                      {attendee.id}
                      <span className="block text-[10px] text-gray-500 font-normal mt-0.5">
                        {attendee.registeredAt}
                      </span>
                    </td>

                    {/* Pilot Info */}
                    <td className="p-4 space-y-0.5">
                      <p className="font-bold text-white text-sm font-sans">{attendee.name}</p>
                      <p className="text-[11px] text-gray-400">{attendee.email}</p>
                      <p className="text-[11px] text-gray-500">{attendee.phone}</p>
                    </td>

                    {/* College & Academic Year */}
                    <td className="p-4 text-gray-300 font-sans">
                      <p className="font-semibold text-xs text-white">{attendee.college}</p>
                      <p className="text-[11px] text-gray-400 font-mono mt-0.5">{attendee.year}</p>
                    </td>

                    {/* Cohort Badge */}
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-md bg-[#181d2a] border border-[#2c364e] text-neon text-[11px] font-bold inline-block">
                        {attendee.cohort_label || `Batch ${attendee.batch_number || 1}`}
                      </span>
                    </td>

                    {/* Payment Toggle */}
                    <td className="p-4 text-center">
                      <button
                        onClick={() => togglePaymentStatus(attendee)}
                        disabled={isUpdating === attendee.id}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                          attendee.status === 'confirmed'
                            ? 'bg-neon/10 border-neon text-neon hover:bg-neon/20 shadow-[0_0_10px_rgba(0,255,102,0.15)]'
                            : 'bg-amber-500/10 border-amber-500/40 text-amber-400 hover:bg-amber-500/20'
                        }`}
                        title="Click to toggle Payment Confirmed / Pending Cash"
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

                    {/* Attendance Toggle */}
                    <td className="p-4 text-center">
                      <button
                        onClick={() => toggleAttendance(attendee)}
                        disabled={isUpdating === attendee.id}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                          attendee.attended
                            ? 'bg-green-500/20 border-green-500 text-green-300 hover:bg-green-500/30'
                            : 'bg-[#181a20] border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white'
                        }`}
                        title="Click to toggle Present / Absent"
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

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}