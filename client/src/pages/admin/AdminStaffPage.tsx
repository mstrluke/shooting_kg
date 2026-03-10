import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStaffAdmin, createStaff, updateStaff, deleteStaff } from '../../lib/api';
import AdminTable from '../../components/admin/AdminTable';
import Modal from '../../components/admin/Modal';
import FormField, { Input, Textarea, Select } from '../../components/admin/FormField';
import ImageUpload from '../../components/admin/ImageUpload';
import Loader from '../../components/ui/Loader';

const categories = [
  { value: 'leadership', label: 'Руководство' },
  { value: 'administration', label: 'Администрация' },
  { value: 'coaches', label: 'Тренерский Состав' },
  { value: 'judges', label: 'Судейский Состав' },
];

const emptyStaff = { name: '', position: '', photo: '', bio: '', category: 'leadership', order: 0 };

export default function AdminStaffPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'staff'], queryFn: getStaffAdmin });
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>(emptyStaff);
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const saveMut = useMutation({
    mutationFn: (d: any) => editId ? updateStaff(editId, d) : createStaff(d),
    onError: (e: any) => setError(e.response?.data?.error || e.message || "Ошибка сохранения"),
    onSuccess: () => { setError(null); qc.invalidateQueries({ queryKey: ['admin', 'staff'] }); setModal(false); },
  });
  const deleteMut = useMutation({
    mutationFn: deleteStaff,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'staff'] }),
  });

  const openAdd = () => { setForm(emptyStaff); setEditId(null); setError(null); setModal(true); };
  const openEdit = (item: any) => { setForm(item); setEditId(item.id); setError(null); setModal(true); };

  if (isLoading) return <Loader />;

  return (
    <>
      <AdminTable
        title="Персонал"
        columns={[
          { key: 'photo', label: 'Фото', render: (v: string) => v ? <img src={v} className="h-10 w-10 object-cover rounded-full" /> : '—' },
          { key: 'name', label: 'Имя' },
          { key: 'position', label: 'Должность' },
          { key: 'category', label: 'Категория', render: (v: string) => categories.find(c => c.value === v)?.label || v },
          { key: 'order', label: '№' },
        ]}
        data={data || []}
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={(id) => deleteMut.mutate(id)}
        viewUrl={(row) => `/staff/${row.category}`}
      />

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Редактировать' : 'Новый сотрудник'} onSubmit={() => saveMut.mutate(form)} loading={saveMut.isPending} error={error}>
        <ImageUpload value={form.photo} onChange={(url) => setForm({ ...form, photo: url })} label="Фото" />
        <FormField label="ФИО"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></FormField>
        <FormField label="Должность"><Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} /></FormField>
        <FormField label="Категория">
          <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </Select>
        </FormField>
        <FormField label="Биография"><Textarea rows={3} value={form.bio || ''} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></FormField>
        <FormField label="Порядок"><Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} /></FormField>
      </Modal>
    </>
  );
}
