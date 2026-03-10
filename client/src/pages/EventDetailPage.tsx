import { useHero } from "@/lib/useHeroImage";
import SafeHtml from '../components/ui/SafeHtml';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, MapPin, Trophy, Medal } from 'lucide-react';
import { getEventBySlug } from '../lib/api';
import { formatDate } from '../lib/utils';
import PageHeader from '../components/layout/PageHeader';
import Loader from '../components/ui/Loader';

export default function EventDetailPage() {
  const { slug } = useParams();
  const { data: event, isLoading } = useQuery({ queryKey: ['event', slug], queryFn: () => getEventBySlug(slug!), enabled: !!slug });
  const hero = useHero("events");

  if (isLoading) return (
    <>
      <PageHeader title="Мероприятие" subtitle="Загрузка..." />
      <div className="max-w-4xl mx-auto px-4 lg:px-6 py-10"><Loader /></div>
    </>
  );

  if (!event) return (
    <>
      <PageHeader title="Мероприятие не найдено" />
      <div className="max-w-4xl mx-auto px-4 lg:px-6 py-16 text-center">
        <p className="text-muted-foreground mb-4">Запрашиваемое мероприятие не найдено</p>
        <Link to="/events" className="btn-pill btn-primary">← Вернуться к мероприятиям</Link>
      </div>
    </>
  );

  return (
    <>
      <PageHeader image={event.image || hero.image} title={event.title} subtitle={`${formatDate(event.startDate)}${event.endDate ? ` — ${formatDate(event.endDate)}` : ''}${event.location ? ` • ${event.location}` : ''}`} />
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-12 min-h-screen">
        <Link to="/events" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary font-medium transition-colors mb-10 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Все мероприятия
        </Link>

        {/* Info badges */}
        <div className="flex flex-wrap gap-3 mb-10">
          <div className="flex items-center gap-2.5 rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium">
            <div className="w-8 h-8 rounded-lg bg-primary/[0.06] flex items-center justify-center">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <span>{formatDate(event.startDate)}{event.endDate && ` — ${formatDate(event.endDate)}`}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-2.5 rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium">
              <div className="w-8 h-8 rounded-lg bg-primary/[0.06] flex items-center justify-center">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <span>{event.location}</span>
            </div>
          )}
        </div>

        {event.image && (
          <div className="rounded-xl overflow-hidden mb-10 border border-border">
            <img src={event.image} alt={event.title} className="w-full h-auto" />
          </div>
        )}

        {event.description && <p className="text-muted-foreground mb-8 max-w-4xl leading-relaxed text-base">{event.description}</p>}
        {event.content && (
          <div className="max-w-4xl">
            <SafeHtml html={event.content} className="rich-content mb-12" />
          </div>
        )}

        {/* Results */}
        {event.results?.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-primary/[0.06] flex items-center justify-center">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-black tracking-tight">Результаты</h2>
            </div>
            <div className="space-y-2">
              {event.results.map((r: any, i: number) => (
                <div key={r.id} className={`flex items-center gap-5 rounded-xl border bg-white p-5 transition-all ${
                  i < 3 ? 'border-primary/15' : 'border-border'
                }`}>
                  <div className="w-12 text-center shrink-0">
                    {i === 0 && (
                      <div className="w-11 h-11 mx-auto rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center ">
                        <Trophy className="w-5 h-5 text-white" />
                      </div>
                    )}
                    {i === 1 && (
                      <div className="w-11 h-11 mx-auto rounded-xl bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center ">
                        <Medal className="w-5 h-5 text-white" />
                      </div>
                    )}
                    {i === 2 && (
                      <div className="w-11 h-11 mx-auto rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center ">
                        <Medal className="w-5 h-5 text-white" />
                      </div>
                    )}
                    {i >= 3 && <div className="text-2xl font-black text-muted-foreground/20 tabular-nums">{r.rank}</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold ${i < 3 ? 'text-foreground' : 'text-foreground/70'}`}>{r.athlete}</h3>
                    {r.category && <div className="text-xs text-muted-foreground mt-0.5">{r.category}</div>}
                  </div>
                  {r.score && (
                    <div className="text-right shrink-0">
                      <div className={`text-xl font-black tabular-nums ${i === 0 ? 'text-primary' : i < 3 ? 'text-foreground' : 'text-muted-foreground'}`}>{r.score}</div>
                      <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">очков</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
