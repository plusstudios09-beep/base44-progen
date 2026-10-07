import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { compressImage } from '@/lib/image';
import { base44 } from '@/api/base44Client';

export default function ImageUpload({ value, onChange, label = 'صورة البروفايل / الشعار', circle = true }) {
  const [uploading, setUploading] = useState(false);
  const handle = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      const res = await base44.integrations.Core.UploadPublicFile({ file: compressed });
      onChange(res.file_url);
    } catch {
      alert('فشل رفع الصورة');
    } finally {
      setUploading(false);
    }
  };
  return (
    <div className="space-y-2">
      <label className="text-sm text-neutral-300">{label}</label>
      <div className="flex items-center gap-3">
        {value ? (
          <div className="relative">
            <img src={value} alt="" className={`w-16 h-16 object-cover border border-neutral-700 ${circle ? 'rounded-full' : 'rounded-xl'}`} />
            <button type="button" onClick={() => onChange('')} className="absolute -top-1 -left-1 bg-red-500 text-white rounded-full p-0.5"><X className="w-3 h-3" /></button>
          </div>
        ) : (
          <div className={`w-16 h-16 border border-dashed border-neutral-700 ${circle ? 'rounded-full' : 'rounded-xl'} flex items-center justify-center text-neutral-600`}>
            <Upload className="w-5 h-5" />
          </div>
        )}
        <label className="cursor-pointer text-sm text-[#5fbf9c] hover:underline">
          {uploading ? 'جارٍ الرفع...' : 'رفع صورة'}
          <input type="file" accept="image/*" className="hidden" onChange={handle} disabled={uploading} />
        </label>
      </div>
    </div>
  );
}