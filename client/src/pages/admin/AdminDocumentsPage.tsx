import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDocumentsAdmin, createDocument, updateDocument, deleteDocument, uploadFile } from '../../lib/api';
import AdminTable from '../../components/admin/AdminTable';
import Modal from '../../components/admin/Modal';
import FormField, { Input, Select } from '../../components/admin/FormField';
import Loader from '../../components/ui/Loader';
import { Upload } from 'lucide-react';

const emptyDoc = { title: '', file: '', category: '', order: 0 };
const categories = ['official', 'plans', 'rules', 'anti-doping', 'other'];

export default function AdminDocumentsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'documents'], queryFn: getDocumentsAdmin });
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>(emptyDoc);
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const saveMut = useMutation({
    mutationFn: (d: any) => editId ? updateDocument(editId, d) : createDocument(d),
    onError: (e: any) => setError(e.response?.data?.error || e.message || "Ошибка сохранения"),
    onSuccess: () => { setError(null); qc.invalidateQueries({ queryKey: ['admin', 'documents'] }); setModal(false); },
  });
  const deleteMut = useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'documents'] }),
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadFile(file);
      setForm({ ...form, file: result.url });
    } catch { alert('Ошибка загрузки'); }
    finally { setUploading(false); }
  };

  if (isLoading) return <Loader />;

  return (
    <>
      <AdminTable
        title="Документы"
        columns={[
          { key: 'title', label: 'Название' },
          { key: 'category', label: 'Категория' },
          { key: 'file', label: 'Файл', render: (v: string) => <a href={v} target="_blank" className="text-primary underline text-sm">Скачать</a> },
          { key: 'order', label: '№' },
        ]}
        data={data || []}
        onAdd={() => { setForm(emptyDoc); setEditId(null); setError(null); setModal(true); }}
        onEdit={(item) => { setForm(item); setEditId(item.id); setError(null); setModal(true); }}
        onDelete={(id) => deleteMut.mutate(id)}
        viewUrl={() => `/documents`}
      />

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Редактировать документ' : 'Новый документ'}
        onSubmit={() => saveMut.mutate(form)} loading={saveMut.isPending} error={error}>
        <FormField label="Название"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></FormField>
        <FormField label="Категория">
          <Select value={form.category || ''} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            <option value="">Без категории</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
        </FormField>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Файл</label>
          {form.file ? (
            <div className="flex items-center gap-2">
              <a href={form.file} target="_blank" className="text-primary underline text-sm">{form.file}</a>
              <button type="button" onClick={() => setForm({ ...form, file: '' })} className="text-destructive text-sm">Удалить</button>
            </div>
          ) : (
            <div>
              <input ref={fileRef} type="file" onChange={handleFileUpload} className="hidden" />
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg text-sm text-muted-foreground hover:border-ring hover:text-primary">
                <Upload className="w-4 h-4" /> {uploading ? 'Загрузка...' : 'Выбрать файл'}
              </button>
            </div>
          )}
        </div>
        <FormField label="Порядок"><Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} /></FormField>
      </Modal>
    </>
  );
}
