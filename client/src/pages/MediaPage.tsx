import { useHero } from "@/lib/useHeroImage";
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, ChevronLeft, ChevronRight, Image } from 'lucide-react';
import { getAlbums, getPhotos } from '../lib/api';
import PageHeader from '../components/layout/PageHeader';
import Loader from '../components/ui/Loader';

export default function MediaPage() {
  const hero = useHero("media");
  const [selectedAlbum, setSelectedAlbum] = useState<number | undefined>(undefined);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const { data: albums } = useQuery({ queryKey: ['albums'], queryFn: getAlbums });
  const { data: photos, isLoading } = useQuery({ queryKey: ['photos', selectedAlbum], queryFn: () => getPhotos(selectedAlbum) });
  const items = (photos || []).filter((p: any) => p.image);

  return (
    <>
      <PageHeader title={hero.title || "Фотогалерея"} subtitle={hero.subtitle || "Фотоматериалы соревнований и событий"} image={hero.image} />
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-12 min-h-screen">
        {/* Album filters */}
        {albums && albums.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            <button onClick={() => setSelectedAlbum(undefined)}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${
                !selectedAlbum
                  ? 'bg-primary text-white '
                  : 'bg-white border border-border text-muted-foreground hover:text-foreground hover:border-primary/20'
              }`}>Все</button>
            {albums.map((a: any) => (
              <button key={a.id} onClick={() => setSelectedAlbum(a.id)}
                className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${
                  selectedAlbum === a.id
                    ? 'bg-primary text-white '
                    : 'bg-white border border-border text-muted-foreground hover:text-foreground hover:border-primary/20'
                }`}>
                {a.title} <span className="text-xs opacity-40 ml-1">({a._count?.photos || 0})</span>
              </button>
            ))}
          </div>
        )}

        {isLoading ? <Loader /> : items.length ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 stagger">
            {items.map((p: any, i: number) => (
              <div key={p.id}
                className="aspect-[4/3] rounded-xl overflow-hidden cursor-pointer group relative animate-fade-up"
                onClick={() => setLightboxIdx(i)}>
                <img src={p.image} alt={p.title || ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                <div className="absolute inset-0 bg-gradient-to-t from-dark/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                {p.title && (
                  <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white text-xs font-semibold truncate ">{p.title}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Image className="w-12 h-12 text-muted-foreground/15 mx-auto mb-4" />
            <p className="text-muted-foreground">Нет фотографий</p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && items[lightboxIdx] && (
        <div className="fixed inset-0 bg-dark/95 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in" onClick={() => setLightboxIdx(null)}>
          <button className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all z-10">
            <X className="w-5 h-5" />
          </button>
          <button className="absolute left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-all z-10"
            onClick={e => { e.stopPropagation(); setLightboxIdx(i => i! > 0 ? i! - 1 : items.length - 1); }}>
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button className="absolute right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-all z-10"
            onClick={e => { e.stopPropagation(); setLightboxIdx(i => i! < items.length - 1 ? i! + 1 : 0); }}>
            <ChevronRight className="w-5 h-5" />
          </button>
          <img src={items[lightboxIdx].image} alt="" className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl" onClick={e => e.stopPropagation()} />
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/20 text-xs font-medium tabular-nums">{lightboxIdx + 1} / {items.length}</div>
        </div>
      )}
    </>
  );
}
