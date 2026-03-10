import { useHero } from "@/lib/useHeroImage";
import SafeHtml from '../components/ui/SafeHtml';
import { useQuery } from '@tanstack/react-query';
import { getPageBySlug } from '../lib/api';
import PageHeader from '../components/layout/PageHeader';
import Loader from '../components/ui/Loader';

export default function AntiDopingPage() {
  const hero = useHero("antidoping");
  const { data: page, isLoading } = useQuery({ queryKey: ['page', 'anti-doping'], queryFn: () => getPageBySlug('anti-doping') });

  return (
    <>
      <PageHeader image={hero.image} title={hero.title || page?.title || 'Антидопинг'} subtitle={hero.subtitle || "Антидопинговая политика и регламенты"} />
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-14 min-h-screen">
        {isLoading ? <Loader /> : page?.content ? (
          <div className="max-w-4xl">
            <SafeHtml html={page.content} className="rich-content text-foreground" />
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground">Информация скоро появится.</p>
          </div>
        )}
      </div>
    </>
  );
}
