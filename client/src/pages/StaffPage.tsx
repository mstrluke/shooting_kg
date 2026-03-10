import { useHero } from "@/lib/useHeroImage";
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getStaff } from '../lib/api';
import { User } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import Loader from '../components/ui/Loader';

const categoryTitles: Record<string, string> = { leadership: 'Руководство', administration: 'Администрация', coaches: 'Тренерский состав', judges: 'Судейский состав' };
const categorySubtitles: Record<string, string> = { leadership: 'Руководящий состав федерации', administration: 'Административный персонал', coaches: 'Тренеры и наставники', judges: 'Квалифицированные судьи' };

export default function StaffPage() {
  const { category } = useParams();
  const hero = useHero("staff");
  const { data: staff, isLoading } = useQuery({ queryKey: ['staff', category], queryFn: () => getStaff(category), enabled: !!category });

  return (
    <>
      <PageHeader image={hero.image} title={hero.title || categoryTitles[category || ''] || 'Персонал'} subtitle={hero.subtitle || categorySubtitles[category || '']} />
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-16 min-h-screen">
        {isLoading ? <Loader /> : staff?.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 stagger">
            {staff.map((person: any) => (
              <div key={person.id} className="rounded-xl border border-border bg-white overflow-hidden hover:border-primary/20 transition-all duration-300 group animate-fade-up shadow-none!">
                <div className="h-64 bg-muted relative overflow-hidden">
                  {person.photo ? (
                    <img src={person.photo} alt={person.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-20 h-20 rounded-xl bg-border/30 flex items-center justify-center">
                        <User className="w-10 h-10 text-muted-foreground/20" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-base">{person.name || '—'}</h3>
                  <p className="text-sm text-primary font-semibold mt-1">{person.position || '—'}</p>
                  {person.bio && <p className="text-xs text-muted-foreground mt-2.5 line-clamp-3 leading-relaxed">{person.bio}</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <User className="w-12 h-12 text-muted-foreground/15 mx-auto mb-4" />
            <p className="text-muted-foreground">Нет данных</p>
          </div>
        )}
      </div>
    </>
  );
}
