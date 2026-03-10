import { useState, useRef } from 'react';
import { Upload, X, GripVertical } from 'lucide-react';
import { uploadFile } from '@/lib/api';
import { Button } from '@/components/ui/button';

interface GalleryUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  label?: string;
}

export default function GalleryUpload({ value = [], onChange, label = 'Галерея' }: GalleryUploadProps) {
  const [uploading, setUploading] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const r = await uploadFile(file);
        urls.push(r.url);
      }
      onChange([...value, ...urls]);
    } catch {
      alert('Ошибка загрузки');
    } finally {
      setUploading(false);
      if (ref.current) ref.current.value = '';
    }
  };

  const remove = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const arr = [...value];
    [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
    onChange(arr);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium leading-none">{label}</label>
      {value.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {value.map((url, i) => (
            <div key={`${url}-${i}`} className="relative group rounded-md overflow-hidden border bg-muted aspect-square">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-white/20" onClick={() => moveUp(i)} title="Переместить">
                  <GripVertical className="size-3" />
                </Button>
                <Button variant="destructive" size="icon" className="h-6 w-6" onClick={() => remove(i)} title="Удалить">
                  <X className="size-3" />
                </Button>
              </div>
              <span className="absolute top-1 left-1 bg-black/50 text-white text-[10px] font-bold w-5 h-5 rounded flex items-center justify-center">
                {i + 1}
              </span>
            </div>
          ))}
        </div>
      )}
      <div>
        <input ref={ref} type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
        <Button variant="outline" size="sm" onClick={() => ref.current?.click()} disabled={uploading}>
          <Upload className="size-4 mr-1.5" /> {uploading ? 'Загрузка...' : 'Добавить фото'}
        </Button>
        {value.length > 0 && <span className="text-xs text-muted-foreground ml-2">{value.length} фото</span>}
      </div>
    </div>
  );
}
