'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Layers, 
  IndianRupee, 
  Download, 
  UploadCloud, 
  Search, 
  FileText, 
  LogOut, 
  Save, 
  AlertCircle 
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<string>('batch-a');
  const [activeTab, setActiveTab] = useState<'registrations' | 'manage'>('registrations');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [batchForm, setBatchForm] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const adminSession = localStorage.getItem('aegis_admin_auth');
    if (adminSession !== 'true') {
      router.replace('/auth?role=admin');
    } else {
      setIsAuthenticated(true);
      fetchBatches();
      fetchRegistrations();
    }
  }, [router]);

  const fetchBatches = async () => {
    const { data } = await supabase
      .from('workshops')
      .select('*')
      .order('batch_sequence', { ascending: true });

    if (data) {
      setBatches(data);
      const formMap: any = {};
      data.forEach((b) => {
        formMap[b.id] = {
          title: b.title,
          fee: b.fee,
          notice: b.notice || '',
          max_capacity: b.max_capacity || 20,
          whatsapp_group_name: b.whatsapp_group_name || '',
          whatsapp_group_link: b.whatsapp_group_link || '',
        };
      });
      setBatchForm(formMap);
    }
  };

  const fetchRegistrations = async () => {
    const { data } = await supabase
      .from('registrations')
      .select('*')
      .order('registered_at', { ascending: false });

    if (data) {
      setRegistrations(
        data.map((r) => ({
          id: r.id,
          name: r.full_name,
          email: r.email,
          phone: r.phone,
          college: r.college,
          batch: r.workshop_id,
          amount: Number(r.amount_paid),
          status: r.payment_status === 'paid' ? 'Paid' : 'Pending',
          registeredAt: new Date(r.registered_at).toLocaleDateString('en-IN'),
        }))
      );
    }
  };

  const saveBatchSettings = async () => {
    setIsSaving(true);
    const curr = batchForm[selectedBatch];
    const { error } = await supabase
      .from('workshops')
      .update({
        title: curr.title,
        fee: curr.fee,
        notice: curr.notice,
        max_capacity: curr.max_capacity,
        whatsapp_group_name: curr.whatsapp_group_name,
        whatsapp_group_link: curr.whatsapp_group_link,
      })
      .eq('id', selectedBatch);

    setIsSaving(false);
    if (!error) {
      alert(`Settings for ${selectedBatch.toUpperCase()} saved successfully!`);
      fetchBatches();
    } else {
      alert('Error updating database: ' + error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('aegis_admin_auth');
    router.replace('/auth?role=admin');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 border-2 border-neon border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-mono text-gray-400">Verifying security credentials...</p>
      </div>
    );
  }

  const filteredRegistrations = registrations
    .filter((r) => r.batch === selectedBatch)
    .filter(
      (r) =>
        r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const totalCollected = registrations.reduce((acc, curr) => acc + curr.amount, 0);

  const exportToCSV = () => {
    const list = registrations.filter((r) => r.batch === selectedBatch);
    const headers = 'ID,Full Name,Email,Phone,College,Amount,Status,Date\n';
    const rows = list
      .map(
        (r) =>
          `"${r.id}","${r.name}","${r.email}","${r.phone}","${r.college}",${r.amount},"${r.status}","${r.registeredAt}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Aegis_Registrations_${selectedBatch}.csv`;
    a.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[#242424] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black text-white">Workshop Command Center</h1>
            <span className="px-2 py-0.5 rounded bg-neon/10 border border-neon/30 text-neon font-bold text-[10px] uppercase font-mono">
              Authorized
            </span>
          </div>
          <p className="text-xs text-gray-400 font-mono mt-1">
            MANAGE BATCH CAPACITIES, NOTICES & POST-REGISTRATION COMMUNITY INVITES
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-[#121212] p-1 rounded-lg border border-[#242424]">
            <button
              onClick={() => setActiveTab('registrations')}
              className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${
                activeTab === 'registrations' ? 'bg-neon text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              Participant Registry
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${
                activeTab === 'manage' ? 'bg-neon text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              Manage Batches & Seats
            </button>
          </div>

          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-2 rounded-lg bg-[#181818] border border-[#2e2e2e] hover:border-red-500 text-gray-400 hover:text-red-400 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-[#121212] border border-[#242424] p-5 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-medium uppercase font-mono">Total Revenue</span>
            <IndianRupee className="w-4 h-4 text-neon" />
          </div>
          <p className="text-2xl font-black text-white">₹{totalCollected.toLocaleString('en-IN')}</p>
        </div>

        <div className="bg-[#121212] border border-[#242424] p-5 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-medium uppercase font-mono">Total Registrations</span>
            <Users className="w-4 h-4 text-neon" />
          </div>
          <p className="text-2xl font-black text-white">{registrations.length} Students</p>
        </div>

        <div className="bg-[#121212] border border-[#242424] p-5 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-medium uppercase font-mono">Configured Batches</span>
            <Layers className="w-4 h-4 text-neon" />
          </div>
          <p className="text-2xl font-black text-neon">{batches.length} Sequential Batches</p>
        </div>
      </div>

      {/* Batch Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#121212] p-4 rounded-xl border border-[#242424]">
        <div className="flex flex-wrap gap-2">
          {batches.map((b) => {
            const count = registrations.filter((r) => r.batch === b.id).length;
            const max = b.max_capacity || 20;
            const isFull = count >= max;

            return (
              <button
                key={b.id}
                onClick={() => setSelectedBatch(b.id)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border flex items-center gap-2 ${
                  selectedBatch === b.id
                    ? 'bg-[#181818] border-neon text-neon shadow-[0_0_10px_rgba(0,255,102,0.2)]'
                    : 'bg-[#0a0a0a] border-[#2e2e2e] text-gray-400 hover:text-white'
                }`}
              >
                <span>{b.id.toUpperCase()}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${isFull ? 'bg-red-900/40 text-red-300' : 'bg-[#181818] text-gray-400'}`}>
                  {count}/{max}
                </span>
              </button>
            );
          })}
        </div>

        {activeTab === 'registrations' && (
          <button
            onClick={exportToCSV}
            className="px-4 py-2 rounded-lg bg-neon text-black font-bold text-xs flex items-center gap-2 hover:bg-[#00cc52] transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export {selectedBatch.toUpperCase()} CSV</span>
          </button>
        )}
      </div>

      {/* Missing WhatsApp Link Warning Banner */}
      {batchForm[selectedBatch] && !batchForm[selectedBatch]?.whatsapp_group_link && (
        <div className="flex items-center gap-3 p-4 bg-amber-950/30 border border-amber-500/40 rounded-xl text-amber-200 text-xs font-mono">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>Note: {selectedBatch.toUpperCase()} does not have a WhatsApp invite link configured. Registered students will see the one-tap message button to admin.</span>
        </div>
      )}

      {/* TAB 1: REGISTRATIONS TABLE */}
      {activeTab === 'registrations' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by student name, email, or Booking ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#121212] border border-[#242424] focus:border-neon outline-none text-xs text-white"
            />
          </div>

          <div className="bg-[#121212] border border-[#242424] rounded-xl overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#181818] border-b border-[#242424] text-gray-400 font-mono uppercase">
                <tr>
                  <th className="p-3.5">Booking ID</th>
                  <th className="p-3.5">Student</th>
                  <th className="p-3.5">College</th>
                  <th className="p-3.5">Phone</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e1e] text-gray-300">
                {filteredRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-gray-500 font-mono">
                      No registrations found for {selectedBatch.toUpperCase()}.
                    </td>
                  </tr>
                ) : (
                  filteredRegistrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-[#181818]/50 transition-colors">
                      <td className="p-3.5 font-mono text-neon font-bold">{reg.id}</td>
                      <td className="p-3.5">
                        <div className="font-semibold text-white">{reg.name}</div>
                        <div className="text-[11px] text-gray-500">{reg.email}</div>
                      </td>
                      <td className="p-3.5">{reg.college}</td>
                      <td className="p-3.5 font-mono">{reg.phone}</td>
                      <td className="p-3.5 font-mono font-bold text-white">₹{reg.amount}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded bg-neon/10 border border-neon/30 text-neon font-bold text-[10px]">
                          {reg.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: BATCH SEAT LIMIT & WHATSAPP CONFIG */}
      {activeTab === 'manage' && batchForm[selectedBatch] && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[#121212] border border-[#242424] p-6 rounded-xl space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-neon" /> {selectedBatch.toUpperCase()} Configuration
            </h2>

            <div className="space-y-1">
              <label className="text-xs text-gray-400">Seat Capacity Limit (Max Students Before Rollover)</label>
              <input
                type="number"
                value={batchForm[selectedBatch].max_capacity}
                onChange={(e) =>
                  setBatchForm({
                    ...batchForm,
                    [selectedBatch]: { ...batchForm[selectedBatch], max_capacity: Number(e.target.value) },
                  })
                }
                className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#242424] focus:border-neon outline-none text-xs text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400">WhatsApp Group Name</label>
              <input
                type="text"
                value={batchForm[selectedBatch].whatsapp_group_name}
                onChange={(e) =>
                  setBatchForm({
                    ...batchForm,
                    [selectedBatch]: { ...batchForm[selectedBatch], whatsapp_group_name: e.target.value },
                  })
                }
                placeholder="Aegis Drone Workshop - 28 Aug 2026 - Batch A"
                className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#242424] focus:border-neon outline-none text-xs text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400">WhatsApp Group Invite Link</label>
              <input
                type="url"
                value={batchForm[selectedBatch].whatsapp_group_link}
                onChange={(e) =>
                  setBatchForm({
                    ...batchForm,
                    [selectedBatch]: { ...batchForm[selectedBatch], whatsapp_group_link: e.target.value },
                  })
                }
                placeholder="https://chat.whatsapp.com/..."
                className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#242424] focus:border-neon outline-none text-xs text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400">Live Notice / Announcements</label>
              <textarea
                rows={3}
                value={batchForm[selectedBatch].notice}
                onChange={(e) =>
                  setBatchForm({
                    ...batchForm,
                    [selectedBatch]: { ...batchForm[selectedBatch], notice: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#242424] focus:border-neon outline-none text-xs text-white"
              ></textarea>
            </div>

            <button
              onClick={saveBatchSettings}
              disabled={isSaving}
              className="w-full py-2.5 rounded-lg bg-neon text-black font-bold text-xs hover:bg-[#00cc52] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Updating Database...' : `Save ${selectedBatch.toUpperCase()} Configuration`}</span>
            </button>
          </div>

          <div className="bg-[#121212] border border-[#242424] p-6 rounded-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-neon" /> Circular & Brochure Upload
              </h2>
              <p className="text-xs text-gray-400">
                Uploaded schedules and circulars update the live track descriptions.
              </p>

              <div className="border-2 border-dashed border-[#2e2e2e] hover:border-neon rounded-xl p-8 text-center space-y-2 cursor-pointer transition-colors bg-[#0a0a0a]">
                <UploadCloud className="w-8 h-8 text-neon mx-auto" />
                <p className="text-xs text-gray-300 font-semibold">
                  Drag and drop poster image or schedule PDF
                </p>
                <p className="text-[10px] text-gray-500">Supports PNG, JPG, PDF up to 10MB</p>
              </div>
            </div>

            <button
              onClick={() => alert('New circular published!')}
              className="w-full py-2.5 rounded-lg bg-[#181818] border border-[#2e2e2e] hover:border-neon text-white font-bold text-xs transition-all cursor-pointer"
            >
              Publish Updated Circular
            </button>
          </div>
        </div>
      )}
    </div>
  );
}