import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPartnersAdmin, createPartner, updatePartner, deletePartner } from '../../lib/api';
import AdminTable from '../../components/admin/AdminTable';
import Modal from '../../components/admin/Modal';
import FormField, { Input, Checkbox } from '../../components/admin/FormField';
import ImageUpload from '../../components/admin/ImageUpload';
import Loader from '../../components/ui/Loader';

const emptyPartner = { name: '', logo: '', url: '', order: 0, active: true };

export default function AdminPartnersPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'partners'], queryFn: getPartnersAdmin });
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>(emptyPartner);
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const saveMut = useMutation({
    mutationFn: (d: any) => editId ? updatePartner(editId, d) : createPartner(d),
    onError: (e: any) => setError(e.response?.data?.error || e.message || "Ошибка сохранения"),
    onSuccess: () => { setError(null); qc.invalidateQueries({ queryKey: ['admin', 'partners'] }); setModal(false); },
  });
  const deleteMut = useMutation({
    mutationFn: deletePartner,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'partners'] }),
  });

  if (isLoading) return <Loader />;

  return (
    <>
      <AdminTable
        title="Партнеры"
        columns={[
          { key: 'logo', label: 'Лого', render: (v: string) => v ? <img src={v} className="h-10 object-contain" /> : '—' },
          { key: 'name', label: 'Название' },
          { key: 'url', label: 'Сайт', render: (v: string) => v ? <a href={v} target="_blank" className="text-primary underline">{v}</a> : '—' },
          { key: 'active', label: 'Активен', render: (v: boolean) => v ? '✅' : '❌' },
        ]}
        data={data || []}
        onAdd={() => { setForm(emptyPartner); setEditId(null); setError(null); setModal(true); }}
        onEdit={(item) => { setForm(item); setEditId(item.id); setError(null); setModal(true); }}
        onDelete={(id) => deleteMut.mutate(id)}
      />

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Редактировать партнера' : 'Новый партнер'}
        onSubmit={() => saveMut.mutate(form)} loading={saveMut.isPending} error={error}>
        <ImageUpload value={form.logo} onChange={(url) => setForm({ ...form, logo: url })} label="Логотип" />
        <FormField label="Название"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></FormField>
        <FormField label="URL сайта"><Input value={form.url || ''} onChange={(e) => setForm({ ...form, url: e.target.value })} /></FormField>
        <FormField label="Порядок"><Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} /></FormField>
        <Checkbox label="Активен" checked={form.active} onChange={(e) => setForm({ ...form, active: (e.target as HTMLInputElement).checked })} />
      </Modal>
    </>
  );
}
