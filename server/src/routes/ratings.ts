import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { sanitizeInput } from '../lib/sanitize';
import { handlePrismaError } from '../lib/errors';

export const ratingsRouter = Router();

ratingsRouter.get('/', async (req: Request, res: Response) => {
  const discipline = req.query.discipline as string | undefined;
  const year = req.query.year ? Number(req.query.year) : undefined;
  const where: any = {};
  if (discipline) where.discipline = discipline;
  if (year) where.year = year;
  const items = await prisma.rating.findMany({ where, orderBy: { rank: 'asc' } });
  res.json(items);
});

ratingsRouter.get('/admin/all', authMiddleware, async (_req: Request, res: Response) => {
  const items = await prisma.rating.findMany({ orderBy: [{ discipline: 'asc' }, { rank: 'asc' }] });
  res.json(items);
});

ratingsRouter.get('/:id', async (req: Request, res: Response) => {
  const item = await prisma.rating.findUnique({ where: { id: Number(req.params.id) } });
  if (!item) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(item);
});

ratingsRouter.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const item = await prisma.rating.create({ data: sanitizeInput(req.body) });
    res.status(201).json(item);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

ratingsRouter.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const item = await prisma.rating.update({ where: { id: Number(req.params.id) }, data: sanitizeInput(req.body) });
    res.json(item);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

ratingsRouter.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  await prisma.rating.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});
