import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { uploadFile } from '@/lib/api';
import { Button } from '@/components/ui/button';

interface ImageUploadProps { value?: string; onChange: (url: string) => void; label?: string; }

export default function ImageUpload({ value, onChange, label = 'Изображение' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const handle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try { const r = await uploadFile(file); onChange(r.url); } catch { alert('Ошибка загрузки'); }
    finally { setUploading(false); }
  };

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium leading-none">{label}</label>
      {value ? (
        <div className="relative w-fit">
          <img src={value} alt="" className="h-28 rounded-md object-cover border" />
          <Button variant="destructive" size="icon" className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full" onClick={() => onChange('')}><X className="size-3" /></Button>
        </div>
      ) : (
        <div>
          <input ref={ref} type="file" accept="image/*" onChange={handle} className="hidden" />
          <Button variant="outline" size="sm" onClick={() => ref.current?.click()} disabled={uploading}>
            <Upload className="size-4 mr-1.5" /> {uploading ? 'Загрузка...' : 'Выбрать файл'}
          </Button>
        </div>
      )}
    </div>
  );
}
