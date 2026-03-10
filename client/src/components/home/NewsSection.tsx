import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Calendar, ArrowUpRight, ArrowRight, Images } from 'lucide-react';
import { getNews } from '../../lib/api';
import { formatDate } from '../../lib/utils';

export default function NewsSection() {
  const { data } = useQuery({ queryKey: ['news', 'home'], queryFn: () => getNews(1, 5) });
  const items = data?.items || [];
  if (!items.length) return null;
  const [featured, ...rest] = items;
  const featuredGallery: string[] = Array.isArray(featured.gallery) ? featured.gallery : [];

  return (
    <section className="relative py-20 lg:py-24 bg-white">
      <div className="absolute inset-0 geo-dots" />
      <div className="relative max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="section-label mb-3">Новости</p>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">Последние новости</h2>
          </div>
          <div className="hidden md:block">
            <Link to="/news" className="btn-pill btn-primary group">
              Все новости <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 stagger">
          {/* Featured — cinematic card (same data pattern: image + gallery badge) */}
          <Link to={`/news/${featured.slug}`} className="lg:col-span-7 group relative rounded-xl overflow-hidden min-h-[480px] flex items-end animate-fade-up">
            {featured.image ? (
              <img src={featured.image} alt={featured.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out" />
            ) : featuredGallery[0] ? (
              <img src={featuredGallery[0]} alt={featured.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out" />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-dark/20 to-transparent" />

            {/* Gallery badge */}
            {featuredGallery.length > 0 && (
              <div className="absolute top-5 left-5 flex items-center gap-1 bg-dark/60 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-md z-10">
                <Images className="w-3 h-3" /> {featuredGallery.length}
              </div>
            )}

            {/* Arrow */}
            <div className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110">
              <ArrowUpRight className="w-5 h-5 text-white" />
            </div>

            <div className="relative p-8 md:p-10">
              <span className="inline-flex items-center gap-2 text-xs text-white/40 mb-3 font-medium">
                <Calendar className="w-3.5 h-3.5" /> {formatDate(featured.date)}
              </span>
              <h3 className="text-2xl md:text-3xl font-black text-white leading-[1.15] tracking-tight line-clamp-3 max-w-lg">
                {featured.title}
              </h3>
              <div className="flex items-center gap-2 mt-5">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-xs text-white/30 font-semibold uppercase tracking-wider">Читать</span>
              </div>
            </div>
          </Link>

          {/* Side cards — same pattern as NewsCard but compact */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            {rest.map((item: any) => {
              const gallery: string[] = Array.isArray(item.gallery) ? item.gallery : [];
              const thumb = item.image || gallery[0];
              return (
                <Link key={item.id} to={`/news/${item.slug}`}
                  className="flex gap-4 rounded-xl border border-border bg-white p-4 hover:border-primary/20 transition-all duration-300 group animate-fade-up">
                  <div className="w-28 h-24 rounded-xl overflow-hidden shrink-0 bg-muted relative">
                    {thumb && <img src={thumb} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                    {gallery.length > 0 && (
                      <div className="absolute bottom-1 right-1 flex items-center gap-0.5 bg-dark/60 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                        <Images className="w-2.5 h-2.5" /> {gallery.length}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1.5 mb-1.5 font-medium">
                      <Calendar className="w-3 h-3" /> {formatDate(item.date)}
                    </span>
                    <h3 className="text-sm font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2">{item.title}</h3>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground/15 group-hover:text-primary shrink-0 mt-1 transition-colors" />
                </Link>
              );
            })}
          </div>
        </div>

        <div className="md:hidden text-center mt-8">
          <Link to="/news" className="btn-pill btn-primary group">
            Все новости <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
