import { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

interface CountdownProps { targetDate: string; title?: string; }

export default function Countdown({ targetDate, title }: CountdownProps) {
  const [t, setT] = useState(calc(targetDate));
  useEffect(() => { const i = setInterval(() => setT(calc(targetDate)), 1000); return () => clearInterval(i); }, [targetDate]);

  const blocks = [
    { v: t.days, l: 'Дней' },
    { v: t.hours, l: 'Часов' },
    { v: t.minutes, l: 'Минут' },
    { v: t.seconds, l: 'Секунд' },
  ];

  return (
    <div className="flex items-center gap-3">
      {blocks.map((b, i) => (
        <div key={b.l} className="flex items-center gap-3">
          <div className="flex flex-col items-center">
            <div className="w-[72px] h-[72px] rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
              <span className="text-3xl font-black text-white tabular-nums leading-none tracking-tight">
                {String(b.v).padStart(2, '0')}
              </span>
            </div>
            <span className="text-[10px] text-white/25 font-semibold uppercase tracking-wider mt-2">{b.l}</span>
          </div>
          {i < blocks.length - 1 && (
            <div className="flex flex-col gap-1.5 -mt-5">
              <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
              <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function calc(target: string) {
  const d = Math.max(0, new Date(target).getTime() - Date.now());
  return { days: Math.floor(d / 864e5), hours: Math.floor((d / 36e5) % 24), minutes: Math.floor((d / 6e4) % 60), seconds: Math.floor((d / 1e3) % 60) };
}
