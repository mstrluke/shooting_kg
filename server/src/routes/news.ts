import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { sanitizeInput } from '../lib/sanitize';
import { handlePrismaError } from '../lib/errors';

export const newsRouter = Router();

newsRouter.get('/', async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 10, 50);
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    prisma.news.findMany({ where: { published: true }, orderBy: { date: 'desc' }, skip, take: limit }),
    prisma.news.count({ where: { published: true } }),
  ]);
  res.json({ items, total, page, totalPages: Math.ceil(total / limit) });
});

newsRouter.get('/slug/:slug', async (req: Request, res: Response) => {
  const item = await prisma.news.findUnique({ where: { slug: req.params.slug as string } });
  if (!item) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(item);
});

newsRouter.get('/admin/all', authMiddleware, async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 20, 50);
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    prisma.news.findMany({ orderBy: { date: 'desc' }, skip, take: limit }),
    prisma.news.count(),
  ]);
  res.json({ items, total, page, totalPages: Math.ceil(total / limit) });
});

newsRouter.get('/:id', async (req: Request, res: Response) => {
  const item = await prisma.news.findUnique({ where: { id: Number(req.params.id) } });
  if (!item) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(item);
});

newsRouter.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const item = await prisma.news.create({ data: sanitizeInput(req.body) });
    res.status(201).json(item);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

newsRouter.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const item = await prisma.news.update({ where: { id: Number(req.params.id) }, data: sanitizeInput(req.body) });
    res.json(item);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

newsRouter.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  await prisma.news.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});
