import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight, ArrowUpRight } from 'lucide-react';
import { getEvents } from '../../lib/api';
import { formatDate } from '../../lib/utils';

export default function EventsSection() {
  const { data } = useQuery({ queryKey: ['events', 'home'], queryFn: () => getEvents(1, 4) });
  const events = data?.items || [];
  if (!events.length) return null;

  return (
    <section className="relative py-20 lg:py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="section-label mb-3">Мероприятия</p>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">Ближайшие события</h2>
          </div>
          <div className="hidden md:block">
            <Link to="/events" className="btn-pill btn-primary group">
              Все мероприятия <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger">
          {events.map((event: any, i: number) => (
            <Link key={event.id} to={`/events/${event.slug}`}
              className="flex gap-5 rounded-xl border border-border bg-white p-6 hover:border-primary/20 transition-all duration-300 group card-hover animate-fade-up">
              {/* Date badge */}
              <div className="shrink-0">
                <div className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center ${
                  i === 0 ? 'bg-primary text-white' : 'bg-primary/[0.06] text-primary'
                }`}>
                  <div className="text-2xl font-black leading-none">{new Date(event.startDate).getDate()}</div>
                  <div className={`text-[9px] font-bold uppercase mt-0.5 ${i === 0 ? 'text-white/70' : 'text-primary/60'}`}>
                    {new Date(event.startDate).toLocaleDateString('ru', { month: 'short' })}
                  </div>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold group-hover:text-primary transition-colors line-clamp-2 mb-2.5">{event.title}</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-primary/40" />
                    {formatDate(event.startDate)}{event.endDate && ` — ${formatDate(event.endDate)}`}
                  </span>
                  {event.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-primary/40" />{event.location}
                    </span>
                  )}
                </div>
              </div>

              <ArrowUpRight className="w-5 h-5 text-muted-foreground/15 group-hover:text-primary shrink-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          ))}
        </div>

        <div className="md:hidden text-center mt-8">
          <Link to="/events" className="btn-pill btn-primary group">
            Все мероприятия <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
