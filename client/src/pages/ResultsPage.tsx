import { useHero } from "@/lib/useHeroImage";
import { useEffect, useRef, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowUpRight, Trophy, Loader2 } from 'lucide-react';
import { getEvents } from '../lib/api';
import { formatDate } from '../lib/utils';
import PageHeader from '../components/layout/PageHeader';
import Loader from '../components/ui/Loader';

export default function ResultsPage() {
  const hero = useHero("results");
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['results-infinite'],
    queryFn: ({ pageParam = 1 }) => getEvents(pageParam, 20),
    getNextPageParam: (lastPage) => lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  });

  const sentinelRef = useRef<HTMLDivElement>(null);
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(handleObserver, { rootMargin: '400px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, [handleObserver]);

  const allItems = data?.pages.flatMap((p) => p.items) || [];

  return (
    <>
      <PageHeader title={hero.title || "Результаты соревнований"} subtitle={hero.subtitle || "Итоги прошедших мероприятий"} image={hero.image} />
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-16 min-h-screen">
        {isLoading ? <Loader /> : allItems.length ? (
          <>
            <div className="space-y-3 stagger">
              {allItems.map((event: any) => (
                <Link key={event.id} to={`/events/${event.slug}`}
                  className="flex items-center gap-5 bg-white border border-border rounded-xl p-5 hover:border-primary/20 transition-all duration-300 group card-hover animate-fade-up">
                  <div className="w-16 text-center shrink-0">
                    <div className="text-3xl font-black leading-none">{new Date(event.startDate).getDate()}</div>
                    <div className="text-[9px] font-bold text-muted-foreground uppercase mt-1">
                      {new Date(event.startDate).toLocaleDateString('ru', { month: 'short' })}
                    </div>
                    <div className="text-[10px] text-muted-foreground/40 font-medium">{new Date(event.startDate).getFullYear()}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold group-hover:text-primary transition-colors">{event.title}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2">
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
                  {event._count?.results > 0 && (
                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/[0.06] text-xs text-primary font-bold shrink-0">
                      <Trophy className="w-3.5 h-3.5" /> {event._count.results}
                    </div>
                  )}
                  <ArrowUpRight className="w-5 h-5 text-muted-foreground/15 group-hover:text-primary transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0" />
                </Link>
              ))}
            </div>

            <div ref={sentinelRef} className="py-8 flex justify-center">
              {isFetchingNextPage && <Loader2 className="w-6 h-6 animate-spin text-primary/40" />}
              {!hasNextPage && allItems.length > 0 && (
                <p className="text-xs text-muted-foreground/40">Все результаты загружены</p>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <Trophy className="w-12 h-12 text-muted-foreground/15 mx-auto mb-4" />
            <p className="text-muted-foreground">Нет данных о результатах</p>
          </div>
        )}
      </div>
    </>
  );
}
