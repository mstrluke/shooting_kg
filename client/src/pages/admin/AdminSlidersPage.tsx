import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSlidersAdmin, createSlider, updateSlider, deleteSlider } from '../../lib/api';
import AdminTable from '../../components/admin/AdminTable';
import Modal from '../../components/admin/Modal';
import FormField, { Input, Checkbox } from '../../components/admin/FormField';
import ImageUpload from '../../components/admin/ImageUpload';
import Loader from '../../components/ui/Loader';

const emptySlider = { title: '', subtitle: '', image: '', link: '', order: 0, active: true };

export default function AdminSlidersPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'sliders'], queryFn: getSlidersAdmin });
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>(emptySlider);
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const saveMut = useMutation({
    mutationFn: (data: any) => editId ? updateSlider(editId, data) : createSlider(data),
    onError: (e: any) => setError(e.response?.data?.error || e.message || "Ошибка сохранения"),
    onSuccess: () => { setError(null); qc.invalidateQueries({ queryKey: ['admin', 'sliders'] }); setModal(false); },
  });
  const deleteMut = useMutation({
    mutationFn: deleteSlider,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'sliders'] }),
  });

  const openAdd = () => { setForm(emptySlider); setEditId(null); setError(null); setModal(true); };
  const openEdit = (item: any) => { setForm(item); setEditId(item.id); setError(null); setModal(true); };

  if (isLoading) return <Loader />;

  return (
    <>
      <AdminTable
        title="Слайдер"
        columns={[
          { key: 'image', label: 'Фото', render: (v: string) => v ? <img src={v} className="h-10 w-16 object-cover rounded" /> : '—' },
          { key: 'title', label: 'Заголовок' },
          { key: 'order', label: 'Порядок' },
          { key: 'active', label: 'Активен', render: (v: boolean) => v ? '✅' : '❌' },
        ]}
        data={data || []}
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={(id) => deleteMut.mutate(id)}
      />
      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Редактировать слайд' : 'Новый слайд'} onSubmit={() => saveMut.mutate(form)} loading={saveMut.isPending} error={error}>
        <ImageUpload value={form.image} onChange={(url) => setForm({ ...form, image: url })} />
        <FormField label="Заголовок"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></FormField>
        <FormField label="Подзаголовок"><Input value={form.subtitle || ''} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} /></FormField>
        <FormField label="Ссылка"><Input value={form.link || ''} onChange={(e) => setForm({ ...form, link: e.target.value })} /></FormField>
        <FormField label="Порядок"><Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} /></FormField>
        <Checkbox label="Активен" checked={form.active} onChange={(e) => setForm({ ...form, active: (e.target as HTMLInputElement).checked })} />
      </Modal>
    </>
  );
}
