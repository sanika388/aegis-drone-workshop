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
  Plus, 
  X, 
  ExternalLink, 
  Trash2,
  AlertCircle,
  MessageSquare,
  CheckCircle2,
  Clock,
  Image as ImageIcon,
  Send,
  Lock,
  Archive,
  Play,
  UploadCloud
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { uploadAegisAsset } from '@/lib/uploadHelper';
export default function AdminDashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'manage' | 'registrations' | 'gallery'>('manage');
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [batchForm, setBatchForm] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

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
    status: 'active',
    notice: 'First 20 seats per batch. Hands-on practical kit provided.',
    whatsapp_group_name: '',
    whatsapp_group_link: '',
  });

  // Gallery URL State
  const [newGalleryUrl, setNewGalleryUrl] = useState('');

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
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching workshops:', error.message);
      return;
    }

    if (data && data.length > 0) {
      setBatches(data);
      setSelectedBatch((prev) => (data.some((b) => b.id === prev) ? prev : data[0].id));

      const formMap: Record<string, any> = {};
      data.forEach((b) => {
        formMap[b.id] = {
          title: b.title || '',
          fee: Number(b.fee || 300),
          venue: b.venue || '',
          date: b.date || '',
          status: b.status || 'active',
          notice: b.notice || '',
          max_capacity: Number(b.max_capacity || 20),
          whatsapp_group_name: b.whatsapp_group_name || '',
          whatsapp_group_link: b.whatsapp_group_link || '',
          gallery_images: b.gallery_images || [],
        };
      });
      setBatchForm(formMap);
    } else {
      setBatches([]);
      setSelectedBatch('');
      setBatchForm({});
    }
  };

  const fetchRegistrations = async () => {
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .order('registered_at', { ascending: false });

    if (error) console.error('Error loading registrations:', error.message);

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
          status: r.payment_status || 'pending',
          emailSent: r.email_sent || false,
          registeredAt: r.registered_at ? new Date(r.registered_at).toLocaleDateString('en-IN') : 'Recent',
        }))
      );
    }
  };

  // 1-Click Workshop-Wise Dynamic Pricing
  const handleUpdatePrice = async (targetBatchId: string, newFee: number) => {
    try {
      const { error } = await supabase
        .from('workshops')
        .update({ fee: newFee })
        .eq('id', targetBatchId);

      if (error) throw error;
      
      setBatchForm((prev) => ({
        ...prev,
        [targetBatchId]: { ...prev[targetBatchId], fee: newFee }
      }));
      
      setBatches((prev) =>
        prev.map((b) => (b.id === targetBatchId ? { ...b, fee: newFee } : b))
      );
      
      alert(`Pricing for ${targetBatchId} dynamically updated to ₹${newFee}!`);
    } catch (err: any) {
      alert('Error updating fee: ' + err.message);
    }
  };

  // Workshop Status Switcher (Active / Batch Full / Completed)
  const handleStatusChange = async (targetBatchId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('workshops')
        .update({ status: newStatus })
        .eq('id', targetBatchId);

      if (error) throw error;

      setBatchForm((prev) => ({
        ...prev,
        [targetBatchId]: { ...prev[targetBatchId], status: newStatus }
      }));
      
      setBatches((prev) =>
        prev.map((b) => (b.id === targetBatchId ? { ...b, status: newStatus } : b))
      );
      
      alert(`Track status changed to: ${newStatus.toUpperCase()}`);
    } catch (err: any) {
      alert('Error updating status: ' + err.message);
    }
  };

  // Save Track Settings
  const saveBatchSettings = async () => {
    if (!selectedBatch || !batchForm[selectedBatch]) return;
    setIsSaving(true);
    const curr = batchForm[selectedBatch];
    try {
      const { error } = await supabase
        .from('workshops')
        .update({
          title: curr.title,
          fee: Number(curr.fee),
          venue: curr.venue,
          date: curr.date,
          status: curr.status,
          notice: curr.notice,
          max_capacity: Number(curr.max_capacity),
          whatsapp_group_name: curr.whatsapp_group_name,
          whatsapp_group_link: curr.whatsapp_group_link,
          gallery_images: curr.gallery_images,
        })
        .eq('id', selectedBatch);

      if (error) throw error;
      alert(`Settings for ${selectedBatch} saved successfully!`);
      await fetchBatches();
    } catch (err: any) {
      alert('Error updating database: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Payment Status & Trigger Automated Welcome Email
  const handleTogglePaymentStatus = async (registration: any) => {
    const newStatus = registration.status === 'confirmed' ? 'pending' : 'confirmed';
    setActionLoadingId(registration.id);

    try {
      const { error } = await supabase
        .from('registrations')
        .update({ payment_status: newStatus, email_sent: newStatus === 'confirmed' })
        .eq('id', registration.id);

      if (error) throw error;

      // Dispatch Confirmation Email API if toggled to Confirmed
      if (newStatus === 'confirmed') {
        const currentBatchData = batchForm[registration.batch] || {};
        await fetch('/api/send-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentName: registration.name,
            studentEmail: registration.email,
            bookingId: registration.id,
            workshopTitle: currentBatchData.title || 'Aegis Drone Workshop',
            amount: registration.amount,
            venue: currentBatchData.venue || 'GCOERC Nashik',
            date: currentBatchData.date || 'September Month',
            whatsappLink: currentBatchData.whatsapp_group_link || '',
          }),
        });
      }

      await fetchRegistrations();
      alert(`Status updated to ${newStatus.toUpperCase()}.${newStatus === 'confirmed' ? ' Welcome email sent!' : ''}`);
    } catch (err: any) {
      alert('Update failed: ' + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Direct WhatsApp Web Trigger
  const handleWhatsAppDirect = (student: any) => {
    const cleanPhone = student.phone.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    const message = encodeURIComponent(
      `Hey ${student.name}! Your seat for the Aegis Drone Workshop (Booking ID: ${student.id}) has been confirmed. See you in the flight lab!`
    );
    window.open(`https://wa.me/${phoneWithCountry}?text=${message}`, '_blank');
  };

  // Add Photo URL to About Showcase
  const handleAddGalleryImage = () => {
    if (!newGalleryUrl.trim() || !selectedBatch) return;
    const currentImages = batchForm[selectedBatch]?.gallery_images || [];
    const updatedImages = [...currentImages, newGalleryUrl.trim()];

    setBatchForm((prev) => ({
      ...prev,
      [selectedBatch]: { ...prev[selectedBatch], gallery_images: updatedImages }
    }));
    setNewGalleryUrl('');
  };

  const handleRemoveGalleryImage = (indexToRemove: number) => {
    const currentImages = batchForm[selectedBatch]?.gallery_images || [];
    const updatedImages = currentImages.filter((_: any, idx: number) => idx !== indexToRemove);

    setBatchForm((prev) => ({
      ...prev,
      [selectedBatch]: { ...prev[selectedBatch], gallery_images: updatedImages }
    }));
  };

  // Track Deletion
  const handleDeleteWorkshop = async (idToDelete: string) => {
    if (!confirm(`Are you sure you want to permanently delete track "${idToDelete}"?`)) return;

    try {
      const { error } = await supabase.from('workshops').delete().eq('id', idToDelete);
      if (error) throw error;
      alert(`Track ${idToDelete} permanently removed.`);
      await fetchBatches();
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    }
  };

  // Launch New Track
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

      const { error } = await supabase.from('workshops').insert([payload]);
      if (error) throw error;

      alert(`Workshop track created: /workshops/${cleanId}`);
      setShowAddModal(false);
      setSelectedBatch(cleanId);
      await fetchBatches();
    } catch (err: any) {
      alert(err.message || 'Failed to create workshop track.');
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
        <p className="text-xs font-mono text-gray-400">Verifying administrative access...</p>
      </div>
    );
  }

  // Filter Registrations
  const filteredRegistrations = registrations
    .filter((r) => !selectedBatch || r.batch === selectedBatch)
    .filter(
      (r) =>
        r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.phone?.includes(searchTerm)
    );

  // Stats Calculations
  const currentBatchRegs = registrations.filter((r) => r.batch === selectedBatch);
  const currentBatchConfirmed = currentBatchRegs.filter((r) => r.status === 'confirmed');
  const currentBatchPending = currentBatchRegs.filter((r) => r.status === 'pending');
  const currentBatchRevenue = currentBatchConfirmed.reduce((acc, curr) => acc + curr.amount, 0);
  const currentBatchCapacity = batchForm[selectedBatch]?.max_capacity || 20;

  const exportToCSV = () => {
    const headers = 'ID,Full Name,Email,Phone,College,Year,Amount,Status,Date\n';
    const rows = filteredRegistrations
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
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[#242424] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white font-mono uppercase">Aegis Flight Command Center</h1>
            <span className="px-2 py-0.5 rounded bg-neon/10 border border-neon/30 text-neon font-bold text-[10px] uppercase font-mono">
              Root Admin
            </span>
          </div>
          <p className="text-xs text-gray-400 font-mono mt-1">
            WORKSHOP LIFECYCLES, DYNAMIC PRICING, AUTOMATED PASSES & STUDENT DISPATCH
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-lg bg-neon text-black font-bold font-mono text-xs flex items-center gap-1.5 hover:bg-[#00cc52] transition-all cursor-pointer shadow-[0_0_15px_rgba(0,255,102,0.2)]"
          >
            <Plus className="w-4 h-4" />
            <span>Launch Track</span>
          </button>

          <div className="flex bg-[#121212] p-1 rounded-lg border border-[#242424]">
            <button
              onClick={() => setActiveTab('manage')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all font-mono cursor-pointer ${
                activeTab === 'manage' ? 'bg-neon text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              Control Room
            </button>
            <button
              onClick={() => setActiveTab('registrations')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all font-mono cursor-pointer ${
                activeTab === 'registrations' ? 'bg-neon text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              Registry ({registrations.length})
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all font-mono cursor-pointer ${
                activeTab === 'gallery' ? 'bg-neon text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              About Showcase
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

      {/* Track Level Quick Stats Breakdown */}
      {selectedBatch && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-[#121212] border border-[#242424] p-4 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-[11px] font-medium uppercase font-mono">Seat Fill Ratio</span>
              <Users className="w-3.5 h-3.5 text-neon" />
            </div>
            <p className="text-xl font-black text-white font-mono">
              {currentBatchConfirmed.length} / {currentBatchCapacity} Filled
            </p>
          </div>

          <div className="bg-[#121212] border border-[#242424] p-4 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-[11px] font-medium uppercase font-mono">Track Revenue</span>
              <IndianRupee className="w-3.5 h-3.5 text-neon" />
            </div>
            <p className="text-xl font-black text-neon font-mono">₹{currentBatchRevenue.toLocaleString('en-IN')}</p>
          </div>

          <div className="bg-[#121212] border border-[#242424] p-4 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-[11px] font-medium uppercase font-mono">Pending Verifications</span>
              <Clock className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <p className="text-xl font-black text-amber-400 font-mono">{currentBatchPending.length} Awaiting</p>
          </div>

          <div className="bg-[#121212] border border-[#242424] p-4 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-[11px] font-medium uppercase font-mono">Current Status</span>
              <Layers className="w-3.5 h-3.5 text-neon" />
            </div>
            <p className="text-xl font-black text-white font-mono uppercase">
              {batchForm[selectedBatch]?.status || 'active'}
            </p>
          </div>
        </div>
      )}

      {/* Track Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#121212] p-4 rounded-xl border border-[#242424]">
        <div className="flex flex-wrap items-center gap-2">
          {batches.map((b) => {
            const count = registrations.filter((r) => r.batch === b.id && r.status === 'confirmed').length;
            const max = b.max_capacity || 20;
            const isFull = count >= max || b.status === 'full';

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
            <>
              <Link
                href={`/workshops/${selectedBatch}`}
                target="_blank"
                className="px-3 py-1.5 rounded-lg bg-[#181818] border border-[#2e2e2e] text-gray-300 hover:text-neon hover:border-neon font-mono text-xs flex items-center gap-1.5"
              >
                <span>Open Public Link</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <button
                onClick={() => handleDeleteWorkshop(selectedBatch)}
                className="p-1.5 rounded-lg bg-[#181818] border border-red-900/40 text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-all cursor-pointer"
                title="Permanently delete track"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* TAB 1: CONTROL ROOM (PRICING, LIFECYCLE & DETAILS) */}
      {activeTab === 'manage' && selectedBatch && batchForm[selectedBatch] && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Workshop-Wise Pricing & Lifecycle Card */}
          <div className="bg-[#121212] border border-[#242424] p-6 rounded-xl space-y-6">
            <div>
              <h2 className="text-base font-bold text-white font-mono uppercase flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-neon" /> 1-Click Price Controller ({selectedBatch})
              </h2>
              <p className="text-xs text-gray-400 font-mono mt-1">
                Updates fee immediately on student registration checkout for this track.
              </p>
            </div>

            <div className="bg-[#0a0a0a] border border-[#242424] p-4 rounded-xl space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400 font-mono">Live Checkout Fee:</span>
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
                  Apply
                </button>
              </div>
            </div>

            {/* Track Status Switcher */}
            <div className="border-t border-[#242424] pt-5 space-y-3">
              <h3 className="text-xs font-bold text-white font-mono uppercase">Track Lifecycle Status</h3>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleStatusChange(selectedBatch, 'active')}
                  className={`py-2 rounded-lg border text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    batchForm[selectedBatch].status === 'active'
                      ? 'bg-neon text-black border-neon'
                      : 'bg-[#181818] text-gray-300 border-gray-700 hover:text-neon'
                  }`}
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Active</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange(selectedBatch, 'full')}
                  className={`py-2 rounded-lg border text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    batchForm[selectedBatch].status === 'full'
                      ? 'bg-amber-400 text-black border-amber-400'
                      : 'bg-[#181818] text-gray-300 border-gray-700 hover:text-amber-400'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Batch Full</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange(selectedBatch, 'completed')}
                  className={`py-2 rounded-lg border text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    batchForm[selectedBatch].status === 'completed'
                      ? 'bg-blue-400 text-black border-blue-400'
                      : 'bg-[#181818] text-gray-300 border-gray-700 hover:text-blue-400'
                  }`}
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>Completed</span>
                </button>
              </div>
            </div>
          </div>

          {/* Details & WhatsApp Community Configuration Card */}
          <div className="bg-[#121212] border border-[#242424] p-6 rounded-xl space-y-4">
            <h2 className="text-base font-bold text-white font-mono uppercase flex items-center gap-2">
              <FileText className="w-4 h-4 text-neon" /> {selectedBatch} Details & Community
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

            <div className="grid grid-cols-2 gap-3">
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
                <label className="text-xs text-gray-400 font-mono">Seat Limit (e.g. 20)</label>
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
              <label className="text-xs text-gray-400 font-mono">Live Registration Notice Banner</label>
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
              <span>{isSaving ? 'Updating...' : `Save Track Settings`}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: ATTENDEE REGISTRY & AUTOMATED PASS SENDER */}
      {activeTab === 'registrations' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search attendee by name, email, phone, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#121212] border border-[#242424] focus:border-neon outline-none text-xs text-white font-mono"
              />
            </div>

            <button
              onClick={exportToCSV}
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
                  <th className="p-3.5">Booking ID</th>
                  <th className="p-3.5">Student</th>
                  <th className="p-3.5">College</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Status & Trigger</th>
                  <th className="p-3.5 text-right">Actions</th>
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
                      <td className="p-3.5 font-bold text-white">₹{reg.amount}</td>
                      <td className="p-3.5">
                        <button
                          onClick={() => handleTogglePaymentStatus(reg)}
                          disabled={actionLoadingId === reg.id}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer ${
                            reg.status === 'confirmed'
                              ? 'bg-neon/10 border border-neon/40 text-neon'
                              : 'bg-amber-400/10 border border-amber-400/40 text-amber-400'
                          }`}
                        >
                          {reg.status === 'confirmed' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Confirmed</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" />
                              <span>Pending (Click to Verify)</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleWhatsAppDirect(reg)}
                          className="p-2 rounded-lg bg-[#181818] border border-gray-700 text-gray-300 hover:text-neon hover:border-neon transition-all inline-flex items-center gap-1.5 cursor-pointer"
                          title="Instant WhatsApp Message"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-neon" />
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
      )}

      {/* TAB 3: ABOUT SHOWCASE DIRECT FILE EXPLORER UPLOAD */}
{activeTab === 'gallery' && selectedBatch && (
  <div className="bg-[#121212] border border-[#242424] p-6 rounded-xl space-y-6">
    <div>
      <h2 className="text-base font-bold text-white font-mono uppercase flex items-center gap-2">
        <ImageIcon className="w-4 h-4 text-neon" /> About Page Showcase Gallery ({selectedBatch})
      </h2>
      <p className="text-xs text-gray-400 font-mono mt-1">
        Select and upload drone hardware photos directly from your device. When empty, the About page automatically displays dynamic flight schematics.
      </p>
    </div>

    {/* Direct File Explorer Dropzone */}
    <label className="border-2 border-dashed border-[#2e2e2e] hover:border-neon rounded-2xl p-8 text-center space-y-3 cursor-pointer transition-all bg-[#0a0a0a] block group hover:bg-[#0e0e0e]">
      <div className="w-12 h-12 rounded-full bg-neon/10 border border-neon/30 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
        <UploadCloud className="w-6 h-6 text-neon" />
      </div>
      <div>
        <p className="text-sm text-white font-bold font-mono">
          {isUploading ? 'Uploading selected assets...' : 'Click to Browse Files / Photos'}
        </p>
        <p className="text-[11px] text-gray-400 font-mono mt-1">
          Supports PNG, JPG, JPEG, WEBP (Select multiple images directly)
        </p>
      </div>

      <input
        type="file"
        multiple
        accept="image/png,image/jpeg,image/jpg,image/webp"
        onChange={async (e) => {
          const files = e.target.files;
          if (!files || files.length === 0 || !selectedBatch) return;

          setIsUploading(true);
          try {
            const uploadedUrls: string[] = [];
            for (let i = 0; i < files.length; i++) {
              const url = await uploadAegisAsset(files[i], 'gallery');
              uploadedUrls.push(url);
            }

            const currentImages = batchForm[selectedBatch]?.gallery_images || [];
            const newImagesList = [...currentImages, ...uploadedUrls];

            setBatchForm((prev) => ({
              ...prev,
              [selectedBatch]: {
                ...prev[selectedBatch],
                gallery_images: newImagesList,
              },
            }));

            // Auto-persist directly to Supabase
            await supabase
              .from('workshops')
              .update({ gallery_images: newImagesList })
              .eq('id', selectedBatch);

            alert(`Successfully uploaded ${uploadedUrls.length} image(s)!`);
          } catch (err: any) {
            alert(err.message || 'Error uploading files');
          } finally {
            setIsUploading(false);
          }
        }}
        className="hidden"
        disabled={isUploading}
      />
    </label>

    {/* Live Image Grid */}
    <div className="space-y-2">
      <div className="flex justify-between items-center text-xs font-mono text-gray-400">
        <span>Active Showcase Images ({(batchForm[selectedBatch]?.gallery_images || []).length})</span>
        <span>Click ✕ to remove</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(batchForm[selectedBatch]?.gallery_images || []).map((imgUrl: string, idx: number) => (
          <div key={idx} className="relative group rounded-xl overflow-hidden border border-[#242424] aspect-video bg-[#0a0a0a]">
            <img src={imgUrl} alt="Showcase upload" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={async () => {
                const currentImages = batchForm[selectedBatch]?.gallery_images || [];
                const updatedList = currentImages.filter((_: any, i: number) => i !== idx);

                setBatchForm((prev) => ({
                  ...prev,
                  [selectedBatch]: {
                    ...prev[selectedBatch],
                    gallery_images: updatedList,
                  },
                }));

                await supabase
                  .from('workshops')
                  .update({ gallery_images: updatedList })
                  .eq('id', selectedBatch);
              }}
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/80 border border-red-900/50 text-red-400 hover:bg-red-900/60 hover:text-white transition-all cursor-pointer"
              title="Remove image"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {(batchForm[selectedBatch]?.gallery_images || []).length === 0 && (
          <div className="col-span-full p-8 border border-[#1f1f1f] bg-[#0a0a0a] rounded-xl text-center text-xs text-gray-500 font-mono">
            No uploaded lab photos found. Default flight schematics are active on the About page.
          </div>
        )}
      </div>
    </div>
  </div>
)}

      {/* CREATE WORKSHOP MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-neon/50 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-[0_0_50px_rgba(0,255,102,0.15)]">
            <div className="flex items-center justify-between border-b border-[#242424] pb-3">
              <h3 className="text-base font-bold text-white font-mono">Launch New Workshop Track</h3>
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
                  <label className="text-gray-400">Initial Fee (₹)</label>
                  <input
                    type="number"
                    required
                    value={newWorkshop.fee}
                    onChange={(e) => setNewWorkshop({ ...newWorkshop, fee: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#242424] focus:border-neon outline-none text-white text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-400">Max Capacity</label>
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
                Launch Track
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}