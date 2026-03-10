import { Pencil, Trash2, Plus, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Column { key: string; label: string; render?: (value: any, row: any) => React.ReactNode; }
interface AdminTableProps {
  title: string;
  columns: Column[];
  data: any[];
  onAdd: () => void;
  onEdit: (item: any) => void;
  onDelete: (id: number) => void;
  addLabel?: string;
  viewUrl?: (row: any) => string;
  page?: number;
  totalPages?: number;
  total?: number;
  onPageChange?: (page: number) => void;
}

export default function AdminTable({ title, columns, data, onAdd, onEdit, onDelete, addLabel = 'Добавить', viewUrl, page, totalPages, total, onPageChange }: AdminTableProps) {
  const hasPagination = page != null && totalPages != null && totalPages > 1 && onPageChange;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground">{total ?? data.length} записей</p>
        </div>
        <Button size="sm" onClick={onAdd}>
          <Plus className="size-4 mr-1.5" /> {addLabel}
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map(c => <TableHead key={c.key}>{c.label}</TableHead>)}
              <TableHead className="w-28 text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map(row => (
              <TableRow key={row.id} className="group">
                {columns.map(c => <TableCell key={c.key}>{c.render ? c.render(row[c.key], row) : row[c.key]}</TableCell>)}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {viewUrl && viewUrl(row) && (
                      <a href={viewUrl(row)} target="_blank" rel="noopener noreferrer"
                        onClick={(e) => { e.stopPropagation(); }}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary"><Eye className="size-3.5" /></Button>
                      </a>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(row)}><Pencil className="size-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => { if (confirm('Удалить?')) onDelete(row.id); }}><Trash2 className="size-3.5" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!data.length && <TableRow><TableCell colSpan={columns.length + 1} className="h-24 text-center text-muted-foreground">Нет данных</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

      {hasPagination && (
        <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
          <span>Страница {page} из {totalPages}</span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 1} onClick={() => onPageChange!(page! - 1)}>
              <ChevronLeft className="size-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === totalPages} onClick={() => onPageChange!(page! + 1)}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
