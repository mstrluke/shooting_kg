import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPagesAdmin, createPage, updatePage, deletePage } from '../../lib/api';
import { slugify } from '../../lib/utils';
import AdminTable from '../../components/admin/AdminTable';
import Modal from '../../components/admin/Modal';
import FormField, { Input, Textarea } from '../../components/admin/FormField';
import Loader from '../../components/ui/Loader';

const emptyPage = { title: '', slug: '', content: '' };

export default function AdminPagesPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'pages'], queryFn: getPagesAdmin });
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>(emptyPage);
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const saveMut = useMutation({
    mutationFn: (d: any) => editId ? updatePage(editId, d) : createPage(d),
    onError: (e: any) => setError(e.response?.data?.error || e.message || "Ошибка сохранения"),
    onSuccess: () => { setError(null); qc.invalidateQueries({ queryKey: ['admin', 'pages'] }); setModal(false); },
  });
  const deleteMut = useMutation({
    mutationFn: deletePage,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'pages'] }),
  });

  if (isLoading) return <Loader />;

  return (
    <>
      <AdminTable
        title="Страницы"
        columns={[
          { key: 'title', label: 'Название' },
          { key: 'slug', label: 'Slug' },
        ]}
        data={data || []}
        onAdd={() => { setForm(emptyPage); setEditId(null); setError(null); setModal(true); }}
        onEdit={(item) => { setForm(item); setEditId(item.id); setError(null); setModal(true); }}
        onDelete={(id) => deleteMut.mutate(id)}
        viewUrl={(row) => `/${row.slug}`}
      />

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Редактировать страницу' : 'Новая страница'}
        onSubmit={() => saveMut.mutate(form)} loading={saveMut.isPending} error={error} wide>
        <FormField label="Заголовок"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: editId ? form.slug : slugify(e.target.value) })} /></FormField>
        <FormField label="Slug"><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></FormField>
        <FormField label="Содержание (HTML)"><Textarea rows={12} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></FormField>
      </Modal>
    </>
  );
}
