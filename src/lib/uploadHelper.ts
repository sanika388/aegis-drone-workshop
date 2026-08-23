import { supabase } from '@/lib/supabaseClient';

export async function uploadAegisAsset(file: File, folder: 'circulars' | 'gallery'): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const cleanBaseName = file.name
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-');
  const fileName = `${folder}/${cleanBaseName}-${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('aegis-assets')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from('aegis-assets')
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}