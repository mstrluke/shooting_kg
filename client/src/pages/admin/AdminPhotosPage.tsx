import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPhotosAdmin, getAlbums, createPhoto, updatePhoto, deletePhoto, createAlbum, updateAlbum, deleteAlbum } from '../../lib/api';
import AdminTable from '../../components/admin/AdminTable';
import Modal from '../../components/admin/Modal';
import FormField, { Input, Select } from '../../components/admin/FormField';
import ImageUpload from '../../components/admin/ImageUpload';
import Loader from '../../components/ui/Loader';
import { Plus, Trash2, Pencil } from 'lucide-react';

export default function AdminPhotosPage() {
  const qc = useQueryClient();
  const { data: photos, isLoading } = useQuery({ queryKey: ['admin', 'photos'], queryFn: getPhotosAdmin });
  const { data: albums } = useQuery({ queryKey: ['admin', 'albums'], queryFn: getAlbums });
  const [modal, setModal] = useState(false);
  const [albumModal, setAlbumModal] = useState(false);
  const [form, setForm] = useState<any>({ image: '', title: '', albumId: '', order: 0 });
  const [albumForm, setAlbumForm] = useState<any>({ title: '', cover: '' });
  const [editId, setEditId] = useState<number | null>(null);
  const [editAlbumId, setEditAlbumId] = useState<number | null>(null);

  const saveMut = useMutation({
    mutationFn: (d: any) => {
      const payload = { ...d, albumId: d.albumId ? Number(d.albumId) : null };
      return editId ? updatePhoto(editId, payload) : createPhoto(payload);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'photos'] }); setModal(false); },
  });
  const deleteMut = useMutation({
    mutationFn: deletePhoto,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'photos'] }),
  });
  const albumSaveMut = useMutation({
    mutationFn: (d: any) => editAlbumId ? updateAlbum(editAlbumId, d) : createAlbum(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'albums'] }); setAlbumModal(false); },
  });
  const albumDeleteMut = useMutation({
    mutationFn: deleteAlbum,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'albums'] }),
  });

  if (isLoading) return <Loader />;

  return (
    <div>
      {/* Albums section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Альбомы</h2>
          <button onClick={() => { setAlbumForm({ title: '', cover: '' }); setEditAlbumId(null); setAlbumModal(true); }}
            className="flex items-center gap-2 bg-primary text-white px-3 py-1.5 rounded-lg text-sm">
            <Plus className="w-4 h-4" /> Альбом
          </button>
        </div>
        <div className="flex flex-wrap gap-3">
          {albums?.map((a: any) => (
            <div key={a.id} className="bg-white border rounded-lg px-4 py-2 flex items-center gap-3">
              <span className="text-sm font-medium">{a.title}</span>
              <span className="text-xs text-muted-foreground">({a._count?.photos || 0})</span>
              <button onClick={() => { setAlbumForm(a); setEditAlbumId(a.id); setAlbumModal(true); }} className="text-muted-foreground hover:text-primary">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => { if (confirm('Удалить альбом?')) albumDeleteMut.mutate(a.id); }} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Photos table */}
      <AdminTable
        title="Фотографии"
        columns={[
          { key: 'image', label: 'Фото', render: (v: string) => v ? <img src={v} className="h-10 w-16 object-cover rounded" /> : '—' },
          { key: 'title', label: 'Название', render: (v: string) => v || '—' },
          { key: 'album', label: 'Альбом', render: (_: any, row: any) => row.album?.title || '—' },
          { key: 'order', label: '№' },
        ]}
        data={photos || []}
        onAdd={() => { setForm({ image: '', title: '', albumId: '', order: 0 }); setEditId(null); setModal(true); }}
        onEdit={(item) => { setForm({ ...item, albumId: item.albumId || '' }); setEditId(item.id); setModal(true); }}
        onDelete={(id) => deleteMut.mutate(id)}
        viewUrl={() => `/media`}
      />

      {/* Photo modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Редактировать фото' : 'Новое фото'}
        onSubmit={() => saveMut.mutate(form)} loading={saveMut.isPending}>
        <ImageUpload value={form.image} onChange={(url) => setForm({ ...form, image: url })} />
        <FormField label="Название"><Input value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} /></FormField>
        <FormField label="Альбом">
          <Select value={form.albumId} onChange={(e) => setForm({ ...form, albumId: e.target.value })}>
            <option value="">Без альбома</option>
            {albums?.map((a: any) => <option key={a.id} value={a.id}>{a.title}</option>)}
          </Select>
        </FormField>
        <FormField label="Порядок"><Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} /></FormField>
      </Modal>

      {/* Album modal */}
      <Modal open={albumModal} onClose={() => setAlbumModal(false)} title={editAlbumId ? 'Редактировать альбом' : 'Новый альбом'}
        onSubmit={() => albumSaveMut.mutate(albumForm)} loading={albumSaveMut.isPending}>
        <FormField label="Название"><Input value={albumForm.title} onChange={(e) => setAlbumForm({ ...albumForm, title: e.target.value })} /></FormField>
        <ImageUpload value={albumForm.cover} onChange={(url) => setAlbumForm({ ...albumForm, cover: url })} label="Обложка" />
      </Modal>
    </div>
  );
}
