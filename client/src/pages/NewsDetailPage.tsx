import { useHero } from "@/lib/useHeroImage";
import { useState } from 'react';
import SafeHtml from '../components/ui/SafeHtml';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight, X, ZoomIn, Images } from 'lucide-react';
import { getNewsBySlug, getNews } from '../lib/api';
import { formatDate } from '../lib/utils';
import PageHeader from '../components/layout/PageHeader';
import Loader from '../components/ui/Loader';

export default function NewsDetailPage() {
  const { slug } = useParams();
  const { data: item, isLoading } = useQuery({ queryKey: ['news', slug], queryFn: () => getNewsBySlug(slug!), enabled: !!slug });
  const { data: latestNews } = useQuery({ queryKey: ['news', 'latest'], queryFn: () => getNews(1, 7), staleTime: 60000 });
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const hero = useHero("news");

  if (isLoading) return (
    <>
      <PageHeader title="Новости" subtitle="Загрузка..." />
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-10"><Loader /></div>
    </>
  );

  if (!item) return (
    <>
      <PageHeader title="Новость не найдена" />
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-16 text-center">
        <p className="text-muted-foreground mb-4">Запрашиваемая новость не найдена</p>
        <Link to="/news" className="btn-pill btn-primary">← Вернуться к новостям</Link>
      </div>
    </>
  );

  const gallery: string[] = Array.isArray(item.gallery) ? item.gallery : [];
  const hasContent = item.content && item.content.trim().length > 0;
  const hasGallery = gallery.length > 0;

  return (
    <>
      <PageHeader title={item.title} subtitle={formatDate(item.date)} image={item.image || hero.image} />

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-12 min-h-screen">
        {/* Back link */}
        <Link to="/news" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary font-medium transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Все новости
        </Link>

        {/* Meta badges */}
        <div className="flex items-center gap-3 mb-8">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-medium bg-muted px-3 py-1.5 rounded-md">
            <Calendar className="w-3.5 h-3.5 text-primary/50" /> {formatDate(item.date)}
          </span>
          {hasGallery && (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-medium bg-muted px-3 py-1.5 rounded-md">
              <Images className="w-3.5 h-3.5 text-primary/50" /> {gallery.length} фото
            </span>
          )}
        </div>

        {/* ===== LAYOUT: 2-column on desktop ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT: Preview image + content */}
          <div className={hasGallery ? 'lg:col-span-7' : 'lg:col-span-8'}>
            {/* Preview image — constrained */}
            {item.image && (
              <div className="rounded-xl overflow-hidden mb-8 border border-border">
                <img src={item.image} alt={item.title} className="w-full aspect-[16/9] object-cover" />
              </div>
            )}

            {/* Excerpt as lead */}
            {item.excerpt && (
              <p className="text-base text-muted-foreground leading-relaxed mb-6 font-medium border-l-2 border-primary/30 pl-4">
                {item.excerpt}
              </p>
            )}

            {/* HTML content (optional) */}
            {hasContent && (
              <div className="rich-content">
                <SafeHtml html={item.content} />
              </div>
            )}
          </div>

          {/* RIGHT: Gallery sidebar (when gallery exists) */}
          {hasGallery && (
            <div className="lg:col-span-5">
              <div className="sticky top-[80px]">
                <div className="flex items-center gap-2 mb-4">
                  <Images className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-bold">Фотогалерея</h3>
                  <span className="text-xs text-muted-foreground/40">({gallery.length})</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {gallery.map((url, i) => (
                    <div key={i}
                      className="aspect-square rounded-xl overflow-hidden cursor-pointer group relative"
                      onClick={() => setLightboxIdx(i)}>
                      <img src={url} alt={`Фото ${i + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-dark/0 group-hover:bg-dark/20 transition-colors duration-300 flex items-center justify-center">
                        <div className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300">
                          <ZoomIn className="w-4 h-4 text-dark" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Related news */}
        {(() => {
          const related = (latestNews?.items || []).filter((n: any) => n.slug !== slug).slice(0, 3);
          if (!related.length) return null;
          return (
            <div className="border-t border-border mt-14 pt-10">
              <h2 className="text-xl font-black tracking-tight mb-6">Другие новости</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {related.map((n: any) => (
                  <Link key={n.id} to={`/news/${n.slug}`} className="group rounded-xl border border-border bg-white overflow-hidden hover:border-primary/20 transition-all duration-300">
                    {n.image ? (
                      <div className="aspect-[16/10] overflow-hidden">
                        <img src={n.image} alt={n.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    ) : (
                      <div className="aspect-[16/10] bg-muted" />
                    )}
                    <div className="p-4">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                        <Calendar className="w-3 h-3" /> {formatDate(n.date)}
                        {Array.isArray(n.gallery) && n.gallery.length > 0 && (
                          <span className="ml-auto flex items-center gap-1 text-primary/60"><Images className="w-3 h-3" /> {n.gallery.length}</span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors">{n.title}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Bottom nav */}
        <div className="border-t border-border mt-10 pt-8">
          <Link to="/news" className="btn-pill btn-primary group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Все новости
          </Link>
        </div>
      </div>

      {/* ===== LIGHTBOX ===== */}
      {lightboxIdx !== null && gallery[lightboxIdx] && (
        <div className="fixed inset-0 bg-dark/95 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in"
          onClick={() => setLightboxIdx(null)}>
          <button className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all z-10"
            onClick={() => setLightboxIdx(null)}>
            <X className="w-5 h-5" />
          </button>

          {gallery.length > 1 && (
            <>
              <button className="absolute left-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-all z-10"
                onClick={(e) => { e.stopPropagation(); setLightboxIdx(i => i !== null && i > 0 ? i - 1 : gallery.length - 1); }}>
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button className="absolute right-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-all z-10"
                onClick={(e) => { e.stopPropagation(); setLightboxIdx(i => i !== null && i < gallery.length - 1 ? i + 1 : 0); }}>
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <img src={gallery[lightboxIdx]} alt=""
            className="max-w-[90vw] max-h-[80vh] object-contain rounded-2xl"
            onClick={e => e.stopPropagation()} />

          {/* Thumbnail strip */}
          {gallery.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
              <div className="flex items-center gap-1.5 max-w-[80vw] overflow-x-auto py-1 px-1">
                {gallery.map((url, i) => (
                  <button key={i}
                    className={`w-14 h-10 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                      i === lightboxIdx ? 'border-white opacity-100' : 'border-transparent opacity-30 hover:opacity-60'
                    }`}
                    onClick={(e) => { e.stopPropagation(); setLightboxIdx(i); }}>
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              <span className="text-white/20 text-xs font-medium tabular-nums">{lightboxIdx + 1} / {gallery.length}</span>
            </div>
          )}
        </div>
      )}
    </>
  );
}
