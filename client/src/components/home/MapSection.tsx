import { useQuery } from '@tanstack/react-query';
import { getSettings } from '../../lib/api';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function MapSection() {
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: getSettings });

  return (
    <section className="relative">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Info panel */}
        <div className="lg:col-span-4 bg-dark text-white p-10 lg:p-14 flex flex-col justify-center">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary mb-3">Контакты</p>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight mb-8">
            Как нас найти
          </h2>

          <div className="space-y-6">
            {settings?.address && (
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-white/25 mb-1">Адрес</div>
                  <p className="text-sm text-white/60 leading-relaxed">{settings.address}</p>
                </div>
              </div>
            )}

            {settings?.phone && (
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-white/25 mb-1">Телефон</div>
                  <a href={`tel:${settings.phone}`} className="text-sm text-white/60 hover:text-white transition-colors">{settings.phone}</a>
                </div>
              </div>
            )}

            {settings?.email && (
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-white/25 mb-1">Email</div>
                  <a href={`mailto:${settings.email}`} className="text-sm text-white/60 hover:text-white transition-colors">{settings.email}</a>
                </div>
              </div>
            )}

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-white/25 mb-1">Режим работы</div>
                <p className="text-sm text-white/60">Пн — Пт: 09:00 — 18:00</p>
              </div>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="lg:col-span-8 min-h-[400px] lg:min-h-[500px] bg-muted relative">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2924.5!2d74.5698!3d42.8746!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x389eb7e043730433%3A0x1c0e2f8deed8e3c6!2z0YPQuy4g0KfQvtC60LDQvdCwINCS0LDQu9C40YXQsNC90L7QstCwIDIvMTQsINCR0LjRiNC60LXQug!5e0!3m2!1sru!2skg!4v1709900000000!5m2!1sru!2skg"
            className="absolute inset-0 w-full h-full border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Расположение ФССКР"
          />
        </div>
      </div>
    </section>
  );
}
