import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Play, X, ArrowRight } from 'lucide-react';
import { getVideos } from '../../lib/api';
import { getYoutubeId, getYoutubeThumbnail } from '../../lib/utils';

export default function VideoSection() {
  const { data: videos } = useQuery({ queryKey: ['videos', 'home'], queryFn: getVideos });
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const items = (videos || []).slice(0, 4);
  if (!items.length) return null;

  return (
    <section className="relative py-20 lg:py-24 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="section-label mb-3">Видео</p>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">Видеогалерея</h2>
          </div>
          <div className="hidden md:block">
            <Link to="/video" className="btn-pill btn-primary group">
              Все видео <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 stagger">
          {items.map((video: any) => (
            <div key={video.id}
              className="rounded-xl overflow-hidden cursor-pointer group bg-white border border-border hover:border-primary/20 transition-all duration-300 card-hover animate-fade-up"
              onClick={() => setActiveVideo(video.youtubeUrl)}>
              <div className="relative aspect-video overflow-hidden">
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
                <h3 className="text-sm font-bold group-hover:text-primary transition-colors line-clamp-2">{video.title}</h3>
              </div>
            </div>
          ))}
        </div>

        <div className="md:hidden text-center mt-8">
          <Link to="/video" className="btn-pill btn-primary group">
            Все видео <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
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
    </section>
  );
}
