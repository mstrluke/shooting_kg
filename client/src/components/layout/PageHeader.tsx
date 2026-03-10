import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface PageHeaderProps { title: string; subtitle?: string; image?: string; }

const segmentLabels: Record<string, string> = {
  about: 'О нас', news: 'Новости', events: 'Мероприятия', staff: 'Персонал',
  media: 'Фотогалерея', video: 'Видеогалерея', documents: 'Документы',
  ratings: 'Рейтинг', results: 'Результаты', 'anti-doping': 'Антидопинг',
  leadership: 'Руководство', administration: 'Администрация', coaches: 'Тренеры', judges: 'Судьи',
  vp_women: 'ВП Женщины', vp_men: 'ВП Мужчины', pp_women: 'ПП Женщины', pp_men: 'ПП Мужчины',
};

function buildBreadcrumbs(pathname: string, title: string) {
  const segments = pathname.split('/').filter(Boolean);
  const crumbs: { label: string; href?: string }[] = [];
  if (segments.length === 0) return crumbs;
  const first = segments[0];
  if (segments.length === 1) {
    crumbs.push({ label: segmentLabels[first] || title });
  } else if (segments.length >= 2) {
    const second = segments[1];
    const firstLabel = segmentLabels[first];
    const secondLabel = segmentLabels[second];
    if (first === 'staff') {
      crumbs.push({ label: 'ФССКР', href: '/about' });
      crumbs.push({ label: secondLabel || second });
    } else if (first === 'ratings') {
      crumbs.push({ label: 'Рейтинг' });
      crumbs.push({ label: secondLabel || second });
    } else {
      crumbs.push({ label: firstLabel || first, href: `/${first}` });
      crumbs.push({ label: secondLabel || title });
    }
  }
  return crumbs;
}

export default function PageHeader({ title, subtitle, image }: PageHeaderProps) {
  const location = useLocation();
  const crumbs = buildBreadcrumbs(location.pathname, title);

  return (
    <>
      {/* Hero */}
      <div className="relative bg-dark overflow-hidden min-h-[40vh] flex items-end">
        {image ? (
          <>
            <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/60 to-dark/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-dark/50 to-transparent" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 geo-grid opacity-20" />
            <div className="absolute top-1/2 right-[8%] -translate-y-1/2 w-[300px] h-[300px] opacity-[0.04]">
              <div className="absolute inset-0 rounded-full border-2 border-white" />
              <div className="absolute inset-[40px] rounded-full border-2 border-white" />
              <div className="absolute inset-[80px] rounded-full border-2 border-white" />
              <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white -translate-y-1/2" />
              <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-white -translate-x-1/2" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.06] via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/90 to-dark/70" />
          </>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-primary/40 via-primary/20 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-6 w-full pb-12 md:pb-16">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-0.5 bg-primary rounded-full" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">ФССКР</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-[1.1] max-w-3xl">
            {title}
          </h1>
          {subtitle && (
            <p className="text-white/35 mt-3 text-sm md:text-base max-w-xl leading-relaxed">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Breadcrumbs — below hero */}
      {crumbs.length > 0 && (
        <div className="bg-background border-b border-border">
          <nav className="max-w-7xl mx-auto px-4 lg:px-6 flex items-center gap-2 text-xs py-3 flex-wrap">
            <Link to="/" className="text-muted-foreground/40 hover:text-primary transition-colors">
              <Home className="w-3.5 h-3.5" />
            </Link>
            {crumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-2">
                <ChevronRight className="w-3 h-3 text-muted-foreground/25" />
                {crumb.href
                  ? <Link to={crumb.href} className="text-muted-foreground/50 hover:text-primary transition-colors">{crumb.label}</Link>
                  : <span className="text-foreground/70 font-medium">{crumb.label}</span>}
              </span>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
