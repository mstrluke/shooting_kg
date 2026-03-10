import { useQuery } from '@tanstack/react-query';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import { getSliders, getSettings } from '../../lib/api';
import { ArrowRight } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

export default function HeroSlider() {
  const { data: sliders } = useQuery({ queryKey: ['sliders'], queryFn: getSliders });
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: getSettings });
  const siteName = settings?.site_name || '';

  if (!sliders?.length) {
    return (
      <div className="relative h-[100vh] min-h-[600px] bg-dark overflow-hidden flex items-end">
        {/* Geometric overlay */}
        <div className="absolute inset-0 geo-grid opacity-50" />
        <div className="absolute top-1/2 right-[10%] -translate-y-1/2 w-[400px] h-[400px] opacity-[0.04]">
          <div className="absolute inset-0 rounded-full border-2 border-white" />
          <div className="absolute inset-[40px] rounded-full border-2 border-white" />
          <div className="absolute inset-[80px] rounded-full border-2 border-white" />
          <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-white -translate-y-1/2" />
          <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-white -translate-x-1/2" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-6 w-full pb-24">
          <div className="flex items-center gap-2 mb-4">
            <img src="/uploads/scraped/logo.png" alt="" className="w-6 h-6 object-contain" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Стрелковый спорт</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.05] tracking-tight max-w-3xl">
            {siteName || 'Федерация стрелкового спорта'}
          </h1>
          <p className="text-white/30 text-lg mt-5 max-w-lg">Кыргызская Республика</p>
          <div className="flex items-center gap-3 mt-8">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="w-12 h-0.5 bg-primary/30 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Swiper
      modules={[Navigation, Pagination, Autoplay, EffectFade]}
      navigation
      pagination={{ clickable: true }}
      autoplay={{ delay: 6000, disableOnInteraction: false }}
      effect="fade"
      fadeEffect={{ crossFade: true }}
      loop
      speed={800}
      className="h-[100vh] min-h-[600px] overflow-hidden"
    >
      {sliders.map((slide: any) => (
        <SwiperSlide key={slide.id}>
          <div className="relative h-full">
            <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
            {/* Cinematic gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/30 to-dark/10" />
            <div className="absolute inset-0 bg-gradient-to-r from-dark/40 to-transparent" />

            {/* Content */}
            <div className="absolute inset-0 flex items-end">
              <div className="max-w-7xl mx-auto px-4 lg:px-6 w-full pb-24">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-8 h-0.5 bg-primary rounded-full" />
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">ФССКР</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-black text-white leading-[1.05] tracking-tight max-w-2xl">
                  {slide.title}
                </h2>
                {slide.subtitle && (
                  <p className="text-white/40 text-base md:text-lg mt-4 max-w-lg leading-relaxed">{slide.subtitle}</p>
                )}
                {slide.link && (
                  <a href={slide.link} className="btn-pill btn-primary mt-8 group">
                    Подробнее
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                )}
              </div>
            </div>

            {/* Bottom accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
