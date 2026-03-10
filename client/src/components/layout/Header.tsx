import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Menu, X, ChevronDown } from "lucide-react";
import { getSettings } from "../../lib/api";

const navItems = [
  { label: "Главная", href: "/" },
  {
    label: "ФССКР",
    children: [
      { label: "О нас", href: "/about" },
      { label: "Руководство", href: "/staff/leadership" },
      { label: "Администрация", href: "/staff/administration" },
      { label: "Тренерский Состав", href: "/staff/coaches" },
      { label: "Судейский Состав", href: "/staff/judges" },
      { label: "Документы", href: "/documents" },
    ],
  },
  { label: "Новости", href: "/news" },
  {
    label: "Мероприятия",
    children: [
      { label: "Календарь", href: "/events" },
      { label: "Результаты", href: "/results" },
    ],
  },
  {
    label: "Мультимедиа",
    children: [
      { label: "Фотогалерея", href: "/media" },
      { label: "Видеогалерея", href: "/video" },
    ],
  },
  {
    label: "Рейтинг",
    children: [
      { label: "ВП – 6 Женщины", href: "/ratings/vp_women" },
      { label: "ВП – 6 Мужчины", href: "/ratings/vp_men" },
      { label: "ПП – 6 Женщины", href: "/ratings/pp_women" },
      { label: "ПП – 6 Мужчины", href: "/ratings/pp_men" },
    ],
  },
  { label: "Антидопинг", href: "/anti-doping" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: getSettings });
  const siteName = settings?.site_name || 'ФССКР';

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => { setMobileOpen(false); setOpenDropdown(null); }, [location.pathname]);

  const isActive = (href?: string) => href && location.pathname === href;
  const isChildActive = (children?: { href: string }[]) =>
    children?.some(c => location.pathname === c.href || location.pathname.startsWith(c.href + '/'));

  // Transparent at top on all pages (every page has dark hero)
  const transparent = !scrolled;

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div
        className="transition-all duration-500 ease-out"
        style={{
          background: transparent ? 'transparent' : 'rgba(255,255,255,0.92)',
          backdropFilter: transparent ? 'none' : 'blur(16px) saturate(1.6)',
          borderBottom: transparent ? '1px solid transparent' : '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0 group">
            <img src="/uploads/scraped/logo.png" alt="ФССКР" className="w-10 h-10 object-contain transition-transform duration-300 group-hover:scale-105" />
            <span className={`hidden sm:block text-[13px] font-extrabold tracking-tight transition-colors duration-500 whitespace-nowrap ${
              transparent ? 'text-white' : 'text-foreground'
            }`}>
              {siteName}
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) =>
              item.children ? (
                <div key={item.label} className="relative"
                  onMouseEnter={() => setOpenDropdown(item.label)}
                  onMouseLeave={() => setOpenDropdown(null)}>
                  <button className={`flex items-center gap-1 px-3 py-2 text-[13px] font-semibold rounded-lg transition-colors duration-200 ${
                    transparent
                      ? (isChildActive(item.children) ? 'text-white' : 'text-white/60 hover:text-white')
                      : (isChildActive(item.children) ? 'text-primary' : 'text-foreground/60 hover:text-foreground')
                  }`}>
                    {item.label}
                    <ChevronDown className={`w-3 h-3 opacity-50 transition-transform duration-200 ${openDropdown === item.label ? "rotate-180" : ""}`} />
                  </button>
                  {openDropdown === item.label && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2">
                      <div className="bg-white rounded-xl shadow-xl shadow-black/8 border border-border/60 py-2 min-w-[220px] animate-slide-down">
                        {item.children.map((child) => (
                          <Link key={child.href} to={child.href}
                            className={`block px-4 py-2.5 text-[13px] transition-colors ${
                              location.pathname === child.href
                                ? "text-primary font-semibold bg-primary/[0.04]"
                                : "text-foreground/60 hover:text-foreground hover:bg-muted/40"
                            }`}>{child.label}</Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link key={item.href} to={item.href!}
                  className={`px-3 py-2 text-[13px] font-semibold rounded-lg transition-colors duration-200 ${
                    transparent
                      ? (isActive(item.href) ? 'text-white' : 'text-white/60 hover:text-white')
                      : (isActive(item.href) ? 'text-primary' : 'text-foreground/60 hover:text-foreground')
                  }`}>{item.label}</Link>
              ),
            )}
          </nav>

          {/* Mobile toggle */}
          <button className={`lg:hidden p-2 rounded-lg transition-colors ${
            transparent ? 'text-white' : 'text-foreground'
          }`} onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden mx-4 mt-1 bg-white/95 backdrop-blur-xl border border-border/50 shadow-2xl shadow-black/10 rounded-xl animate-slide-down">
          <nav className="p-3 space-y-0.5">
            {navItems.map((item) =>
              item.children ? (
                <div key={item.label}>
                  <button className="flex items-center justify-between w-full px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted/50 rounded-xl transition-colors"
                    onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}>
                    {item.label}
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${openDropdown === item.label ? "rotate-180" : ""}`} />
                  </button>
                  {openDropdown === item.label && (
                    <div className="ml-4 pl-3 border-l-2 border-primary/15 my-1 space-y-0.5">
                      {item.children.map((child) => (
                        <Link key={child.href} to={child.href}
                          className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                            location.pathname === child.href
                              ? "text-primary font-semibold"
                              : "text-foreground/60 hover:text-foreground"
                          }`}>{child.label}</Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link key={item.href} to={item.href!}
                  className={`block px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${
                    location.pathname === item.href
                      ? "text-primary bg-primary/[0.04]"
                      : "text-foreground hover:bg-muted/50"
                  }`}>{item.label}</Link>
              ),
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
