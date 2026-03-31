import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSettings, updateSettings } from '@/lib/api';
import Loader from '@/components/ui/Loader';
import ImageUpload from '@/components/admin/ImageUpload';
import { Save, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const fieldGroups = [
  { title: 'Основные', fields: [
    { key: 'site_name', label: 'Название сайта' }, { key: 'site_description', label: 'Описание сайта' },
    { key: 'phone', label: 'Телефон' }, { key: 'email', label: 'Email' }, { key: 'address', label: 'Адрес' },
  ]},
  { title: 'Соц. сети', fields: [
    { key: 'facebook', label: 'Facebook URL' }, { key: 'instagram', label: 'Instagram URL' },
    { key: 'whatsapp', label: 'WhatsApp URL' }, { key: 'telegram', label: 'Telegram URL' },
  ]},
  { title: 'Обратный отсчет', fields: [
    { key: 'countdown_date', label: 'Дата', type: 'datetime-local' }, { key: 'countdown_title', label: 'Текст' },
  ]},
];

const heroPages = [
  { key: 'news', label: 'Новости', defaultTitle: 'Новости', defaultSubtitle: 'Последние новости федерации' },
  { key: 'events', label: 'Мероприятия', defaultTitle: 'Календарь мероприятий', defaultSubtitle: 'Предстоящие и прошедшие соревнования' },
  { key: 'staff', label: 'Персонал', defaultTitle: 'Персонал', defaultSubtitle: 'Руководство и сотрудники федерации' },
  { key: 'media', label: 'Фотогалерея', defaultTitle: 'Фотогалерея', defaultSubtitle: 'Фотоматериалы соревнований' },
  { key: 'video', label: 'Видеогалерея', defaultTitle: 'Видеогалерея', defaultSubtitle: 'Видеоматериалы соревнований' },
  { key: 'documents', label: 'Документы', defaultTitle: 'Документы', defaultSubtitle: 'Официальные документы' },
  { key: 'ratings', label: 'Рейтинг', defaultTitle: 'Рейтинг', defaultSubtitle: 'Текущий рейтинг спортсменов' },
  { key: 'results', label: 'Результаты', defaultTitle: 'Результаты соревнований', defaultSubtitle: 'Итоги прошедших мероприятий' },
  { key: 'about', label: 'О нас', defaultTitle: 'О нас', defaultSubtitle: 'Федерация стрелкового спорта КР' },
  { key: 'antidoping', label: 'Антидопинг', defaultTitle: 'Антидопинг', defaultSubtitle: 'Антидопинговая политика' },
];

export default function AdminSettingsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['settings'], queryFn: getSettings });
  const [form, setForm] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => { if (data) setForm(data); }, [data]);
  const saveMut = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['settings'] }); setSaved(true); setTimeout(() => setSaved(false), 2000); },
  });

  if (isLoading) return <Loader />;

  return (
    <div className="pb-20">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold">Настройки</h1>
      </div>
      <div className="max-w-2xl space-y-4">
        {fieldGroups.map(g => (
          <Card key={g.title}>
            <CardHeader className="pb-3"><CardTitle className="text-sm">{g.title}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {g.fields.map(f => (
                <div key={f.key} className="space-y-1.5">
                  <label className="text-sm font-medium">{f.label}</label>
                  <Input type={f.type || 'text'} value={form[f.key] || ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
                </div>
              ))}
              {g.title === 'Обратный отсчет' && (
                <label className="flex items-center gap-3 pt-2 cursor-pointer select-none">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={form.countdown_enabled !== 'false'}
                    onClick={() => setForm({ ...form, countdown_enabled: form.countdown_enabled === 'false' ? 'true' : 'false' })}
                    className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                      form.countdown_enabled !== 'false' ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform duration-200 ${
                      form.countdown_enabled !== 'false' ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                  <span className="text-sm font-medium">
                    {form.countdown_enabled !== 'false' ? 'Отображается на сайте' : 'Скрыт на сайте'}
                  </span>
                </label>
              )}
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Hero-секции страниц</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Заголовок, описание и фон для шапки каждой страницы. Пустые поля — используются значения по умолчанию.</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {heroPages.map(hp => (
              <div key={hp.key} className="border border-border rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-semibold text-foreground">{hp.label}</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Заголовок</label>
                    <Input
                      placeholder={hp.defaultTitle}
                      value={form[`hero_${hp.key}_title`] || ''}
                      onChange={e => setForm({ ...form, [`hero_${hp.key}_title`]: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Описание</label>
                    <Input
                      placeholder={hp.defaultSubtitle}
                      value={form[`hero_${hp.key}_subtitle`] || ''}
                      onChange={e => setForm({ ...form, [`hero_${hp.key}_subtitle`]: e.target.value })}
                    />
                  </div>
                </div>
                <ImageUpload
                  value={form[`hero_${hp.key}`] || ''}
                  onChange={(url) => setForm({ ...form, [`hero_${hp.key}`]: url })}
                  label="Фоновое изображение"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Sticky save button */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex items-center justify-end gap-3 px-6 py-3 max-w-2xl">
          <Button size="sm" onClick={() => saveMut.mutate(form)} disabled={saveMut.isPending} className="shadow-lg">
            {saved ? <><Check className="size-4 mr-1.5" /> Сохранено</> : <><Save className="size-4 mr-1.5" /> Сохранить</>}
          </Button>
        </div>
      </div>
    </div>
  );
}
