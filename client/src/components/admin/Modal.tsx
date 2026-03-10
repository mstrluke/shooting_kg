import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

interface ModalProps { open: boolean; onClose: () => void; title: string; children: React.ReactNode; onSubmit?: () => void; submitLabel?: string; loading?: boolean; wide?: boolean; error?: string | null; }

export default function Modal({ open, onClose, title, children, onSubmit, submitLabel = 'Сохранить', loading, wide, error }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { if (!open) return; const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }; window.addEventListener('keydown', fn); return () => window.removeEventListener('keydown', fn); }, [open, onClose]);
  if (!open) return null;

  return (
    <div ref={ref} className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-[10vh] px-4 overflow-y-auto animate-fade-in"
      onClick={e => { if (e.target === ref.current) onClose(); }}>
      <div className={`bg-background border rounded-lg w-full ${wide ? 'max-w-2xl' : 'max-w-md'} mb-10 animate-slide-down`}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b">
          <h2 className="text-sm font-semibold">{title}</h2>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}><X className="size-4" /></Button>
        </div>
        <div className="px-5 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {error && <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md p-3">{error}</div>}
          {children}
        </div>
        {onSubmit && (
          <div className="flex justify-end gap-2 px-5 py-3.5 border-t bg-muted/50">
            <Button variant="outline" size="sm" onClick={onClose}>Отмена</Button>
            <Button size="sm" onClick={onSubmit} disabled={loading}>{loading ? 'Сохранение...' : submitLabel}</Button>
          </div>
        )}
      </div>
    </div>
  );
}
