import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEventsAdmin, createEvent, updateEvent, deleteEvent } from '../../lib/api';
import { formatDate, slugify } from '../../lib/utils';
import AdminTable from '../../components/admin/AdminTable';
import Modal from '../../components/admin/Modal';
import FormField, { Input, Textarea, Checkbox } from '../../components/admin/FormField';
import ImageUpload from '../../components/admin/ImageUpload';
import Loader from '../../components/ui/Loader';

const emptyEvent = { title: '', slug: '', description: '', content: '', image: '', startDate: '', endDate: '', location: '', published: false };

export default function AdminEventsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'events', page], queryFn: () => getEventsAdmin(page) });
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>(emptyEvent);
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const saveMut = useMutation({
    mutationFn: (d: any) => editId ? updateEvent(editId, d) : createEvent(d),
    onError: (e: any) => setError(e.response?.data?.error || e.message || "Ошибка сохранения"),
    onSuccess: () => { setError(null); qc.invalidateQueries({ queryKey: ['admin', 'events'] }); setModal(false); },
  });
  const deleteMut = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'events'] }),
  });

  const openAdd = () => { setForm(emptyEvent); setEditId(null); setError(null); setModal(true); };
  const openEdit = (item: any) => {
    setForm({ ...item, startDate: item.startDate?.slice(0, 10) || '', endDate: item.endDate?.slice(0, 10) || '' });
    setEditId(item.id);
    setModal(true);
  };

  if (isLoading) return <Loader />;

  return (
    <>
      <AdminTable
        title="Мероприятия"
        columns={[
          { key: 'title', label: 'Название', render: (v: string) => <span className="line-clamp-1 max-w-xs">{v}</span> },
          { key: 'startDate', label: 'Дата', render: (v: string) => formatDate(v) },
          { key: 'location', label: 'Место' },
          { key: 'published', label: 'Опубл.', render: (v: boolean) => v ? '✅' : '❌' },
        ]}
        data={data?.items || []}
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={(id) => deleteMut.mutate(id)}
        viewUrl={(row) => row.slug ? `/events/${row.slug}` : ''}
        page={data?.page}
        totalPages={data?.totalPages}
        total={data?.total}
        onPageChange={setPage}
      />

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Редактировать мероприятие' : 'Новое мероприятие'} onSubmit={() => saveMut.mutate(form)} loading={saveMut.isPending} error={error} wide>
        <ImageUpload value={form.image} onChange={(url) => setForm({ ...form, image: url })} />
        <FormField label="Название"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: editId ? form.slug : slugify(e.target.value) })} /></FormField>
        <FormField label="Slug"><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Дата начала"><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></FormField>
          <FormField label="Дата окончания"><Input type="date" value={form.endDate || ''} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></FormField>
        </div>
        <FormField label="Место"><Input value={form.location || ''} onChange={(e) => setForm({ ...form, location: e.target.value })} /></FormField>
        <FormField label="Описание"><Textarea rows={3} value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} /></FormField>
        <FormField label="Содержание (HTML)"><Textarea rows={6} value={form.content || ''} onChange={(e) => setForm({ ...form, content: e.target.value })} /></FormField>
        <Checkbox label="Опубликовано" checked={form.published} onChange={(e) => setForm({ ...form, published: (e.target as HTMLInputElement).checked })} />
      </Modal>
    </>
  );
}
