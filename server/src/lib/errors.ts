import { Response } from 'express';

export function handlePrismaError(e: any, res: Response) {
  // Unique constraint violation
  if (e.code === 'P2002') {
    const fields = e.meta?.target?.join(', ') || 'unknown';
    res.status(409).json({ error: `Запись с таким значением (${fields}) уже существует` });
    return;
  }
  // Required field missing
  if (e.code === 'P2012') {
    res.status(400).json({ error: `Заполните обязательные поля: ${e.meta?.path || ''}` });
    return;
  }
  // Generic
  res.status(400).json({ error: e.message?.substring(0, 300) || 'Unknown error' });
}
