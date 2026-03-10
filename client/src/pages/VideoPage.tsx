import { useHero } from "@/lib/useHeroImage";
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Play, X, Film } from 'lucide-react';
import { getVideos } from '../lib/api';
import { getYoutubeId, getYoutubeThumbnail } from '../lib/utils';
import PageHeader from '../components/layout/PageHeader';
import Loader from '../components/ui/Loader';

export default function VideoPage() {
  const hero = useHero("video");
  const { data: videos, isLoading } = useQuery({ queryKey: ['videos'], queryFn: getVideos });
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  return (
    <>
      <PageHeader title={hero.title || "Видеогалерея"} subtitle={hero.subtitle || "Видеоматериалы соревнований и тренировок"} image={hero.image} />
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-16 min-h-screen">
        {isLoading ? <Loader /> : videos?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
            {videos.map((video: any) => (
              <div key={video.id}
                className="rounded-xl border border-border overflow-hidden cursor-pointer hover:border-primary/20 transition-all duration-300 group bg-white card-hover animate-fade-up"
                onClick={() => setActiveVideo(video.youtubeUrl)}>
                <div className="relative aspect-video bg-muted overflow-hidden">
                  <img src={video.thumbnail || getYoutubeThumbnail(video.youtubeUrl)} alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                  <div className="absolute inset-0 bg-dark/10 group-hover:bg-dark/30 transition-colors duration-300" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      <div className="w-14 h-14 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Play className="w-5 h-5 text-dark ml-0.5" fill="currentColor" />
                      </div>
                      <div className="absolute inset-0 rounded-full bg-white/30 animate-[pulse-ring_2s_ease-out_infinite]" />
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold group-hover:text-primary transition-colors line-clamp-2">{video.title}</h3>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Film className="w-12 h-12 text-muted-foreground/15 mx-auto mb-4" />
            <p className="text-muted-foreground">Нет видео</p>
          </div>
        )}
      </div>

      {/* Video modal */}
      {activeVideo && (
        <div className="fixed inset-0 bg-dark/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setActiveVideo(null)}>
          <button className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all">
            <X className="w-5 h-5" />
          </button>
          <div className="w-full max-w-4xl aspect-video animate-scale-in" onClick={e => e.stopPropagation()}>
            <iframe src={`https://www.youtube.com/embed/${getYoutubeId(activeVideo)}?autoplay=1`}
              className="w-full h-full rounded-xl" allow="autoplay; encrypted-media" allowFullScreen />
          </div>
        </div>
      )}
    </>
  );
}
