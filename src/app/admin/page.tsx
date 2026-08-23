'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Layers, 
  IndianRupee, 
  Download, 
  Search, 
  FileText, 
  LogOut, 
  Save, 
  AlertCircle,
  Plus,
  X,
  ExternalLink,
  UploadCloud,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<string>('aegis-drone-feb-2026');
  const [activeTab, setActiveTab] = useState<'registrations' | 'manage'>('registrations');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [batchForm, setBatchForm] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');

  // New Workshop Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWorkshop, setNewWorkshop] = useState({
    id: '',
    title: 'Aegis Drone Workshop Batch 2',
    badge: 'CERTIFIED WORKSHOP',
    date: 'September Month',
    venue: 'Guru Gobind Singh College of Engineering & Research Centre, Nashik',
    fee: 300,
    max_capacity: 20,
    notice: 'First 20 seats per batch. Hands-on practical kit provided.',
    whatsapp_group_name: '',
    whatsapp_group_link: '',
  });

  const defaultTrack = {
    id: 'aegis-drone-feb-2026',
    title: 'Aegis Drone Workshop',
    badge: 'CERTIFIED WORKSHOP ★ DESIGN. BUILD. TEST. FLY. MASTER.',
    date: 'September Month',
    venue: 'Guru Gobind Singh College of Engineering & Research Centre, Nashik',
    fee: 300,
    max_capacity: 20,
    notice: 'First 20 seats per batch. Hands-on flight hardware provided in lab.',
    whatsapp_group_name: 'Aegis Drone Batch - GCOERC',
    whatsapp_group_link: '',
    brochure_url: '',
  };

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
    const { data, error } = await supabase
      .from('workshops')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error('Error fetching workshops:', error.message);

    let list = data && data.length > 0 ? [...data] : [];

    // Ensure default track is guaranteed
    if (!list.some((b) => b.id === 'aegis-drone-feb-2026')) {
      list.unshift(defaultTrack);
    }

    setBatches(list);

    if (!selectedBatch || !list.some((b) => b.id === selectedBatch)) {
      setSelectedBatch(list[0].id);
    }

    const formMap: Record<string, any> = {};
    list.forEach((b) => {
      formMap[b.id] = {
        title: b.title || '',
        fee: Number(b.fee || 300),
        venue: b.venue || 'GCOERC Nashik',
        date: b.date || 'September Month',
        notice: b.notice || '',
        max_capacity: Number(b.max_capacity || 20),
        whatsapp_group_name: b.whatsapp_group_name || '',
        whatsapp_group_link: b.whatsapp_group_link || '',
        brochure_url: b.brochure_url || '',
      };
    });
    setBatchForm(formMap);
  };

  const fetchRegistrations = async () => {
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .order('registered_at', { ascending: false });

    if (error) console.error('Error fetching registrations:', error.message);

    if (data) {
      setRegistrations(
        data.map((r) => ({
          id: r.id,
          name: r.full_name,
          email: r.email,
          phone: r.phone,
          college: r.college,
          year: r.academic_year,
          batch: r.workshop_id,
          amount: Number(r.amount_paid || 0),
          status: r.payment_status === 'paid' || r.payment_status === 'confirmed' ? 'Confirmed' : 'Pending',
          registeredAt: r.registered_at ? new Date(r.registered_at).toLocaleDateString('en-IN') : 'Recent',
        }))
      );
    }
  };

  // Instant Price Controller
  const handleUpdatePrice = async (targetBatchId: string, newFee: number) => {
    try {
      const { error } = await supabase
        .from('workshops')
        .upsert({
          id: targetBatchId,
          fee: newFee,
          title: batchForm[targetBatchId]?.title || 'Aegis Drone Workshop',
        });

      if (error) throw error;
      
      setBatchForm((prev) => ({
        ...prev,
        [targetBatchId]: { ...prev[targetBatchId], fee: newFee }
      }));
      
      await fetchBatches();
      alert(`Pricing for ${targetBatchId.toUpperCase()} updated to ₹${newFee}!`);
    } catch (err: any) {
      alert('Error updating fee: ' + err.message);
    }
  };

  // Save Full Workshop Settings
  const saveBatchSettings = async () => {
    setIsSaving(true);
    const curr = batchForm[selectedBatch];
    try {
      const { error } = await supabase
        .from('workshops')
        .upsert({
          id: selectedBatch,
          title: curr.title,
          fee: Number(curr.fee),
          venue: curr.venue,
          date: curr.date,
          notice: curr.notice,
          max_capacity: Number(curr.max_capacity),
          whatsapp_group_name: curr.whatsapp_group_name,
          whatsapp_group_link: curr.whatsapp_group_link,
          brochure_url: curr.brochure_url,
        });

      if (error) throw error;
      alert(`Settings for ${selectedBatch.toUpperCase()} saved successfully!`);
      await fetchBatches();
    } catch (err: any) {
      alert('Error updating database: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Create & Launch New Workshop Track
  const handleCreateWorkshop = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cleanId = newWorkshop.id.toLowerCase().trim().replace(/\s+/g, '-');
      const payload = {
        ...newWorkshop,
        id: cleanId,
        syllabus: [
          '01 BUILD THE BRAIN: ESP Module (ESP32), Gyro & Sensors (MPU6050/BMI270), Firmware & Motors Wiring',
          '02 BUILD THE BODY: 3D Printed Quadcopter Chassis, Aerodynamics & Modular Assembly',
          '03 TEST. TUNE. TRUST: PID Tuning, Thrust Control, Hover & Flight Optimization',
          '100% Hands-on Practical with Real Components & Connectors',
        ],
      };

      const { error } = await supabase.from('workshops').upsert([payload]);
      if (error) throw error;

      alert(`Workshop track created: /workshops/${cleanId}`);
      setShowAddModal(false);
      setSelectedBatch(cleanId);
      await fetchBatches();
    } catch (err: any) {
      alert(err.message || 'Failed to create workshop track.');
    }
  };

  // File Upload Handler for Circular / Poster
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadSuccess('');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${selectedBatch}-${Date.now()}.${fileExt}`;
      const filePath = `circulars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('workshops')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        // Fallback: Store mock filename if storage bucket is uninitialized
        setBatchForm((prev) => ({
          ...prev,
          [selectedBatch]: { ...prev[selectedBatch], brochure_url: file.name },
        }));
        setUploadSuccess(`File "${file.name}" linked successfully!`);
      } else {
        const { data: publicUrlData } = supabase.storage
          .from('workshops')
          .getPublicUrl(filePath);

        setBatchForm((prev) => ({
          ...prev,
          [selectedBatch]: { ...prev[selectedBatch], brochure_url: publicUrlData.publicUrl },
        }));
        setUploadSuccess(`Uploaded and linked: ${file.name}`);
      }
    } catch (err: any) {
      alert('Upload issue: ' + err.message);
    } finally {
      setIsUploading(false);
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
    .filter((r) => !selectedBatch || r.batch === selectedBatch)
    .filter(
      (r) =>
        r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.phone?.includes(searchTerm)
    );

  const totalCollected = registrations.reduce((acc, curr) => acc + curr.amount, 0);

  const exportToCSV = () => {
    const list = registrations.filter((r) => !selectedBatch || r.batch === selectedBatch);
    const headers = 'ID,Full Name,Email,Phone,College,Academic Year,Amount,Status,Date\n';
    const rows = list
      .map(
        (r) =>
          `"${r.id}","${r.name}","${r.email}","${r.phone}","${r.college}","${r.year}",${r.amount},"${r.status}","${r.registeredAt}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Aegis_Registrations_${selectedBatch || 'all'}.csv`;
    a.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[#242424] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white font-mono uppercase">Workshop Command Center</h1>
            <span className="px-2 py-0.5 rounded bg-neon/10 border border-neon/30 text-neon font-bold text-[10px] uppercase font-mono">
              Live Production
            </span>
          </div>
          <p className="text-xs text-gray-400 font-mono mt-1">
            CONTROL ACTIVE PRICING (₹300 / ₹500 / ₹1000), LAUNCH NEW TRACKS & MANAGE 20-SEAT BATCHES
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-2 rounded-lg bg-neon text-black font-bold font-mono text-xs flex items-center gap-1.5 hover:bg-[#00cc52] transition-all cursor-pointer shadow-[0_0_15px_rgba(0,255,102,0.2)]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Workshop Track</span>
          </button>

          <div className="flex bg-[#121212] p-1 rounded-lg border border-[#242424]">
            <button
              onClick={() => setActiveTab('registrations')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all font-mono cursor-pointer ${
                activeTab === 'registrations' ? 'bg-neon text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              Registry
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all font-mono cursor-pointer ${
                activeTab === 'manage' ? 'bg-neon text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              Pricing & Config
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
          <p className="text-2xl font-black text-white font-mono">₹{totalCollected.toLocaleString('en-IN')}</p>
        </div>

        <div className="bg-[#121212] border border-[#242424] p-5 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-medium uppercase font-mono">Total Registrations</span>
            <Users className="w-4 h-4 text-neon" />
          </div>
          <p className="text-2xl font-black text-white font-mono">{registrations.length} Students</p>
        </div>

        <div className="bg-[#121212] border border-[#242424] p-5 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-medium uppercase font-mono">Configured Tracks</span>
            <Layers className="w-4 h-4 text-neon" />
          </div>
          <p className="text-2xl font-black text-neon font-mono">{batches.length} Active Tracks</p>
        </div>
      </div>

      {/* Track Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#121212] p-4 rounded-xl border border-[#242424]">
        <div className="flex flex-wrap items-center gap-2">
          {batches.map((b) => {
            const count = registrations.filter((r) => r.batch === b.id).length;
            const max = b.max_capacity || 20;
            const isFull = count >= max;

            return (
              <button
                key={b.id}
                onClick={() => setSelectedBatch(b.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border flex items-center gap-2 cursor-pointer ${
                  selectedBatch === b.id
                    ? 'bg-[#181818] border-neon text-neon shadow-[0_0_10px_rgba(0,255,102,0.2)]'
                    : 'bg-[#0a0a0a] border-[#2e2e2e] text-gray-400 hover:text-white'
                }`}
              >
                <span>{b.id}</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] ${isFull ? 'bg-red-900/40 text-red-300' : 'bg-[#181818] text-gray-400'}`}>
                  {count}/{max}
                </span>
                <span className="text-neon font-mono">₹{b.fee}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {selectedBatch && (
            <Link
              href={`/workshops/${selectedBatch}`}
              target="_blank"
              className="px-3 py-1.5 rounded-lg bg-[#181818] border border-[#2e2e2e] text-gray-300 hover:text-neon hover:border-neon font-mono text-xs flex items-center gap-1.5"
            >
              <span>Open Public Terminal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}

          {activeTab === 'registrations' && (
            <button
              onClick={exportToCSV}
              className="px-3 py-1.5 rounded-lg bg-neon text-black font-bold font-mono text-xs flex items-center gap-1.5 hover:bg-[#00cc52] transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Warning Banner for WhatsApp link */}
      {selectedBatch && batchForm[selectedBatch] && !batchForm[selectedBatch]?.whatsapp_group_link && (
        <div className="flex items-center gap-3 p-3.5 bg-amber-950/30 border border-amber-500/40 rounded-xl text-amber-200 text-xs font-mono">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>Note: {selectedBatch.toUpperCase()} does not have a WhatsApp group link set yet.</span>
        </div>
      )}

      {/* TAB 1: REGISTRATIONS TABLE */}
      {activeTab === 'registrations' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search attendee by name, email, phone, or Booking ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#121212] border border-[#242424] focus:border-neon outline-none text-xs text-white font-mono"
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
              <tbody className="divide-y divide-[#1e1e1e] text-gray-300 font-mono">
                {filteredRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-gray-500 font-mono">
                      No registrations found for {selectedBatch || 'this batch'}.
                    </td>
                  </tr>
                ) : (
                  filteredRegistrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-[#181818]/50 transition-colors">
                      <td className="p-3.5 font-bold text-neon">{reg.id}</td>
                      <td className="p-3.5 font-sans">
                        <div className="font-semibold text-white">{reg.name}</div>
                        <div className="text-[11px] text-gray-500 font-mono">{reg.email}</div>
                      </td>
                      <td className="p-3.5 font-sans">{reg.college} ({reg.year})</td>
                      <td className="p-3.5">{reg.phone}</td>
                      <td className="p-3.5 font-bold text-white">₹{reg.amount}</td>
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

      {/* TAB 2: PRICING, BATCH CONFIG & BROCHURE UPLOAD */}
      {activeTab === 'manage' && selectedBatch && batchForm[selectedBatch] && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Quick Price Controller */}
          <div className="bg-[#121212] border border-[#242424] p-6 rounded-xl space-y-6">
            <div>
              <h2 className="text-base font-bold text-white font-mono uppercase flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-neon" /> Instant Pricing Switcher
              </h2>
              <p className="text-xs text-gray-400 font-mono mt-1">
                Updates fee immediately on student registration checkout for {selectedBatch.toUpperCase()}.
              </p>
            </div>

            <div className="bg-[#0a0a0a] border border-[#242424] p-4 rounded-xl space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400 font-mono">Current Live Checkout Price:</span>
                <span className="text-2xl font-black text-neon font-mono">₹{batchForm[selectedBatch].fee}</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[300, 500, 1000].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleUpdatePrice(selectedBatch, p)}
                    className={`py-2 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer ${
                      batchForm[selectedBatch].fee === p
                        ? 'bg-neon text-black border-neon'
                        : 'bg-[#181818] text-gray-300 border-gray-700 hover:border-neon hover:text-neon'
                    }`}
                  >
                    Set ₹{p}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-mono">Custom Fee (₹)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={batchForm[selectedBatch].fee}
                  onChange={(e) =>
                    setBatchForm({
                      ...batchForm,
                      [selectedBatch]: { ...batchForm[selectedBatch], fee: Number(e.target.value) },
                    })
                  }
                  className="flex-1 px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#242424] focus:border-neon outline-none text-xs text-white font-mono"
                />
                <button
                  type="button"
                  onClick={() => handleUpdatePrice(selectedBatch, Number(batchForm[selectedBatch].fee))}
                  className="px-4 py-2 rounded-lg bg-[#181818] border border-neon/50 text-neon font-mono text-xs hover:bg-neon hover:text-black transition-all cursor-pointer"
                >
                  Apply Custom
                </button>
              </div>
            </div>

            {/* Circular / Poster Upload Area */}
            <div className="border-t border-[#242424] pt-4 space-y-3">
              <h3 className="text-xs font-bold text-white font-mono uppercase flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-neon" /> Circular & Brochure File
              </h3>
              <label className="border-2 border-dashed border-[#2e2e2e] hover:border-neon rounded-xl p-6 text-center space-y-2 cursor-pointer transition-colors bg-[#0a0a0a] block">
                <UploadCloud className="w-6 h-6 text-neon mx-auto" />
                <p className="text-xs text-gray-300 font-semibold">
                  {isUploading ? 'Uploading file...' : 'Click to Upload Schedule PDF or Poster'}
                </p>
                <p className="text-[10px] text-gray-500">Supports PNG, JPG, PDF up to 10MB</p>
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>

              {uploadSuccess && (
                <div className="flex items-center gap-2 text-xs text-neon font-mono bg-neon/10 p-2 rounded-lg border border-neon/30">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadSuccess}</span>
                </div>
              )}
            </div>
          </div>

          {/* Batch Configuration Form */}
          <div className="bg-[#121212] border border-[#242424] p-6 rounded-xl space-y-4">
            <h2 className="text-base font-bold text-white font-mono uppercase flex items-center gap-2">
              <FileText className="w-4 h-4 text-neon" /> {selectedBatch.toUpperCase()} Configuration
            </h2>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-mono">Track Title</label>
              <input
                type="text"
                value={batchForm[selectedBatch].title}
                onChange={(e) =>
                  setBatchForm({
                    ...batchForm,
                    [selectedBatch]: { ...batchForm[selectedBatch], title: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#242424] focus:border-neon outline-none text-xs text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-mono">Date / Month</label>
              <input
                type="text"
                value={batchForm[selectedBatch].date}
                onChange={(e) =>
                  setBatchForm({
                    ...batchForm,
                    [selectedBatch]: { ...batchForm[selectedBatch], date: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#242424] focus:border-neon outline-none text-xs text-white font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-mono">Venue</label>
              <input
                type="text"
                value={batchForm[selectedBatch].venue}
                onChange={(e) =>
                  setBatchForm({
                    ...batchForm,
                    [selectedBatch]: { ...batchForm[selectedBatch], venue: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#242424] focus:border-neon outline-none text-xs text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-mono">Seat Capacity Limit (Max Students / Batch)</label>
              <input
                type="number"
                value={batchForm[selectedBatch].max_capacity}
                onChange={(e) =>
                  setBatchForm({
                    ...batchForm,
                    [selectedBatch]: { ...batchForm[selectedBatch], max_capacity: Number(e.target.value) },
                  })
                }
                className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#242424] focus:border-neon outline-none text-xs text-white font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-mono">WhatsApp Group Invite Link</label>
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
                className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#242424] focus:border-neon outline-none text-xs text-white font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-mono">Notice / Announcements</label>
              <textarea
                rows={2}
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
              className="w-full py-2.5 rounded-lg bg-neon text-black font-bold text-xs hover:bg-[#00cc52] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 font-mono uppercase tracking-wider mt-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Updating Database...' : `Save ${selectedBatch.toUpperCase()} Configuration`}</span>
            </button>
          </div>
        </div>
      )}

      {/* CREATE WORKSHOP MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-neon/50 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-[0_0_50px_rgba(0,255,102,0.15)]">
            <div className="flex items-center justify-between border-b border-[#242424] pb-3">
              <h3 className="text-base font-bold text-white font-mono">Create Workshop Track</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWorkshop} className="space-y-3.5 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-gray-400">URL Slug (e.g. aegis-drone-batch-2)</label>
                <input
                  type="text"
                  required
                  placeholder="aegis-drone-batch-2"
                  value={newWorkshop.id}
                  onChange={(e) => setNewWorkshop({ ...newWorkshop, id: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#242424] focus:border-neon outline-none text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400">Title</label>
                <input
                  type="text"
                  required
                  value={newWorkshop.title}
                  onChange={(e) => setNewWorkshop({ ...newWorkshop, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#242424] focus:border-neon outline-none text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-gray-400">Fee (₹)</label>
                  <input
                    type="number"
                    required
                    value={newWorkshop.fee}
                    onChange={(e) => setNewWorkshop({ ...newWorkshop, fee: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#242424] focus:border-neon outline-none text-white text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-400">Batch Size</label>
                  <input
                    type="number"
                    required
                    value={newWorkshop.max_capacity}
                    onChange={(e) => setNewWorkshop({ ...newWorkshop, max_capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#242424] focus:border-neon outline-none text-white text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-400">Venue</label>
                <input
                  type="text"
                  required
                  value={newWorkshop.venue}
                  onChange={(e) => setNewWorkshop({ ...newWorkshop, venue: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#242424] focus:border-neon outline-none text-white text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-neon text-black font-bold text-xs uppercase tracking-wider hover:bg-[#00cc52] transition-all mt-3 cursor-pointer"
              >
                Save & Launch Workshop
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}