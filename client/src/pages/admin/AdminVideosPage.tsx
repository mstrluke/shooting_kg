import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getVideosAdmin, createVideo, updateVideo, deleteVideo } from '../../lib/api';
import AdminTable from '../../components/admin/AdminTable';
import Modal from '../../components/admin/Modal';
import FormField, { Input } from '../../components/admin/FormField';
import ImageUpload from '../../components/admin/ImageUpload';
import Loader from '../../components/ui/Loader';

const emptyVideo = { title: '', youtubeUrl: '', thumbnail: '', order: 0 };

export default function AdminVideosPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'videos'], queryFn: getVideosAdmin });
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>(emptyVideo);
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const saveMut = useMutation({
    mutationFn: (d: any) => editId ? updateVideo(editId, d) : createVideo(d),
    onError: (e: any) => setError(e.response?.data?.error || e.message || "Ошибка сохранения"),
    onSuccess: () => { setError(null); qc.invalidateQueries({ queryKey: ['admin', 'videos'] }); setModal(false); },
  });
  const deleteMut = useMutation({
    mutationFn: deleteVideo,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'videos'] }),
  });

  if (isLoading) return <Loader />;

  return (
    <>
      <AdminTable
        title="Видео"
        columns={[
          { key: 'title', label: 'Название' },
          { key: 'youtubeUrl', label: 'YouTube', render: (v: string) => <a href={v} target="_blank" className="text-primary underline truncate max-w-xs block">{v}</a> },
          { key: 'order', label: '№' },
        ]}
        data={data || []}
        onAdd={() => { setForm(emptyVideo); setEditId(null); setError(null); setModal(true); }}
        onEdit={(item) => { setForm(item); setEditId(item.id); setError(null); setModal(true); }}
        onDelete={(id) => deleteMut.mutate(id)}
        viewUrl={() => `/video`}
      />

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Редактировать видео' : 'Новое видео'}
        onSubmit={() => saveMut.mutate(form)} loading={saveMut.isPending} error={error}>
        <FormField label="Название"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></FormField>
        <FormField label="YouTube URL"><Input value={form.youtubeUrl} onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })} placeholder="https://www.youtube.com/watch?v=..." /></FormField>
        <ImageUpload value={form.thumbnail} onChange={(url) => setForm({ ...form, thumbnail: url })} label="Превью (необязательно)" />
        <FormField label="Порядок"><Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} /></FormField>
      </Modal>
    </>
  );
}
