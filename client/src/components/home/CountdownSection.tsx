import { useQuery } from '@tanstack/react-query';
import { getSettings } from '../../lib/api';
import { Link } from 'react-router-dom';
import { ArrowRight, Timer, Calendar, Trophy, MapPin } from 'lucide-react';
import Countdown from '../ui/Countdown';

export default function CountdownSection() {
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: getSettings });

  if (!settings?.countdown_date) return null;

  return (
    <section className="relative">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Info panel */}
        <div className="lg:col-span-4 bg-dark text-white p-10 lg:p-14 flex flex-col justify-center">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary mb-3">Обратный отсчёт</p>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight mb-3">
            {settings.countdown_title || 'До соревнований'}
          </h2>
          <p className="text-sm text-white/30 leading-relaxed mb-8">
            Следите за ближайшими мероприятиями федерации стрелкового спорта
          </p>

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-white/25 mb-0.5">Дата</div>
                <p className="text-sm text-white/60">
                  {new Date(settings.countdown_date).toLocaleDateString('ru', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>

          <Link to="/events" className="btn-pill btn-primary group w-fit">
            Мероприятия <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Countdown panel */}
        <div className="lg:col-span-8 bg-dark-soft flex items-center justify-center p-10 lg:p-14 min-h-[300px] lg:min-h-[400px] relative overflow-hidden">
          <div className="absolute inset-0 geo-grid opacity-20" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-primary/30 via-primary/10 to-transparent" />

          <div className="relative">
            <Countdown targetDate={settings.countdown_date} />
          </div>
        </div>
      </div>
    </section>
  );
}
