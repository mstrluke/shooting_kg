import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { X, ArrowRight, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { getPhotos } from '../../lib/api';

export default function PhotoSection() {
  const { data: photos } = useQuery({ queryKey: ['photos', 'home'], queryFn: () => getPhotos() });
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const items = (photos || []).filter((p: any) => p.image).slice(0, 8);
  if (!items.length) return null;

  return (
    <section className="relative py-20 lg:py-24 bg-white">
      <div className="absolute inset-0 geo-dots" />
      <div className="relative max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="section-label mb-3">Медиа</p>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">Фотогалерея</h2>
          </div>
          <div className="hidden md:block">
            <Link to="/media" className="btn-pill btn-primary group">
              Все фото <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Masonry-style grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-[200px] stagger">
          {items.map((photo: any, i: number) => (
            <div key={photo.id}
              className={`rounded-xl overflow-hidden cursor-pointer group relative animate-fade-up ${
                i === 0 ? 'md:col-span-2 md:row-span-2' : ''
              }`}
              onClick={() => setLightboxIdx(i)}>
              <img src={photo.image} alt={photo.title || ''}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300">
                  <ZoomIn className="w-5 h-5 text-dark" />
                </div>
              </div>
              {photo.title && (
                <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-white text-sm font-semibold truncate ">{photo.title}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="md:hidden text-center mt-8">
          <Link to="/media" className="btn-pill btn-primary group">
            Все фото <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && items[lightboxIdx] && (
        <div className="fixed inset-0 bg-dark/95 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in" onClick={() => setLightboxIdx(null)}>
          <button className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all z-10">
            <X className="w-5 h-5" />
          </button>
          <button className="absolute left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-all z-10"
            onClick={(e) => { e.stopPropagation(); setLightboxIdx(i => i !== null && i > 0 ? i - 1 : items.length - 1); }}>
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button className="absolute right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-all z-10"
            onClick={(e) => { e.stopPropagation(); setLightboxIdx(i => i !== null && i < items.length - 1 ? i + 1 : 0); }}>
            <ChevronRight className="w-5 h-5" />
          </button>
          <img src={items[lightboxIdx].image} alt="" className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl" onClick={e => e.stopPropagation()} />
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-3">
            <span className="text-white/20 text-xs font-medium tabular-nums">{lightboxIdx + 1} / {items.length}</span>
          </div>
        </div>
      )}
    </section>
  );
}
