import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { sanitizeInput } from '../lib/sanitize';
import { handlePrismaError } from '../lib/errors';

export const documentsRouter = Router();

documentsRouter.get('/', async (req: Request, res: Response) => {
  const category = req.query.category as string | undefined;
  const where = category ? { category } : {};
  const items = await prisma.document.findMany({ where, orderBy: { order: 'asc' } });
  res.json(items);
});

documentsRouter.get('/admin/all', authMiddleware, async (_req: Request, res: Response) => {
  const items = await prisma.document.findMany({ orderBy: { order: 'asc' } });
  res.json(items);
});

documentsRouter.get('/:id', async (req: Request, res: Response) => {
  const item = await prisma.document.findUnique({ where: { id: Number(req.params.id) } });
  if (!item) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(item);
});

documentsRouter.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const item = await prisma.document.create({ data: sanitizeInput(req.body) });
    res.status(201).json(item);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

documentsRouter.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const item = await prisma.document.update({ where: { id: Number(req.params.id) }, data: sanitizeInput(req.body) });
    res.json(item);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

documentsRouter.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  await prisma.document.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});
