import { Crosshair } from 'lucide-react';

export default function Loader() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="relative">
        <Crosshair className="w-6 h-6 text-primary animate-spin" style={{ animationDuration: '2s' }} />
        <div className="absolute inset-0 w-6 h-6 rounded-full border-2 border-primary/20 animate-[pulse-ring_1.5s_ease-out_infinite]" />
      </div>
      <span className="text-xs text-muted-foreground font-medium">Загрузка...</span>
    </div>
  );
}
