'use client';

import { useState } from 'react';
import { UploadCloud, X, ImageIcon } from 'lucide-react';
import { uploadAegisAsset } from '@/lib/uploadHelper';
import { supabase } from '@/lib/supabaseClient';

interface MediaShowcaseProps {
  selectedBatch: string;
  images: string[];
  onRefresh: () => void;
}

export default function MediaShowcaseTab({ selectedBatch, images, onRefresh }: MediaShowcaseProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !selectedBatch) return;

    setIsUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await uploadAegisAsset(files[i], 'gallery');
        uploadedUrls.push(url);
      }

      const updatedList = [...(images || []), ...uploadedUrls];
      await supabase.from('workshops').update({ gallery_images: updatedList }).eq('id', selectedBatch);

      alert(`Successfully uploaded ${uploadedUrls.length} image(s)!`);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Upload error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async (idxToRemove: number) => {
    const updated = (images || []).filter((_, idx) => idx !== idxToRemove);
    try {
      await supabase.from('workshops').update({ gallery_images: updated }).eq('id', selectedBatch);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="bg-[#121212] border border-[#242424] p-6 rounded-xl space-y-6">
      <div>
        <h2 className="text-base font-bold text-white font-mono uppercase flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-neon" /> About Page Showcase Gallery ({selectedBatch})
        </h2>
        <p className="text-xs text-gray-400 font-mono mt-1">
          Upload hardware photos directly from your device. When empty, the About page automatically displays dynamic flight schematics.
        </p>
      </div>

      <label className="border-2 border-dashed border-[#2e2e2e] hover:border-neon rounded-2xl p-8 text-center space-y-3 cursor-pointer transition-all bg-[#0a0a0a] block group hover:bg-[#0e0e0e]">
        <div className="w-12 h-12 rounded-full bg-neon/10 border border-neon/30 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
          <UploadCloud className="w-6 h-6 text-neon" />
        </div>
        <div>
          <p className="text-sm text-white font-bold font-mono">
            {isUploading ? 'Uploading assets...' : 'Click to Browse Files / Photos'}
          </p>
          <p className="text-[11px] text-gray-400 font-mono mt-1">
            Supports PNG, JPG, JPEG, WEBP (Multi-select enabled)
          </p>
        </div>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
          disabled={isUploading}
        />
      </label>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(images || []).map((url, idx) => (
          <div key={idx} className="relative group rounded-xl overflow-hidden border border-[#242424] aspect-video bg-[#0a0a0a]">
            <img src={url} alt="Showcase upload" className="w-full h-full object-cover" />
            <button
              onClick={() => handleRemove(idx)}
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/80 text-red-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        {(images || []).length === 0 && (
          <div className="col-span-full p-8 border border-[#1f1f1f] bg-[#0a0a0a] rounded-xl text-center text-xs text-gray-500 font-mono">
            No uploaded lab photos found. Default flight schematics are active on the About page.
          </div>
        )}
      </div>
    </div>
  );
}