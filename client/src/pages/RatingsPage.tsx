import { useHero } from "@/lib/useHeroImage";
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Medal, BarChart3, Download } from 'lucide-react';
import { getRatings } from '../lib/api';
import PageHeader from '../components/layout/PageHeader';
import Loader from '../components/ui/Loader';

const titles: Record<string, string> = { vp_women: 'ВП – 6 Женщины', vp_men: 'ВП – 6 Мужчины', pp_women: 'ПП – 6 Женщины', pp_men: 'ПП – 6 Мужчины' };

function downloadCSV(ratings: any[], discipline: string) {
  const title = titles[discipline] || discipline;
  const header = 'Место,Спортсмен,Очки,Год\n';
  const rows = ratings.map((r: any) => `${r.rank},${r.athlete},${r.score || ''},${r.year}`).join('\n');
  const bom = '\uFEFF';
  const blob = new Blob([bom + header + rows], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Рейтинг_${title.replace(/\s/g, '_')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function RatingsPage() {
  const { discipline } = useParams();
  const hero = useHero("ratings");
  const { data: ratings, isLoading } = useQuery({ queryKey: ['ratings', discipline], queryFn: () => getRatings(discipline!), enabled: !!discipline });

  return (
    <>
      <PageHeader image={hero.image} title={hero.title || `Рейтинг — ${titles[discipline || ''] || 'Рейтинг'}`} subtitle={hero.subtitle || "Текущий рейтинг спортсменов"} />
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-16 min-h-screen">
        {isLoading ? <Loader /> : ratings?.length ? (
          <>
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">{ratings.length} спортсменов</p>
            <button onClick={() => downloadCSV(ratings, discipline!)} className="btn-pill btn-primary text-xs !px-4 !py-2">
              <Download className="w-3.5 h-3.5" /> Скачать CSV
            </button>
          </div>
          <div className="space-y-3 stagger">
            {ratings.map((r: any, i: number) => (
              <div key={r.id} className={`flex items-center gap-5 rounded-xl border bg-white p-5 transition-all card-hover animate-fade-up ${
                i < 3 ? 'border-primary/15' : 'border-border'
              }`}>
                <div className="w-12 text-center shrink-0">
                  {i === 0 && (
                    <div className="w-11 h-11 mx-auto rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center ">
                      <Trophy className="w-5 h-5 text-white" />
                    </div>
                  )}
                  {i === 1 && (
                    <div className="w-11 h-11 mx-auto rounded-xl bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center ">
                      <Medal className="w-5 h-5 text-white" />
                    </div>
                  )}
                  {i === 2 && (
                    <div className="w-11 h-11 mx-auto rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center ">
                      <Medal className="w-5 h-5 text-white" />
                    </div>
                  )}
                  {i >= 3 && <div className="text-2xl font-black text-muted-foreground/20 tabular-nums">{r.rank}</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold ${i < 3 ? '' : 'text-foreground/70'}`}>{r.athlete}</h3>
                  <div className="text-xs text-muted-foreground mt-0.5">{r.year} г.</div>
                </div>
                <div className="text-right shrink-0">
                  <div className={`text-xl font-black tabular-nums ${i === 0 ? 'text-primary' : i < 3 ? '' : 'text-muted-foreground'}`}>{r.score}</div>
                  <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">очков</div>
                </div>
              </div>
            ))}
          </div>
          </>
        ) : (
          <div className="text-center py-20">
            <BarChart3 className="w-12 h-12 text-muted-foreground/15 mx-auto mb-4" />
            <p className="text-muted-foreground">Нет данных рейтинга</p>
          </div>
        )}
      </div>
    </>
  );
}
