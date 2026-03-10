import SafeHtml from '../ui/SafeHtml';
import { useQuery } from '@tanstack/react-query';
import { getPageBySlug } from '../../lib/api';
import { Link } from 'react-router-dom';
import { ArrowRight, Target, Users, Trophy } from 'lucide-react';

export default function AboutSection() {
  const { data: page } = useQuery({ queryKey: ['page', 'about'], queryFn: () => getPageBySlug('about') });

  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 lg:px-6">
        {page?.content && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <div className="lg:col-span-7">
              <p className="section-label mb-4">О федерации</p>
              <h2 className="text-2xl md:text-4xl font-black tracking-tight leading-[1.15] mb-6">
                {page.title || 'О нас'}
              </h2>
              <div className="text-[15px] text-muted-foreground/80 leading-[1.85] space-y-4">
                <SafeHtml html={page.content} className="rich-content" />
              </div>
              <Link to="/about" className="btn-pill btn-primary mt-8 group">
                Подробнее <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="lg:col-span-5 space-y-3">
              {[
                { icon: Target, label: 'Стрелковый спорт', desc: 'Развитие стрелковых дисциплин в Кыргызстане' },
                { icon: Users, label: 'Команда профессионалов', desc: 'Опытные тренеры и квалифицированные судьи' },
                { icon: Trophy, label: 'Соревнования', desc: 'Организация национальных и международных турниров' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-5 rounded-xl border border-border bg-white hover:border-primary/20 transition-all duration-300 group">
                  <div className="w-11 h-11 rounded-xl bg-primary/[0.06] flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[13px] mb-0.5">{item.label}</h3>
                    <p className="text-xs text-muted-foreground/70 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
