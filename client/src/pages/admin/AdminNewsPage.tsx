import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNewsAdmin, createNews, updateNews, deleteNews } from '../../lib/api';
import { formatDate, slugify } from '../../lib/utils';
import AdminTable from '../../components/admin/AdminTable';
import Modal from '../../components/admin/Modal';
import FormField, { Input, Textarea, Checkbox } from '../../components/admin/FormField';
import ImageUpload from '../../components/admin/ImageUpload';
import GalleryUpload from '../../components/admin/GalleryUpload';
import Loader from '../../components/ui/Loader';

const emptyNews = { title: '', slug: '', excerpt: '', content: '', image: '', gallery: [] as string[], published: false, date: new Date().toISOString().slice(0, 10) };

export default function AdminNewsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'news', page], queryFn: () => getNewsAdmin(page) });
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>(emptyNews);
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const saveMut = useMutation({
    mutationFn: (d: any) => editId ? updateNews(editId, d) : createNews(d),
    onError: (e: any) => setError(e.response?.data?.error || e.message || "Ошибка сохранения"),
    onSuccess: () => { setError(null); qc.invalidateQueries({ queryKey: ['admin', 'news'] }); setModal(false); },
  });
  const deleteMut = useMutation({
    mutationFn: deleteNews,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'news'] }),
  });

  const openAdd = () => { setForm(emptyNews); setEditId(null); setError(null); setModal(true); };
  const openEdit = (item: any) => {
    setForm({
      ...item,
      date: item.date?.slice(0, 10) || '',
      gallery: Array.isArray(item.gallery) ? item.gallery : [],
    });
    setEditId(item.id);
    setError(null);
    setModal(true);
  };

  const handleTitleChange = (title: string) => {
    setForm({ ...form, title, slug: editId ? form.slug : slugify(title) });
  };

  if (isLoading) return <Loader />;

  return (
    <>
      <AdminTable
        title="Новости"
        columns={[
          { key: 'image', label: 'Фото', render: (v: string) => v ? <img src={v} className="h-10 w-16 object-cover rounded" /> : '—' },
          { key: 'title', label: 'Заголовок', render: (v: string) => <span className="line-clamp-1 max-w-xs">{v}</span> },
          { key: 'date', label: 'Дата', render: (v: string) => formatDate(v) },
          { key: 'gallery', label: 'Галерея', render: (v: any) => Array.isArray(v) && v.length > 0 ? `${v.length} фото` : '—' },
          { key: 'published', label: 'Опубл.', render: (v: boolean) => v ? '✅' : '❌' },
        ]}
        data={data?.items || []}
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={(id) => deleteMut.mutate(id)}
        viewUrl={(row) => row.slug ? `/news/${row.slug}` : ''}
        page={data?.page}
        totalPages={data?.totalPages}
        total={data?.total}
        onPageChange={setPage}
      />

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Редактировать новость' : 'Новая новость'} onSubmit={() => saveMut.mutate(form)} loading={saveMut.isPending} error={error} wide>
        <ImageUpload value={form.image} onChange={(url) => setForm({ ...form, image: url })} label="Превью изображение" />
        <FormField label="Заголовок"><Input value={form.title} onChange={(e) => handleTitleChange(e.target.value)} /></FormField>
        <FormField label="Slug"><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></FormField>
        <FormField label="Дата"><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></FormField>
        <FormField label="Краткое описание"><Textarea rows={2} value={form.excerpt || ''} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} /></FormField>
        <FormField label="Содержание (HTML) — необязательно"><Textarea rows={8} value={form.content || ''} onChange={(e) => setForm({ ...form, content: e.target.value })} /></FormField>
        <GalleryUpload value={form.gallery || []} onChange={(urls) => setForm({ ...form, gallery: urls })} label="Галерея изображений" />
        <Checkbox label="Опубликовано" checked={form.published} onChange={(e) => setForm({ ...form, published: (e.target as HTMLInputElement).checked })} />
      </Modal>
    </>
  );
}
