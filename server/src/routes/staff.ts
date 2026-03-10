import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { sanitizeInput } from '../lib/sanitize';
import { handlePrismaError } from '../lib/errors';

export const staffRouter = Router();

staffRouter.get('/', async (req: Request, res: Response) => {
  const category = req.query.category as string | undefined;
  const where = category ? { category } : {};
  const items = await prisma.staff.findMany({ where, orderBy: { order: 'asc' } });
  res.json(items);
});

staffRouter.get('/admin/all', authMiddleware, async (_req: Request, res: Response) => {
  const items = await prisma.staff.findMany({ orderBy: [{ category: 'asc' }, { order: 'asc' }] });
  res.json(items);
});

staffRouter.get('/:id', async (req: Request, res: Response) => {
  const item = await prisma.staff.findUnique({ where: { id: Number(req.params.id) } });
  if (!item) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(item);
});

staffRouter.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const item = await prisma.staff.create({ data: sanitizeInput(req.body) });
    res.status(201).json(item);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

staffRouter.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const item = await prisma.staff.update({ where: { id: Number(req.params.id) }, data: sanitizeInput(req.body) });
    res.json(item);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

staffRouter.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  await prisma.staff.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});
