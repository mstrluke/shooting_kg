import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRatingsAdmin, createRating, updateRating, deleteRating } from '../../lib/api';
import AdminTable from '../../components/admin/AdminTable';
import Modal from '../../components/admin/Modal';
import FormField, { Input, Select } from '../../components/admin/FormField';
import Loader from '../../components/ui/Loader';

const disciplines = [
  { value: 'vp_women', label: 'ВП – 6 Женщины' },
  { value: 'vp_men', label: 'ВП – 6 Мужчины' },
  { value: 'pp_women', label: 'ПП – 6 Женщины' },
  { value: 'pp_men', label: 'ПП – 6 Мужчины' },
];

const emptyRating = { athlete: '', discipline: 'vp_men', score: 0, rank: 1, year: new Date().getFullYear() };

export default function AdminRatingsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'ratings'], queryFn: getRatingsAdmin });
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>(emptyRating);
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const saveMut = useMutation({
    mutationFn: (d: any) => {
      const payload = { ...d, score: Number(d.score), rank: Number(d.rank), year: Number(d.year) };
      return editId ? updateRating(editId, payload) : createRating(payload);
    },
    onError: (e: any) => setError(e.response?.data?.error || e.message || "Ошибка сохранения"),
    onSuccess: () => { setError(null); qc.invalidateQueries({ queryKey: ['admin', 'ratings'] }); setModal(false); },
  });
  const deleteMut = useMutation({
    mutationFn: deleteRating,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'ratings'] }),
  });

  if (isLoading) return <Loader />;

  return (
    <>
      <AdminTable
        title="Рейтинг"
        columns={[
          { key: 'rank', label: 'Место' },
          { key: 'athlete', label: 'Спортсмен' },
          { key: 'discipline', label: 'Дисциплина', render: (v: string) => disciplines.find(d => d.value === v)?.label || v },
          { key: 'score', label: 'Очки' },
          { key: 'year', label: 'Год' },
        ]}
        data={data || []}
        onAdd={() => { setForm(emptyRating); setEditId(null); setError(null); setModal(true); }}
        onEdit={(item) => { setForm(item); setEditId(item.id); setError(null); setModal(true); }}
        onDelete={(id) => deleteMut.mutate(id)}
        viewUrl={(row) => `/ratings/${row.discipline}`}
      />

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Редактировать рейтинг' : 'Новая запись'}
        onSubmit={() => saveMut.mutate(form)} loading={saveMut.isPending} error={error}>
        <FormField label="Спортсмен"><Input value={form.athlete} onChange={(e) => setForm({ ...form, athlete: e.target.value })} /></FormField>
        <FormField label="Дисциплина">
          <Select value={form.discipline} onChange={(e) => setForm({ ...form, discipline: e.target.value })}>
            {disciplines.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </Select>
        </FormField>
        <div className="grid grid-cols-3 gap-4">
          <FormField label="Очки"><Input type="number" step="0.1" value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} /></FormField>
          <FormField label="Место"><Input type="number" value={form.rank} onChange={(e) => setForm({ ...form, rank: e.target.value })} /></FormField>
          <FormField label="Год"><Input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} /></FormField>
        </div>
      </Modal>
    </>
  );
}
