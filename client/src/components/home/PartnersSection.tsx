import { useQuery } from '@tanstack/react-query';
import { getPartners } from '../../lib/api';

export default function PartnersSection() {
  const { data: partners } = useQuery({ queryKey: ['partners'], queryFn: getPartners });
  if (!partners?.length) return null;
  // Triple to ensure seamless loop
  const items = [...partners, ...partners, ...partners];

  return (
    <section className="relative py-16 lg:py-20 bg-white overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="max-w-7xl mx-auto px-4 lg:px-6 mb-10">
        <p className="section-label mb-3 justify-center text-center">Партнеры</p>
        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-center">Наши партнёры</h2>
      </div>

      {/* Marquee with proper edge fades */}
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

        {/* Scrolling track — uses CSS animation */}
        <div className="flex w-max animate-[marquee_40s_linear_infinite] hover:[animation-play-state:paused]">
          {items.map((p: any, i: number) => (
            <a key={`${p.id}-${i}`} href={p.url || '#'} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center h-20 px-10 mx-3 rounded-xl border border-border bg-white shrink-0 hover:border-primary/20 transition-all duration-500">
              {p.logo ? (
                <img src={p.logo} alt={p.name} className="max-h-10 max-w-[140px] object-contain" />
              ) : (
                <span className="text-sm font-bold text-muted-foreground whitespace-nowrap">{p.name}</span>
              )}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
