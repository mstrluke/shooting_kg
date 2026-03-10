import { useHero } from "@/lib/useHeroImage";
import { useQuery } from '@tanstack/react-query';
import { FileText, Download, FolderOpen, File } from 'lucide-react';
import { getDocuments } from '../lib/api';
import PageHeader from '../components/layout/PageHeader';
import Loader from '../components/ui/Loader';

export default function DocumentsPage() {
  const hero = useHero("documents");
  const { data: documents, isLoading } = useQuery({ queryKey: ['documents'], queryFn: () => getDocuments() });
  const catNames: Record<string, string> = { official: 'Официальные', protocols: 'Протоколы', regulations: 'Регламенты', reports: 'Отчёты' };

  const groups: Record<string, any[]> = {};
  (documents || []).forEach((doc: any) => {
    const cat = catNames[doc.category] || doc.category || 'Другие';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(doc);
  });

  return (
    <>
      <PageHeader title={hero.title || "Документы"} subtitle={hero.subtitle || "Официальные документы и нормативные акты"} image={hero.image} />
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-16 min-h-screen">
        {isLoading ? <Loader /> : Object.keys(groups).length ? (
          <div className="space-y-14">
            {Object.entries(groups).map(([category, docs]) => (
              <div key={category}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-primary/[0.06] flex items-center justify-center">
                    <FolderOpen className="w-4 h-4 text-primary" />
                  </div>
                  <h2 className="text-sm font-extrabold uppercase tracking-wider text-foreground">{category}</h2>
                  <span className="text-xs text-muted-foreground/30 font-bold ml-1">({docs.length})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {docs.map((doc: any) => (
                    <a key={doc.id} href={doc.file} target="_blank" rel="noopener noreferrer" download
                      className="flex items-center gap-4 rounded-xl border border-border bg-white p-5 hover:border-primary/20 transition-all duration-300 group card-hover">
                      <div className="w-12 h-12 rounded-xl bg-primary/[0.06] flex items-center justify-center shrink-0 group-hover:bg-primary/[0.1] transition-colors">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm group-hover:text-primary transition-colors">{doc.title}</h3>
                        {doc.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{doc.description}</p>}
                      </div>
                      <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/[0.06] transition-colors">
                        <Download className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <File className="w-12 h-12 text-muted-foreground/15 mx-auto mb-4" />
            <p className="text-muted-foreground">Нет документов</p>
          </div>
        )}
      </div>
    </>
  );
}
