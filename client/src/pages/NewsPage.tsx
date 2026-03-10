import { useHero } from "@/lib/useHeroImage";
import { useEffect, useRef, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Calendar, Loader2, ArrowUpRight, Images } from 'lucide-react';
import { getNews } from '../lib/api';
import { formatDate } from '../lib/utils';
import PageHeader from '../components/layout/PageHeader';
import Loader from '../components/ui/Loader';

export default function NewsPage() {
  const hero = useHero("news");
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['news-infinite'],
    queryFn: ({ pageParam = 1 }) => getNews(pageParam, 12),
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
      <PageHeader title={hero.title || "Новости"} subtitle={hero.subtitle || "Последние новости федерации стрелкового спорта"} image={hero.image} />
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-16 min-h-screen">
        {isLoading ? <Loader /> : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
              {allItems.map((item: any) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
            <div ref={sentinelRef} className="h-4" />
            {isFetchingNextPage && (
              <div className="flex justify-center py-10">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              </div>
            )}
            {!hasNextPage && allItems.length > 0 && (
              <div className="text-center py-10">
                <div className="flex items-center justify-center gap-2">
                  <span className="w-8 h-px bg-border" />
                  <span className="text-xs text-muted-foreground/40 font-medium">Все новости загружены</span>
                  <span className="w-8 h-px bg-border" />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

/** Shared news card component — same pattern used in NewsSection */
export function NewsCard({ item }: { item: any }) {
  const gallery: string[] = Array.isArray(item.gallery) ? item.gallery : [];
  const totalImages = (item.image ? 1 : 0) + gallery.length;

  return (
    <Link to={`/news/${item.slug}`}
      className="rounded-xl border border-border overflow-hidden hover:border-primary/20 transition-all duration-300 group bg-white card-hover animate-fade-up flex flex-col">
      {/* Preview image */}
      <div className="h-56 overflow-hidden bg-muted relative">
        {item.image ? (
          <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
        ) : gallery[0] ? (
          <img src={gallery[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-dark/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Gallery count badge */}
        {gallery.length > 0 && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-dark/60 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-md">
            <Images className="w-3 h-3" /> {gallery.length}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
            <Calendar className="w-3.5 h-3.5 text-primary/40" />{formatDate(item.date)}
          </span>
          <ArrowUpRight className="w-4 h-4 text-muted-foreground/15 group-hover:text-primary transition-colors" />
        </div>
        <h3 className="font-bold group-hover:text-primary transition-colors mb-2 line-clamp-2 leading-snug">{item.title}</h3>
        {item.excerpt && <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed mt-auto">{item.excerpt}</p>}
      </div>
    </Link>
  );
}
