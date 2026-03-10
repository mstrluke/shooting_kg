import { Link } from 'react-router-dom';
import { Phone, MapPin, Mail, Facebook, Instagram, MessageCircle, Send, ArrowUpRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getSettings } from '../../lib/api';

export default function Footer() {
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: getSettings });
  const siteName = settings?.site_name || 'Shooting Sport';

  const socials = [
    { icon: Facebook, href: settings?.facebook, label: 'Facebook' },
    { icon: Instagram, href: settings?.instagram, label: 'Instagram' },
    { icon: MessageCircle, href: settings?.whatsapp, label: 'WhatsApp' },
    { icon: Send, href: settings?.telegram, label: 'Telegram' },
  ].filter(s => s.href);

  return (
    <footer className="relative bg-dark text-white overflow-hidden">
      {/* Geometric decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] opacity-[0.02]">
        <div className="absolute top-20 right-20 w-80 h-80 rounded-full border-2 border-white" />
        <div className="absolute top-32 right-32 w-56 h-56 rounded-full border-2 border-white" />
        <div className="absolute top-44 right-44 w-32 h-32 rounded-full border-2 border-white" />
        <div className="absolute top-[168px] right-20 w-80 h-[2px] bg-white" />
        <div className="absolute top-20 right-[248px] w-[2px] h-80 bg-white" />
      </div>

      {/* Top accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 lg:px-6">
        {/* Main footer content */}
        <div className="py-16 lg:py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3 mb-6">
              <img src="/uploads/scraped/logo.png" alt="ФССКР" className="w-10 h-10 object-contain" />
              <span className="text-base font-extrabold tracking-tight">{siteName}</span>
            </div>
            {settings?.site_description && (
              <p className="text-sm text-white/30 leading-relaxed max-w-xs">{settings.site_description}</p>
            )}
            {socials.length > 0 && (
              <div className="flex gap-2 mt-6">
                {socials.map((s, i) => (
                  <a key={i} href={s.href!} target="_blank" rel="noopener noreferrer" title={s.label}
                    className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/30 hover:bg-primary hover:border-primary hover:text-white transition-all duration-300 hover:-translate-y-0.5">
                    <s.icon className="w-[18px] h-[18px]" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Nav */}
          <div className="lg:col-span-2">
            <h3 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-white/20 mb-5">Навигация</h3>
            <ul className="space-y-3">
              {[
                { label: 'О федерации', href: '/about' },
                { label: 'Новости', href: '/news' },
                { label: 'Мероприятия', href: '/events' },
                { label: 'Результаты', href: '/results' },
              ].map(link => (
                <li key={link.href}>
                  <Link to={link.href} className="group flex items-center gap-1.5 text-sm text-white/30 hover:text-white transition-all duration-200">
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="lg:col-span-2">
            <h3 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-white/20 mb-5">Ресурсы</h3>
            <ul className="space-y-3">
              {[
                { label: 'Фотогалерея', href: '/media' },
                { label: 'Видеогалерея', href: '/video' },
                { label: 'Документы', href: '/documents' },
                { label: 'Антидопинг', href: '/anti-doping' },
              ].map(link => (
                <li key={link.href}>
                  <Link to={link.href} className="group flex items-center gap-1.5 text-sm text-white/30 hover:text-white transition-all duration-200">
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacts */}
          <div className="lg:col-span-4">
            <h3 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-white/20 mb-5">Контакты</h3>
            <div className="space-y-4">
              {settings?.phone && (
                <a href={`tel:${settings.phone}`} className="flex items-start gap-3 group">
                  <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0 group-hover:bg-primary/20 group-hover:border-primary/30 transition-all">
                    <Phone className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-white/15 mb-0.5">Телефон</div>
                    <span className="text-sm text-white/40 group-hover:text-white transition-colors">{settings.phone}</span>
                  </div>
                </a>
              )}
              {settings?.email && (
                <a href={`mailto:${settings.email}`} className="flex items-start gap-3 group">
                  <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0 group-hover:bg-primary/20 group-hover:border-primary/30 transition-all">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-white/15 mb-0.5">Email</div>
                    <span className="text-sm text-white/40 group-hover:text-white transition-colors">{settings.email}</span>
                  </div>
                </a>
              )}
              {settings?.address && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-white/15 mb-0.5">Адрес</div>
                    <span className="text-sm text-white/40">{settings.address}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.04] py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/15">© {new Date().getFullYear()} {siteName}. Все права защищены.</p>
          <div className="flex items-center gap-1 text-xs text-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-primary/60 inline-block" />
            Кыргызская Республика
          </div>
        </div>
      </div>
    </footer>
  );
}
